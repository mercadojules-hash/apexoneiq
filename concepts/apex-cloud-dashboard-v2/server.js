const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { plans, normalizePlanId, planFor, entitlementsFor } = require('./js/subscription-config.js');

const root = __dirname;
const port = Number(process.env.PORT || 4177);
const dataDir = path.join(root, 'data');
const subscriptionStorePath = path.join(dataDir, 'subscription-store.json');

loadEnvFile(path.join(root, '.env'));
loadEnvFile(path.join(root, '.env.sandbox'));

const contentTypes = {
	'.html': 'text/html; charset=utf-8',
	'.css': 'text/css; charset=utf-8',
	'.js': 'application/javascript; charset=utf-8',
	'.json': 'application/json; charset=utf-8',
	'.png': 'image/png',
	'.jpg': 'image/jpeg',
	'.jpeg': 'image/jpeg',
	'.svg': 'image/svg+xml; charset=utf-8',
	'.ico': 'image/x-icon'
};

const server = http.createServer(async (req, res) => {
	try {
		const url = new URL(req.url, `http://${req.headers.host || `127.0.0.1:${port}`}`);
		if (req.method === 'GET' && url.pathname === '/api/billing/config') return sendBillingConfig(res);
		if (req.method === 'GET' && url.pathname === '/api/billing/status') return sendBillingStatus(req, res, url);
		if (req.method === 'POST' && url.pathname.startsWith('/api/billing/checkout/')) return handleCheckout(req, res, url);
		if (req.method === 'POST' && url.pathname === '/api/billing/portal') return handleCustomerPortal(req, res, url);
		if (req.method === 'POST' && (url.pathname === '/api/billing/webhook' || url.pathname === '/api/stripe/webhook')) return handleStripeWebhook(req, res);
		if (req.method === 'POST' && url.pathname === '/api/entitlements/check') return handleEntitlementCheck(req, res);
		if (req.method === 'POST' && url.pathname === '/api/enterprise/inquiry') return handleEnterpriseInquiry(req, res);
		if (req.method !== 'GET' && req.method !== 'HEAD') {
			sendJson(res, 405, { error: 'method_not_allowed' });
			return;
		}
		serveStatic(req, res, url);
	} catch (error) {
		sendJson(res, 500, { error: 'server_error', message: error.message });
	}
});

server.listen(port, () => {
	console.log(`ApexOneIQ sandbox server running at http://127.0.0.1:${port}`);
});

async function handleCheckout(req, res, url) {
	const requestedPlan = url.pathname.split('/').filter(Boolean).pop();
	const planId = normalizePlanId(requestedPlan);
	const plan = planFor(planId);
	const payload = await readJsonBody(req);

	if (!plan || !plan.purchaseAvailable) {
		sendJson(res, 400, {
			error: planId === 'enterprise' ? 'enterprise_request_information_only' : 'plan_not_purchasable',
			message: planId === 'enterprise' ? 'Enterprise is request-information only and does not use self-service Stripe Checkout.' : 'This plan cannot be purchased through self-service checkout.'
		});
		return;
	}

	const stripeCheck = stripeEnvironmentCheck(plan);
	if (stripeCheck) {
		sendJson(res, stripeCheck.status, stripeCheck.body);
		return;
	}

	const origin = `${url.protocol}//${req.headers.host}`;
	const userId = String(payload.userId || payload.user_id || payload.user?.id || 'local-user');
	const accountId = String(payload.accountId || payload.account_id || payload.account?.id || userId);
	const businessWebsite = String(payload.businessWebsite || payload.website || payload.profile?.website || '');
	const businessId = String(payload.businessId || payload.business_id || accountId);
	const price = process.env[plan.stripePriceEnv];
	const body = new URLSearchParams({
		mode: 'subscription',
		success_url: `${origin}/checkout/success.html?session_id={CHECKOUT_SESSION_ID}&plan=${encodeURIComponent(plan.id)}`,
		cancel_url: `${origin}/checkout/cancel.html?plan=${encodeURIComponent(plan.id)}`,
		'line_items[0][price]': price,
		'line_items[0][quantity]': '1',
		client_reference_id: accountId,
		'metadata[user_id]': userId,
		'metadata[account_id]': accountId,
		'metadata[internal_plan_id]': plan.id,
		'metadata[business_website]': businessWebsite,
		'metadata[business_id]': businessId,
		'metadata[environment]': String(process.env.STRIPE_MODE || 'test').toLowerCase()
	});

	const stripeResponse = await fetch('https://api.stripe.com/v1/checkout/sessions', {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
			'Content-Type': 'application/x-www-form-urlencoded'
		},
		body
	});
	const data = await stripeResponse.json();
	if (!stripeResponse.ok) {
		sendJson(res, stripeResponse.status, {
			error: 'stripe_checkout_failed',
			message: data.error?.message || 'Stripe Checkout Session creation failed.'
		});
		return;
	}

	sendJson(res, 200, {
		id: data.id,
		url: data.url,
		plan: plan.id,
		entitlements: entitlementsFor(plan.id),
		billingInterval: plan.billingInterval
	});
}

