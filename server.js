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
		if (req.method === 'GET' && url.pathname === '/api/executive-scan') return handleExecutiveScan(req, res, url);
		if (req.method === 'POST' && url.pathname.startsWith('/api/billing/checkout/')) return handleCheckout(req, res, url);
		if (req.method === 'POST' && url.pathname === '/api/billing/portal') return handleCustomerPortal(req, res, url);
		if (req.method === 'POST' && (url.pathname === '/api/billing/webhook' || url.pathname === '/api/stripe/webhook')) return handleStripeWebhook(req, res);
		if (req.method === 'POST' && url.pathname === '/api/entitlements/check') return handleEntitlementCheck(req, res);
		if (req.method === 'POST' && url.pathname === '/api/enterprise/inquiry') return handleEnterpriseInquiry(req, res);
		if (req.method === 'GET' && normalizeRoutePath(url.pathname) === '/oauth/google') return handleGoogleOAuthStart(req, res, url);
		if (req.method === 'GET' && normalizeRoutePath(url.pathname) === '/oauth/google/callback') return handleGoogleOAuthCallback(req, res, url);
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

async function handleExecutiveScan(req, res, url) {
	const website = normalizeWebsiteUrl(url.searchParams.get('website'));
	if (!website) {
		sendJson(res, 400, { error: 'invalid_website', message: 'A secure website URL beginning with https:// is required.' });
		return;
	}

	try {
		const result = await buildExecutiveScanResult(website);
		sendJson(res, 200, result);
	} catch (error) {
		sendJson(res, 200, fallbackExecutiveScanResult(website, error.message));
	}
}

function handleGoogleOAuthStart(req, res, url) {
	const clientId = process.env.APEXONEIQ_GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID;
	if (!clientId) {
		sendJson(res, 503, { error: 'google_oauth_not_configured', message: 'Google OAuth client ID is required.' });
		return;
	}
	const origin = publicOrigin(req, url);
	const redirectUri = googleCallbackUrl(origin);
	const redirectTo = safeRedirectPath(url.searchParams.get('redirect_to') || '/sign-in.html');
	const state = crypto.randomBytes(24).toString('hex');
	const statePayload = Buffer.from(JSON.stringify({ state, redirectTo })).toString('base64url');
	const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
	authUrl.searchParams.set('client_id', clientId);
	authUrl.searchParams.set('redirect_uri', redirectUri);
	authUrl.searchParams.set('response_type', 'code');
	authUrl.searchParams.set('scope', 'openid email profile');
	authUrl.searchParams.set('state', statePayload);
	authUrl.searchParams.set('prompt', 'select_account');
	console.log('Google OAuth redirect debug');
	console.log(`client_id=${clientId}`);
	console.log(`redirect_uri=${redirectUri}`);
	console.log(`scope=${authUrl.searchParams.get('scope')}`);
	console.log(`response_type=${authUrl.searchParams.get('response_type')}`);
	console.log(`access_type=${authUrl.searchParams.get('access_type') || ''}`);
	console.log(`prompt=${authUrl.searchParams.get('prompt')}`);
	console.log(`authorization_url=${authUrl.toString()}`);
	console.log(`APP_URL=${maskEnvValue(process.env.APP_URL || '')}`);
	console.log(`APEXONEIQ_APP_URL=${maskEnvValue(process.env.APEXONEIQ_APP_URL || '')}`);
	console.log(`APEXONEIQ_GOOGLE_CALLBACK_URL=${maskEnvValue(process.env.APEXONEIQ_GOOGLE_CALLBACK_URL || '')}`);
	console.log(`GOOGLE_CALLBACK_URL=${maskEnvValue(process.env.GOOGLE_CALLBACK_URL || '')}`);
	res.writeHead(302, {
		Location: authUrl.toString(),
		'Set-Cookie': cookieHeader('apex_oauth_state', state, 600)
	});
	res.end();
}

