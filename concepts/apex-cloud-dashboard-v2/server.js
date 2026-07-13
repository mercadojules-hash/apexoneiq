const http = require('http');
const fs = require('fs');
const path = require('path');

const root = __dirname;
const port = Number(process.env.PORT || 4177);

loadEnvFile(path.join(root, '.env'));
loadEnvFile(path.join(root, '.env.sandbox'));

const plans = {
	cloud: {
		env: 'NEXT_PUBLIC_STRIPE_PRICE_CLOUD',
		name: 'Apex Cloud',
		workspace: 'cloud',
		entitlementKind: 'software'
	},
	command: {
		env: 'NEXT_PUBLIC_STRIPE_PRICE_COMMAND',
		name: 'Apex Command',
		workspace: 'command',
		entitlementKind: 'software'
	},
	essentials: {
		env: 'NEXT_PUBLIC_STRIPE_PRICE_ESSENTIALS',
		name: 'Apex Concierge Essentials',
		workspace: 'concierge_essentials',
		entitlementKind: 'managed_service'
	},
	growth: {
		env: 'NEXT_PUBLIC_STRIPE_PRICE_GROWTH',
		name: 'Apex Concierge Growth',
		workspace: 'concierge_growth',
		entitlementKind: 'managed_service'
	}
};

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
		if (req.method === 'POST' && url.pathname.startsWith('/api/billing/checkout/')) {
			await handleCheckout(req, res, url);
			return;
		}
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
	const planKey = url.pathname.split('/').filter(Boolean).pop();
	const plan = plans[planKey];
	if (!plan) {
		sendJson(res, 404, { error: 'unknown_plan' });
		return;
	}

	const secret = process.env.STRIPE_SECRET_KEY;
	if (!secret) {
		sendJson(res, 503, {
			error: 'stripe_not_configured',
			message: 'STRIPE_SECRET_KEY is required to create a sandbox Checkout Session.'
		});
		return;
	}
	if (!secret.startsWith('sk_test_')) {
		sendJson(res, 400, {
			error: 'live_key_rejected',
			message: 'Only Stripe sandbox secret keys are allowed in this concept.'
		});
		return;
	}

	const price = process.env[plan.env];
	if (!price) {
		sendJson(res, 503, {
			error: 'price_not_configured',
			message: `${plan.env} is required for ${plan.name}.`
		});
		return;
	}

	const origin = `${url.protocol}//${req.headers.host}`;
	const body = new URLSearchParams({
		mode: 'subscription',
		success_url: `${origin}/checkout/success.html?session_id={CHECKOUT_SESSION_ID}&plan=${encodeURIComponent(planKey)}`,
		cancel_url: `${origin}/checkout/cancel.html?plan=${encodeURIComponent(planKey)}`,
		'line_items[0][price]': price,
		'line_items[0][quantity]': '1',
		'metadata[apex_plan]': planKey,
		'metadata[apex_workspace]': plan.workspace,
		'metadata[entitlement_kind]': plan.entitlementKind,
		'metadata[environment]': 'sandbox'
	});

	const stripeResponse = await fetch('https://api.stripe.com/v1/checkout/sessions', {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${secret}`,
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
		plan: planKey,
		entitlementKind: plan.entitlementKind
	});
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