async function handleStripeWebhook(req, res) {
	const rawBody = await readRawBody(req);
	const secret = process.env.STRIPE_WEBHOOK_SECRET;
	if (!secret) {
		sendJson(res, 503, { error: 'webhook_secret_not_configured' });
		return;
	}
	if (!verifyStripeSignature(rawBody, req.headers['stripe-signature'], secret)) {
		sendJson(res, 400, { error: 'stripe_signature_verification_failed' });
		return;
	}

	const event = JSON.parse(rawBody.toString('utf8'));
	const store = readSubscriptionStore();
	if (store.processedEvents[event.id]) {
		sendJson(res, 200, { received: true, duplicate: true });
		return;
	}

	const result = applyStripeEvent(store, event);
	store.processedEvents[event.id] = {
		type: event.type,
		processedAt: new Date().toISOString(),
		result
	};
	writeSubscriptionStore(store);
	sendJson(res, 200, { received: true, result });
}

async function handleCustomerPortal(req, res, url) {
	const stripeCheck = stripeEnvironmentCheck({ stripePriceEnv: 'STRIPE_PRICE_DIY', displayName: 'Customer Portal', id: 'portal' }, true);
	if (stripeCheck) return sendJson(res, stripeCheck.status, stripeCheck.body);
	const payload = await readJsonBody(req);
	const status = subscriptionStatusFor(payload.userId || payload.user_id, payload.accountId || payload.account_id);
	const customer = payload.stripeCustomerId || status.stripeCustomerId;
	if (!customer) {
		sendJson(res, 404, { error: 'stripe_customer_missing', message: 'No Stripe customer is stored for this account yet.' });
		return;
	}
	const origin = `${url.protocol}//${req.headers.host}`;
	const body = new URLSearchParams({
		customer,
		return_url: `${origin}/subscription.html`
	});
	const stripeResponse = await fetch('https://api.stripe.com/v1/billing_portal/sessions', {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
			'Content-Type': 'application/x-www-form-urlencoded'
		},
		body
	});
	const data = await stripeResponse.json();
	if (!stripeResponse.ok) {
		sendJson(res, stripeResponse.status, { error: 'stripe_portal_failed', message: data.error?.message || 'Customer portal could not be created.' });
		return;
	}
	sendJson(res, 200, { url: data.url });
}

async function handleEntitlementCheck(req, res) {
	const payload = await readJsonBody(req);
	const status = subscriptionStatusFor(payload.userId || payload.user_id, payload.accountId || payload.account_id);
	const planId = normalizePlanId(payload.planId || payload.plan_id || status.entitlementPlan || status.planId || 'free');
	const required = String(payload.entitlement || '');
	sendJson(res, 200, {
		allowed: !required || entitlementsFor(planId).includes(required),
		planId,
		billingStatus: status.billingStatus,
		entitlements: entitlementsFor(planId)
	});
}