function handleGoogleOAuthCallback(req, res, url) {
	const cookies = parseCookies(req.headers.cookie || '');
	let payload = {};
	try {
		payload = JSON.parse(Buffer.from(url.searchParams.get('state') || '', 'base64url').toString('utf8'));
	} catch (error) {
		payload = {};
	}
	if (!payload.state || payload.state !== cookies.apex_oauth_state) {
		sendJson(res, 400, { error: 'google_oauth_state_invalid' });
		return;
	}
	const redirectTo = safeRedirectPath(payload.redirectTo || '/sign-in.html');
	const target = new URL(redirectTo, publicOrigin(req, url));
	if (url.searchParams.get('error')) target.searchParams.set('oauth_error', url.searchParams.get('error'));
	else target.searchParams.set('oauth', 'google');
	res.writeHead(302, {
		Location: `${target.pathname}${target.search}`,
		'Set-Cookie': cookieHeader('apex_oauth_state', '', 0)
	});
	res.end();
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

function normalizeRoutePath(pathname) {
	return String(pathname || '').replace(/\/+$/, '') || '/';
}

function publicOrigin(req, url) {
	const configured = process.env.APP_URL || process.env.APEXONEIQ_APP_URL;
	if (configured) return configured.replace(/\/+$/, '');
	const proto = req.headers['x-forwarded-proto'] || url.protocol.replace(':', '') || 'https';
	return `${proto}://${req.headers.host}`;
}

function googleCallbackUrl(origin) {
	const configured = process.env.APEXONEIQ_GOOGLE_CALLBACK_URL || process.env.GOOGLE_CALLBACK_URL || '';
	const cleaned = configured.replace(/^(APEXONEIQ_GOOGLE_CALLBACK_URL|GOOGLE_CALLBACK_URL)=/i, '').trim();
	const callback = new URL(cleaned || `${origin}/oauth/google/callback/`, origin);
	callback.pathname = '/oauth/google/callback/';
	callback.search = '';
	callback.hash = '';
	return callback.toString();
}

function maskEnvValue(value) {
	const text = String(value || '');
	if (!text) return '';
	if (text.length <= 4) return text;
	return `${'*'.repeat(Math.max(0, text.length - 4))}${text.slice(-4)}`;
}

function safeRedirectPath(value) {
	const path = String(value || '/sign-in.html');
	if (!path.startsWith('/') || path.startsWith('//') || path.includes('\\')) return '/sign-in.html';
	return path;
}

function parseCookies(header) {
	return Object.fromEntries(String(header).split(';').map(part => {
		const [key, ...value] = part.trim().split('=');
		return [key, decodeURIComponent(value.join('=') || '')];
	}).filter(([key]) => key));
}

function cookieHeader(name, value, maxAge) {
	const encoded = encodeURIComponent(value);
	return `${name}=${encoded}; Max-Age=${maxAge}; Path=/; HttpOnly; Secure; SameSite=Lax`;
}

function normalizeWebsiteUrl(value) {
	try {
		const url = new URL(String(value || '').trim());
		if (url.protocol !== 'https:' || !url.hostname.includes('.')) return '';
		url.hash = '';
		return url.toString();
	} catch (error) {
		return '';
	}
}

async function buildExecutiveScanResult(website) {
	const startedAt = Date.now();
	const response = await fetchWithTimeout(website, 9000);
	const html = await response.text();
	const responseMs = Date.now() - startedAt;
	const url = new URL(website);
	const origin = `${url.protocol}//${url.host}`;
	const title = textBetween(html, /<title[^>]*>([\s\S]*?)<\/title>/i);
	const description = metaContent(html, 'description');
	const h1 = textBetween(html, /<h1[^>]*>([\s\S]*?)<\/h1>/i);
	const bodyText = stripHtml(html);
	const wordCount = bodyText.split(/\s+/).filter(Boolean).length;
	const links = extractLinks(html, origin);
	const schemaAnalysis = schemaAnalysisFromHtml(html);
	const schemaTypes = schemaAnalysis.types;
	const trustCoverage = trustCoverageFromHtml(html, links.external, schemaTypes);
	const robots = await fetchOptionalText(`${origin}/robots.txt`);
	const sitemap = await fetchOptionalText(`${origin}/sitemap.xml`);
	const brokenLinks = await brokenLinkSummary(links.internal);
	const headingAnalysis = headingHierarchyFromHtml(html);
	const imageAlt = imageAltCoverageFromHtml(html);
	const metadata = metadataSignalsFromHtml(html, website);
	const indexability = indexabilitySignals(html, robots, response.status, url);
	const contentQuality = aiReadableContentSignals(bodyText, headingAnalysis, schemaTypes);
	const findings = {
		website,
		statusCode: response.status,
		responseMs,
		title,
		description,
		h1,
		wordCount,
		internalLinks: links.internal.length,
		externalLinks: links.external.length,
		checkedInternalLinks: brokenLinks.checked,
		brokenInternalLinks: brokenLinks.broken,
		schemaDetected: schemaTypes.length > 0,
		schemaTypes,
		schemaValidation: schemaAnalysis.validation,
		schemaCoverage: schemaCoverageFromTypes(schemaTypes),
		faqDetected: schemaTypes.some(type => /faq/i.test(type)) || /FAQPage|Frequently Asked Questions/i.test(html),
		robotsFound: Boolean(robots),
		sitemapFound: Boolean(sitemap) || /sitemap\.xml/i.test(robots || ''),
		canonical: metadata.canonical,
		openGraph: metadata.openGraph,
		twitterCards: metadata.twitterCards,
		viewport: metadata.viewport,
		titleQuality: metadata.titleQuality,
		metaDescriptionQuality: metadata.metaDescriptionQuality,
		headingHierarchy: headingAnalysis,
		imageAltCoverage: imageAlt,
		https: url.protocol === 'https:',
		mobileFriendly: metadata.viewport.status === 'Found' ? 'Found' : 'Missing',
		indexability,
		crawlability: crawlabilitySignals(robots, sitemap, response.status),
		aiReadableContent: contentQuality,
		reviewSignals: reviewSignalsFromHtml(html),
		trustCoverage,
		coreWebVitals: { status: 'Pending', note: 'Core Web Vitals require field data or Lighthouse collection.' },
		indexing: { status: indexability.status, evidence: indexability.evidence }
	};
	const executionActions = executionActionsFromFindings(findings);
	const components = executiveScoreComponents(findings);
	const businessGrowthScore = weightedBusinessGrowthScore(components);
	return {
		source: 'live_scan',
		simulated: false,
		website,
		domain: url.hostname.replace(/^www\./, ''),
		scannedAt: new Date().toISOString(),
		businessGrowthScore,
		components,
		findings,
		executionActions,
		timeline: timelineFromFindings(findings, businessGrowthScore),
		competitors: { status: 'processing', message: 'Competitor discovery still processing...', items: [] },
		keywords: keywordOpportunitiesFromFindings(findings),
		forecast: { status: 'pending', message: 'Pending live data.' },
		trend: [Math.max(0, businessGrowthScore - 9), Math.max(0, businessGrowthScore - 6), Math.max(0, businessGrowthScore - 3), businessGrowthScore],
		scoreExplanation: scoreExplanation(components)
	};
}

function fallbackExecutiveScanResult(website, reason) {
	const url = new URL(website);
	const components = {
		localSeo: 0,
		websiteHealth: 0,
		trustCoverage: 0,
		aiVisibility: 0,
		technicalHealth: 0,
		authority: 0,
		content: 0,
		reputation: 0
	};
	return {
		source: 'scan_unavailable',
		simulated: false,
		website,
		domain: url.hostname.replace(/^www\./, ''),
		scannedAt: new Date().toISOString(),
		businessGrowthScore: 0,
		components,
		findings: { website, error: reason, trustCoverage: trustCoverageFromHtml('', [], []) },
		executionActions: [],
		timeline: [['Now', 'Website scan unavailable', reason || 'The submitted website could not be scanned.', 'warning']],
		competitors: { status: 'processing', message: 'Competitor discovery still processing...', items: [] },
		keywords: [],
		forecast: { status: 'pending', message: 'Pending live data.' },
		trend: [0],
		scoreExplanation: scoreExplanation(components)
	};
}

async function fetchWithTimeout(url, timeoutMs) {
	const controller = new AbortController();
	const timer = setTimeout(() => controller.abort(), timeoutMs);
	try {
		return await fetch(url, {
			headers: {
				'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36 ApexOneIQExecutiveScan/1.0',
				Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
			},
			redirect: 'follow',
			signal: controller.signal
		});
	} finally {
		clearTimeout(timer);
	}
}

async function fetchOptionalText(url) {
	try {
		const response = await fetchWithTimeout(url, 4500);
		if (!response.ok) return '';
		return await response.text();
	} catch (error) {
		return '';
	}
}

function textBetween(html, pattern) {
	const match = String(html || '').match(pattern);
	return cleanText(match?.[1] || '');
}

function metaContent(html, name) {
	const source = String(html || '');
	const patterns = [
		new RegExp(`<meta[^>]+name=["']${name}["'][^>]+content=["']([^"']+)["'][^>]*>`, 'i'),
		new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+name=["']${name}["'][^>]*>`, 'i'),
		new RegExp(`<meta[^>]+property=["']og:${name}["'][^>]+content=["']([^"']+)["'][^>]*>`, 'i')
	];
	for (const pattern of patterns) {
		const match = source.match(pattern);
		if (match?.[1]) return cleanText(match[1]);
	}
	return '';
}

function cleanText(value) {
	return String(value || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function stripHtml(html) {
	return cleanText(String(html || '').replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' '));
}

function extractLinks(html, origin) {
	const internal = [];
	const external = [];
	for (const match of String(html || '').matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>/gi)) {
		try {
			const link = new URL(match[1], origin);
			if (!/^https?:$/.test(link.protocol)) continue;
			(link.origin === origin ? internal : external).push(link.toString());
		} catch (error) {
			// Ignore malformed links.
		}
	}
	return { internal: Array.from(new Set(internal)), external: Array.from(new Set(external)) };
}

function schemaAnalysisFromHtml(html) {
	const types = new Set();
	let scripts = 0;
	let invalidJsonLd = 0;
	for (const match of String(html || '').matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
		scripts += 1;
		try {
			const json = JSON.parse(match[1].trim());
			collectSchemaTypes(json, types);
		} catch (error) {
			invalidJsonLd += 1;
		}
	}
	return {
		types: Array.from(types),
		validation: {
			status: invalidJsonLd ? 'Invalid' : scripts ? 'Valid' : 'Missing',
			scripts,
			invalidJsonLd,
			evidence: invalidJsonLd ? `${invalidJsonLd} JSON-LD script(s) failed parsing.` : scripts ? `${scripts} valid JSON-LD script(s) parsed.` : 'No JSON-LD scripts detected.'
		}
	};
}

function schemaTypesFromHtml(html) {
	return schemaAnalysisFromHtml(html).types;
}

function collectSchemaTypes(value, types) {
	if (Array.isArray(value)) return value.forEach(item => collectSchemaTypes(item, types));
	if (!value || typeof value !== 'object') return;
	const type = value['@type'];
	if (Array.isArray(type)) type.forEach(item => types.add(String(item)));
	else if (type) types.add(String(type));
	Object.values(value).forEach(item => {
		if (item && typeof item === 'object') collectSchemaTypes(item, types);
	});
}

function schemaCoverageFromTypes(types) {
	const has = name => types.some(type => String(type).toLowerCase() === name.toLowerCase());
	return {
		organization: has('Organization') ? 'Found' : 'Missing',
		website: has('WebSite') ? 'Found' : 'Missing',
		product: has('Product') ? 'Found' : 'Missing',
		faq: has('FAQPage') ? 'Found' : 'Missing',
		breadcrumb: has('BreadcrumbList') ? 'Found' : 'Missing'
	};
}

function metadataSignalsFromHtml(html, website) {
	const canonical = linkHref(html, 'canonical');
	const ogTitle = metaProperty(html, 'og:title');
	const ogDescription = metaProperty(html, 'og:description');
	const ogUrl = metaProperty(html, 'og:url');
	const twitterCard = metaContent(html, 'twitter:card');
	const viewport = metaContent(html, 'viewport');
	const title = textBetween(html, /<title[^>]*>([\s\S]*?)<\/title>/i);
	const description = metaContent(html, 'description');
	return {
		canonical: {
			status: canonical ? 'Found' : 'Missing',
			url: canonical || '',
			evidence: canonical ? `Canonical detected: ${canonical}` : 'Canonical link not detected.'
		},
		openGraph: {
			status: ogTitle && ogDescription && ogUrl ? 'Found' : ogTitle || ogDescription || ogUrl ? 'Weak' : 'Missing',
			evidence: `${ogTitle ? 'og:title found' : 'og:title missing'} / ${ogDescription ? 'og:description found' : 'og:description missing'} / ${ogUrl ? 'og:url found' : 'og:url missing'}`
		},
		twitterCards: {
			status: twitterCard ? 'Found' : 'Missing',
			evidence: twitterCard ? `Twitter card detected: ${twitterCard}` : 'Twitter card metadata not detected.'
		},
		viewport: {
			status: viewport ? 'Found' : 'Missing',
			evidence: viewport ? `Viewport detected: ${viewport}` : 'Viewport meta tag not detected.'
		},
		titleQuality: textQualityStatus(title, 30, 65, 'title'),
		metaDescriptionQuality: textQualityStatus(description, 70, 165, 'meta description'),
		canonicalMatches: canonical ? canonical.replace(/\/+$/, '') === website.replace(/\/+$/, '') : false
	};
}

function textQualityStatus(value, min, max, label) {
	const length = cleanText(value).length;
	if (!length) return { status: 'Missing', length, evidence: `${label} missing.` };
	if (length < min) return { status: 'Weak', length, evidence: `${label} is short at ${length} characters.` };
	if (length > max) return { status: 'Weak', length, evidence: `${label} is long at ${length} characters.` };
	return { status: 'Found', length, evidence: `${label} length is ${length} characters.` };
}

function linkHref(html, rel) {
	const match = String(html || '').match(new RegExp(`<link[^>]+rel=["'][^"']*${rel}[^"']*["'][^>]+href=["']([^"']+)["'][^>]*>`, 'i'))
		|| String(html || '').match(new RegExp(`<link[^>]+href=["']([^"']+)["'][^>]+rel=["'][^"']*${rel}[^"']*["'][^>]*>`, 'i'));
	return match?.[1] || '';
}

function metaProperty(html, property) {
	const source = String(html || '');
	const patterns = [
		new RegExp(`<meta[^>]+property=["']${property}["'][^>]+content=["']([^"']+)["'][^>]*>`, 'i'),
		new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${property}["'][^>]*>`, 'i')
	];
	for (const pattern of patterns) {
		const match = source.match(pattern);
		if (match?.[1]) return cleanText(match[1]);
	}
	return '';
}

function headingHierarchyFromHtml(html) {
	const headings = [...String(html || '').matchAll(/<h([1-6])\b[^>]*>([\s\S]*?)<\/h\1>/gi)].map(match => ({
		level: Number(match[1]),
		text: cleanText(match[2])
	}));
	const h1Count = headings.filter(item => item.level === 1).length;
	let skipped = false;
	for (let index = 1; index < headings.length; index += 1) {
		if (headings[index].level - headings[index - 1].level > 1) skipped = true;
	}
	return {
		status: h1Count === 1 && !skipped ? 'Found' : h1Count ? 'Weak' : 'Missing',
		h1Count,
		count: headings.length,
		skippedLevels: skipped,
		evidence: h1Count === 1 && !skipped ? `${headings.length} headings with one H1.` : h1Count ? `${h1Count} H1 tag(s); skipped hierarchy: ${skipped ? 'yes' : 'no'}.` : 'No H1 detected.'
	};
}

function imageAltCoverageFromHtml(html) {
	const images = [...String(html || '').matchAll(/<img\b[^>]*>/gi)];
	const withAlt = images.filter(match => /\balt=["'][^"']+["']/i.test(match[0])).length;
	const percent = images.length ? Math.round((withAlt / images.length) * 100) : 100;
	return {
		status: images.length === 0 ? 'Not Available' : percent >= 90 ? 'Found' : percent >= 60 ? 'Weak' : 'Missing',
		total: images.length,
		withAlt,
		percent,
		evidence: images.length ? `${withAlt}/${images.length} images include alt text.` : 'No standard img tags detected in initial HTML.'
	};
}

async function brokenLinkSummary(internalLinks) {
	const sample = internalLinks.filter(Boolean).slice(0, 20);
	const results = await Promise.all(sample.map(async link => {
		try {
			const response = await fetchWithTimeout(link, 3500);
			return { link, status: response.status, broken: response.status >= 400 };
		} catch (error) {
			return { link, status: 0, broken: true };
		}
	}));
	return {
		checked: results.length,
		broken: results.filter(item => item.broken).length,
		items: results.filter(item => item.broken).slice(0, 5)
	};
}

function indexabilitySignals(html, robots, statusCode, url) {
	const noindex = /<meta[^>]+name=["']robots["'][^>]+content=["'][^"']*noindex/i.test(String(html || ''));
	const robotsBlocksAll = new RegExp(`disallow:\\s*/\\s*(\\n|$)`, 'i').test(String(robots || ''));
	if (statusCode >= 400) return { status: 'Missing', evidence: `HTTP ${statusCode} prevents normal indexing.` };
	if (noindex) return { status: 'Missing', evidence: 'Robots noindex meta tag detected.' };
	if (robotsBlocksAll) return { status: 'Weak', evidence: 'robots.txt may disallow the root path.' };
	return { status: url.protocol === 'https:' ? 'Found' : 'Weak', evidence: url.protocol === 'https:' ? 'HTTPS page is indexable in scan context.' : 'HTTP page should use HTTPS.' };
}

function crawlabilitySignals(robots, sitemap, statusCode) {
	if (statusCode >= 400) return { status: 'Missing', evidence: `HTTP ${statusCode} response.` };
	if (robots && sitemap) return { status: 'Found', evidence: 'robots.txt and sitemap.xml detected.' };
	if (robots || sitemap) return { status: 'Weak', evidence: robots ? 'robots.txt detected; sitemap missing.' : 'sitemap.xml detected; robots missing.' };
	return { status: 'Missing', evidence: 'robots.txt and sitemap.xml not detected.' };
}

function aiReadableContentSignals(bodyText, headings, schemaTypes) {
	const words = bodyText.split(/\s+/).filter(Boolean).length;
	const hasQuestionContent = /\?|\b(can|how|what|why|where|when)\b/i.test(bodyText);
	const hasStructure = headings.count >= 3;
	const hasSchema = schemaTypes.length > 0;
	const score = clampNumber((words >= 450 ? 34 : words >= 220 ? 22 : 10) + (hasStructure ? 24 : 8) + (hasSchema ? 28 : 0) + (hasQuestionContent ? 14 : 4));
	return {
		status: score >= 75 ? 'Found' : score >= 45 ? 'Weak' : 'Missing',
		score,
		evidence: `${words} words, ${headings.count} headings, ${schemaTypes.length} schema types.`
	};
}

function executionActionsFromFindings(findings) {
	const actions = [];
	const add = (title, state, evidence, nextStep, category = 'Optimization') => actions.push({
		title,
		state,
		category,
		evidence,
		nextStep,
		canAutoFix: state === 'AUTO EXECUTED' || state === 'READY FOR APPROVAL',
		requiresApproval: state === 'READY FOR APPROVAL',
		thirdPartyBlocked: state === 'WAITING FOR THIRD PARTY',
		informationRequired: state === 'INFORMATION REQUIRED'
	});
	if (findings.schemaCoverage?.faq === 'Missing' && findings.faqDetected) {
		add('FAQ JSON-LD', 'READY FOR APPROVAL', 'FAQ opportunity detected, but FAQPage schema is missing from the live scan.', 'Prepare FAQ JSON-LD from visible FAQ content, preview, deploy after approval.', 'Schema');
	}
	if (findings.schemaCoverage?.breadcrumb === 'Missing') {
		add('Breadcrumb Schema', 'READY FOR APPROVAL', 'BreadcrumbList schema is missing from the live scan.', 'Generate BreadcrumbList schema from the current URL hierarchy and deploy after approval.', 'Schema');
	}
	if (findings.titleQuality?.status === 'Weak' || findings.metaDescriptionQuality?.status === 'Weak') {
		add('Title and Meta Description Optimization', 'READY FOR APPROVAL', `${findings.titleQuality.evidence} ${findings.metaDescriptionQuality.evidence}`, 'Prepare improved metadata and deploy after approval.', 'Metadata');
	}
	if (findings.brokenInternalLinks > 0) {
		add('Broken Internal Link Repair', 'READY FOR APPROVAL', `${findings.brokenInternalLinks}/${findings.checkedInternalLinks} checked internal links returned errors.`, 'Repair or redirect broken internal links, then rescan.', 'Crawlability');
	}
	if (findings.imageAltCoverage?.status === 'Weak' || findings.imageAltCoverage?.status === 'Missing') {
		add('Image Alt Text Coverage', 'READY FOR APPROVAL', findings.imageAltCoverage.evidence, 'Prepare descriptive alt text for missing images and deploy after approval.', 'Accessibility');
	}
	for (const source of findings.trustCoverage || []) {
		if (['Google Business Profile', 'Apple Business Connect', 'BBB', 'Merchant Center'].includes(source.name) && source.status !== 'Found') {
			add(source.name, 'WAITING FOR THIRD PARTY', source.evidence, `Prepare ${source.name} verification checklist; completion depends on external provider verification.`, 'Trust');
		}
	}
	for (const source of findings.trustCoverage || []) {
		if (['Contact Consistency', 'NAP Consistency', 'Review Schema'].includes(source.name) && source.status !== 'Found') {
			add(source.name, 'INFORMATION REQUIRED', source.evidence, 'Collect verified business/contact/review data before Apex can publish structured proof.', 'Trust');
		}
	}
	if (!actions.length) {
		add('Scan Evidence Recording', 'AUTO EXECUTED', 'No low-risk automatic issue was detected in the scanned evidence set.', 'Apex recorded the scan baseline and will compare the next scan for movement.', 'Evidence');
	}
	return actions;
}

function trustCoverageFromHtml(html, externalLinks, schemaTypes = []) {
	const haystack = `${String(html || '')} ${externalLinks.join(' ')}`.toLowerCase();
	const hasSchema = type => schemaTypes.some(item => String(item).toLowerCase() === type.toLowerCase());
	const hasAnySchema = pattern => schemaTypes.some(item => pattern.test(String(item)));
	const hasEmail = /mailto:|[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i.test(String(html || ''));
	const hasPhone = /tel:|\+?\d[\d\s().-]{7,}\d/.test(String(html || ''));
	const hasAddress = /streetaddress|postalcode|addresslocality|addressregion|\b(address|suite|floor)\b/i.test(String(html || ''));
	const sources = [
		{ name: 'Google Business Profile', pattern: /(google\.com\/maps|g\.page|business\.google|goo\.gl\/maps)/, why: 'Validates the business entity for local discovery and AI confidence.', impact: '+6% estimated local trust impact', effort: 'Low' },
		{ name: 'Apple Business Connect', pattern: /(maps\.apple\.com|apple business connect)/, why: 'Adds third-party entity proof in Apple Maps and iOS search surfaces.', impact: '+3% estimated trust impact', effort: 'Low' },
		{ name: 'BBB', pattern: /(bbb\.org|better business bureau)/, why: 'Provides external trust proof for cautious buyers.', impact: '+2% estimated trust impact', effort: 'Medium' },
		{ name: 'Yelp', pattern: /(yelp\.com|yelp)/, why: 'Strengthens third-party review and local citation coverage.', impact: '+2% estimated trust impact', effort: 'Low' },
		{ name: 'Facebook', pattern: /(facebook\.com|fb\.com)/, why: 'Confirms social proof and customer-facing brand presence.', impact: '+2% estimated trust impact', effort: 'Low' },
		{ name: 'Instagram', pattern: /(instagram\.com|instagr\.am)/, why: 'Confirms visual brand presence and social proof for creative businesses.', impact: '+2% estimated trust impact', effort: 'Low' },
		{ name: 'LinkedIn', pattern: /(linkedin\.com)/, why: 'Adds business legitimacy proof and founder/company entity confidence.', impact: '+2% estimated authority impact', effort: 'Low' },
		{ name: 'Pinterest', pattern: /(pinterest\.com)/, why: 'Adds visual discovery proof for design and creative asset searches.', impact: '+2% estimated visibility impact', effort: 'Low' },
		{ name: 'Trustpilot', pattern: /(trustpilot\.com|trustpilot)/, why: 'Adds independent review proof for buyer confidence.', impact: '+2% estimated reputation impact', effort: 'Medium' },
		{ name: 'Industry directories', pattern: /(clutch\.co|upcity\.com|thumbtack\.com|angi\.com|houzz\.com|avvo\.com|findlaw\.com|justia\.com|directory)/, why: 'Builds third-party citation consistency beyond owned channels.', impact: '+3% estimated authority impact', effort: 'Medium' },
		{ name: 'Merchant Center', pattern: /(merchantcenter|google shopping|shopping\.google\.com)/, why: 'Improves commerce entity readiness for product discovery surfaces.', impact: '+3% estimated commerce visibility impact', effort: 'Medium' }
	];
	const externalSources = sources.map(({ name, pattern, why, impact, effort }) => {
		const found = pattern.test(haystack);
		return { name, status: found ? 'Found' : 'Missing', evidence: found ? 'Detected in page/link signals' : 'Not detected during website scan', why, impact, effort };
	});
	const schemaSources = [
		{
			name: 'Knowledge Graph',
			status: /(wikidata\.org|wikipedia\.org|kgmid|sameas)/i.test(haystack) && hasSchema('Organization') ? 'Weak' : 'Missing',
			evidence: /(sameas)/i.test(haystack) ? 'Organization sameAs signals detected; no independent knowledge-base entity confirmed.' : 'No knowledge-base entity signal detected.',
			why: 'Helps AI systems connect the brand to a stable entity.',
			impact: '+4% estimated entity confidence impact',
			effort: 'Medium'
		},
		{
			name: 'Organization Schema',
			status: hasSchema('Organization') ? 'Found' : 'Missing',
			evidence: hasSchema('Organization') ? 'Organization JSON-LD detected' : 'Organization JSON-LD not detected',
			why: 'Defines the business entity for search and answer engines.',
			impact: '+4% estimated AI visibility impact',
			effort: 'Low'
		},
		{
			name: 'Review Schema',
			status: hasAnySchema(/^(Review|AggregateRating)$/i) ? 'Found' : /\breviews?\b|\btestimonials?\b/i.test(stripHtml(html)) ? 'Weak' : 'Missing',
			evidence: hasAnySchema(/^(Review|AggregateRating)$/i) ? 'Review/AggregateRating schema detected' : 'No Review/AggregateRating schema detected',
			why: 'Turns reputation proof into machine-readable evidence.',
			impact: '+3% estimated reputation impact',
			effort: 'Medium'
		},
		{
			name: 'Author Information',
			status: hasAnySchema(/^(Person|ProfilePage|BlogPosting)$/i) || /\bauthor\b/i.test(haystack) ? 'Found' : 'Missing',
			evidence: hasAnySchema(/^(Person|ProfilePage|BlogPosting)$/i) ? 'Author/person schema detected' : 'No author entity detected during scan',
			why: 'Adds expertise and accountability signals to content.',
			impact: '+2% estimated content trust impact',
			effort: 'Low'
		},
		{
			name: 'Contact Consistency',
			status: hasEmail && hasPhone ? 'Found' : hasEmail || hasPhone ? 'Weak' : 'Missing',
			evidence: `${hasEmail ? 'Email detected' : 'Email missing'} / ${hasPhone ? 'phone detected' : 'phone missing'}`,
			why: 'Confirms customers and crawlers can verify how to reach the business.',
			impact: '+3% estimated trust impact',
			effort: 'Low'
		},
		{
			name: 'NAP Consistency',
			status: hasPhone && hasAddress ? 'Found' : hasPhone || hasAddress ? 'Weak' : 'Missing',
			evidence: `${hasPhone ? 'Phone detected' : 'Phone missing'} / ${hasAddress ? 'address detected' : 'address missing'}`,
			why: 'Name, address, and phone consistency supports local trust and citations.',
			impact: '+4% estimated local SEO impact',
			effort: 'Medium'
		}
	];
	return [...externalSources, ...schemaSources];
}

function reviewSignalsFromHtml(html) {
	const source = String(html || '');
	const hasAggregate = /aggregateRating|reviewCount|ratingValue/i.test(source);
	const hasReviewText = /\breviews?\b|\btestimonials?\b/i.test(stripHtml(source));
	return {
		status: hasAggregate ? 'Strong' : hasReviewText ? 'Weak' : 'Missing',
		aggregateRating: hasAggregate,
		pageMentions: hasReviewText
	};
}

function executiveScoreComponents(findings) {
	const title = findings.title ? 12 : 0;
	const description = findings.description ? 12 : 0;
	const h1 = findings.h1 ? 10 : 0;
	const contentDepth = findings.wordCount >= 900 ? 18 : findings.wordCount >= 450 ? 13 : findings.wordCount >= 200 ? 8 : 3;
	const linkDepth = Math.min(12, findings.internalLinks * 2);
	const trustFound = findings.trustCoverage.filter(item => item.status === 'Found').length;
	const trustWeak = findings.trustCoverage.filter(item => item.status === 'Weak').length;
	const trustCoverageMax = Math.max(1, findings.trustCoverage.length);
	const trustDensity = ((trustFound + trustWeak * .55) / trustCoverageMax) * 100;
	const schemaScore = findings.schemaDetected ? 18 : 0;
	const faqScore = findings.faqDetected ? 8 : 0;
	const speedScore = findings.responseMs < 900 ? 20 : findings.responseMs < 1800 ? 15 : findings.responseMs < 3200 ? 9 : 4;
	const statusScore = findings.statusCode >= 200 && findings.statusCode < 300 ? 20 : findings.statusCode < 400 ? 12 : 0;
	const metadataScore = statusPoints(findings.titleQuality) + statusPoints(findings.metaDescriptionQuality) + statusPoints(findings.canonical) + statusPoints(findings.openGraph) + statusPoints(findings.twitterCards);
	const technicalEvidence = statusPoints(findings.schemaValidation) + statusPoints(findings.indexability) + statusPoints(findings.crawlability) + statusPoints(findings.viewport);
	const contentEvidence = statusPoints(findings.headingHierarchy) + statusPoints(findings.imageAltCoverage) + statusPoints(findings.aiReadableContent);
	const brokenLinkPenalty = Math.min(12, findings.brokenInternalLinks * 4);
	return {
		localSeo: clampNumber((findings.sitemapFound ? 28 : 8) + (findings.robotsFound ? 18 : 6) + Math.min(28, trustDensity * .28) + Math.min(20, findings.internalLinks)),
		websiteHealth: clampNumber(statusScore + speedScore + title + description + h1 + Math.min(18, findings.internalLinks) + metadataScore * .16 - brokenLinkPenalty),
		trustCoverage: clampNumber(trustDensity * .78 + (findings.reviewSignals.status === 'Strong' ? 18 : findings.reviewSignals.status === 'Weak' ? 9 : 0)),
		aiVisibility: clampNumber(schemaScore + faqScore + title + description + Math.min(24, contentDepth + linkDepth) + statusPoints(findings.aiReadableContent) * .12),
		technicalHealth: clampNumber(statusScore + speedScore + (findings.schemaDetected ? 14 : 0) + (findings.sitemapFound ? 14 : 0) + (findings.robotsFound ? 10 : 0) + technicalEvidence * .12 - brokenLinkPenalty),
		authority: clampNumber(trustDensity * .45 + Math.min(28, findings.externalLinks * 2) + (findings.reviewSignals.status === 'Strong' ? 18 : findings.reviewSignals.status === 'Weak' ? 8 : 0)),
		content: clampNumber(title + description + h1 + contentDepth + (findings.faqDetected ? 10 : 0) + Math.min(22, findings.internalLinks) + contentEvidence * .1),
		reputation: clampNumber((findings.reviewSignals.status === 'Strong' ? 44 : findings.reviewSignals.status === 'Weak' ? 24 : 6) + trustDensity * .32)
	};
}

function statusPoints(signal = {}) {
	const status = String(signal.status || '').toLowerCase();
	if (status === 'found' || status === 'valid') return 10;
	if (status === 'weak') return 5;
	return 0;
}

function weightedBusinessGrowthScore(components) {
	const weights = {
		localSeo: .14,
		websiteHealth: .16,
		trustCoverage: .18,
		aiVisibility: .14,
		technicalHealth: .12,
		authority: .1,
		content: .1,
		reputation: .06
	};
	return clampNumber(Object.entries(weights).reduce((sum, [key, weight]) => sum + (components[key] || 0) * weight, 0));
}

function clampNumber(value) {
	return Math.max(0, Math.min(100, Math.round(Number(value) || 0)));
}

function timelineFromFindings(findings, score) {
	const events = [
		['Now', 'Website scan completed', `HTTP ${findings.statusCode} / ${findings.responseMs}ms response`, findings.statusCode < 400 ? 'complete' : 'warning'],
		['Now', 'Technical audit completed', `${findings.robotsFound ? 'Robots found' : 'Robots missing'} / ${findings.sitemapFound ? 'sitemap found' : 'sitemap not found'}`, findings.sitemapFound && findings.robotsFound ? 'complete' : 'warning'],
		['Now', 'Schema analysis completed', findings.schemaDetected ? `${findings.schemaTypes.join(', ')} detected` : 'No JSON-LD schema detected', findings.schemaDetected ? 'complete' : 'warning'],
		['Now', 'Metadata reviewed', `${findings.canonical.status} canonical / ${findings.openGraph.status} OpenGraph / ${findings.twitterCards.status} Twitter Cards`, findings.canonical.status === 'Found' && findings.openGraph.status === 'Found' ? 'complete' : 'warning'],
		['Now', 'Link integrity checked', `${findings.brokenInternalLinks}/${findings.checkedInternalLinks} checked internal links broken`, findings.brokenInternalLinks ? 'warning' : 'complete'],
		['Now', 'Content evaluated', `${findings.wordCount} words / ${findings.h1 ? 'H1 found' : 'H1 not detected'}`, findings.wordCount >= 450 && findings.h1 ? 'complete' : 'warning'],
		['Now', 'Accessibility signals checked', `${findings.imageAltCoverage.evidence} / ${findings.headingHierarchy.evidence}`, findings.imageAltCoverage.status === 'Found' && findings.headingHierarchy.status === 'Found' ? 'complete' : 'warning'],
		['Now', 'Trust coverage reviewed', `${findings.trustCoverage.filter(item => item.status === 'Found').length} trust sources found`, findings.trustCoverage.some(item => item.status === 'Found') ? 'stable' : 'warning'],
		['Now', 'Business Growth Score calculated', `${score}/100 from weighted scan components`, 'growth']
	];
	if (findings.reviewSignals.status !== 'Missing') events.splice(4, 0, ['Now', 'Review signals detected', `${findings.reviewSignals.status} reputation signal`, findings.reviewSignals.status === 'Strong' ? 'complete' : 'stable']);
	return events;
}

function keywordOpportunitiesFromFindings(findings) {
	const source = `${findings.title} ${findings.description} ${findings.h1}`.toLowerCase();
	const stop = new Set(['the', 'and', 'for', 'with', 'from', 'your', 'our', 'you', 'are', 'that', 'this', 'near', 'best', 'home', 'page']);
	const words = source.match(/[a-z][a-z0-9-]{3,}/g) || [];
	const counts = words.reduce((map, word) => {
		if (!stop.has(word)) map[word] = (map[word] || 0) + 1;
		return map;
	}, {});
	return Object.entries(counts)
		.sort((a, b) => b[1] - a[1])
		.slice(0, 5)
		.map(([keyword, count]) => ({
			keyword,
			currentRanking: 'Ranking data pending.',
			opportunityLevel: count > 1 ? 'Medium' : 'Low',
			projectedBusinessImpact: 'Visibility opportunity; ranking data not connected.',
			estimatedVisibilityGain: findings.schemaDetected ? 'Pending ranking data' : 'Pending schema/content validation'
		}));
}

function scoreExplanation(components) {
	return Object.entries(components).map(([key, value]) => ({
		component: key.replace(/([A-Z])/g, ' $1').replace(/^./, char => char.toUpperCase()),
		value,
		source: 'Executive Scan'
	}));
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