async function handleEnterpriseInquiry(req, res) {
	const payload = await readJsonBody(req);
	const store = readSubscriptionStore();
	const inquiry = {
		id: `inq_${Date.now()}_${Math.random().toString(16).slice(2)}`,
		createdAt: new Date().toISOString(),
		userId: String(payload.userId || payload.user_id || 'local-user'),
		accountId: String(payload.accountId || payload.account_id || payload.userId || 'local-account'),
		website: String(payload.website || payload.businessWebsite || ''),
		email: String(payload.email || ''),
		message: String(payload.message || 'Enterprise request information')
	};
	store.enterpriseInquiries.push(inquiry);
	writeSubscriptionStore(store);
	sendJson(res, 200, {
		requested: true,
		plan: 'enterprise',
		message: 'Enterprise is request-information only. No checkout session was created.',
		inquiry
	});
}

function sendBillingConfig(res) {
	const publicPlans = Object.fromEntries(Object.entries(plans).filter(([, plan]) => !plan.internalOnly).map(([id, plan]) => [id, {
		id: plan.id,
		displayName: plan.displayName,
		price: plan.price,
		priceLabel: plan.priceLabel,
		entitlements: plan.entitlements,
		billingInterval: plan.billingInterval,
		purchaseAvailable: plan.purchaseAvailable,
		workspace: plan.workspace,
		restrictions: plan.restrictions,
		stripeConfigured: plan.stripePriceEnv ? Boolean(process.env[plan.stripePriceEnv]) : false
	}]));
	sendJson(res, 200, {
		publishableKeyConfigured: Boolean(process.env.STRIPE_PUBLISHABLE_KEY),
		webhookConfigured: Boolean(process.env.STRIPE_WEBHOOK_SECRET),
		plans: publicPlans
	});
}

function sendBillingStatus(req, res, url) {
	sendJson(res, 200, subscriptionStatusFor(url.searchParams.get('user_id'), url.searchParams.get('account_id')));
}

function applyStripeEvent(store, event) {
	const object = event.data?.object || {};
	if (event.type === 'checkout.session.completed') {
		return upsertSubscription(store, {
			userId: object.metadata?.user_id || object.client_reference_id || object.customer || 'stripe-user',
			accountId: object.metadata?.account_id || object.client_reference_id || object.customer || 'stripe-account',
			planId: object.metadata?.internal_plan_id || 'free',
			billingStatus: object.payment_status === 'paid' ? 'active' : 'incomplete',
			stripeCustomerId: object.customer,
			stripeSubscriptionId: object.subscription,
			checkoutSessionId: object.id,
			businessWebsite: object.metadata?.business_website || '',
			businessId: object.metadata?.business_id || '',
			lastStripeEventType: event.type
		});
	}
	if (event.type.startsWith('customer.subscription.')) {
		const planId = object.metadata?.internal_plan_id || planFromSubscriptionObject(object);
		const status = event.type === 'customer.subscription.deleted' ? 'canceled' : normalizeStripeStatus(object.status);
		return upsertSubscription(store, {
			userId: object.metadata?.user_id || userIdForStripeObject(store, object),
			accountId: object.metadata?.account_id || accountIdForStripeObject(store, object),
			planId,
			billingStatus: status,
			stripeCustomerId: object.customer,
			stripeSubscriptionId: object.id,
			currentPeriodEnd: object.current_period_end ? new Date(object.current_period_end * 1000).toISOString() : null,
			lastStripeEventType: event.type
		});
	}
	if (event.type === 'invoice.payment_succeeded' || event.type === 'invoice.payment_failed') {
		const existing = findSubscription(store, null, null, object.customer, object.subscription);
		return upsertSubscription(store, {
			...(existing || {}),
			userId: existing?.userId || object.customer || 'stripe-user',
			accountId: existing?.accountId || object.customer || 'stripe-account',
			planId: existing?.planId || planFromSubscriptionObject(object),
			billingStatus: event.type === 'invoice.payment_succeeded' ? 'active' : 'past_due',
			stripeCustomerId: object.customer,
			stripeSubscriptionId: object.subscription,
			lastStripeEventType: event.type
		});
	}
	return { ignored: true, type: event.type };
}

function upsertSubscription(store, update) {
	const planId = normalizePlanId(update.planId);
	const billingStatus = normalizeStripeStatus(update.billingStatus);
	const activePaid = ['active', 'trialing'].includes(billingStatus);
	const entitlementPlan = activePaid ? planId : 'free';
	const existing = findSubscription(store, update.userId, update.accountId, update.stripeCustomerId, update.stripeSubscriptionId);
	const record = {
		id: existing?.id || `sub_${Date.now()}_${Math.random().toString(16).slice(2)}`,
		userId: String(update.userId || existing?.userId || 'local-user'),
		accountId: String(update.accountId || existing?.accountId || update.userId || 'local-account'),
		planId,
		entitlementPlan,
		entitlements: entitlementsFor(entitlementPlan),
		billingStatus,
		stripeCustomerId: update.stripeCustomerId || existing?.stripeCustomerId || null,
		stripeSubscriptionId: update.stripeSubscriptionId || existing?.stripeSubscriptionId || null,
		checkoutSessionId: update.checkoutSessionId || existing?.checkoutSessionId || null,
		businessWebsite: update.businessWebsite || existing?.businessWebsite || '',
		businessId: update.businessId || existing?.businessId || '',
		currentPeriodEnd: update.currentPeriodEnd || existing?.currentPeriodEnd || null,
		lastStripeEventType: update.lastStripeEventType || existing?.lastStripeEventType || null,
		updatedAt: new Date().toISOString(),
		createdAt: existing?.createdAt || new Date().toISOString()
	};
	store.subscriptions = store.subscriptions.filter(item => item.id !== record.id);
	store.subscriptions.push(record);
	return { subscriptionId: record.id, planId: record.planId, entitlementPlan: record.entitlementPlan, billingStatus: record.billingStatus };
}

function subscriptionStatusFor(userId, accountId) {
	const store = readSubscriptionStore();
	const record = findSubscription(store, userId || 'local-user', accountId || userId || 'local-account') || null;
	if (!record) {
		return {
			planId: 'free',
			entitlementPlan: 'free',
			billingStatus: 'free',
			entitlements: entitlementsFor('free'),
			stripeCustomerId: null,
			stripeSubscriptionId: null
		};
	}
	return record;
}

function findSubscription(store, userId, accountId, stripeCustomerId, stripeSubscriptionId) {
	return store.subscriptions.find(item =>
		(stripeSubscriptionId && item.stripeSubscriptionId === stripeSubscriptionId)
		|| (stripeCustomerId && item.stripeCustomerId === stripeCustomerId)
		|| (accountId && item.accountId === String(accountId))
		|| (userId && item.userId === String(userId))
	);
}

function userIdForStripeObject(store, object) {
	return findSubscription(store, null, null, object.customer, object.id)?.userId || object.customer || 'stripe-user';
}

function accountIdForStripeObject(store, object) {
	return findSubscription(store, null, null, object.customer, object.id)?.accountId || object.customer || 'stripe-account';
}

function planFromSubscriptionObject(object) {
	const price = object.items?.data?.[0]?.price?.id || object.lines?.data?.[0]?.price?.id || '';
	return planFromPriceId(price);
}

function planFromPriceId(priceId) {
	const match = Object.values(plans).find(plan => plan.stripePriceEnv && process.env[plan.stripePriceEnv] === priceId);
	return match?.id || 'free';
}

function normalizeStripeStatus(status) {
	const value = String(status || '').toLowerCase();
	if (['active', 'trialing', 'past_due', 'canceled', 'incomplete', 'unpaid'].includes(value)) return value;
	if (value === 'paid') return 'active';
	return value || 'incomplete';
}

function stripeEnvironmentCheck(plan, allowPortalWithoutPrice = false) {
	const secret = process.env.STRIPE_SECRET_KEY;
	if (!secret) {
		return { status: 503, body: { error: 'stripe_not_configured', message: 'STRIPE_SECRET_KEY is required.' } };
	}
	const stripeMode = String(process.env.STRIPE_MODE || 'test').toLowerCase();
	const expectedPrefix = stripeMode === 'live' ? 'sk_live_' : 'sk_test_';
	if (!secret.startsWith(expectedPrefix)) {
		return { status: 400, body: { error: 'stripe_key_mode_mismatch', message: `STRIPE_SECRET_KEY must start with ${expectedPrefix} when STRIPE_MODE=${stripeMode}.` } };
	}
	if (!allowPortalWithoutPrice && plan.stripePriceEnv && !process.env[plan.stripePriceEnv]) {
		return { status: 503, body: { error: 'price_not_configured', message: `${plan.stripePriceEnv} is required for ${plan.displayName}.` } };
	}
	return null;
}

function verifyStripeSignature(rawBody, signatureHeader, secret) {
	if (!signatureHeader || !secret) return false;
	const parts = Object.fromEntries(signatureHeader.split(',').map(item => {
		const [key, value] = item.split('=');
		return [key, value];
	}));
	const timestamp = parts.t;
	const signature = parts.v1;
	if (!timestamp || !signature) return false;
	const expected = crypto.createHmac('sha256', secret).update(`${timestamp}.${rawBody.toString('utf8')}`).digest('hex');
	const expectedBuffer = Buffer.from(expected, 'hex');
	const signatureBuffer = Buffer.from(signature, 'hex');
	if (expectedBuffer.length !== signatureBuffer.length) return false;
	const ageSeconds = Math.abs(Date.now() / 1000 - Number(timestamp));
	return ageSeconds <= 300 && crypto.timingSafeEqual(expectedBuffer, signatureBuffer);
}

function readSubscriptionStore() {
	if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
	if (!fs.existsSync(subscriptionStorePath)) {
		return { subscriptions: [], processedEvents: {}, enterpriseInquiries: [] };
	}
	try {
		const parsed = JSON.parse(fs.readFileSync(subscriptionStorePath, 'utf8'));
		return {
			subscriptions: Array.isArray(parsed.subscriptions) ? parsed.subscriptions : [],
			processedEvents: parsed.processedEvents && typeof parsed.processedEvents === 'object' ? parsed.processedEvents : {},
			enterpriseInquiries: Array.isArray(parsed.enterpriseInquiries) ? parsed.enterpriseInquiries : []
		};
	} catch (error) {
		return { subscriptions: [], processedEvents: {}, enterpriseInquiries: [] };
	}
}

function writeSubscriptionStore(store) {
	if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
	fs.writeFileSync(subscriptionStorePath, JSON.stringify(store, null, 2));
}

function serveStatic(req, res, url) {
	let pathname = decodeURIComponent(url.pathname);
	if (pathname === '/') pathname = '/index.html';
	let filePath = path.normalize(path.join(root, pathname));
	if (!filePath.startsWith(root)) {
		res.writeHead(403);
		res.end('Forbidden');
		return;
	}
	if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
		filePath = path.join(filePath, 'index.html');
	}
	if (!fs.existsSync(filePath)) {
		res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
		res.end('Not found');
		return;
	}
	const type = contentTypes[path.extname(filePath)] || 'application/octet-stream';
	res.writeHead(200, { 'Content-Type': type });
	if (req.method === 'HEAD') {
		res.end();
		return;
	}
	fs.createReadStream(filePath).pipe(res);
}

function sendJson(res, status, payload) {
	res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
	res.end(JSON.stringify(payload));
}

function readRawBody(req) {
	return new Promise((resolve, reject) => {
		const chunks = [];
		req.on('data', chunk => chunks.push(chunk));
		req.on('end', () => resolve(Buffer.concat(chunks)));
		req.on('error', reject);
	});
}

async function readJsonBody(req) {
	const raw = await readRawBody(req);
	if (!raw.length) return {};
	try {
		return JSON.parse(raw.toString('utf8'));
	} catch (error) {
		return {};
	}
}

function loadEnvFile(filePath) {
	if (!fs.existsSync(filePath)) return;
	const lines = fs.readFileSync(filePath, 'utf8').split(/\r?\n/);
	for (const line of lines) {
		const trimmed = line.trim();
		if (!trimmed || trimmed.startsWith('#')) continue;
		const equals = trimmed.indexOf('=');
		if (equals === -1) continue;
		const key = trimmed.slice(0, equals).trim();
		const value = trimmed.slice(equals + 1).trim().replace(/^['"]|['"]$/g, '');
		if (!process.env[key]) process.env[key] = value;
	}
}
