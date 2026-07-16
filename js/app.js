const apexRoot = window.ApexOneIQ?.baseUrl || `${location.origin}/`;
const apexAuthUrl = window.ApexOneIQ?.authUrl || `${apexRoot}sign-in.html`;
const apexRegisterUrl = window.ApexOneIQ?.registerUrl || `${apexRoot}register/`;
const apexRoutePath = location.pathname.replace(/\/$/, '');
const route = document.body.dataset.route || apexRoutePath.split('/').pop() || 'dashboard.html';
const apexDemoMode = Boolean(window.ApexOneIQ?.demoMode) || new URLSearchParams(location.search).get('demo') === '1';
const apexWordPressMode = typeof window.ApexOneIQ !== 'undefined';
const apexProfileKey = 'apexoneiq_free_profile';
const apexSessionKey = 'apexoneiq_auth_user';
const apexHref = href => {
	if (!href || /^(https?:|mailto:|tel:|#|\/)/.test(href)) {
		return href;
	}

	return `${apexRoot}${href}`;
};
const apexBrandLogoUrl = apexHref('assets/brand/apexoneiq-logo.png');
const apexPageUrl = page => new URL(apexHref(page), window.location.origin).toString();
document.body.classList.add(`route-${route.replace(/[^a-z0-9]/gi, '-').toLowerCase()}`);
if (apexDemoMode) document.body.classList.add('demo-mode');

function safeJsonParse(value, fallback = null) {
	try {
		return JSON.parse(value || 'null') || fallback;
	} catch (error) {
		return fallback;
	}
}

function readStorage(key, fallback = null) {
	try {
		return safeJsonParse(localStorage.getItem(key), fallback);
	} catch (error) {
		return fallback;
	}
}

function writeStorage(key, value) {
	try {
		localStorage.setItem(key, JSON.stringify(value));
	} catch (error) {
		// Local storage is a convenience for the standalone prototype; WordPress remains the source of truth.
	}
}

function initialsFor(nameOrEmail = 'JM') {
	const source = String(nameOrEmail || 'JM').replace(/@.*$/, '').trim();
	const parts = source.split(/[\s._-]+/).filter(Boolean);
	const initials = parts.length > 1 ? `${parts[0][0]}${parts[1][0]}` : source.slice(0, 2);
	return initials.toUpperCase() || 'JM';
}

function getApexUser() {
	const wpUser = window.ApexOneIQ?.isLoggedIn ? {
		name: window.ApexOneIQ?.userName || window.ApexOneIQ?.businessName || window.ApexOneIQ?.businessEmail || 'Apex User',
		email: window.ApexOneIQ?.businessEmail || '',
		initials: window.ApexOneIQ?.userInitials || initialsFor(window.ApexOneIQ?.userName || window.ApexOneIQ?.businessEmail || 'JM'),
		source: 'wordpress'
	} : null;
	return wpUser || readStorage(apexSessionKey, null);
}

function ensurePrototypeUser() {
	const existing = getApexUser();
	if (existing) return existing;
	const user = {
		name: 'Jules Mercado',
		email: 'owner@apexoneiq.com',
		initials: 'JM',
		source: 'prototype',
		createdAt: new Date().toISOString()
	};
	writeStorage(apexSessionKey, user);
	return user;
}

function getStoredProfile() {
	const stored = readStorage(apexProfileKey, null);
	if (stored?.website) return stored;
	if (window.ApexOneIQ?.businessWebsite) {
		const score = Number(window.ApexOneIQ.scanScore || 0) || scanScoreFor(window.ApexOneIQ.businessWebsite);
		const scanCompleted = Boolean(window.ApexOneIQ.scanCompleted || window.ApexOneIQ.workspaceReady);
		return {
			businessName: window.ApexOneIQ.businessName || new URL(window.ApexOneIQ.businessWebsite).hostname.replace(/^www\./, ''),
			website: window.ApexOneIQ.businessWebsite,
			email: window.ApexOneIQ.businessEmail || '',
			scanCompleted,
			score,
			createdAt: new Date().toISOString(),
			completedAt: window.ApexOneIQ.scanCompletedAt || '',
			trend: Array.isArray(window.ApexOneIQ.scanTrend) && window.ApexOneIQ.scanTrend.length ? window.ApexOneIQ.scanTrend : [12, 28, 41, 55, score],
			dataMode: 'wordpress-profile'
		};
	}
	return null;
}

function saveProfile(profile) {
	writeStorage(apexProfileKey, profile);
	return profile;
}

function scoreLabel(score) {
	if (score >= 85) return 'Excellent';
	if (score >= 72) return 'Strong';
	if (score >= 62) return 'Good';
	if (score >= 45) return 'Needs Attention';
	return 'Critical';
}

function scanScoreFor(website) {
	const host = new URL(website).hostname.replace(/^www\./, '');
	const seed = [...host].reduce((sum, char) => sum + char.charCodeAt(0), 0);
	return 54 + (seed % 18);
}

function workspaceDomain(website) {
	if (!website) return '';
	try {
		return new URL(website).hostname.replace(/^www\./, '');
	} catch (error) {
		return String(website).replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
	}
}

function formatWorkspaceDate(value) {
	if (!value) return 'No completed scan';
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return value;
	return date.toLocaleString([], { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });
}

function getWorkspaceContext() {
	const profile = getStoredProfile();
	const domain = workspaceDomain(profile?.website) || profile?.businessName || 'Business not selected';
	const scanCompleted = Boolean(profile?.scanCompleted);
	const lastScan = scanCompleted ? formatWorkspaceDate(profile?.completedAt || profile?.createdAt) : 'No completed scan';
	return {
		domain,
		status: scanCompleted ? 'Executive profile active' : 'Executive scan pending',
		lastScan,
		lastUpdate: scanCompleted ? lastScan : 'Awaiting first scan',
		website: profile?.website || ''
	};
}

const pageTitles = {
	'index.html': 'ApexOneIQ - AI Executive Intelligence for Business Growth',
	'dashboard.html': 'ApexOneIQ - Supporting Intelligence',
	'executive-brief.html': 'ApexOneIQ - Executive Brief',
	'mission-workspace.html': 'ApexOneIQ - Mission Workspace',
	'opportunities.html': 'ApexOneIQ - Action Center',
	'competitors.html': 'ApexOneIQ - Competitor Intelligence',
	'business-timeline.html': 'ApexOneIQ - Executive Journal',
	'monitoring-center.html': 'ApexOneIQ - Business Pulse',
	'forecast.html': 'ApexOneIQ - Future Simulation',
	'reports.html': 'ApexOneIQ - Board Briefings',
	'ai-visibility.html': 'ApexOneIQ - AI Recommendations',
	'website-overview.html': 'ApexOneIQ - Website Overview',
	'organic-keywords.html': 'ApexOneIQ - Organic Keywords',
	'keyword-opportunities.html': 'ApexOneIQ - Keyword Opportunities',
	'competitor-intelligence.html': 'ApexOneIQ - Competitor Intelligence',
	'backlinks.html': 'ApexOneIQ - Backlink Intelligence',
	'content-gap.html': 'ApexOneIQ - Content Gap',
	'site-audit.html': 'ApexOneIQ - Site Audit Intelligence',
	'intelligence-ai-visibility.html': 'ApexOneIQ - AI Visibility Intelligence',
	'search-trends.html': 'ApexOneIQ - Search Trends',
	'local-rankings.html': 'ApexOneIQ - Local Rankings',
	'history.html': 'ApexOneIQ - Market Intelligence',
	'alerts.html': 'ApexOneIQ - Decision Alerts',
	'website-profile.html': 'ApexOneIQ - Website Health',
	'settings.html': 'ApexOneIQ - Settings',
	'command-dashboard.html': 'ApexOneIQ - Execution Center',
	'enterprise-dashboard.html': 'ApexOneIQ - Enterprise Operations',
	'concierge-dashboard.html': 'ApexOneIQ - Concierge Workspace',
	'concierge-essentials-dashboard.html': 'ApexOneIQ - Concierge Essentials',
	'subscription.html': 'ApexOneIQ - Subscription Plans',
	'concierge-enrollment.html': 'ApexOneIQ - Concierge Enrollment',
	'sign-in.html': 'ApexOneIQ - Executive Sign In',
	'register': 'ApexOneIQ - Create Free Account'
};

document.title = pageTitles[route] || 'ApexOneIQ - Executive Intelligence OS';

const executiveNav = [
	['Workspace', [
		['Executive Brief', 'executive-brief.html'],
		['Mission Workspace', 'mission-workspace.html'],
		['Billing', 'subscription.html'],
		['Settings', 'settings.html']
	]],
	['Supporting Detail', [
		['Legacy Dashboard', 'dashboard.html'],
		['Priority Detail', 'opportunities.html'],
		['Forecast Detail', 'forecast.html']
	]]
];

const commandPreviewNav = [
	['Cloud Intelligence', [
		['Mission Control', 'dashboard.html'],
		['Executive Brief', 'executive-brief.html'],
		['Mission Workspace', 'mission-workspace.html'],
		['Reports', 'reports.html']
	]],
	['Intelligence Research', [
		['Website Overview', 'website-overview.html'],
		['Organic Keywords', 'organic-keywords.html'],
		['Keyword Opportunities', 'keyword-opportunities.html'],
		['Competitor Intelligence', 'competitor-intelligence.html'],
		['AI Visibility', 'intelligence-ai-visibility.html'],
		['Local Rankings', 'local-rankings.html']
	]],
	['Execution', [
		['Execution Center', 'command-dashboard.html'],
		['Approval Queue', 'command-dashboard.html#approvals'],
		['Mission Queue', 'command-dashboard.html#mission-queue'],
		['Permissions', 'command-dashboard.html#permissions']
	]],
	['Upgrade-Only', [
		['Managed Concierge', null, 'Upgrade'],
		['Enterprise Governance', null, 'Upgrade']
	]]
];

const essentialsPreviewNav = [
	['Managed Service', [
		['Essentials Dashboard', 'concierge-essentials-dashboard.html'],
		['Monthly Priorities', 'concierge-essentials-dashboard.html#priorities'],
		['Approvals', 'concierge-essentials-dashboard.html#approvals'],
		['Completed Work', 'concierge-essentials-dashboard.html#completed'],
		['Upcoming Work', 'concierge-essentials-dashboard.html#upcoming'],
		['Reports', 'concierge-essentials-dashboard.html#reports'],
		['Support', 'mailto:support@apexoneiq.com']
	]],
	['Included Intelligence Context', [
		['Cloud Intelligence', 'dashboard.html?demo=1', 'Included context'],
		['Website Overview', 'website-overview.html?demo=1', 'Preview'],
		['AI Visibility', 'intelligence-ai-visibility.html?demo=1', 'Preview'],
		['Keyword Opportunities', null, 'Cloud'],
		['Command Execution', null, 'Upgrade'],
		['Concierge Growth', null, 'Upgrade']
	]]
];

function navForRoute(currentRoute) {
	if (currentRoute === 'command-dashboard.html') return commandPreviewNav;
	if (currentRoute === 'concierge-essentials-dashboard.html') return essentialsPreviewNav;
	return executiveNav;
}

function hrefWithDemo(href) {
	if (!apexDemoMode || !href || href.startsWith('mailto:') || href.startsWith('#')) return href;
	if (href.includes('subscription.html')) return href;
	const url = new URL(apexHref(href), window.location.origin);
	url.searchParams.set('demo', '1');
	return url.toString();
}

document.querySelectorAll('.nav-list, .free-workspace aside > .workspace-nav:first-of-type, .command-workspace aside > .workspace-nav:first-of-type, .concierge-essentials-workspace aside > .workspace-nav:first-of-type').forEach(nav => {
	const groups = navForRoute(route).filter(([label]) => !(apexDemoMode && label === 'System'));
	nav.innerHTML = groups.map(([label, items]) => `
		<div class="nav-group">
			<div class="nav-group-label">${label}</div>
			${items.map(([name, href, badge]) => href
				? `<a class="nav-link" data-nav href="${hrefWithDemo(href)}"><span>${name}</span>${badge ? `<small>${badge}</small>` : ''}</a>`
				: `<span class="nav-link nav-link-muted"><span>${name}</span><small>${badge || 'Soon'}</small></span>`
			).join('')}
		</div>
	`).join('');
});

if (apexDemoMode) {
	document.querySelectorAll('.account').forEach(account => {
		account.innerHTML = '<span class="status-pill status-ok">Demo Workspace</span><a class="ghost-button" href="/register/">Start Free</a>';
	});
	document.querySelectorAll('.site-card strong').forEach(item => item.textContent = 'Demo Business');
	document.querySelectorAll('.avatar').forEach(item => item.textContent = 'DW');
	document.querySelectorAll('[data-checkout-plan], [data-complete], [data-enroll-submit]').forEach(control => {
		control.disabled = true;
		control.setAttribute('aria-disabled', 'true');
		control.dataset.ask = 'Create a free account to use authenticated workspace actions.';
	});
	const main = document.querySelector('.main');
	if (main && !main.querySelector('[data-demo-banner]')) {
		const banner = document.createElement('section');
		banner.className = 'demo-banner';
		banner.dataset.demoBanner = '';
		banner.innerHTML = '<strong>Demo Workspace</strong><span>Safe mock data only. Settings, billing, integrations, and account-management controls are hidden until sign-in.</span>';
		main.prepend(banner);
	}
}

document.querySelectorAll('.brand strong').forEach(item => item.textContent = 'ApexOneIQ');
document.querySelectorAll('.brand span').forEach(item => item.textContent = 'Executive Intelligence OS');
document.querySelectorAll('.logo, .landing-logo').forEach(item => {
	item.textContent = '';
	item.classList.add('brand-logo-mark');
	const image = document.createElement('img');
	image.src = apexBrandLogoUrl;
	image.alt = 'ApexOneIQ';
	image.loading = 'eager';
	item.appendChild(image);
});
document.querySelectorAll('.system-card .eyebrow').forEach(item => item.textContent = 'ApexOneIQ focus');
document.querySelectorAll('.system-card p').forEach(item => item.textContent = 'The Executive Brief is the center of the ApexOneIQ customer experience.');
document.querySelectorAll('.system-card .button').forEach(item => item.textContent = 'Open Executive Brief');

function renderWorkspaceContext() {
	if (apexDemoMode || !getApexUser()) return;
	const context = getWorkspaceContext();
	document.querySelectorAll('.site-card').forEach(card => {
		const eyebrow = card.querySelector('.eyebrow');
		const title = card.querySelector('strong');
		const copy = card.querySelector('p');
		if (eyebrow) eyebrow.innerHTML = `<span class="live-dot"></span>${escapeHtml(context.status)}`;
		if (title) title.textContent = context.domain;
		if (copy) copy.textContent = `Last scan: ${context.lastScan} / Last update: ${context.lastUpdate}`;
		card.dataset.workspaceContext = '';
	});
	document.querySelectorAll('.topbar .account').forEach(account => {
		if (account.querySelector('[data-workspace-pill]')) return;
		const pill = document.createElement('span');
		pill.className = 'status-pill status-ok';
		pill.dataset.workspacePill = '';
		pill.textContent = context.domain;
		account.prepend(pill);
	});
}

function renderAccountState() {
	if (apexDemoMode) return;
	const user = getApexUser();

	document.querySelectorAll('.account').forEach(account => {
		const askQuestion = account.querySelector('[data-ask]')?.dataset.ask || routeAskDefaults[route] || 'What should I do next?';
		const exportButton = route === 'executive-brief.html'
			? '<button class="ghost-button" type="button" data-export-brief-pdf>Export PDF</button>'
			: '';
		if (!user) {
			account.innerHTML = `${exportButton}<a class="ghost-button sign-in-link" data-sign-in-link href="${escapeHtml(apexAuthUrl)}">Sign In</a><div class="avatar">IQ</div>`;
			return;
		}

		account.innerHTML = `
			${exportButton}
			<button class="ghost-button" type="button" data-ask="${escapeHtml(askQuestion)}">Ask Apex</button>
			<div class="account-menu" data-account-menu>
				<button class="account-trigger" type="button" data-account-toggle aria-expanded="false">
					<span class="avatar">${escapeHtml(user.initials || initialsFor(user.name || user.email))}</span>
					<span>${escapeHtml(user.initials || initialsFor(user.name || user.email))}</span>
					<small>v</small>
				</button>
				<div class="account-dropdown" role="menu">
					<a href="${escapeHtml(apexPageUrl('executive-brief.html'))}" role="menuitem">My Workspace</a>
					<a href="${escapeHtml(apexPageUrl('account.html'))}" role="menuitem">Account</a>
					<a href="${escapeHtml(apexPageUrl('subscription.html'))}" role="menuitem">Billing</a>
					<a href="${escapeHtml(apexPageUrl('settings.html'))}" role="menuitem">Settings</a>
					<button type="button" data-apex-logout role="menuitem">Logout</button>
				</div>
			</div>
		`;
	});

	if (user) {
		document.querySelectorAll('.landing-nav .nav-cta').forEach(link => {
			link.textContent = 'My Workspace';
			link.href = apexPageUrl(getStoredProfile()?.scanCompleted ? 'executive-brief.html' : 'sign-in.html');
		});
		document.querySelectorAll('.landing-nav a').forEach(link => {
			if (/sign in|google sign in/i.test(link.textContent || '')) {
				link.textContent = 'My Workspace';
				link.href = apexPageUrl(getStoredProfile()?.scanCompleted ? 'executive-brief.html' : 'sign-in.html');
			}
		});
	}
	renderWorkspaceContext();
	renderPlanPills();
}

document.querySelectorAll('[data-nav]').forEach(link => {
	const hrefRoute = link.getAttribute('href').split('/').pop();
	if (hrefRoute === route || (route === 'index.html' && hrefRoute === 'dashboard.html')) {
		link.classList.add('active');
	}
});

document.querySelectorAll('[data-range]').forEach(button => {
	button.addEventListener('click', () => {
		const group = button.closest('.range, .filter');
		group.querySelectorAll('button').forEach(item => item.classList.remove('active'));
		button.classList.add('active');
		document.querySelectorAll('[data-range-label]').forEach(label => {
			label.textContent = button.dataset.range;
		});
	});
});

document.querySelectorAll('[data-filter]').forEach(button => {
	button.addEventListener('click', () => {
		const filter = button.dataset.filter;
		button.closest('.filter').querySelectorAll('button').forEach(item => item.classList.remove('active'));
		button.classList.add('active');
		document.querySelectorAll('[data-severity], [data-engine], [data-opportunity]').forEach(row => {
			const key = row.dataset.severity || row.dataset.engine || row.dataset.opportunity;
			row.hidden = filter !== 'all' && key !== filter;
		});
	});
});

document.querySelectorAll('[data-complete]').forEach(button => {
	button.addEventListener('click', () => {
		const row = button.closest('.data-row, .opportunity');
		row.classList.toggle('done');
		button.textContent = row.classList.contains('done') ? 'Completed' : 'Mark complete';
	});
});

let drawer = document.querySelector('[data-drawer]');
if (!drawer) {
	drawer = document.createElement('aside');
	drawer.className = 'drawer advisor-drawer';
	drawer.dataset.drawer = '';
	drawer.setAttribute('aria-live', 'polite');
	drawer.innerHTML = `
		<button class="ghost-button drawer-close" data-close-drawer>x</button>
		<div class="panel-label" data-drawer-label>Executive Intelligence</div>
		<h2 data-drawer-title>Finding</h2>
		<div class="drawer-nav" data-drawer-nav hidden></div>
		<div data-drawer-text></div>
	`;
	document.body.appendChild(drawer);
}
const drawerLabel = document.querySelector('[data-drawer-label]');
const drawerTitle = document.querySelector('[data-drawer-title]');
const drawerText = document.querySelector('[data-drawer-text]');
if (drawer && !drawer.querySelector('[data-drawer-nav]')) {
	drawerTitle.insertAdjacentHTML('afterend', '<div class="drawer-nav" data-drawer-nav hidden></div>');
}

const askResponses = {
	'Why is my Business Trust only 68?': 'Business Trust is 68 because your relevance is improving faster than your local trust. Apex sees an incomplete Google Business Profile, thin service-area proof, and fewer trusted listings than the closest competitors. The fastest fix is completing the trust layer before publishing more broad content.',
	'Why is Business Trust only 68?': 'Business Trust is 68 because your relevance is improving faster than your local proof. The profile trust layer, service-area proof, and trusted listings are still below the competitor band. Complete the Google Business Profile playbook first.',
	'Why is Forecast Confidence 72%?': 'Forecast Confidence is 72% because the current trend is positive but action-dependent. Customer discovery and AI recommendations improved, but business trust is still limiting the Top 10 path. Completing recommendation #1 lifts the model to 78%; completing #1-3 lifts it to 87%.',
	'Why is Northstar Legal outranking me?': 'Northstar Legal is ahead because it recently gained service-area proof and has stronger local proof signals. The gap is beatable: your AI recommendation presence is growing, and Apex recommends trust completion plus comparison content to counter their advantage.',
	"Explain today's recommendation.": 'Today Apex recommends completing the Google Business Profile trust layer because it has the strongest combination of business impact, confidence, short completion time, low difficulty, projected AVI increase, revenue potential, and urgency.',
	"Explain today's report.": 'Today’s report says the business is improving, but the next executive decision is still trust completion. Discovery and AI mentions are moving up; the constraint is whether buyers and recommendation engines have enough proof to choose you confidently.',
	'Why is this ranked #1?': 'This is ranked #1 because it has the strongest mix of business impact, confidence, speed, and dependency value. Completing it unlocks better results from the service-area page, trusted listings, and AI comparison content.',
	'Why does ChatGPT say "Indirect"?': 'ChatGPT says "Indirect" because the business is being referenced through category or competitor context rather than as the direct recommended answer. Apex would improve this by strengthening trust proof first, then publishing comparison-ready content.',
	'Compare me against Northstar.': 'Northstar is currently more dangerous on local proof and service-area specificity. You are improving faster in AI discovery, but Northstar still has the trust advantage. The right response is not panic; complete the trust layer, then add service-area proof.',
	'Explain the largest issue.': 'The largest issue is not visibility volume; it is business trust. The business is discoverable enough to create opportunity, but incomplete proof is limiting conversion, AI recommendation stability, and forecast confidence.',
	'What happens if I ignore this opportunity?': 'If you ignore it, Apex expects the momentum window to decay over seven days. The business may still improve, but forecast confidence drops because competitors can continue compounding trust while your business trust constraint remains unresolved.',
	'Why are AI recommendations improving?': 'AI recommendations are improving because two comparison-style prompts now mention the business. Apex classifies this as early growth, not dominance. Publishing a comparison page can make the business a more stable answer source.',
	'What does Google volatility mean?': 'Google volatility means market surfaces and AI recommendations are moving more than normal in your category. In this case it is not a crisis. It is an opportunity window because the market is fluid and Apex sees a low-effort trust action with high confidence.'
};

const routeAskDefaults = {
	'dashboard.html': 'Why is Business Trust only 68?',
	'executive-brief.html': "Explain today's report.",
	'opportunities.html': 'Why is this ranked #1?',
	'mission-workspace.html': 'What has Apex already prepared?',
	'ai-visibility.html': 'Why does ChatGPT say "Indirect"?',
	'competitors.html': 'Compare me against Northstar.',
	'history.html': 'Explain the latest market movement.',
	'website-profile.html': 'Explain the largest issue.',
	'monitoring-center.html': 'What business condition needs attention?',
	'business-timeline.html': 'What did Apex learn from the timeline?',
	'forecast.html': 'Why is Forecast Confidence 72%?',
	'reports.html': "Explain today's report.",
	'alerts.html': 'Which alert deserves action?',
	'settings.html': 'What setup issue affects growth today?',
	'website-overview.html': 'Where does my website stand?',
	'organic-keywords.html': 'Which keyword should I improve first?',
	'keyword-opportunities.html': 'Which opportunity has the highest ROI?',
	'competitor-intelligence.html': 'Why is this competitor gaining?',
	'backlinks.html': 'Which authority gap matters most?',
	'content-gap.html': 'Which missing page has the largest business impact?',
	'site-audit.html': 'Which site issue costs the most revenue?',
	'intelligence-ai-visibility.html': 'How do I become a stronger AI recommendation?',
	'search-trends.html': 'Which trend should I act on this week?',
	'local-rankings.html': 'Which city needs attention first?',
	'command-dashboard.html': 'What is Apex executing right now?',
	'enterprise-dashboard.html': 'Which region needs intervention?',
	'concierge-dashboard.html': "Summarize today's Concierge progress.",
	'concierge-essentials-dashboard.html': 'Explain Concierge Essentials.',
	'subscription.html': 'Which ApexOneIQ workspace should I preview first?',
	'concierge-enrollment.html': 'Help me choose a Concierge plan.',
	'sign-in.html': 'Explain the ApexOneIQ sign-in options.',
	'register': 'What happens after I create a free account?'
};

const routeAskSuggestions = {
	'dashboard.html': ['Why is Business Trust only 68?', "Explain today's recommendation.", 'What happens if I ignore this opportunity?'],
	'executive-brief.html': ["Explain today's report.", 'What should I do first?', 'What can wait?'],
	'opportunities.html': ['Why is this ranked #1?', 'What unlocks after this?', 'What happens if I wait?'],
	'mission-workspace.html': ['What is ready for approval?', 'What did Apex prepare?', 'What prevents execution?'],
	'ai-visibility.html': ['Why does ChatGPT say "Indirect"?', 'Why are AI recommendations improving?', 'What improves AI discovery?'],
	'competitors.html': ['Compare me against Northstar.', 'Who deserves immediate attention?', 'Which competitor can I ignore?'],
	'history.html': ['Explain the latest market movement.', 'What changed this week?', 'What should I do next?'],
	'website-profile.html': ['Explain the largest issue.', 'Which connection matters most?', 'What should I fix first?'],
	'monitoring-center.html': ['What business condition needs attention?', 'What can I ignore?', 'What changed risk today?'],
	'business-timeline.html': ['What did Apex learn from the timeline?', 'Which decision changed?', 'What happens next?'],
	'forecast.html': ['Why is Forecast Confidence 72%?', 'What changes the forecast?', 'What if I wait?'],
	'reports.html': ["Explain today's report.", 'Prepare the board summary.', 'What decision should this report drive?'],
	'alerts.html': ['Which alert deserves action?', 'What can be archived?', 'What should interrupt me?'],
	'settings.html': ['What setup issue affects growth today?', 'Explain billing status.', 'What privacy setting matters?'],
	'website-overview.html': ['Where does my website stand?', 'What is holding me back?', 'Where is the biggest opportunity?'],
	'organic-keywords.html': ['Which keyword should I improve first?', 'Why do competitors outrank us?', 'What page should support this keyword?'],
	'keyword-opportunities.html': ['Which opportunity has the highest ROI?', 'Show easy wins.', 'What should become a landing page?'],
	'competitor-intelligence.html': ['Why is this competitor gaining?', 'Which competitor is most dangerous?', 'What should I copy or avoid?'],
	'backlinks.html': ['Which authority gap matters most?', 'What link would change trust?', 'Which mentions should I pursue?'],
	'content-gap.html': ['Which missing page has the largest business impact?', 'Generate the next content brief.', 'What should wait?'],
	'site-audit.html': ['Which site issue costs the most revenue?', 'Open the highest priority playbook.', 'What can be ignored?'],
	'intelligence-ai-visibility.html': ['How do I become a stronger AI recommendation?', 'Which engine is weakest?', 'What proof is missing?'],
	'search-trends.html': ['Which trend should I act on this week?', 'What trend affects revenue?', 'What should I monitor?'],
	'local-rankings.html': ['Which city needs attention first?', 'Where is Map Pack movement possible?', 'Which ZIP has competitor pressure?'],
	'command-dashboard.html': ['What changed overnight?', 'What is waiting for me?', 'What will improve next?'],
	'enterprise-dashboard.html': ['Which region needs intervention?', 'Why is Florida behind Texas?', 'Generate the executive board report.'],
	'concierge-dashboard.html': ["Summarize today's Concierge progress.", 'Show work waiting for my approval.', 'Compare Concierge tiers.'],
	'concierge-essentials-dashboard.html': ['Explain Concierge Essentials.', 'What is pending approval?', 'Should I upgrade to Growth?'],
	'subscription.html': ['Which plan is right for me?', 'Compare Concierge tiers.', 'Explain annual software billing.'],
	'concierge-enrollment.html': ['Help me choose a Concierge plan.', 'What happens after I submit?', 'What should I connect first?'],
	'sign-in.html': ['Explain the ApexOneIQ sign-in options.', 'What happens after I create an account?', 'Why does Free start after sign-in?'],
	'register': ['What happens after I create a free account?', 'Why do I start on Free?', 'How does Google sign-in get enabled?']
};

renderAccountState();

const simScenarios = {
	current: {
		forecast: '72%',
		bar: '72%',
		timeline: 'Today',
		leads: 'Baseline',
		revenue: '$3,400/mo potential',
		confidence: '72%'
	},
	one: {
		forecast: '78%',
		bar: '78%',
		timeline: '7 Days',
		leads: '+9/mo',
		revenue: '$4,700/mo potential',
		confidence: '78%'
	},
	three: {
		forecast: '87%',
		bar: '87%',
		timeline: '30 Days',
		leads: '+23/mo',
		revenue: '$7,900/mo potential',
		confidence: '87%'
	}
};

function escapeHtml(value) {
	return String(value).replace(/[&<>"']/g, char => ({
		'&': '&amp;',
		'<': '&lt;',
		'>': '&gt;',
		'"': '&quot;',
		"'": '&#039;'
	})[char]);
}

const templateTitles = {
	'drawer-authority': 'Why Business Trust is 68',
	'drawer-gbp': 'Complete Google Business Profile',
	'drawer-chart': 'Why customer discovery increased',
	'drawer-roadmap': 'Improvement roadmap',
	'opp-gbp': 'Complete Google Business Profile',
	'opp-service': 'Create service area page',
	'opp-citation': 'Add five trusted listings',
	'opp-ai': 'Publish AI comparison page'
};

const playbookSequence = ['drawer-gbp', 'drawer-service-area', 'drawer-citations', 'drawer-comparison'];
const scanDrivenPlaybookMap = {
	'drawer-gbp': 'drawer-gbp',
	'drawer-service-area': 'drawer-service-area',
	'drawer-citations': 'drawer-citations',
	'drawer-comparison': 'drawer-comparison',
	'opp-gbp': 'drawer-gbp',
	'opp-service': 'drawer-service-area',
	'opp-citation': 'drawer-citations',
	'opp-ai': 'drawer-comparison'
};
let currentDrawerTemplate = '';
let drawerHistory = [];

function updatePlaybookProgress(scope) {
	const checks = [...scope.querySelectorAll('[data-play-check]')];
	if (!checks.length) return;
	const complete = checks.filter(check => check.checked).length;
	const percent = Math.round((complete / checks.length) * 100);
	scope.querySelectorAll('[data-playbook-progress]').forEach(item => item.textContent = `${percent}%`);
	scope.querySelectorAll('[data-playbook-count]').forEach(item => item.textContent = `${complete} of ${checks.length} steps`);
	scope.querySelectorAll('[data-playbook-bar]').forEach(item => item.style.width = `${percent}%`);
}

function updatePageProgress() {
	document.querySelectorAll('[data-today-progress]').forEach(item => item.textContent = '1 of 4');
	document.querySelectorAll('[data-week-completed]').forEach(item => item.textContent = '3');
	document.querySelectorAll('[data-progress-trust]').forEach(item => item.textContent = '74');
	document.querySelectorAll('[data-progress-discovery]').forEach(item => item.textContent = '+3.8%');
	document.querySelectorAll('[data-progress-ai]').forEach(item => item.textContent = '+21%');
	document.querySelectorAll('[data-progress-position]').forEach(item => item.textContent = '#11');
	document.querySelectorAll('[data-progress-revenue]').forEach(item => item.textContent = '$4,700/mo');
	document.querySelectorAll('[data-progress-bar="trust"]').forEach(item => item.style.width = '74%');
	document.querySelectorAll('[data-progress-bar="discovery"]').forEach(item => item.style.width = '68%');
	document.querySelectorAll('[data-progress-bar="ai"]').forEach(item => item.style.width = '61%');
	document.querySelectorAll('[data-progress-bar="position"]').forEach(item => item.style.width = '58%');
}

function scanEvidence() {
	const profile = getStoredProfile();
	const score = Number(profile?.score || 61);
	const domain = workspaceDomain(profile?.website) || 'the submitted website';
	const trend = Array.isArray(profile?.trend) && profile.trend.length ? profile.trend : [12, 28, 41, 55, score];
	const profileCompleteness = Math.max(38, Math.min(78, score + 7));
	const reviewDepth = Math.max(22, Math.min(72, score - 4));
	const localSignals = Math.max(30, Math.min(74, score + 1));
	const faqReadiness = score >= 72 ? 'Partial FAQ coverage found' : 'FAQ schema not detected in the scan baseline';
	return {
		profile,
		domain,
		score,
		trend,
		profileCompleteness,
		reviewDepth,
		localSignals,
		faqReadiness,
		completedAt: formatWorkspaceDate(profile?.completedAt || profile?.createdAt),
		gaps: [
			profileCompleteness < 82 ? 'Google Business Profile trust proof is incomplete.' : '',
			reviewDepth < 75 ? 'Review depth and recency are below the trust band.' : '',
			'Primary business categories and service categories need stronger confirmation.',
			faqReadiness,
			localSignals < 80 ? 'Local trust signals and citations are weaker than the leader band.' : '',
			'Trust entities should be reinforced with consistent business name, phone, service area, and third-party proof.'
		].filter(Boolean)
	};
}

function createScanPlaybookContent(templateId = 'drawer-gbp') {
	const evidence = scanEvidence();
	const content = document.createElement('div');
	content.className = 'scan-driven-playbook';
	const playbooks = {
		'drawer-gbp': {
			why: `Apex recommends the Google Business Profile trust layer because the ${evidence.domain} scan shows proof signals lagging behind visibility. The Business Growth Score™ is ${evidence.score}/100, profile completeness is ${evidence.profileCompleteness}%, and local trust signals are ${evidence.localSignals}/100.`,
			items: [
				['Confirm Google Business Profile ownership and core NAP consistency.', 'Missing or weak GBP proof lowers local trust and AI recommendation confidence.', '5 min'],
				['Add primary business categories and high-value service categories.', 'The scan found category proof is not strong enough to support the highest-confidence local recommendation.', '5 min'],
				['Add review proof and recent customer evidence.', 'Review depth is ' + evidence.reviewDepth + '%, which keeps trust below the leader band.', '4 min'],
				['Add FAQ schema for buyer objections and local service questions.', evidence.faqReadiness + '.', '3 min'],
				['Reinforce trust entities with citations and consistent service-area proof.', 'Apex found local signals at ' + evidence.localSignals + '/100, so third-party confirmation matters before broader content.', '4 min']
			],
			result: ['+6 AVI modeled lift', 'Higher Local Pack probability', '+9 estimated leads/month', '$1,300/month projected revenue lift', 'Confidence: 94%']
		},
		'drawer-service-area': {
			why: `Apex recommends service-area proof after GBP because ${evidence.domain} has a valid baseline, but the scan does not show enough geographic evidence to defend local relevance across buyer searches.`,
			items: [
				['Publish one focused service-area page.', 'Competitors can win when their location proof is clearer than yours.', '25 min'],
				['Add local examples, service terms, and trust proof.', 'Apex needs page-level evidence it can connect to the business entity.', '20 min'],
				['Link the page from the profile and core service pages.', 'Internal proof helps search and AI systems understand market coverage.', '10 min']
			],
			result: ['+4 AVI modeled lift', 'Better local relevance', 'Improves Top 10 probability', 'Confidence: 88%']
		},
		'drawer-citations': {
			why: `Apex recommends citations because ${evidence.domain} needs more third-party confirmation. The scan shows local trust at ${evidence.localSignals}/100, which is below the threshold for stable executive confidence.`,
			items: [
				['Add or correct five trusted listings.', 'Citation consistency strengthens the same business entity across the web.', '30 min'],
				['Match business name, phone, URL, category, and service area.', 'Conflicting NAP data weakens local trust and AI answer confidence.', '15 min'],
				['Record citation URLs for the next scan.', 'Future scans need evidence history to confirm progress.', '5 min']
			],
			result: ['+3 AVI modeled lift', 'Lower trust leakage', 'Stronger entity confidence', 'Confidence: 84%']
		},
		'drawer-comparison': {
			why: `Apex recommends AI comparison content only after trust proof because ${evidence.domain} needs stronger evidence before answer engines can confidently recommend it as the safer choice.`,
			items: [
				['Publish one comparison-ready page.', 'AI systems need structured decision evidence, not generic marketing copy.', '45 min'],
				['Add proof points, FAQs, service differences, and trust entities.', 'This supports direct recommendations instead of indirect category mentions.', '25 min'],
				['Connect the page to GBP, reviews, and citations.', 'The content performs better after the trust layer is complete.', '10 min']
			],
			result: ['+18% AI discovery potential', 'More stable answer-engine recommendations', 'Dependency: complete trust proof first', 'Confidence: 81%']
		}
	};
	const playbook = playbooks[templateId] || playbooks['drawer-gbp'];
	content.innerHTML = `
		<p>${escapeHtml(playbook.why)}</p>
		<div class="scan-evidence-panel">
			<div><span>Scan baseline</span><strong>${escapeHtml(evidence.completedAt)}</strong></div>
			<div><span>Business Growth Score™</span><strong>${evidence.score}/100</strong></div>
			<div><span>GBP proof</span><strong>${evidence.profileCompleteness}%</strong></div>
			<div><span>Local trust</span><strong>${evidence.localSignals}/100</strong></div>
		</div>
		<h3>Evidence From The Scan</h3>
		<ul>${evidence.gaps.map(gap => `<li>${escapeHtml(gap)}</li>`).join('')}</ul>
		<h3>Recommended Work</h3>
		<div class="playbook-checklist">
			${playbook.items.map(([step, reason, time]) => `
				<label>
					<input type="checkbox" data-play-check>
					<span><strong>${escapeHtml(step)}</strong><em>${escapeHtml(reason)}</em></span>
					<small>${escapeHtml(time)}</small>
				</label>
			`).join('')}
		</div>
		<div class="playbook-summary">
			<span class="playbook-label">Completion progress</span>
			<strong data-playbook-progress>0%</strong>
			<div class="playbook-track"><i data-playbook-bar style="width:0%"></i></div>
			<p><span data-playbook-count>0 of ${playbook.items.length} steps</span> complete. Historical improvement begins after the next scan validates these items.</p>
		</div>
		<h3>Expected Business Result</h3>
		<div class="drawer-callout">${playbook.result.map(item => `<span>${escapeHtml(item)}</span>`).join('')}</div>
		<div class="playbook-actions">
			<button class="button" data-complete-action="gbp">Mark Playbook Complete</button>
			<button class="ghost-button" data-template="${escapeHtml(playbookSequence[Math.min(playbookSequence.indexOf(templateId) + 1, playbookSequence.length - 1)])}">Next Playbook</button>
			<button class="ghost-button" type="button" disabled aria-disabled="true" title="Execution automation is intentionally deferred.">Coming Soon</button>
		</div>
		<p class="completion-message" data-completion-message>Completed. Apex updated today's progress and moved the forecast scenario to After #1.</p>
	`;
	return content;
}

function updateDrawerNavigation() {
	const nav = drawer?.querySelector('[data-drawer-nav]');
	if (!nav) return;
	const currentIndex = playbookSequence.indexOf(currentDrawerTemplate);
	const isPlaybook = currentIndex !== -1;
	nav.hidden = !isPlaybook;
	if (!isPlaybook) {
		nav.innerHTML = '';
		return;
	}
	nav.innerHTML = `
		<button class="ghost-button" type="button" data-drawer-back ${drawerHistory.length ? '' : 'disabled'}>Back</button>
		<button class="ghost-button" type="button" data-drawer-prev ${currentIndex > 0 ? '' : 'disabled'}>Previous</button>
		<span>${currentIndex + 1} of ${playbookSequence.length}</span>
		<button class="ghost-button" type="button" data-drawer-next ${currentIndex < playbookSequence.length - 1 ? '' : 'disabled'}>Next</button>
	`;
}

function openDrawer(title, content, label = 'Executive Intelligence', options = {}) {
	if (!drawer) return;
	if (options.templateId) {
		if (currentDrawerTemplate && currentDrawerTemplate !== options.templateId && options.trackHistory !== false) {
			drawerHistory.push(currentDrawerTemplate);
		}
		currentDrawerTemplate = options.templateId;
	} else {
		currentDrawerTemplate = '';
	}
	if (drawerLabel) drawerLabel.textContent = label;
	drawerTitle.textContent = title;
	if (typeof content === 'string') {
		drawerText.textContent = content;
	} else {
		drawerText.replaceChildren(content);
	}
	updatePlaybookProgress(drawerText);
	updateDrawerNavigation();
	drawer.classList.add('open');
}

function openPlaybook(templateId, trackHistory = true) {
	const resolvedTemplate = scanDrivenPlaybookMap[templateId] || templateId;
	openDrawer(templateTitles[templateId] || templateTitles[resolvedTemplate] || 'Executive Playbook', createScanPlaybookContent(resolvedTemplate), 'Scan-Driven Playbook', { templateId: resolvedTemplate, trackHistory });
}

function responseFor(question) {
	if (askResponses[question]) return askResponses[question];
	const lower = question.toLowerCase();
	if (lower.includes('northstar') || lower.includes('competitor')) return askResponses['Compare me against Northstar.'];
	if (lower.includes('chatgpt') || lower.includes('indirect')) return askResponses['Why does ChatGPT say "Indirect"?'];
	if (lower.includes('forecast')) return askResponses['Why is Forecast Confidence 72%?'];
	if (lower.includes('trust')) return askResponses['Why is Business Trust only 68?'];
	if (lower.includes('report') || lower.includes('brief')) return askResponses["Explain today's report."];
	if (lower.includes('rank') || lower.includes('#1') || lower.includes('order')) return askResponses['Why is this ranked #1?'];
	if (lower.includes('issue') || lower.includes('health')) return askResponses['Explain the largest issue.'];
	if (lower.includes('plan') || lower.includes('pricing') || lower.includes('free')) return 'Start with the Executive Scan if you want fast business clarity. Upgrade to Cloud when you want daily executive briefings, competitor intelligence, AI visibility, forecasting, playbooks, and business-impact prioritization.';
	return 'Apex is reading the current page as an executive decision surface. The main pattern is business condition, business consequence, recommended action, and expected result. For this concept, the safest next move is still completing the local trust layer before adding more content or lower-priority work.';
}

function createAskContent(question) {
	const wrap = document.createElement('div');
	wrap.className = 'ask-chat';
	const answer = responseFor(question);
	const suggestions = routeAskSuggestions[route] || routeAskSuggestions['dashboard.html'];
	wrap.innerHTML = `
		<div class="chat-message user"><span>You</span><p>${escapeHtml(question)}</p></div>
		<div class="chat-message apex"><span>ApexOneIQ</span><p>${escapeHtml(answer)}</p></div>
		<div class="ask-suggestions">
			${suggestions.map(item => `<button type="button" data-ask="${escapeHtml(item)}">${escapeHtml(item)}</button>`).join('')}
		</div>
		<form class="ask-input" data-ask-form>
			<input name="question" autocomplete="off" placeholder="Ask Apex about this page..." value="">
			<button type="submit" data-ask-submit>Ask</button>
		</form>
	`;
	return wrap;
}

function openAsk(question = routeAskDefaults[route] || 'What should I do next?') {
	openDrawer('Ask Apex', createAskContent(question), 'Executive AI Assistant');
}

async function startCheckout(plan, control) {
	if (!plan) return;
	const normalizedPlan = window.ApexSubscriptionConfig?.normalizePlanId?.(plan) || plan;
	if (normalizedPlan === 'enterprise') {
		await requestEnterpriseInformation(control);
		return;
	}
	const originalText = control?.textContent;
	if (control) {
		control.disabled = true;
		control.textContent = 'Preparing Checkout...';
	}
	try {
		const profile = getStoredProfile() || {};
		const user = getApexUser() || {};
		const response = await fetch(`/api/billing/checkout/${encodeURIComponent(normalizedPlan)}`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				userId: user.id || user.email || 'local-user',
				accountId: profile.website || user.email || 'local-account',
				businessWebsite: profile.website || '',
				businessId: profile.website || ''
			})
		});
		const payload = await response.json().catch(() => ({}));
		if (response.status === 401 && payload?.data?.login_url) {
			window.location.assign(payload.data.login_url);
			return;
		}
		const checkoutUrl = payload?.data?.url || payload?.url;
		if (!response.ok || !checkoutUrl) {
			throw new Error(payload?.data?.message || payload.message || 'Checkout could not be started. Confirm the sandbox backend and Stripe environment variables are configured.');
		}
		window.location.assign(checkoutUrl);
	} catch (error) {
		openDrawer('Checkout Not Ready', `Apex could not create the Stripe Sandbox Checkout Session. ${error.message}`, 'Billing');
		if (control) {
			control.disabled = false;
			control.textContent = originalText;
		}
	}
}

async function requestEnterpriseInformation(control) {
	const originalText = control?.textContent;
	if (control) {
		control.disabled = true;
		control.textContent = 'Sending Request...';
	}
	try {
		const profile = getStoredProfile() || {};
		const user = getApexUser() || {};
		const response = await fetch('/api/enterprise/inquiry', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				userId: user.id || user.email || 'local-user',
				accountId: profile.website || user.email || 'local-account',
				website: profile.website || '',
				email: user.email || profile.email || '',
				message: 'Enterprise request information from subscription page'
			})
		});
		const payload = await response.json().catch(() => ({}));
		if (!response.ok || !payload.requested) throw new Error(payload.message || 'Enterprise request could not be recorded.');
		openDrawer('Enterprise Request Received', 'Enterprise remains request-information only. No Stripe Checkout session was created and no subscription was automatically activated.', 'Billing');
	} catch (error) {
		openDrawer('Enterprise Request', `Apex could not record the Enterprise request locally. ${error.message}`, 'Billing');
	} finally {
		if (control) {
			control.disabled = false;
			control.textContent = originalText;
		}
	}
}

function currentSubscriptionState() {
	const stored = readStorage('apexoneiq_subscription', {});
	const planId = window.ApexSubscriptionConfig?.normalizePlanId?.(stored.entitlementPlan || stored.planId || stored.plan || 'free') || 'free';
	const plan = window.ApexSubscriptionConfig?.planFor?.(planId) || { displayName: planId, entitlements: [] };
	return {
		...stored,
		planId,
		entitlementPlan: stored.entitlementPlan || planId,
		displayName: plan.displayName || planId,
		entitlements: stored.entitlements || plan.entitlements || []
	};
}

function hasLocalEntitlement(entitlement) {
	return currentSubscriptionState().entitlements.includes(entitlement);
}

async function refreshBillingStatus() {
	const profile = getStoredProfile() || {};
	const user = getApexUser() || {};
	const params = new URLSearchParams({
		user_id: user.id || user.email || 'local-user',
		account_id: profile.website || user.email || 'local-account'
	});
	try {
		const response = await fetch(`/api/billing/status?${params.toString()}`);
		const status = await response.json();
		if (response.ok && status.entitlements) {
			writeStorage('apexoneiq_subscription', {
				planId: status.planId || 'free',
				entitlementPlan: status.entitlementPlan || status.planId || 'free',
				billingStatus: status.billingStatus,
				entitlements: status.entitlements,
				stripeCustomerId: status.stripeCustomerId,
				stripeSubscriptionId: status.stripeSubscriptionId,
				updatedAt: status.updatedAt || new Date().toISOString()
			});
			renderPlanPills();
			return status;
		}
	} catch (error) {
		// Local entitlement state remains the fallback when the sandbox server is unavailable.
	}
	return currentSubscriptionState();
}

function renderPlanPills() {
	const subscription = currentSubscriptionState();
	document.querySelectorAll('.account').forEach(account => {
		if (account.querySelector('[data-plan-pill]')) return;
		const pill = document.createElement('span');
		pill.className = 'status-pill status-ok';
		pill.dataset.planPill = '';
		pill.textContent = subscription.displayName || 'Free';
		account.prepend(pill);
	});
}

function setupLandingCapture() {
	const form = document.querySelector('[data-start-free-form]');
	if (!form) return;

	const status = form.querySelector('[data-start-free-status]');
	form.addEventListener('submit', event => {
		event.preventDefault();
		const website = form.elements.website.value.trim();
		const email = form.elements.email.value.trim();
		const validWebsite = /^https?:\/\/[^\s]+\.[^\s]+$/i.test(website);
		const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

		if (!validWebsite || !validEmail) {
			status.textContent = !validWebsite
				? 'Enter a full website URL, including https://, so ApexOneIQ can prepare your business snapshot.'
				: 'Enter a valid business email to start the free ApexOneIQ account flow.';
			form.classList.add('has-error');
			return;
		}

		form.classList.remove('has-error');
		status.textContent = 'Preparing your free Executive Snapshot...';
		try {
			localStorage.setItem('apexoneiq_signup_intent', JSON.stringify({ website, email, createdAt: new Date().toISOString() }));
		} catch (error) {
			// Storage is optional; the sign-in flow remains the source of truth.
		}
		setTimeout(() => {
			const url = new URL(apexRegisterUrl, window.location.origin);
			url.searchParams.set('website', website);
			url.searchParams.set('email', email);
			window.location.assign(url.toString());
		}, 450);
	});
}

function setupExecutiveScan() {
	const form = document.querySelector('[data-executive-scan-form]');
	if (!form) return;
	if (!apexWordPressMode) ensurePrototypeUser();
	renderAccountState();

	const status = form.querySelector('[data-executive-scan-status]');
	const scan = document.querySelector('[data-scan-experience]');
	const scanRing = document.querySelector('.scan-ring');
	const percent = document.querySelector('[data-scan-percent]');
	const bar = document.querySelector('[data-scan-bar]');
	const title = document.querySelector('[data-scan-title]');
	const detail = document.querySelector('[data-scan-detail]');
	const googleStatus = document.querySelector('[data-google-status]');
	const savedProfile = getStoredProfile();

	const currentUser = getApexUser();
	if (currentUser && googleStatus) {
		googleStatus.textContent = 'Google Sign In connected';
	} else if (googleStatus) {
		googleStatus.textContent = 'Google Sign In required';
	}
	if (savedProfile?.website && form.elements.website) {
		form.elements.website.value = savedProfile.website;
	}
	if (savedProfile?.website && savedProfile.scanCompleted) {
		status.textContent = 'Existing business found. Opening your Executive Brief...';
		setTimeout(() => window.location.assign(apexHref('executive-brief.html?existing=1')), 850);
		return;
	}

	const scanSteps = [
		[9, 'Identifying the business...', 'Business identity confirmed', 'Understanding the company, market, and customer decision context.'],
		[18, 'Reading business health...', 'Business health baseline created', 'Measuring whether the business looks credible, findable, and ready to convert demand.'],
		[27, 'Finding missed opportunity...', 'Opportunity window estimated', 'Estimating the upside available if the highest-value constraints improve.'],
		[36, 'Reviewing trust coverage...', 'Trust coverage reviewed', 'Checking whether buyers and AI systems have enough proof to choose the business confidently.'],
		[45, 'Comparing market position...', 'Competitive pressure mapped', 'Understanding where competitors look stronger and where the business can gain ground.'],
		[54, 'Checking local authority...', 'Local authority scored', 'Reviewing the signals that help customers find and trust the business locally.'],
		[63, 'Evaluating AI visibility...', 'AI visibility scored', 'Testing whether answer engines can understand and recommend the business.'],
		[72, 'Estimating growth path...', 'Growth path modeled', 'Projecting current position, likely improvement, and the healthy target.'],
		[81, 'Prioritizing next moves...', 'Top priorities selected', 'Ranking actions by business impact, visibility lift, effort, confidence, and ROI.'],
		[90, 'Creating Business Growth Score™...', 'Business Growth Score™ ready', 'Combining growth health, trust, visibility, authority, and market pressure.'],
		[98, 'Building Executive Brief™...', 'Executive Brief™ ready', 'Preparing the free Executive Brief with the first recommendation and growth path.']
	];
	let scanList = scan?.querySelector('[data-scan-systems]');
	if (scan && !scanList) {
		scanList = document.createElement('div');
		scanList.className = 'scan-system-list';
		scanList.dataset.scanSystems = '';
		scan.appendChild(scanList);
	}
	if (scanList) {
		scanList.innerHTML = scanSteps.map(([nextPercent, nextTitle]) => `
			<div class="scan-system-row" data-scan-row="${nextPercent}">
				<span></span>
				<strong>${escapeHtml(nextTitle)}</strong>
				<small>Queued</small>
			</div>
		`).join('');
	}

	form.addEventListener('submit', event => {
		event.preventDefault();
		if (apexWordPressMode && !getApexUser()) {
			status.textContent = 'Sign in with Google before ApexOneIQ can save your Executive Scan.';
			window.location.assign(apexHref('oauth/google/?redirect_to=/sign-in.html'));
			return;
		}
		const website = form.elements.website.value.trim();
		const validWebsite = /^https:\/\/[^\s]+\.[^\s]+$/i.test(website);

		if (!validWebsite) {
			form.classList.add('has-error');
			status.textContent = 'Enter a secure website URL beginning with https://.';
			return;
		}

		form.classList.remove('has-error');
		status.textContent = 'Executive scan started.';
		form.querySelector('button[type="submit"]').disabled = true;
		scan.hidden = false;
		scan.scrollIntoView({ behavior: 'smooth', block: 'center' });

		const host = new URL(website).hostname.replace(/^www\./, '');
		saveProfile({
			businessName: window.ApexOneIQ?.businessName || host,
			website,
			email: window.ApexOneIQ?.businessEmail || getApexUser()?.email || '',
			scanCompleted: false,
			score: scanScoreFor(website),
			createdAt: new Date().toISOString(),
			dataMode: window.ApexOneIQ?.isLoggedIn ? 'wordpress-onboarding' : 'static-onboarding'
		});

		scanSteps.forEach(([nextPercent, nextTitle, completeLabel, nextDetail], index) => {
			setTimeout(() => {
				if (percent) percent.textContent = `${nextPercent}%`;
				if (bar) bar.style.width = `${nextPercent}%`;
				if (scanRing) scanRing.style.background = `conic-gradient(var(--green) 0 ${nextPercent}%, rgba(111, 180, 255, .13) ${nextPercent}% 100%)`;
				if (title) title.textContent = nextTitle;
				if (detail) detail.textContent = nextDetail;
				const row = scanList?.querySelector(`[data-scan-row="${nextPercent}"]`);
				row?.classList.add('active');
				if (row) row.querySelector('small').textContent = 'Analyzing';
				setTimeout(() => {
					row?.classList.add('complete');
					if (row) {
						row.querySelector('strong').textContent = completeLabel;
						row.querySelector('small').textContent = 'Complete';
					}
				}, 430);
			}, 360 + index * 680);
		});

		setTimeout(() => {
			const profile = getStoredProfile();
			const completedProfile = saveProfile({
				...profile,
				scanCompleted: true,
				completedAt: new Date().toISOString(),
				trend: [12, 28, 41, 55, profile?.score || scanScoreFor(website)]
			});
			const runtime = window.ApexMissionEngine?.orchestrateAIWorkforce?.({
				profile: completedProfile,
				businessGrowthScore: completedProfile.score,
				subscription: { plan: currentSubscriptionState().entitlementPlan || 'free' },
				missionId: 'website-scan',
				missionState: readStorage('apexoneiq_unified_mission_state', {}),
				realAnalysis: false
			});
			if (runtime?.result?.updatedMissionState) {
				writeStorage('apexoneiq_unified_mission_state', runtime.result.updatedMissionState);
				writeStorage('apexoneiq_ai_workforce_results', [runtime.result].concat(readStorage('apexoneiq_ai_workforce_results', [])).slice(0, 20));
			}
			status.textContent = 'Scan complete. Opening your Executive Brief...';
			persistExecutiveScan(completedProfile).then(dashboardUrl => {
				const nextUrl = new URL(dashboardUrl || apexHref('free-dashboard.html'), window.location.origin);
				nextUrl.searchParams.set('scan', 'complete');
				window.location.assign(nextUrl.toString());
			});
		}, 7600);
	});
}

async function persistExecutiveScan(profile) {
	if (!window.ApexOneIQ?.scanEndpoint || !window.ApexOneIQ?.scanNonce || !profile?.website) {
		return apexHref('free-dashboard.html');
	}

	try {
		const response = await fetch(window.ApexOneIQ.scanEndpoint, {
			method: 'POST',
			credentials: 'same-origin',
			headers: {
				'Content-Type': 'application/json',
				'X-WP-Nonce': window.ApexOneIQ.scanNonce
			},
			body: JSON.stringify({
				website: profile.website,
				score: profile.score,
				trend: profile.trend
			})
		});
		const body = await response.json();
		if (response.ok && body?.success && body?.data?.dashboardUrl) return body.data.dashboardUrl;
	} catch (error) {
		// Local storage still supports the immediate dashboard; WordPress persistence is retried on the next scan.
	}

	return apexHref('free-dashboard.html');
}

function setupRegistrationForm() {
	const form = document.querySelector('[data-register-form]');
	if (!form) return;

	const params = new URLSearchParams(window.location.search);
	const status = form.querySelector('[data-register-status]');
	const intent = (() => {
		try {
			return JSON.parse(localStorage.getItem('apexoneiq_signup_intent') || '{}');
		} catch (error) {
			return {};
		}
	})();
	const website = params.get('website') || intent.website || '';
	const email = params.get('email') || intent.email || '';
	if (website && form.elements.business_website) form.elements.business_website.value = website;
	if (email && form.elements.email) form.elements.email.value = email;

	form.addEventListener('submit', event => {
		if (form.method.toLowerCase() === 'post' && form.action && !('staticRegister' in form.dataset)) return;
		event.preventDefault();
		const values = Object.fromEntries(new FormData(form).entries());
		const validWebsite = /^https?:\/\/[^\s]+\.[^\s]+$/i.test(values.business_website || '');
		const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email || '');
		if (!values.business_name || !validWebsite || !validEmail || !values.password || values.password !== values.confirm_password) {
			form.classList.add('has-error');
			status.textContent = values.password !== values.confirm_password
				? 'Passwords must match before ApexOneIQ can create the free account.'
				: 'Complete every field with a valid website and business email.';
			return;
		}

		form.classList.remove('has-error');
		status.textContent = 'Creating your free business snapshot...';
		try {
			saveProfile({
				businessName: values.business_name,
				website: values.business_website,
				email: values.email,
				scanCompleted: false,
				score: scanScoreFor(values.business_website),
				createdAt: new Date().toISOString(),
				dataMode: 'static-placeholder'
			});
		} catch (error) {
			// Local storage is only used by the standalone concept.
		}
		setTimeout(() => window.location.assign(apexHref('sign-in.html')), 500);
	});
}

function applyFreeProfileSnapshot() {
	if (route !== 'free-dashboard.html') return;
	const main = document.querySelector('.main');
	if (!main) return;
	const data = buildExecutiveBriefData();
	const topThree = data.recommendations.slice(0, 3);
	document.body.classList.add('free-executive-brief-v2');
	main.innerHTML = `
		<header class="topbar">
			<div><span class="eyebrow"><span class="live-dot"></span>Free Executive Brief™ Ready</span></div>
			<div class="account"><a class="ghost-button" href="${escapeHtml(apexHref('subscription.html'))}">Choose How To Grow</a><div class="avatar">IQ</div></div>
		</header>
		<section class="free-brief-hero">
			<div>
				<div class="page-kicker">Free Executive Brief™</div>
				<h1>${escapeHtml(data.businessName)} has a clear growth constraint.</h1>
				<div class="free-summary-label">Executive Summary</div>
				<p>${escapeHtml(data.summary)}</p>
			</div>
			<div class="free-brief-score">
				<span>Business Growth Score™</span>
				<strong>${data.score}</strong>
				<small>${escapeHtml(data.health.label)} / ${data.confidence}% confidence</small>
			</div>
		</section>
		<section class="free-brief-grid">
			<article>
				<span>Business Health</span>
				<strong>${escapeHtml(data.health.label)}</strong>
				<p>The business has enough demand signal to justify action, but trust proof is limiting confidence.</p>
			</article>
			<article>
				<span>Estimated Business Opportunity</span>
				<strong>$${data.opportunity.monthly.toLocaleString()}/mo</strong>
				<p>${data.opportunity.leads} estimated new monthly lead opportunities if the first constraint improves.</p>
			</article>
			<article>
				<span>Projected Visibility Improvement</span>
				<strong>+${data.opportunity.visibility}%</strong>
				<p>Modeled lift from completing the top three priorities.</p>
			</article>
		</section>
		<section class="free-brief-chart-panel">
			<div class="brief-section-head"><span>Business Growth Progress</span><strong>Current → projected → goal.</strong></div>
			${businessTimelineSvg(data)}
		</section>
		<section class="free-brief-priorities">
			<div class="brief-section-head"><span>Top Three Priorities</span><strong>The first growth moves.</strong></div>
			${topThree.map((item, index) => `
				<article>
					<b>${index + 1}</b>
					<div><strong>${escapeHtml(item.title)}</strong><p>${escapeHtml(item.why)}</p></div>
					<span>${escapeHtml(item.scoreLift)} / ${escapeHtml(item.visibility)} visibility</span>
				</article>
			`).join('')}
		</section>
		<section class="free-brief-recommendation">
			<div>
				<div class="page-kicker">Recommended Next Step</div>
				<h2>${escapeHtml(data.recommendations[0].title)}</h2>
				<p>${escapeHtml(data.recommendations[0].impact)} Apex can show the complete evidence, refresh the score, and turn this into a repeatable growth plan.</p>
			</div>
			<a class="button" href="${escapeHtml(apexHref('subscription.html'))}">Choose How You Want To Grow</a>
		</section>
	`;
}

function dashboardEmptyState(main, pageHead) {
	document.body.classList.add('dashboard-empty-state');
	pageHead.querySelector('h1').textContent = 'Complete your Executive Scan before Apex builds the dashboard.';
	const kicker = pageHead.querySelector('.page-kicker');
	if (kicker) kicker.textContent = 'Executive Scan Required';
	pageHead.querySelector('.ghost-button')?.setAttribute('href', apexHref('sign-in.html'));
	if (pageHead.querySelector('.ghost-button')) pageHead.querySelector('.ghost-button').textContent = 'Start Executive Scan';
	main.querySelectorAll(':scope > section:not(.page-head):not([data-dashboard-empty])').forEach(section => {
		section.hidden = true;
	});
	if (main.querySelector('[data-dashboard-empty]')) return;
	pageHead.insertAdjacentHTML('afterend', `
		<section class="dashboard-empty-panel" data-dashboard-empty>
			<div>
				<div class="page-kicker">No intelligence displayed yet</div>
				<h2>Enter your business website to generate the first Executive Intelligence profile.</h2>
				<p>ApexOneIQ will hold the Business Growth Score™, summary, opportunities, and recommendations until the scan is complete.</p>
				<a class="button" href="${escapeHtml(apexHref('sign-in.html'))}">Start Executive Scan</a>
			</div>
			<div class="empty-signal-stack">
				<span>Website Health</span>
				<span>Trust Signals</span>
				<span>AI Visibility</span>
				<span>Market Intelligence</span>
				<span>Executive Snapshot</span>
			</div>
		</section>
	`);
}

function trendPath(points) {
	const coords = points.map((value, index) => {
		const x = 16 + index * (268 / Math.max(points.length - 1, 1));
		const y = 142 - value * 1.34;
		return `${x},${Math.max(22, Math.min(138, y))}`;
	});
	return coords.join(' ');
}

function executiveBaselineSvg(trend, score) {
	const baseline = Number(score || trend[trend.length - 1] || 61);
	const projection = [
		baseline,
		Math.min(100, baseline + 6),
		Math.min(100, baseline + 13),
		Math.min(100, baseline + 22)
	];
	const plot = projection.map((value, index) => {
		const x = 58 + index * 76;
		const y = 132 - value * 1.02;
		return { x, y: Math.max(28, Math.min(132, y)), value };
	});
	const path = plot.map((point, index) => `${index ? 'L' : 'M'} ${point.x} ${point.y}`).join(' ');
	const areaPath = `${path} L ${plot[plot.length - 1].x} 142 L ${plot[0].x} 142 Z`;
	return `
		<svg class="executive-baseline-chart" viewBox="0 0 320 190" role="img" aria-label="Business Growth Score baseline timeline">
			<defs>
				<linearGradient id="apexBaselineLine" x1="0" x2="1">
					<stop stop-color="#22e7ff"></stop>
					<stop offset="1" stop-color="#21f2a6"></stop>
				</linearGradient>
				<linearGradient id="apexBaselineArea" x1="0" x2="0" y1="0" y2="1">
					<stop stop-color="#21f2a6" stop-opacity=".24"></stop>
					<stop offset="1" stop-color="#22e7ff" stop-opacity=".02"></stop>
				</linearGradient>
			</defs>
			<g class="baseline-grid" aria-hidden="true">
				<path d="M48 30H294 M48 68H294 M48 106H294 M48 144H294"></path>
				<path d="M58 24V148 M134 24V148 M210 24V148 M286 24V148"></path>
			</g>
			<g class="baseline-axis" aria-hidden="true">
				<path d="M48 22V148H298"></path>
				<text x="18" y="34">100</text>
				<text x="24" y="74">70</text>
				<text x="24" y="112">40</text>
				<text x="57" y="170">Scan</text>
				<text x="126" y="170">+7d</text>
				<text x="202" y="170">+30d</text>
				<text x="272" y="170">+60d</text>
			</g>
			<path class="baseline-area" d="${areaPath}"></path>
			<path class="baseline-progression" d="${path}"></path>
			<path class="baseline-forecast" d="M ${plot[0].x} ${plot[0].y} ${plot.slice(1).map(point => `L ${point.x} ${point.y}`).join(' ')}"></path>
			<g class="baseline-point">
				<circle cx="${plot[0].x}" cy="${plot[0].y}" r="8"></circle>
				<circle cx="${plot[0].x}" cy="${plot[0].y}" r="3"></circle>
				<text x="${plot[0].x + 14}" y="${plot[0].y - 10}">Initial scan ${baseline}/100</text>
			</g>
			<g class="baseline-callout">
				<path d="M58 148V28"></path>
				<text x="70" y="44">Historical data begins here</text>
			</g>
		</svg>
	`;
}

function clampScore(value) {
	return Math.max(0, Math.min(100, Math.round(Number(value) || 0)));
}

function businessHealth(score) {
	if (score >= 80) return { label: 'Healthy', className: 'healthy', color: 'green' };
	if (score >= 55) return { label: 'Needs Attention', className: 'attention', color: 'yellow' };
	return { label: 'Critical', className: 'critical', color: 'red' };
}

function growthDriverScores(score) {
	return {
		localSeo: clampScore(score + 2),
		aiVisibility: clampScore(score - 7),
		trustCoverage: clampScore(score - 6),
		websiteHealth: clampScore(score + 9),
		contentAuthority: clampScore(score - 3),
		competitivePosition: clampScore(score - 1)
	};
}

function briefStatusFor(score) {
	if (score >= 80) return 'Healthy';
	if (score >= 55) return 'Needs Attention';
	return 'Critical';
}

function fallbackMissionPlan(context) {
	const score = clampScore(context.businessGrowthScore || 66);
	const drivers = context.executiveHealth || growthDriverScores(score);
	const mission = {
		id: 'fallback-trust-coverage',
		title: 'Increase trust coverage',
		type: 'Trust',
		state: 'Ready',
		reason: 'Trust is currently the largest constraint preventing customers and AI systems from confidently choosing the business.',
		businessImpact: 'Completes the business proof layer and makes future growth recommendations easier to validate.',
		expectedBusinessGrowthScore: 4,
		expectedVisibility: 6,
		expectedLeads: 9,
		expectedRevenueImpact: 2600,
		expectedTrust: 8,
		expectedForecast: 5,
		estimatedTime: '18 minutes',
		confidence: 92,
		difficulty: 'Low',
		owner: 'Customer',
		executionMode: 'Customer Required',
		approvalStatus: 'No approval needed',
		dependencies: [],
		blockedBy: [],
		priorityScore: 88,
		status: 'Ready to Execute',
		forecastModel: { current: clampScore(score + 6), afterMission: clampScore(score + 11), thirtyDayTarget: clampScore(score + 19) }
	};
	const recommendation = {
		title: mission.title,
		why: mission.reason,
		impact: `${mission.businessImpact} Expected outcome: +${mission.expectedBusinessGrowthScore} Business Growth Score™ points, +${mission.expectedVisibility}% visibility, and ${mission.expectedLeads} estimated new leads per month.`,
		scoreLift: `+${mission.expectedBusinessGrowthScore} BGS`,
		visibility: `+${mission.expectedVisibility}%`,
		effort: mission.difficulty,
		time: mission.estimatedTime,
		owner: mission.owner,
		roi: 'High',
		approvalStatus: mission.approvalStatus,
		dependencies: 'None',
		status: mission.state,
		expectedRevenueImpact: mission.expectedRevenueImpact,
		priorityScore: mission.priorityScore,
		executionMode: mission.executionMode
	};
	return {
		version: 'fallback',
		generatedAt: new Date().toISOString(),
		metrics: {
			businessGrowthScore: score,
			localSeo: drivers.localSeo,
			aiVisibility: drivers.aiVisibility,
			trustCoverage: drivers.trustCoverage,
			websiteHealth: drivers.websiteHealth,
			contentAuthority: drivers.contentAuthority,
			forecast: clampScore(score + 6)
		},
		primaryMission: mission,
		secondaryMissions: [],
		blockedMissions: [],
		missionQueue: [mission],
		recommendations: [recommendation],
		history: [],
		automationPermissions: {
			Automatic: 'Simulated only until automation launch',
			'Approval Required': 'Approval workflow ready',
			'Customer Required': 'Customer action required',
			'Manual Only': 'Manual execution only'
		},
		dailyBrief: {
			yesterday: 'Apex created the initial business baseline.',
			today: `Current mission: ${mission.title}. ${mission.reason}`,
			tomorrow: 'Tomorrow depends on today’s completion signal.',
			businessGrowthScore: { current: score, change: '+4 projected' },
			trust: { current: drivers.trustCoverage, change: '+8 projected' },
			aiVisibility: { current: drivers.aiVisibility, change: '+6% projected' },
			forecast: { current: clampScore(score + 6), change: '+5 projected' },
			risksDetected: 'No critical planning risks detected.',
			competitorMovement: 'Competitor pressure is stable today.',
			blockedItems: [],
			approvalsNeeded: []
		}
	};
}

function missionContextForProfile(profile = getStoredProfile() || {}) {
	const score = clampScore(profile.score || 66);
	const drivers = growthDriverScores(score);
	return {
		profile,
		businessGrowthScore: score,
		executiveHealth: drivers,
		localSeo: drivers.localSeo,
		aiVisibility: drivers.aiVisibility,
		trustCoverage: drivers.trustCoverage,
		websiteHealth: drivers.websiteHealth,
		contentAuthority: drivers.contentAuthority,
		forecast: clampScore(score + 6),
		subscription: window.ApexOneIQ?.subscription || readStorage('apexoneiq_subscription', { plan: 'free' }),
		approvals: readStorage('apexoneiq_customer_approvals', []),
		completedWork: readStorage('apexoneiq_completed_work', []),
		completedMissionIds: readStorage('apexoneiq_completed_mission_ids', []),
		missionHistory: readStorage('apexoneiq_mission_history', []),
		missionState: readStorage('apexoneiq_unified_mission_state', {})
	};
}

function getUnifiedMissionState(context = missionContextForProfile()) {
	if (window.ApexMissionEngine?.buildUnifiedMissionState) {
		return window.ApexMissionEngine.buildUnifiedMissionState(context);
	}
	const missionPlan = window.ApexMissionEngine?.generateDailyMission
		? window.ApexMissionEngine.generateDailyMission(context)
		: fallbackMissionPlan(context);
	return {
		missionPlan,
		primaryMission: missionPlan.primaryMission,
		missionRecords: missionPlan.missionQueue || [],
		approvalQueue: [],
		notifications: [],
		timeline: [],
		memoryRecords: [],
		executiveReadiness: 'Ready',
		businessScore: {
			components: context.executiveHealth,
			current: context.businessGrowthScore,
			projected: clampScore(context.businessGrowthScore + 8),
			delta: 0
		},
		dailyOperations: {}
	};
}

function setUnifiedMissionStage(missionId, stage) {
	if (!missionId || !stage) return;
	if (/Executing|Awaiting Approval|Completed|Verified|Monitoring/i.test(stage) && !hasLocalEntitlement('approval_packages')) {
		openDrawer('Upgrade Required', 'This action requires AI Automated or Concierge access. DIY users receive instructions and prepared guidance, but Apex does not move approval or execution states.', 'Subscription');
		return;
	}
	const current = readStorage('apexoneiq_unified_mission_state', {});
	writeStorage('apexoneiq_unified_mission_state', { ...current, [missionId]: stage });
	window.dispatchEvent(new CustomEvent('apexoneiq:mission-state-change', { detail: { missionId, stage } }));
}

function getMissionPlan() {
	const context = missionContextForProfile();
	const unifiedState = getUnifiedMissionState(context);
	if (unifiedState?.missionPlan) {
		return unifiedState.missionPlan;
	}

	return fallbackMissionPlan(context);
}

function buildExecutiveBriefData() {
	const profile = getStoredProfile() || {
		businessName: 'Your Business',
		website: 'https://example.com',
		score: 66,
		scanCompleted: true,
		completedAt: new Date().toISOString(),
		trend: [58, 61, 64, 66]
	};
	const baseScore = clampScore(profile.score || 66);
	const baseDrivers = growthDriverScores(baseScore);
	const unifiedState = getUnifiedMissionState(missionContextForProfile(profile));
	const score = unifiedState.businessScore?.current || baseScore;
	const scoreComponents = unifiedState.businessScore?.components || {};
	const drivers = {
		...baseDrivers,
		trustCoverage: scoreComponents.trust || baseDrivers.trustCoverage,
		localSeo: scoreComponents.visibility || baseDrivers.localSeo,
		contentAuthority: scoreComponents.authority || baseDrivers.contentAuthority,
		websiteHealth: scoreComponents.website || baseDrivers.websiteHealth,
		aiVisibility: scoreComponents.aiVisibility || baseDrivers.aiVisibility,
		...scoreComponents
	};
	const projected = unifiedState.businessScore?.projected || clampScore(score + 13);
	const goal = Math.max(90, projected + 8);
	const health = businessHealth(score);
	const missionPlan = unifiedState.missionPlan || getMissionPlan();
	const fallbackPrimaryMission = fallbackMissionPlan({ businessGrowthScore: score, executiveHealth: drivers }).primaryMission;
	const plannedPrimaryMission = (missionPlan.missionQueue || []).find(mission => mission.id === unifiedState.primaryMission?.id) || missionPlan.primaryMission || fallbackPrimaryMission;
	const primaryMission = {
		...plannedPrimaryMission,
		...(unifiedState.primaryMission || {}),
		expectedBusinessGrowthScore: unifiedState.primaryMission?.estimatedBusinessGrowthScoreLift || plannedPrimaryMission.expectedBusinessGrowthScore || fallbackPrimaryMission.expectedBusinessGrowthScore,
		expectedRevenueImpact: Number(String(unifiedState.primaryMission?.projectedRevenueLift || '').replace(/[^0-9]/g, '')) || plannedPrimaryMission.expectedRevenueImpact || fallbackPrimaryMission.expectedRevenueImpact
	};
	const domain = workspaceDomain(profile.website) || profile.businessName || 'your business';
	const businessName = profile.businessName || domain;
	const missionTarget = clampScore(score + (primaryMission.expectedBusinessGrowthScore || 8));
	const trend = Array.isArray(profile.trend) && profile.trend.length ? profile.trend.map(clampScore) : [58, 61, 64, score];
	const previousScore = trend.length > 1 ? trend[trend.length - 2] : Math.max(0, score - 5);
	const scoreDelta = score - previousScore;
	const momentumState = scoreDelta > 2 ? 'Accelerating' : scoreDelta < 0 ? 'Losing Ground' : 'Stagnating';
	const confidence = clampScore((unifiedState.primaryMission?.confidence || 78) + Math.max(0, Math.min(8, scoreDelta)));
	const opportunity = {
		monthly: Math.max(3400, (100 - score) * 210),
		leads: Math.max(8, Math.round((100 - drivers.trustCoverage) / 4) + 1),
		visibility: Math.max(11, projected - score + 5),
		scoreIncrease: projected - score,
		confidence
	};
	const summary = unifiedState.insights?.[0] || `${businessName} is showing demand potential, but ${primaryMission.reason.charAt(0).toLowerCase()}${primaryMission.reason.slice(1)} If nothing changes, competitors with stronger proof can keep capturing the highest-intent opportunities. Today’s highest-value mission is ${primaryMission.title.toLowerCase()}, projected to move the Business Growth Score™ from ${score} toward ${projected}.`;
	const recommendations = missionPlan.recommendations?.length ? missionPlan.recommendations : [
		{
			title: 'Increase trust coverage across core business profiles',
			why: 'Buyers and AI systems need stronger third-party proof before they can confidently choose the business.',
			impact: `Projected to add ${opportunity.leads} qualified lead opportunities per month by making the business easier to trust.`,
			scoreLift: '+4 BGS',
			visibility: '+8%',
			effort: 'Low',
			time: '7 days',
			owner: 'Customer',
			roi: 'High',
			approvalStatus: 'Ready for approval',
			dependencies: 'Business profile access',
			status: 'Recommended'
		},
		{
			title: 'Clarify service-area authority with one proof-focused page',
			why: 'The business has visibility potential, but local relevance needs clearer market proof.',
			impact: 'Projected to improve local discovery and reduce competitor leakage.',
			scoreLift: '+3 BGS',
			visibility: '+6%',
			effort: 'Medium',
			time: '10 days',
			owner: 'Customer',
			roi: 'High',
			approvalStatus: 'Queued after trust work',
			dependencies: 'Trust coverage priority',
			status: 'Next'
		},
		{
			title: 'Answer buyer questions in a structured format',
			why: 'AI systems need concise, sourceable answers before they can recommend the business directly.',
			impact: 'Projected to improve AI recommendation readiness and answer coverage.',
			scoreLift: '+3 BGS',
			visibility: '+8%',
			effort: 'Low',
			time: '5 days',
			owner: 'Customer',
			roi: 'Medium',
			approvalStatus: 'Ready after source proof',
			dependencies: 'Service and FAQ inputs',
			status: 'Planned'
		},
		{
			title: 'Strengthen review authority and recency',
			why: 'Review proof is one of the clearest trust signals for customers comparing local providers.',
			impact: 'Projected to increase confidence in high-intent local searches.',
			scoreLift: '+2 BGS',
			visibility: '+4%',
			effort: 'Medium',
			time: '14 days',
			owner: 'Customer',
			roi: 'Medium',
			approvalStatus: 'Needs customer participation',
			dependencies: 'Customer review process',
			status: 'Planned'
		},
		{
			title: 'Improve internal links to the highest-value service pages',
			why: 'Apex needs clearer paths between buyer intent, proof, and conversion pages.',
			impact: 'Projected to help existing visibility compound without adding new pages first.',
			scoreLift: '+2 BGS',
			visibility: '+3%',
			effort: 'Low',
			time: '3 days',
			owner: 'Customer',
			roi: 'Medium',
			approvalStatus: 'Ready',
			dependencies: 'Website edit access',
			status: 'Planned'
		}
	];
	const missionStages = (unifiedState.primaryMission?.executionHistory || []).map(stage => [
		stage.stage,
		stage.status,
		stage.state
	]);
	const fallbackMissionStages = [
		['Scanning', 'Completed', 'complete'],
		['Research', 'Completed', 'complete'],
		['Content Generated', primaryMission.executionMode === 'Customer Required' ? 'Prepared' : 'Completed', 'complete'],
		['Validation', 'In Progress', 'active'],
		['Waiting For Approval', primaryMission.executionMode === 'Approval Required' ? 'Pending' : 'Not Required', primaryMission.executionMode === 'Approval Required' ? 'pending' : 'muted'],
		['Deployment', primaryMission.executionMode === 'Automatic' ? 'Queued' : 'Pending', 'pending'],
		['Verification', 'Pending', 'pending']
	];
	const activeMissionStages = missionStages.length ? missionStages : fallbackMissionStages;
	const completedStages = activeMissionStages.filter(([, , state]) => state === 'complete').length;
	const missionProgress = clampScore((completedStages / activeMissionStages.length) * 100 + (activeMissionStages.some(([, , state]) => state === 'active') ? 8 : 0));
	const confidenceDrivers = [
		['Business profile incomplete', 'Trust source is not fully verified', 'risk'],
		['Competitor trust advantage', 'Competitors show stronger proof density', 'warning'],
		['Review velocity below market', 'Fresh review signal trails the local set', 'warning'],
		['AI citation coverage low', 'AI systems need clearer sourceable proof', 'risk'],
		['Historical success rate', 'Similar trust missions produced fast lift', 'growth']
	];
	const unlocks = [
		['Local Pack', 'growth'],
		['AI Visibility', 'growth'],
		['Review Authority', 'stable'],
		['Buyer Confidence', 'growth'],
		['Service Area Proof', 'stable']
	];
	const activityTimeline = Array.isArray(unifiedState.timeline) && unifiedState.timeline.length ? unifiedState.timeline : [
		['08:01', 'Scan Started', '8 pages analyzed', 'complete'],
		['08:02', 'Competitor Changes Detected', '2 competitors gained trust signals', 'warning'],
		['08:03', 'Local SEO Score Updated', `Local SEO recalculated at ${drivers.localSeo}`, 'stable'],
		['08:05', 'Generated FAQ Draft', '6 AI answer opportunities prepared', 'complete'],
		['08:07', 'Built Schema Markup', 'Structured data opportunity generated', 'complete'],
		['08:09', 'Forecast Recalculated', `Mission lift modeled at +${primaryMission.expectedForecast || 7} forecast points`, 'growth'],
		['08:11', primaryMission.executionMode === 'Approval Required' ? 'Waiting for Approval' : 'Mission Ready', primaryMission.approvalStatus || primaryMission.status, primaryMission.executionMode === 'Approval Required' ? 'warning' : 'stable'],
		['08:12', 'Executive Brief Generated', 'Mission queue reordered', 'complete']
	];
	const activityProof = [
		[String((unifiedState.missionRecords || []).length || 8), 'Missions Synced', 'complete'],
		[String((unifiedState.notifications || []).length || 4), 'Executive Notices', 'warning'],
		[String((unifiedState.timeline || []).length || 18), 'Timeline Events', 'stable'],
		[String((unifiedState.approvalQueue || []).length || 0), 'Approvals Waiting', (unifiedState.approvalQueue || []).length ? 'warning' : 'growth'],
		[String((unifiedState.memoryRecords || []).length || 0), 'Memory Records', 'stable'],
		['1', 'Shared State Engine', 'complete']
	];
	const impactBlocks = [
		['Revenue', `$${primaryMission.expectedRevenueImpact?.toLocaleString() || '3,200'}/mo`, 'growth'],
		['Trust', `+${primaryMission.expectedTrust || 8}`, 'growth'],
		['Visibility', `+${primaryMission.expectedVisibility || 6}%`, 'stable'],
		['Lead Growth', `+${primaryMission.expectedLeads || opportunity.leads}/mo`, 'growth']
	];
	const riskBlocks = [
		['Customer Effort', primaryMission.executionMode === 'Customer Required' ? 'Medium' : 'Low', primaryMission.executionMode === 'Customer Required' ? 'warning' : 'growth'],
		['Dependency Risk', primaryMission.dependencies?.length ? 'Blocked' : 'Low', primaryMission.dependencies?.length ? 'blocked' : 'growth'],
		['Opportunity Window', 'Open — 7 Days', 'opportunity'],
		['Approval', primaryMission.executionMode === 'Approval Required' ? 'Needed' : 'Clear', primaryMission.executionMode === 'Approval Required' ? 'warning' : 'growth']
	];
	const intelligenceVisuals = {
		forecastCone: [
			['Current', score],
			['After Mission', missionTarget],
			['30 Day', projected],
			['Goal', goal]
		],
		waterfall: [
			['Current', score, 'baseline'],
			['Trust', 4, 'trust'],
			['AI', 3, 'ai'],
			['Projected', score + 7, 'subtotal'],
			['Planned', 6, 'planned'],
			['30-Day', score + 13, 'final']
		],
		aiDistribution: [
			['Citation Gaps', 34],
			['FAQ Answers', 26],
			['Schema', 18],
			['Comparison Proof', 22]
		]
	};
	return {
		profile,
		businessName,
		domain,
		score,
		previousScore,
		scoreDelta,
		confidence,
		projected,
		goal,
		health,
		drivers,
		trend,
		summary,
		opportunity,
		recommendations,
		mission: {
			id: primaryMission.id,
			title: primaryMission.title,
			type: primaryMission.type,
			progress: missionProgress,
			currentStage: unifiedState.primaryMission?.currentExecutionStage || 'Validation In Progress',
			remainingSteps: activeMissionStages.filter(([, , state]) => state === 'pending').length,
			estimatedCompletion: primaryMission.estimatedTime || '7 days',
			impact: `${primaryMission.businessImpact} Expected to create ${primaryMission.expectedLeads || opportunity.leads} new monthly lead opportunities and lift the Business Growth Score™ by ${primaryMission.expectedBusinessGrowthScore || 4} points.`,
			currentScore: score,
			targetScore: missionTarget,
			owner: primaryMission.owner || 'Customer',
			state: primaryMission.state,
			executionMode: primaryMission.executionMode,
			confidence: primaryMission.confidence,
			priorityScore: primaryMission.priorityScore,
			reason: primaryMission.reason,
			dependencies: primaryMission.dependencies || []
		},
		unifiedState,
		notifications: unifiedState.notifications || [],
		timeline: unifiedState.timeline || activityTimeline,
		memoryRecords: unifiedState.memoryRecords || [],
		executiveReadiness: unifiedState.executiveReadiness || 'Ready',
		missionPlan,
		missionStages: activeMissionStages,
		confidenceDrivers,
		unlocks,
		activityTimeline,
		activityProof,
		impactBlocks,
		riskBlocks,
		intelligenceVisuals,
		competitors: [
			['You', score, drivers.trustCoverage, drivers.aiVisibility],
			['Competitor A', clampScore(score + 8), clampScore(drivers.trustCoverage + 13), clampScore(drivers.aiVisibility + 6)],
			['Competitor B', clampScore(score + 3), clampScore(drivers.trustCoverage + 8), clampScore(drivers.aiVisibility + 3)],
			['Competitor C', clampScore(score - 4), clampScore(drivers.trustCoverage - 2), clampScore(drivers.aiVisibility - 5)]
		],
		momentum: [
			['Previous', previousScore, 'Prior baseline'],
			['Current', score, 'Scan baseline'],
			['Projected', projected, 'After top priorities'],
			['Goal', goal, 'Healthy target']
		],
		momentumStory: `${momentumState}: the score moved ${scoreDelta >= 0 ? '+' : ''}${scoreDelta} points since the prior baseline. The business is not blocked by demand; it is constrained by proof, so trust coverage is the lever most likely to convert momentum into measurable growth.`,
		trust: [
			['Google', 'connected'],
			['GBP', drivers.trustCoverage >= 76 ? 'connected' : 'weak'],
			['BBB', 'missing'],
			['Yelp', drivers.trustCoverage >= 72 ? 'connected' : 'weak'],
			['Trustpilot', 'missing'],
			['Apple Business', 'missing'],
			['Facebook', 'weak'],
			['Industry Directories', drivers.trustCoverage >= 80 ? 'connected' : 'weak']
		],
		updatedAt: formatWorkspaceDate(profile.completedAt || profile.createdAt || new Date().toISOString())
	};
}

function executiveRadarSvg(data) {
	const axes = [
		['Local SEO', data.drivers.localSeo],
		['AI Visibility', data.drivers.aiVisibility],
		['Trust', data.drivers.trustCoverage],
		['Website', data.drivers.websiteHealth],
		['Content', data.drivers.contentAuthority],
		['Competition', data.drivers.competitivePosition]
	];
	const center = 150;
	const radius = 104;
	const points = axes.map(([, value], index) => {
		const angle = (-90 + index * 60) * Math.PI / 180;
		const distance = radius * (value / 100);
		return {
			x: center + Math.cos(angle) * distance,
			y: center + Math.sin(angle) * distance,
			labelX: center + Math.cos(angle) * 128,
			labelY: center + Math.sin(angle) * 128,
			value
		};
	});
	const polygon = points.map(point => `${point.x},${point.y}`).join(' ');
	return `
		<svg class="brief-radar" viewBox="0 0 300 300" role="img" aria-label="Executive health radar chart">
			<g class="brief-chart-grid">
				<circle cx="150" cy="150" r="104"></circle><circle cx="150" cy="150" r="70"></circle><circle cx="150" cy="150" r="36"></circle>
				${axes.map(([, value], index) => {
					const angle = (-90 + index * 60) * Math.PI / 180;
					return `<path d="M150 150 L${150 + Math.cos(angle) * 112} ${150 + Math.sin(angle) * 112}"></path>`;
				}).join('')}
			</g>
			<polygon class="brief-radar-shape" points="${polygon}"></polygon>
			${points.map((point, index) => `<circle class="brief-radar-point" cx="${point.x}" cy="${point.y}" r="4"></circle><text x="${point.labelX}" y="${point.labelY}">${escapeHtml(axes[index][0])}</text>`).join('')}
		</svg>
	`;
}

function businessTimelineSvg(data) {
	return `
		<svg class="brief-timeline-chart" viewBox="0 0 720 180" role="img" aria-label="Business timeline from current position to goal">
			<g class="brief-chart-grid">
				<path d="M64 132H656"></path>
				<path d="M64 54H656"></path>
				<path d="M64 93H656"></path>
			</g>
			<path class="brief-timeline-path" d="M92 122 C230 108 314 86 416 74 C502 64 574 58 628 42"></path>
			${[
				[92, 122, 'Current Position', data.score],
				[416, 74, 'Projected Position', data.projected],
				[628, 42, 'Goal', data.goal]
			].map(([x, y, label, value]) => `<g class="brief-timeline-node"><circle cx="${x}" cy="${y}" r="8"></circle><text x="${x}" y="${y + 34}">${label}</text><text class="value" x="${x}" y="${y - 16}">${value}</text></g>`).join('')}
		</svg>
	`;
}

function aiProgressSvg(data) {
	return `
		<div class="brief-ai-progress">
			<div><span>Current</span><strong>${data.drivers.aiVisibility}</strong></div>
			<i><b style="width:${data.drivers.aiVisibility}%"></b></i>
			<div><span>Target</span><strong>${Math.max(data.drivers.aiVisibility + 18, 82)}</strong></div>
		</div>
	`;
}

function missionRingSvg(data) {
	const radius = 58;
	const circumference = 2 * Math.PI * radius;
	const offset = circumference - (data.mission.progress / 100) * circumference;
	return `
		<svg class="brief-mission-ring" viewBox="0 0 150 150" role="img" aria-label="Mission completion ${data.mission.progress}%">
			<circle class="ring-track" cx="75" cy="75" r="${radius}"></circle>
			<circle class="ring-progress" cx="75" cy="75" r="${radius}" stroke-dasharray="${circumference.toFixed(1)}" stroke-dashoffset="${offset.toFixed(1)}"></circle>
			<text x="75" y="72">${data.mission.progress}%</text>
			<text class="ring-label" x="75" y="94">Mission</text>
		</svg>
	`;
}

function missionOperatingSystemHtml(data) {
	return `
		<section class="brief-section brief-mission-os">
			<div class="brief-section-number">03</div>
			<div class="brief-section-body">
				<div class="brief-section-head"><span>Mission Operating System</span><strong>Where Apex is inside today's work.</strong></div>
				<div class="brief-mission-os-grid">
					<div class="brief-mission-ring-card">
						${missionRingSvg(data)}
						<div>
							<span>Today’s Mission</span>
							<strong>${escapeHtml(data.mission.title)}</strong>
							<small>${escapeHtml(data.mission.currentStage)} / ${data.mission.remainingSteps} steps remaining</small>
						</div>
					</div>
					<div class="brief-stage-ladder">
						${data.missionStages.map(([label, status, state]) => `
							<div class="${escapeHtml(state)}"><i></i><span>${escapeHtml(label)}</span><strong>${escapeHtml(status)}</strong></div>
						`).join('')}
					</div>
					<div class="brief-executive-blocks">
						${data.impactBlocks.map(([label, value, state]) => `<div class="${escapeHtml(state)}"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`).join('')}
					</div>
				</div>
				<div class="brief-unlocks">
					<span>Unlocks</span>
					${data.unlocks.map(([label, state]) => `<b class="${escapeHtml(state)}">✓ ${escapeHtml(label)}</b>`).join('')}
				</div>
			</div>
		</section>
	`;
}

function activityTimelineHtml(data) {
	return `
		<section class="brief-section brief-activity-section">
			<div class="brief-section-number">04</div>
			<div class="brief-section-body">
				<div class="brief-section-head"><span>Apex Activity Timeline</span><strong>What Apex already did this morning.</strong></div>
				<div class="brief-activity-proof">
					${data.activityProof.map(([value, label, state]) => `<div class="${escapeHtml(state)}"><strong>${escapeHtml(value)}</strong><span>${escapeHtml(label)}</span></div>`).join('')}
				</div>
				<div class="brief-activity-timeline">
					${data.activityTimeline.map(([time, title, note, state]) => `
						<div class="${escapeHtml(state)}"><time>${escapeHtml(time)}</time><i></i><strong>${escapeHtml(title)}</strong><span>${escapeHtml(note)}</span></div>
					`).join('')}
				</div>
			</div>
		</section>
	`;
}

function forecastConeSvg(data) {
	const points = data.intelligenceVisuals.forecastCone;
	const coords = points.map(([label, value], index) => {
		const x = 78 + index * 178;
		const y = 162 - (value / 100) * 108;
		return { label, value, x, y };
	});
	const line = coords.map((point, index) => `${index ? 'L' : 'M'}${point.x} ${point.y}`).join(' ');
	const upper = coords.map((point, index) => `${index ? 'L' : 'M'}${point.x} ${point.y - (10 + index * 4)}`).join(' ');
	const lower = coords.slice().reverse().map((point, index) => `L${point.x} ${point.y + (16 + (coords.length - index) * 5)}`).join(' ');
	return `
		<svg class="brief-cone-chart" viewBox="0 0 660 220" role="img" aria-label="Forecast confidence cone">
			<path class="cone-baseline" d="M58 178H626"></path>
			<path class="cone-band" d="${upper} ${lower} Z"></path>
			<path class="cone-line" d="${line}"></path>
			${coords.map((point, index) => `<g><circle cx="${point.x}" cy="${point.y}" r="6"></circle><text x="${point.x}" y="204">${escapeHtml(point.label)}</text><text class="value" x="${point.x}" y="${Math.max(20, point.y - 20 - index * 2)}">${point.value}</text></g>`).join('')}
		</svg>
	`;
}

function opportunityWaterfallHtml(data) {
	const steps = data.intelligenceVisuals.waterfall;
	const floor = 60;
	const ceiling = 82;
	const chart = { width: 780, height: 300, top: 42, bottom: 236, left: 58, gap: 22, bar: 82 };
	const scaleY = value => chart.bottom - ((value - floor) / (ceiling - floor)) * (chart.bottom - chart.top);
	let cumulative = steps[0][1];
	const bars = steps.map(([label, value, state], index) => {
		const x = chart.left + index * (chart.bar + chart.gap);
		if (index === 0 || state === 'subtotal' || state === 'final') {
			const total = value;
			cumulative = total;
			return { label, value: total, state, x, y: scaleY(total), height: chart.bottom - scaleY(total), from: floor, to: total, display: total };
		}
		const from = cumulative;
		const to = cumulative + value;
		cumulative = to;
		return { label, value, state, x, y: scaleY(to), height: scaleY(from) - scaleY(to), from, to, display: `+${value}` };
	});
	return `
		<svg class="brief-waterfall-svg" viewBox="0 0 ${chart.width} ${chart.height}" role="img" aria-label="Business score waterfall from current to projected">
			<path class="waterfall-baseline" d="M42 ${chart.bottom}H738"></path>
			${bars.slice(0, -1).map((bar, index) => {
				const next = bars[index + 1];
				const y = scaleY(bar.to);
				return `<path class="waterfall-connector" d="M${bar.x + chart.bar} ${y}H${next.x}"></path>`;
			}).join('')}
			${bars.map(bar => `
				<g class="waterfall-step ${escapeHtml(bar.state)}">
					<rect x="${bar.x}" y="${bar.y}" width="${chart.bar}" height="${Math.max(3, bar.height)}" rx="7"></rect>
					<text class="waterfall-value" x="${bar.x + chart.bar / 2}" y="${Math.max(24, bar.y - 10)}">${bar.display}</text>
					<text class="waterfall-label" x="${bar.x + chart.bar / 2}" y="274">${escapeHtml(bar.label)}</text>
				</g>
			`).join('')}
		</svg>
	`;
}

function confidenceDriversFor(item) {
	const title = String(item.title || '').toLowerCase();
	if (title.includes('google business') || title.includes('trust coverage')) {
		return [
			['Profile verification incomplete', 'Primary business proof is not confirmed'],
			['Missing source-of-truth business proof', 'AI systems need a verified entity anchor'],
			['Competitors have verified local profiles', 'Trust advantage is visible in market comparisons'],
			['High historical impact on local trust', 'Similar missions lift confidence quickly']
		];
	}
	if (title.includes('faq')) {
		return [
			['Limited question-and-answer coverage', 'Buyer questions are not fully answered'],
			['No clear sourceable answers detected', 'AI systems lack concise citation material'],
			['Competitors provide stronger structured responses', 'Market answers are easier to reuse'],
			['FAQ schema opportunity detected', 'Structured answer markup can be generated']
		];
	}
	if (title.includes('internal link')) {
		return [
			['High-value service pages are isolated', 'Important pages receive weak discovery support'],
			['Buyer-intent pages receive insufficient link equity', 'Conversion paths are harder to follow'],
			['Multiple contextual link opportunities detected', 'Apex found relevant supporting pages'],
			['Low implementation risk', 'Changes are contained and reversible']
		];
	}
	if (title.includes('comparison')) {
		return [
			['Competitors have stronger comparison proof', 'Buyers can compare alternatives more easily'],
			['No sourceable differentiation page detected', 'Apex needs a clear decision asset'],
			['High-intent decision content is missing', 'Comparison searches can leak demand'],
			['Approval required before publication', 'Strategic positioning needs customer signoff']
		];
	}
	if (title.includes('speed') || title.includes('stability') || title.includes('performance')) {
		return [
			['Core performance weaknesses detected', 'Technical health is limiting conversion confidence'],
			['High-value pages load below target', 'Buyer-intent traffic can experience friction'],
			['Conversion friction affects buyer-intent traffic', 'Slow pages reduce action probability'],
			['Technical implementation required', 'Apex can prepare but deployment needs execution access']
		];
	}
	return [
		['Mission-specific evidence detected', 'Apex found measurable business impact'],
		['Dependency path is clear', 'No blocking prerequisite is preventing review'],
		['Expected lift is modeled', 'Forecast moved after mission scoring'],
		['Implementation effort is understood', 'Risk and time are bounded']
	];
}

function confidenceIntelligenceHtml(data, item, index) {
	const confidence = index === 0 ? data.mission.confidence : Math.max(72, (data.mission.confidence || 88) - index * 5);
	const drivers = confidenceDriversFor(item);
	return `
		<div class="brief-confidence-intel">
			<div class="brief-confidence-gauge confidence-ring">
				<div class="confidence-ring__content">
					<div class="confidence-ring__value">${confidence}%</div>
					<div class="confidence-ring__label">CONFIDENCE</div>
				</div>
			</div>
			<div>
				<span>Confidence Drivers</span>
				${drivers.map(([label, note, state]) => `<small class="${escapeHtml(state || '')}">${escapeHtml(label)} <em>${escapeHtml(note)}</em></small>`).join('')}
			</div>
			<div class="brief-expected-lift">
				<b>${escapeHtml(item.scoreLift)}</b><b>${escapeHtml(item.visibility)}</b><b>${escapeHtml(item.time)}</b>
			</div>
		</div>
	`;
}

function premiumVisualsHtml(data) {
	return `
		<section class="brief-chart-pair brief-intelligence-visuals">
			<div class="brief-chart-panel">
				<div class="brief-section-head"><span>Forecast Confidence Cone</span><strong>Current → mission → goal.</strong></div>
				${forecastConeSvg(data)}
			</div>
			<div class="brief-chart-panel">
				<div class="brief-section-head"><span>Opportunity Waterfall</span><strong>Which improvements move the score.</strong></div>
				${opportunityWaterfallHtml(data)}
			</div>
		</section>
		<section class="brief-chart-pair brief-intelligence-visuals">
			<div class="brief-chart-panel">
				<div class="brief-section-head"><span>Risk Matrix</span><strong>Status before reading.</strong></div>
				<div class="brief-risk-matrix">
					${data.riskBlocks.map(([label, value, state]) => `<div class="${escapeHtml(state)}"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`).join('')}
				</div>
			</div>
			<div class="brief-chart-panel">
				<div class="brief-section-head"><span>AI Recommendation Distribution</span><strong>Where visibility can improve.</strong></div>
				<div class="brief-ai-distribution">
					${data.intelligenceVisuals.aiDistribution.map(([label, value]) => `<div><span>${escapeHtml(label)}</span><i><b style="width:${value}%"></b></i><strong>${value}%</strong></div>`).join('')}
				</div>
			</div>
		</section>
	`;
}

function renderExecutiveBrief() {
	if (route !== 'executive-brief.html') return;
	const main = document.querySelector('.main');
	if (!main) return;
	const data = buildExecutiveBriefData();
	const driverCards = [
		['Business Growth Score™', data.score, data.health.label],
		['Local SEO', data.drivers.localSeo, briefStatusFor(data.drivers.localSeo)],
		['AI Visibility', data.drivers.aiVisibility, briefStatusFor(data.drivers.aiVisibility)],
		['Trust Coverage', data.drivers.trustCoverage, briefStatusFor(data.drivers.trustCoverage)],
		['Website Health', data.drivers.websiteHealth, briefStatusFor(data.drivers.websiteHealth)],
		['Content Authority', data.drivers.contentAuthority, briefStatusFor(data.drivers.contentAuthority)]
	];
	main.innerHTML = `
		<header class="topbar executive-brief-topbar">
			<div><span class="eyebrow"><span class="live-dot"></span>Executive Brief™ Updated</span></div>
			<div class="account"><button class="ghost-button" type="button" data-export-brief-pdf>Export PDF</button><button class="ghost-button" type="button" data-ask="Explain today's Executive Brief.">Ask Apex</button><div class="avatar">JM</div></div>
		</header>
		<article class="executive-brief-document" data-executive-brief-document>
			<section class="brief-title-row">
				<div>
					<div class="page-kicker">Executive Brief™</div>
					<h1>${escapeHtml(data.businessName)}</h1>
					<p>${escapeHtml(data.domain)} / Updated ${escapeHtml(data.updatedAt)}</p>
				</div>
				<div class="brief-promise">Know What's Wrong. Watch It Get Better.</div>
			</section>
			<section class="brief-section brief-summary-section">
				<div class="brief-section-number">01</div>
				<div><span>Executive Summary</span><p>${escapeHtml(data.summary)}</p></div>
			</section>
			<section class="brief-score-hero">
				<div class="brief-growth-score">
					<span>Business Growth Score™</span>
					<strong>${data.score}</strong>
					<small>${data.previousScore} previous → ${data.score} current → ${data.projected} projected</small>
					<div class="brief-score-confidence"><b style="width:${data.confidence}%"></b><em>${data.confidence}% confidence</em></div>
				</div>
				<div class="brief-health-card ${data.health.className}">
					<span>Business Health</span>
					<strong>${escapeHtml(data.health.label)}</strong>
					<small>Three-state executive signal</small>
				</div>
				<div class="brief-opportunity-card">
					<span>Estimated Business Opportunity</span>
					<strong>$${data.opportunity.monthly.toLocaleString()}/mo</strong>
					<div class="brief-opportunity-metrics">
						<div><small>New Leads</small><b>${data.opportunity.leads}/mo</b></div>
						<div><small>Visibility</small><b>+${data.opportunity.visibility}%</b></div>
						<div><small>BGS Increase</small><b>+${data.opportunity.scoreIncrease}</b></div>
						<div><small>Confidence</small><b>${data.opportunity.confidence}%</b></div>
					</div>
				</div>
			</section>
			${missionOperatingSystemHtml(data)}
			${activityTimelineHtml(data)}
			<section class="brief-section">
				<div class="brief-section-number">05</div>
				<div class="brief-section-body">
					<div class="brief-section-head"><span>Executive Momentum</span><strong>Watch the business improve.</strong></div>
					<div class="brief-executive-signal"><b>${escapeHtml(data.momentumStory.split(':')[0])}</b><span>${escapeHtml(data.momentumStory.replace(`${data.momentumStory.split(':')[0]}: `, ''))}</span></div>
					<div class="brief-momentum-strip">
						${data.momentum.map(([label, value, note]) => `<div><span>${escapeHtml(label)}</span><strong>${value}</strong><small>${escapeHtml(note)}</small></div>`).join('')}
					</div>
				</div>
			</section>
			<section class="brief-section">
				<div class="brief-section-number">06</div>
				<div class="brief-section-body">
					<div class="brief-section-head"><span>Executive Health</span><strong>One score, five drivers.</strong></div>
					<div class="brief-health-grid">
						${driverCards.map(([label, value, status]) => `<div class="brief-kpi-card"><span>${escapeHtml(label)}</span><strong>${value}</strong><small>${escapeHtml(status)}</small><i><b style="width:${value}%"></b></i></div>`).join('')}
					</div>
				</div>
			</section>
			<section class="brief-chart-pair">
				<div class="brief-chart-panel"><div class="brief-section-head"><span>Radar Chart</span><strong>Strengths and weaknesses.</strong></div>${executiveRadarSvg(data)}</div>
				<div class="brief-chart-panel"><div class="brief-section-head"><span>Business Timeline</span><strong>Current → projected → goal.</strong></div>${businessTimelineSvg(data)}</div>
			</section>
			<section class="brief-section">
				<div class="brief-section-number">07</div>
				<div class="brief-section-body">
					<div class="brief-section-head"><span>Top Priorities</span><strong>Executive investment opportunities.</strong></div>
					<div class="brief-priority-list">
						${data.recommendations.map((item, index) => `
							<div class="brief-priority">
								<b>${index + 1}</b>
								<div class="brief-priority-main">
									<strong>${escapeHtml(item.title)}</strong>
									<div class="brief-priority-blocks">
										<span class="growth"><small>BGS Lift</small>${escapeHtml(item.scoreLift)}</span>
										<span class="stable"><small>Visibility</small>${escapeHtml(item.visibility)}</span>
										<span class="opportunity"><small>ROI</small>${escapeHtml(item.roi)}</span>
										<span class="muted"><small>Time</small>${escapeHtml(item.time)}</span>
										<span class="${/Blocked|Waiting/.test(item.status) ? 'blocked' : 'growth'}"><small>Status</small>${escapeHtml(item.status)}</span>
									</div>
									<div class="brief-priority-result-grid">
										<span><small>Expected Result</small>${escapeHtml(item.scoreLift)} / ${escapeHtml(item.visibility)}</span>
										<span><small>Owner</small>${escapeHtml(item.owner)}</span>
										<span><small>Approval</small>${escapeHtml(item.approvalStatus)}</span>
										<span><small>Dependency</small>${escapeHtml(item.dependencies)}</span>
									</div>
									${confidenceIntelligenceHtml(data, item, index)}
								</div>
							</div>
						`).join('')}
					</div>
				</div>
			</section>
			${premiumVisualsHtml(data)}
			<section class="brief-chart-pair">
				<div class="brief-chart-panel">
					<div class="brief-section-head"><span>Competitor Snapshot</span><strong>You vs market pressure.</strong></div>
					<div class="brief-competitors">
						${data.competitors.map(([name, competitorScore, trust, ai], index) => `<div class="${index === 0 ? 'you' : ''}"><strong>${escapeHtml(name)}</strong><span>Score ${competitorScore}</span><i><b style="width:${competitorScore}%"></b></i><small>Trust ${trust} / AI ${ai}</small></div>`).join('')}
					</div>
				</div>
				<div class="brief-chart-panel">
					<div class="brief-section-head"><span>Trust Coverage</span><strong>Proof ecosystem.</strong></div>
					<div class="brief-trust-grid">
						${data.trust.map(([name, state]) => `<div class="${escapeHtml(state)}"><strong>${escapeHtml(name)}</strong><span>${escapeHtml(state)}</span></div>`).join('')}
					</div>
				</div>
			</section>
			<section class="brief-chart-pair brief-final-row">
				<div class="brief-chart-panel">
					<div class="brief-section-head"><span>AI Visibility</span><strong>Current → target.</strong></div>
					${aiProgressSvg(data)}
				</div>
				<div class="brief-mission-card">
					<span>Approval Intelligence</span>
					<strong>${escapeHtml(data.mission.executionMode)}</strong>
					<div class="brief-mission-progress"><i><b style="width:${data.mission.progress}%"></b></i><em>${data.mission.progress}%</em></div>
					<p>${escapeHtml(data.mission.impact.split('. ')[0])}.</p>
					<div class="brief-mission-meta">
						<div><small>Estimated Completion</small><b>${escapeHtml(data.mission.estimatedCompletion)}</b></div>
						<div><small>Current Stage</small><b>${escapeHtml(data.mission.currentStage)}</b></div>
						<div><small>Remaining</small><b>${data.mission.remainingSteps}</b></div>
						<div><small>Owner</small><b>${escapeHtml(data.mission.owner)}</b></div>
					</div>
				</div>
			</section>
		</article>
	`;
	document.body.classList.add('executive-brief-v2');
}

function setupExecutiveDashboard() {
	if (route !== 'dashboard.html' || apexDemoMode) return;
	const main = document.querySelector('.main');
	const pageHead = document.querySelector('.page-head');
	if (!main || !pageHead) return;

	renderAccountState();
	const profile = getStoredProfile();
	if (!profile?.scanCompleted) {
		dashboardEmptyState(main, pageHead);
		return;
	}

	document.body.classList.add('dashboard-scan-complete');
	main.querySelectorAll(':scope > section:not(.page-head):not([data-executive-live-dashboard])').forEach(section => {
		section.hidden = true;
	});
	const score = Number(profile.score || 61);
	const trend = Array.isArray(profile.trend) && profile.trend.length ? profile.trend : [12, 28, 41, 55, score];
	const businessName = profile.businessName || new URL(profile.website).hostname.replace(/^www\./, '');
	const status = scoreLabel(score);
	const briefData = buildExecutiveBriefData();
	const mission = briefData.mission;
	renderWorkspaceContext();
	pageHead.querySelector('h1').textContent = `${businessName} Executive Intelligence profile is ready.`;
	const kicker = pageHead.querySelector('.page-kicker');
	if (kicker) kicker.textContent = 'Mission Control';

	if (!main.querySelector('[data-executive-live-dashboard]')) {
		pageHead.insertAdjacentHTML('afterend', `
			<section class="executive-live-dashboard" data-executive-live-dashboard>
				<article class="live-score-card" data-assemble-card style="--delay:0ms">
					<div class="panel-label">Business Growth Score™</div>
					<div class="executive-score-ring" data-score-ring style="--score:0">
						<div><strong data-executive-score data-final-score="${score}">0</strong><span>/100</span></div>
					</div>
					<h3 data-score-status>${escapeHtml(status)}</h3>
					<p>Based on website health, business trust, AI visibility, and local search signals.</p>
				</article>
				<article class="live-snapshot-card" data-assemble-card style="--delay:420ms">
					<div class="panel-label">Business Health Snapshot</div>
					<h3>Trust is the current constraint; visibility has room to move.</h3>
					<div class="animated-meter"><span data-meter style="--w:68%"></span></div>
					<p>Apex detected enough business signal to build the first decision profile. The fastest confidence lift is strengthening proof signals.</p>
				</article>
				<article class="live-summary-card" data-assemble-card style="--delay:780ms">
					<div class="panel-label">Executive Summary</div>
					<h3>One decision matters before broader content or ads.</h3>
					<p>Complete the local trust layer first. It improves buyer confidence, supports AI answer visibility, and makes every next action more durable.</p>
				</article>
				<article class="live-trend-card" data-assemble-card style="--delay:1120ms">
					<div class="panel-label">Business Growth Score™ Trend</div>
					<h3>First scan baseline created.</h3>
					${executiveBaselineSvg(trend, score)}
					<p>The first scan is the baseline. Future scans add verified history from this point instead of showing a placeholder line.</p>
				</article>
				<article class="live-opportunity-card" data-assemble-card style="--delay:1460ms">
					<div class="panel-label">Opportunity Cards</div>
					<div class="live-opportunities">
						<span><strong>Trust Layer</strong><small>Highest confidence</small></span>
						<span><strong>AI Visibility</strong><small>Indexed baseline</small></span>
						<span><strong>Local Search</strong><small>Ready for proof</small></span>
					</div>
				</article>
				<article class="live-action-card" data-assemble-card style="--delay:1780ms">
					<div class="panel-label">Today’s Mission</div>
					<h3>${escapeHtml(mission.title)}</h3>
					<p>${escapeHtml(mission.reason || mission.impact)}</p>
					<div class="mission-mini-meta">
						<span>${escapeHtml(mission.executionMode || 'Customer Required')}</span>
						<span>${escapeHtml(mission.state || 'Ready')}</span>
						<span>${mission.confidence || briefData.confidence}% confidence</span>
					</div>
					<button class="ghost-button" data-template="drawer-gbp">View Playbook</button>
				</article>
				<article class="live-feed-card" data-assemble-card style="--delay:2100ms">
					<div class="panel-label">Apex Activity Feed</div>
					<div class="mini-timeline">
						${briefData.activityProof.slice(0, 6).map(([value, label, state]) => `
							<button><span>${escapeHtml(value)}</span><strong>${escapeHtml(label)}</strong><small>${escapeHtml(state === 'warning' ? 'Needs attention' : state === 'growth' ? 'Growth signal' : 'Completed intelligence')}</small></button>
						`).join('')}
					</div>
				</article>
			</section>
		`);
	}

	requestAnimationFrame(() => {
		document.body.classList.add('dashboard-assembling');
		const scoreEl = document.querySelector('[data-executive-score]');
		const ring = document.querySelector('[data-score-ring]');
		const duration = 2600;
		const start = performance.now();
		const animate = now => {
			const progress = Math.min((now - start) / duration, 1);
			const eased = 1 - Math.pow(1 - progress, 3);
			const value = Math.round(score * eased);
			if (scoreEl) scoreEl.textContent = value;
			if (ring) ring.style.setProperty('--score', value);
			if (progress < 1) requestAnimationFrame(animate);
		};
		requestAnimationFrame(animate);
	});
}

function statusClassForState(state = '') {
	const value = String(state).toLowerCase();
	if (/complete|passed|ready|validated|clear|prepared|active|allowed/.test(value)) return 'status-ok';
	if (/waiting|approval|pending|deferred|hold/.test(value)) return 'status-high';
	if (/blocked|failed|risk/.test(value)) return 'status-critical';
	return '';
}

function missionStatement(value, fallback = 'Prepared') {
	return escapeHtml(value || fallback);
}

function missionWorkspaceList(items, className = 'mission-workspace-list') {
	return `
		<div class="${className}">
			${items.map(([title, value, note, state]) => `
				<div>
					<span>${escapeHtml(title)}</span>
					<strong>${escapeHtml(value)}</strong>
					${note ? `<p>${escapeHtml(note)}</p>` : ''}
					${state ? `<small class="status-pill ${statusClassForState(state)}">${escapeHtml(state)}</small>` : ''}
				</div>
			`).join('')}
		</div>
	`;
}

function missionCompactGrid(items, className = 'mission-compact-grid') {
	return `
		<div class="${className}">
			${items.map(([label, value, state]) => `
				<div class="${state ? escapeHtml(state) : ''}">
					<span>${escapeHtml(label)}</span>
					<strong>${escapeHtml(value)}</strong>
				</div>
			`).join('')}
		</div>
	`;
}

function executiveNotificationStrip(notifications = [], readiness = 'Ready') {
	const items = notifications.length ? notifications.slice(0, 4) : [{ title: 'Executive OS synchronized', detail: 'Mission state is current across workspaces.', state: 'complete' }];
	return `
		<section class="executive-os-strip" data-executive-notifications>
			<div>
				<span class="panel-label">Executive OS Notifications</span>
				<strong>${escapeHtml(readiness)}</strong>
			</div>
			${items.map(item => `
				<article class="${escapeHtml(item.state || 'stable')}">
					<span>${escapeHtml(item.title)}</span>
					<strong>${escapeHtml(item.detail)}</strong>
				</article>
			`).join('')}
		</section>
	`;
}

function missionWorkflow(title, steps, state = '') {
	return `
		<div class="mission-workflow ${state ? escapeHtml(state) : ''}">
			<span>${escapeHtml(title)}</span>
			<div>${steps.map(step => `<strong>${escapeHtml(step)}</strong>`).join('<i></i>')}</div>
		</div>
	`;
}

function missionWorkspacePanel(title, subtitle, body, open = false, extraClass = '') {
	return `
		<details class="mission-disclosure ${extraClass}" ${open ? 'open' : ''}>
			<summary>
				<div><span>${escapeHtml(title)}</span><strong>${escapeHtml(subtitle)}</strong></div>
				<i></i>
			</summary>
			<div class="mission-disclosure-body">${body}</div>
		</details>
	`;
}

function renderMissionWorkspace() {
	if (route !== 'mission-workspace.html') return;
	const main = document.querySelector('.main');
	const pageHead = document.querySelector('.page-head');
	if (!main || !pageHead || main.querySelector('[data-mission-workspace]')) return;
	const data = buildExecutiveBriefData();
	const unified = data.unifiedState || getUnifiedMissionState(missionContextForProfile(data.profile));
	const missionPlan = data.missionPlan;
	const missionRecord = unified.primaryMission || (unified.missionRecords || [])[0] || {};
	const mission = missionPlan.primaryMission;
	const layer = missionPlan.executionLayer || window.ApexMissionEngine?.buildExecutionLayer?.(mission, missionPlan.secondaryMissions || [], missionPlan.blockedMissions || [], missionPlan.metrics || {}, missionPlan.subscriptionLevel) || {};
	const workspace = layer.missionWorkspace || {};
	const approval = layer.approvalIntelligence || {};
	const provider = layer.providerArchitecture || {};
	const daily = unified.dailyOperations || layer.dailyOperations || {};
	const email = layer.dailyEmail || { sections: [] };
	const bgsLift = missionRecord.estimatedBusinessGrowthScoreLift || workspace.estimatedImpact?.businessGrowthScore || mission?.expectedBusinessGrowthScore || 0;
	const confidence = missionRecord.confidence || workspace.confidenceScore || mission?.confidence || 0;
	const revenue = workspace.estimatedImpact?.revenue || mission?.expectedRevenueImpact || 0;
	const timeSaved = workspace.estimatedImpact?.timeSaved || 0;
	const approvalWaiting = (unified.approvalQueue || []).length || (Array.isArray(daily.pendingApprovals) ? daily.pendingApprovals.length : 0);
	const lifecycle = missionRecord.executionHistory?.map(stage => [stage.stage, stage.status, stage.timestamp, stage.state]) || workspace.lifecycle || [];
	const activeStage = lifecycle.find(item => item[3] === 'active') || lifecycle.find(item => item[3] === 'pending') || lifecycle[0] || [];
	const completedStages = lifecycle.filter(item => item[3] === 'complete').length;
	const operationsTimeline = (unified.timeline || layer.operationsLog || []).map(item => Array.isArray(item) ? item : [item.time, item.title, item.note, item.state]);
	const summaryItems = [
		['Mission', missionRecord.title || mission?.title || 'Mission prepared', 'priority'],
		['Business Growth', `+${bgsLift} BGS`, 'growth'],
		['Confidence', `${confidence}%`, 'confidence'],
		['Expected Lift', `$${revenue.toLocaleString()}/mo`, 'growth'],
		['Approval', approval.currentDecision || workspace.approvalStatus || 'Prepared', approvalWaiting ? 'approval' : 'clear'],
		['Status', missionRecord.currentExecutionStage || workspace.executionStatus || 'Prepared, not executed', 'status']
	];
	const commandMetrics = [
		['Business Growth Score', daily.businessGrowthScoreMovement || `+${bgsLift} projected`, 'growth'],
		["Today's Mission", missionRecord.title || mission?.title || 'Mission prepared', 'priority'],
		['Completed Yesterday', daily.completedYesterday || 'Baseline, mission queue, forecast.', 'complete'],
		['Approvals Waiting', `${approvalWaiting}`, approvalWaiting ? 'approval' : 'clear'],
		['Forecast', daily.forecast || 'Prepared', 'forecast'],
		['Business Risk', daily.businessRisks || 'Approval delay can slow forecast movement.', 'risk'],
		['Competitor Changes', daily.competitorChanges || 'No critical ranking shock detected.', 'competitor'],
		['Current Status', missionRecord.currentExecutionStage || workspace.executionStatus || 'Prepared', 'status'],
		['Executive Readiness', unified.executiveReadiness || 'Ready', statusClassForState(unified.executiveReadiness || 'Ready').replace('status-', '')],
		['Time Saved', `${timeSaved} min`, 'time'],
		['Projected Revenue', `$${revenue.toLocaleString()}/mo`, 'revenue']
	];
	const workflowBody = [
		missionWorkflow('Rollback', ['Archive', 'Deploy', 'Validate', 'Restore if needed'], 'stable'),
		missionWorkflow('Evidence', ['Before', 'Execute', 'After', 'Verification', 'Stored'], 'growth'),
		missionWorkflow('Provider Flow', ['Mission', 'Execution Engine', 'Provider Adapter', 'Verification', 'Evidence'], 'deferred')
	].join('');
	const evidenceTiles = [
		['Before Screenshot', 'Ready'],
		['After Screenshot', 'Reserved'],
		['JSON-LD', 'Passed'],
		['Validation Log', 'Ready'],
		['Performance Snapshot', 'Prepared'],
		['Provider Confirmation', 'Deferred'],
		['Rollback Archive', 'Ready'],
		['Execution Timeline', 'Active']
	];
	document.body.classList.add('mission-workspace-page');
	pageHead.querySelector('.page-kicker').textContent = 'Mission Workspace';
	pageHead.querySelector('h1').textContent = 'Executive Command Center';
	const action = pageHead.querySelector('.ghost-button');
	if (action) action.remove();
	main.querySelectorAll(':scope > section:not(.page-head)').forEach(section => {
		if (!section.hasAttribute('data-mission-workspace')) section.hidden = true;
	});
	pageHead.insertAdjacentHTML('afterend', `
		<section class="mission-workspace" data-mission-workspace>
			<section class="mission-command-center">
				<div class="command-greeting">
					<span class="panel-label">Good Morning</span>
					<h2>${escapeHtml(missionRecord.title || mission?.title || 'Mission prepared')}</h2>
					<p>${missionStatement(daily.executiveRecommendation, 'Apex prepared the highest-value work. Human judgment is only needed for live-business approval.')}</p>
				</div>
				<div class="command-score">
					<span>Business Growth Score</span>
					<strong>${escapeHtml(String(daily.businessGrowthScoreMovement || `+${bgsLift} projected`))}</strong>
					<div class="mission-confidence-line"><i style="width:${confidence}%"></i></div>
					<small>${confidence}% confidence / ${escapeHtml(activeStage[0] || 'Prepared')} active</small>
				</div>
				<div class="command-recommendation">
					<span>Executive Recommendation</span>
					<strong>${missionStatement(daily.executiveRecommendation, 'Approve the prepared package when ready.')}</strong>
				</div>
				${missionCompactGrid(commandMetrics, 'command-metric-grid')}
			</section>
			${executiveNotificationStrip(unified.notifications || [], unified.executiveReadiness || 'Ready')}

			<section class="mission-ops-preview" id="activity">
				<div class="panel-head"><div><div class="panel-label">Executive Operations Log</div><h3>Apex already handled everything it could.</h3></div><span class="status-pill status-ok">Waiting for approval</span></div>
				<div class="operations-log executive">
					${operationsTimeline.map(([time, title, note, state]) => `
						<div class="${escapeHtml(state)}"><span>${escapeHtml(time)}</span><strong>${escapeHtml(title)}</strong><p>${escapeHtml(note)}</p></div>
					`).join('')}
				</div>
			</section>

			<section class="mission-disclosure-stack">
				${missionWorkspacePanel('Mission Summary', `${completedStages} stages complete / ${escapeHtml(activeStage[0] || 'Prepared')} active`, `
					${missionCompactGrid(summaryItems, 'mission-priority-grid')}
					<div class="mission-lifecycle signature">
						${lifecycle.map(([stage, status, note, state]) => `
							<div class="${escapeHtml(state)}">
								<span>${escapeHtml(stage)}</span>
								<strong>${escapeHtml(status)}</strong>
								<p>${escapeHtml(note)}</p>
							</div>
						`).join('')}
					</div>
				`, true, 'mission-summary-disclosure')}

				${missionWorkspacePanel('Execution', 'Prepared only / no production changes', `
					${missionCompactGrid([
						['Research', 'Complete', 'complete'],
						['Content', 'Ready', 'complete'],
						['Validation', 'Passed', 'complete'],
						['Dependencies', workspace.dependencies?.some(item => item[1] === 'Waiting') ? 'Waiting' : 'Clear', workspace.dependencies?.some(item => item[1] === 'Waiting') ? 'risk' : 'clear'],
						['Execution', 'Deferred', 'deferred'],
						['Monitoring', 'Prepared', 'status']
					])}
					<div class="mission-workflow-grid">${workflowBody}</div>
				`)}

				${missionWorkspacePanel('Prepared Assets', `${(workspace.filesPrepared || []).length} files / ${(workspace.changesReady || []).length} changes`, `
					<div class="mission-two-column">
						${missionWorkspaceList((workspace.filesPrepared || []).map(([title, value, state]) => [title, state || value, '', state]), 'mission-workspace-list compact')}
						${missionWorkspaceList((workspace.changesReady || []).map(([title, value, state]) => [title, state || value, '', state]), 'mission-workspace-list compact')}
					</div>
				`)}

				${missionWorkspacePanel('Evidence', 'Proof package reserved', `
					${missionCompactGrid(evidenceTiles, 'evidence-tile-grid')}
				`)}

				${missionWorkspacePanel('Approval', approval.currentDecision || 'Approval package prepared', `
					<div class="approval-rules">
						<div><span>Automatic Preparation</span>${(approval.automatic || []).map(item => `<b>${escapeHtml(item)}</b>`).join('')}</div>
						<div><span>Requires Approval</span>${(approval.requiresApproval || []).map(item => `<b>${escapeHtml(item)}</b>`).join('')}</div>
					</div>
					<div class="approval-actions">${(approval.visualActions || []).map(([label, note, kind]) => `<button class="${kind === 'primary' ? 'button' : 'ghost-button'}" type="button" data-mission-transition="${escapeHtml(missionRecord.id || mission?.id || '')}" data-next-stage="${kind === 'primary' ? 'Executing' : label === 'Reject' ? 'Blocked' : 'Prepared'}"><strong>${escapeHtml(label)}</strong><span>${escapeHtml(note)}</span></button>`).join('')}</div>
				`)}

				${missionWorkspacePanel('Verification', workspace.verificationStatus || 'Verification architecture prepared', `
					${missionWorkspaceList((workspace.verificationPlan || []).map(([title, value, state]) => [title, state || value, '', state]), 'mission-workspace-list compact')}
				`)}

				${missionWorkspacePanel('Operations Log', `${(layer.operationsLog || []).length} events this morning`, `
					<div class="operations-log">
						${operationsTimeline.map(([time, title, note, state]) => `
							<div class="${escapeHtml(state)}"><span>${escapeHtml(time)}</span><strong>${escapeHtml(title)}</strong><p>${escapeHtml(note)}</p></div>
						`).join('')}
					</div>
				`)}

				${missionWorkspacePanel('Daily Intelligence', 'Morning brief architecture', `
					${missionCompactGrid(Object.entries(daily).map(([key, value]) => [key.replace(/([A-Z])/g, ' $1'), Array.isArray(value) ? value.join(', ') || 'None' : String(value), 'status']), 'daily-intel-grid')}
				`)}

				${missionWorkspacePanel('Email Preview', email.subject || 'Apex Daily Executive Brief', `
					<div class="email-preview-card">
						${(email.sections || []).map(([title, value]) => `<div><span>${escapeHtml(title)}</span><strong>${escapeHtml(value)}</strong></div>`).join('')}
					</div>
				`)}

				${missionWorkspacePanel('Architecture', `${(layer.missionTemplates || []).length} reusable mission templates`, `
					<p>${escapeHtml(provider.rule || 'No provider-specific execution is connected yet.')}</p>
					<div class="provider-grid">${(provider.providers || []).map(item => `<span>${escapeHtml(item)}</span>`).join('')}</div>
					${missionWorkspaceList(provider.interface || [], 'mission-provider-interface compact')}
					<div class="mission-template-grid">${(layer.missionTemplates || []).map(item => `<span>${escapeHtml(item)}</span>`).join('')}</div>
				`)}
			</section>
		</section>
	`);
	main.querySelectorAll('[data-mission-transition]').forEach(button => {
		button.addEventListener('click', () => {
			setUnifiedMissionStage(button.dataset.missionTransition, button.dataset.nextStage);
			main.querySelector('[data-mission-workspace]')?.remove();
			renderMissionWorkspace();
		});
	});
}

function renderMissionQueuePanel() {
	if (route !== 'opportunities.html') return;
	const main = document.querySelector('.main');
	const pageHead = document.querySelector('.page-head');
	if (!main || !pageHead || main.querySelector('[data-mission-queue-panel]')) return;
	const data = buildExecutiveBriefData();
	const queue = data.missionPlan.missionQueue.slice(0, 6);
	pageHead.insertAdjacentHTML('afterend', `
		<section class="mission-queue-panel" data-mission-queue-panel>
			<div class="panel-head">
				<div><div class="panel-label">Mission Engine Queue</div><h3>Ranked by business impact, confidence, dependencies, customer effort, and competitive pressure.</h3></div>
				<span class="status-pill status-ok">Primary mission selected</span>
			</div>
			<div class="mission-queue-list">
				${queue.map((mission, index) => `
					<article class="mission-queue-item ${index === 0 ? 'primary' : ''}">
						<div class="mission-rank">${index + 1}</div>
						<div class="mission-queue-main">
							<span>${escapeHtml(mission.type)} / ${escapeHtml(mission.executionMode)}</span>
							<strong>${escapeHtml(mission.title)}</strong>
							<p>${escapeHtml(mission.reason)}</p>
						</div>
						<div class="mission-score-block"><small>Priority</small><b>${mission.priorityScore}</b></div>
						<div class="mission-score-block"><small>BGS</small><b>+${mission.expectedBusinessGrowthScore}</b></div>
						<div class="mission-score-block"><small>Visibility</small><b>+${mission.expectedVisibility}%</b></div>
						<div class="mission-score-block"><small>Leads</small><b>+${mission.expectedLeads}/mo</b></div>
						<div class="mission-score-block"><small>Time</small><b>${escapeHtml(mission.estimatedTime)}</b></div>
						<div class="mission-state-pill">${escapeHtml(mission.state)}</div>
					</article>
				`).join('')}
			</div>
		</section>
	`);
}

function renderMissionForecastPanel() {
	if (route !== 'forecast.html') return;
	const main = document.querySelector('.main');
	const pageHead = document.querySelector('.page-head');
	if (!main || !pageHead || main.querySelector('[data-mission-forecast-panel]')) return;
	const data = buildExecutiveBriefData();
	const mission = data.missionPlan.primaryMission;
	const forecast = mission.forecastModel || { current: data.score + 6, afterMission: data.projected, thirtyDayTarget: data.goal };
	pageHead.insertAdjacentHTML('afterend', `
		<section class="mission-forecast-panel" data-mission-forecast-panel>
			<div class="panel-head">
				<div><div class="panel-label">Mission-Driven Forecast</div><h3>Forecast movement is now tied to the daily mission engine.</h3></div>
				<span class="status-pill">Planning engine only</span>
			</div>
			<div class="mission-forecast-grid">
				<div><span>Current Forecast</span><strong>${forecast.current}%</strong><p>Baseline after the latest Executive Growth Scan.</p></div>
				<div><span>After Today’s Mission</span><strong>${forecast.afterMission}%</strong><p>${escapeHtml(mission.title)} is projected to add +${mission.expectedForecast} forecast points.</p></div>
				<div><span>30-Day Target</span><strong>${forecast.thirtyDayTarget}%</strong><p>Assumes the dependency path stays unblocked.</p></div>
			</div>
		</section>
	`);
}

function renderMissionSettingsPanel() {
	if (route !== 'settings.html') return;
	const main = document.querySelector('.main');
	const pageHead = document.querySelector('.page-head');
	if (!main || !pageHead || main.querySelector('[data-automation-permissions]')) return;
	const data = buildExecutiveBriefData();
	const permissions = data.missionPlan.automationPermissions;
	pageHead.insertAdjacentHTML('afterend', `
		<section class="setting-group automation-permissions-panel" data-automation-permissions>
			<div class="panel-head">
				<div><div class="panel-label">Automation Permissions</div><h3>Controls the execution mode each future mission is allowed to use.</h3></div>
				<span class="status-pill">Foundation ready</span>
			</div>
			${Object.entries(permissions).map(([mode, status]) => `
				<div class="setting-row">
					<div><strong>${escapeHtml(mode)}</strong><p>${escapeHtml(status)}</p></div>
					<span class="status-pill ${/Allowed|ready|Customer/.test(status) ? 'status-ok' : ''}">${escapeHtml(mode === 'Automatic' ? 'Future' : 'Configured')}</span>
					<button class="row-action" data-coming-soon="Automation permission editing is intentionally deferred until Executive Autopilot.">Coming Soon</button>
				</div>
			`).join('')}
		</section>
	`);
}

function renderExecutionCenter() {
	if (route !== 'command-dashboard.html') return;
	const main = document.querySelector('.main');
	if (!main || main.querySelector('[data-execution-center]')) return;
	const briefData = buildExecutiveBriefData();
	const execution = briefData.unifiedState || getUnifiedMissionState(missionContextForProfile(briefData.profile));
	const missions = execution.missionRecords || [];
	const primaryId = execution.primaryMissionId || missions[0]?.id;
	const approvals = execution.approvalQueue || [];
	const daily = execution.dailyOperations || {};
	const summary = execution.summary || {};
	document.body.classList.add('execution-center-page');
	document.querySelector('.command-workspace .brand span')?.replaceChildren(document.createTextNode('Execution Center'));
	document.querySelector('.command-workspace .site-card .eyebrow')?.replaceChildren(document.createTextNode('Execution architecture ready'));
	const activeTasks = missions.filter(mission => mission.currentExecutionStage !== 'Completed').length;
	const readiness = execution.executiveReadiness || 'Ready';
	main.innerHTML = `
		<header class="topbar">
			<div><span class="eyebrow"><span class="live-dot"></span>Execution center online</span></div>
			<div class="account"><span class="status-pill ${statusClassForState(readiness)}">${escapeHtml(readiness)}</span><span class="status-pill status-ok">${activeTasks} active missions</span><button class="ghost-button" data-ask="What is Apex executing right now?">Ask Apex</button><div class="avatar">JM</div></div>
		</header>
		<section class="execution-center" data-execution-center>
			<section class="execution-command-hero">
				<div>
					<div class="page-kicker">Execution Center</div>
					<h1>Apex already prepared the work. Only approval-gated decisions are waiting.</h1>
					<p>Provider execution is still architectural. The system now models preparation, approval, verification, evidence, rollback, and reporting as one reusable operating layer.</p>
				</div>
				<div class="execution-command-grid">
					<div><span>What changed overnight?</span><strong>${escapeHtml(summary.overnightChange || 'Business scan refreshed.')}</strong></div>
					<div><span>What is Apex doing right now?</span><strong>${escapeHtml(summary.doingNow || 'Preparing the top mission.')}</strong></div>
					<div><span>What is waiting for me?</span><strong>${escapeHtml(summary.waitingForOwner || 'No approvals waiting.')}</strong></div>
					<div><span>What will improve next?</span><strong>${escapeHtml(summary.improvesNext || 'Business Growth Score movement.')}</strong></div>
				</div>
			</section>
			${executiveNotificationStrip(execution.notifications || [], readiness)}

			<section class="execution-grid" id="mission-queue">
				<article class="execution-panel execution-queue-panel">
					<div class="panel-head"><div><div class="panel-label">Mission Queue</div><h3>Every mission follows the same execution lifecycle.</h3></div><span class="status-pill">${missions.length} missions</span></div>
					<div class="execution-mission-list">
						${missions.map((mission, index) => `
							<button class="${mission.id === primaryId ? 'active' : ''}" type="button" data-execution-mission="${escapeHtml(mission.id)}">
								<b>${index + 1}</b>
								<span><strong>${escapeHtml(mission.title)}</strong><small>${escapeHtml(mission.category)} / ${escapeHtml(mission.currentExecutionStage)}</small></span>
								<i>+${mission.estimatedBusinessGrowthScoreLift} BGS</i>
							</button>
						`).join('')}
					</div>
				</article>
				<article class="execution-panel execution-detail-panel">
					${missions.map(mission => `
						<div class="execution-detail" data-execution-detail="${escapeHtml(mission.id)}" ${mission.id === primaryId ? '' : 'hidden'}>
							<div class="panel-head"><div><div class="panel-label">Mission Details</div><h3>${escapeHtml(mission.title)}</h3></div><span class="status-pill ${statusClassForState(mission.currentExecutionStage)}">${escapeHtml(mission.currentExecutionStage)}</span></div>
							<div class="execution-kpi-grid">
								<div><span>Priority</span><strong>${mission.priority}</strong></div>
								<div><span>Confidence</span><strong>${mission.confidence}%</strong></div>
								<div><span>Score Lift</span><strong>+${mission.estimatedBusinessGrowthScoreLift}</strong></div>
								<div><span>Time</span><strong>${escapeHtml(mission.estimatedTime)}</strong></div>
								<div><span>Owner</span><strong>${escapeHtml(mission.owner)}</strong></div>
								<div><span>Approval</span><strong>${escapeHtml(mission.approvalRequirement)}</strong></div>
								<div><span>Dependencies</span><strong>${mission.blockedReason || (mission.dependencies.length ? mission.dependencies.map(item => item.replace(/-/g, ' ')).join(', ') : 'Clear')}</strong></div>
								<div><span>Rollback</span><strong>${mission.rollbackAvailable ? 'Available' : 'Unavailable'}</strong></div>
							</div>
							<div class="execution-detail-sections">
								<div><span>Mission Summary</span><p>${escapeHtml(mission.objective)}</p></div>
								<div><span>Reason It Exists</span><p>${escapeHtml(mission.reason)}</p></div>
								<div><span>Business Evidence</span><p>${escapeHtml(mission.businessEvidence)}</p></div>
								<div><span>Competitor Evidence</span><p>${escapeHtml(mission.competitorEvidence)}</p></div>
								<div><span>AI Evidence</span><p>${escapeHtml(mission.aiEvidence)}</p></div>
								<div><span>Expected Outcome</span><p>${escapeHtml(mission.expectedOutcome)} / ${escapeHtml(mission.projectedRevenueLift)}</p></div>
							</div>
							<div class="execution-asset-grid">
								<div><span>Files Generated</span>${mission.filesGenerated.map(item => `<b>${escapeHtml(item)}</b>`).join('')}</div>
								<div><span>Content Generated</span>${mission.contentGenerated.map(item => `<b>${escapeHtml(item)}</b>`).join('')}</div>
								<div><span>Schema Prepared</span><b>${escapeHtml(mission.schemaPrepared)}</b></div>
								<div><span>Internal Links Prepared</span><b>${escapeHtml(mission.internalLinksPrepared)}</b></div>
								<div><span>Review Responses Prepared</span><b>${escapeHtml(mission.reviewResponsesPrepared)}</b></div>
								<div><span>Completion Criteria</span>${mission.completionCriteria.map(item => `<b>${escapeHtml(item)}</b>`).join('')}</div>
							</div>
							<div class="execution-pipeline">
								${mission.executionHistory.map(stage => `
									<div class="${escapeHtml(stage.state)}">
										<span>${escapeHtml(stage.timestamp)}</span>
										<strong>${escapeHtml(stage.stage)}</strong>
										<small>${escapeHtml(stage.status)}</small>
									</div>
								`).join('')}
							</div>
						</div>
					`).join('')}
				</article>
			</section>

			<section class="execution-grid">
				<article class="execution-panel" id="approvals">
					<div class="panel-head"><div><div class="panel-label">Approval Center</div><h3>Only live-business decisions appear here.</h3></div><span class="status-pill status-high">${approvals.length} waiting</span></div>
					<div class="execution-approval-list">
						${approvals.length ? approvals.map(item => `
							<div>
								<span>${escapeHtml(item.title)}</span>
								<strong>${escapeHtml(item.summary)}</strong>
								<p>Risk: ${escapeHtml(item.risk)} / Gain: ${escapeHtml(item.expectedGain)} / Rollback: ${item.rollbackAvailable ? 'Available' : 'Unavailable'}</p>
								<div><button class="button" data-mission-transition="${escapeHtml(item.id)}" data-next-stage="Executing">Approve</button><button class="ghost-button" data-mission-transition="${escapeHtml(item.id)}" data-next-stage="Blocked">Reject</button><button class="ghost-button" data-mission-transition="${escapeHtml(item.id)}" data-next-stage="Prepared">Request Revision</button></div>
							</div>
						`).join('') : '<div><span>No owner approval waiting</span><strong>Apex has no approval-gated decisions in the current shared state.</strong><p>Approved work is removed from this queue automatically.</p></div>'}
					</div>
				</article>
				<article class="execution-panel">
					<div class="panel-head"><div><div class="panel-label">Evidence Engine</div><h3>Evidence becomes part of the mission record.</h3></div></div>
					<div class="execution-evidence-grid">
						${(execution.evidenceEngine || []).map(item => `<div><span>${escapeHtml(item.item)}</span><strong>${escapeHtml(item.status)}</strong></div>`).join('')}
					</div>
				</article>
			</section>

			<section class="execution-grid">
				<article class="execution-panel">
					<div class="panel-head"><div><div class="panel-label">Verification Engine</div><h3>No mission completes without verification.</h3></div></div>
					<div class="execution-verification-list">
						${(execution.verificationEngine || []).map(item => `
							<div>
								<strong>${escapeHtml(item.mission)}</strong>
								<span>Expected: ${escapeHtml(item.expectedVerification)}</span>
								<span>Actual: ${escapeHtml(item.actualVerification)}</span>
								<span>Retry: ${escapeHtml(item.retryStatus)}</span>
								<span>Failure: ${escapeHtml(item.failureReason)}</span>
								<b>${escapeHtml(item.confidenceAfterExecution)} / score ${item.missionScore}</b>
							</div>
						`).join('')}
					</div>
				</article>
				<article class="execution-panel" id="permissions">
					<div class="panel-head"><div><div class="panel-label">Automation Permissions</div><h3>Provider-agnostic permission framework.</h3></div><span class="status-pill">No integrations</span></div>
					<div class="execution-permission-grid">
						${(execution.providerPermissions || []).map(provider => `
							<div>
								<strong>${escapeHtml(provider.provider)}</strong>
								${Object.entries(provider.permissions).map(([permission, value]) => `<span>${escapeHtml(permission)} <b>${escapeHtml(value)}</b></span>`).join('')}
							</div>
						`).join('')}
					</div>
				</article>
			</section>

			<section class="execution-grid">
				<article class="execution-panel">
					<div class="panel-head"><div><div class="panel-label">Unified Activity Timeline</div><h3>One timeline powers the brief, workspace, command center, and daily operations.</h3></div><span class="status-pill">${(execution.timeline || []).length} events</span></div>
					<div class="execution-verification-list">
						${(execution.timeline || []).map(([time, title, note, state]) => `
							<div>
								<span>${escapeHtml(time)}</span>
								<strong>${escapeHtml(title)}</strong>
								<span>${escapeHtml(note)}</span>
								<b>${escapeHtml(state)}</b>
							</div>
						`).join('')}
					</div>
				</article>
				<article class="execution-panel">
					<div class="panel-head"><div><div class="panel-label">Executive Memory Layer</div><h3>Business history architecture for completed mission records.</h3></div><span class="status-pill">No AI memory</span></div>
					<div class="execution-verification-list">
						${(execution.memoryRecords || []).length ? (execution.memoryRecords || []).map(item => `
							<div>
								<strong>${escapeHtml(item.title)}</strong>
								<span>Changed: ${escapeHtml(item.whatChanged)}</span>
								<span>Why: ${escapeHtml(item.why)}</span>
								<span>Score: ${escapeHtml(item.businessScoreMovement)}</span>
								<b>${escapeHtml(item.confidenceBefore)} -> ${escapeHtml(item.confidenceAfter)}</b>
							</div>
						`).join('') : '<div><strong>No completed mission history yet.</strong><span>Completed and verified missions will record outcome, evidence, score movement, and confidence deltas here.</span></div>'}
					</div>
				</article>
			</section>

			<section class="execution-panel" id="activity">
				<div class="panel-head"><div><div class="panel-label">Daily Operations Foundation</div><h3>Prepared for future morning automation. No scheduler is active.</h3></div><span class="status-pill">Architecture only</span></div>
				<div class="execution-daily-grid">
					${Object.entries(daily).map(([key, value]) => `<div><span>${escapeHtml(key.replace(/([A-Z])/g, ' $1'))}</span><strong>${escapeHtml(String(value))}</strong></div>`).join('')}
				</div>
			</section>
		</section>
	`;

	main.querySelectorAll('[data-execution-mission]').forEach(button => {
		button.addEventListener('click', () => {
			main.querySelectorAll('[data-execution-mission]').forEach(item => item.classList.toggle('active', item === button));
			main.querySelectorAll('[data-execution-detail]').forEach(detail => {
				detail.hidden = detail.dataset.executionDetail !== button.dataset.executionMission;
			});
		});
	});
	main.querySelectorAll('[data-mission-transition]').forEach(button => {
		button.addEventListener('click', () => {
			setUnifiedMissionStage(button.dataset.missionTransition, button.dataset.nextStage);
			main.innerHTML = '';
			renderExecutionCenter();
		});
	});
}

function renderMissionEngineIntegrations() {
	renderExecutionCenter();
	renderMissionWorkspace();
	renderMissionQueuePanel();
	renderMissionForecastPanel();
	renderMissionSettingsPanel();
}

document.querySelectorAll('.account').forEach(account => {
	if (apexDemoMode) return;
	if (!account.querySelector('[data-ask]')) {
		const ask = document.createElement('button');
		ask.className = 'ghost-button';
		ask.type = 'button';
		ask.dataset.ask = routeAskDefaults[route] || 'What should I do next?';
		ask.textContent = 'Ask Apex';
		account.prepend(ask);
	}
});

renderExecutiveBrief();
renderAccountState();
setupLandingCapture();
setupExecutiveScan();
setupRegistrationForm();
applyFreeProfileSnapshot();
setupExecutiveDashboard();
renderMissionEngineIntegrations();

document.querySelectorAll('[data-explain]').forEach(button => {
	button.addEventListener('click', () => {
		openAsk(button.dataset.explain);
	});
});

document.addEventListener('click', event => {
	const accountToggle = event.target.closest('[data-account-toggle]');
	if (accountToggle) {
		const menu = accountToggle.closest('[data-account-menu]');
		const open = !menu.classList.contains('open');
		document.querySelectorAll('[data-account-menu]').forEach(item => item.classList.remove('open'));
		menu.classList.toggle('open', open);
		accountToggle.setAttribute('aria-expanded', String(open));
		return;
	}

	if (!event.target.closest('[data-account-menu]')) {
		document.querySelectorAll('[data-account-menu]').forEach(item => item.classList.remove('open'));
	}

	const logout = event.target.closest('[data-apex-logout]');
	if (logout) {
		try {
			localStorage.removeItem(apexSessionKey);
			localStorage.removeItem(apexProfileKey);
		} catch (error) {
			// Ignore local logout cleanup failures.
		}
		if (apexWordPressMode) {
			window.location.assign(`${apexRoot}wp-login.php?action=logout`);
			return;
		}
		window.location.assign(apexHref('sign-in.html'));
		return;
	}

	const hashLink = event.target.closest('a[href="#"]');
	if (hashLink) event.preventDefault();

	const exportPdf = event.target.closest('[data-export-brief-pdf]');
	if (exportPdf) {
		document.body.classList.add('brief-printing');
		window.print();
		setTimeout(() => document.body.classList.remove('brief-printing'), 400);
		return;
	}

	const templateButton = event.target.closest('[data-template]');
	if (templateButton) {
		if (scanDrivenPlaybookMap[templateButton.dataset.template]) {
			openPlaybook(templateButton.dataset.template);
			return;
		}
		const template = document.getElementById(templateButton.dataset.template);
		if (!template) return;
		const title = templateButton.textContent.trim() || templateButton.getAttribute('aria-label') || 'Executive Finding';
		openDrawer(title, template.content.cloneNode(true), 'Executive Intelligence');
		return;
	}

	const askButton = event.target.closest('[data-ask]');
	if (askButton) {
		const question = askButton.dataset.ask;
		openAsk(question);
		return;
	}

	const comingSoon = event.target.closest('[data-coming-soon]');
	if (comingSoon) {
		openAsk(comingSoon.dataset.comingSoon || 'This production action is coming soon.');
		return;
	}

	const checkoutButton = event.target.closest('[data-checkout-plan]');
	if (checkoutButton) {
		startCheckout(checkoutButton.dataset.checkoutPlan, checkoutButton);
		return;
	}

	const completeAction = event.target.closest('[data-complete-action]');
	if (completeAction) {
		updatePageProgress();
		document.querySelector('[data-sim="one"]')?.click();
		drawer?.querySelectorAll('[data-completion-message]').forEach(item => item.classList.add('show'));
	}

	const drawerBack = event.target.closest('[data-drawer-back]');
	if (drawerBack && drawerHistory.length) {
		openPlaybook(drawerHistory.pop(), false);
		return;
	}

	const drawerPrev = event.target.closest('[data-drawer-prev]');
	if (drawerPrev) {
		const index = playbookSequence.indexOf(currentDrawerTemplate);
		if (index > 0) openPlaybook(playbookSequence[index - 1]);
		return;
	}

	const drawerNext = event.target.closest('[data-drawer-next]');
	if (drawerNext) {
		const index = playbookSequence.indexOf(currentDrawerTemplate);
		if (index !== -1 && index < playbookSequence.length - 1) openPlaybook(playbookSequence[index + 1]);
		return;
	}

	const memoryButton = event.target.closest('.memory-rail button');
	if (memoryButton) {
		openAsk(`Explain this Executive Memory item: ${memoryButton.textContent.trim().replace(/\\s+/g, ' ')}`);
		return;
	}

	const chart = event.target.closest('.chart-panel svg, .phase20-main-viz svg, .board-bars, .memory-map, .condition-map, .confidence-band, .waterfall-chart');
	if (chart) {
		openAsk(chart.getAttribute('aria-label') || chart.closest('section')?.querySelector('h1, h2, h3')?.textContent || 'Explain this chart.');
		return;
	}

	const genericControl = event.target.closest('button:not([data-range]):not([data-filter]):not([data-sim]):not([data-playback]):not([data-billing]):not([data-toggle-section]):not([data-select-plan]):not([data-select-meeting]):not([data-connection]):not([data-enroll-back]):not([data-enroll-continue]):not([data-enroll-submit]):not([data-close-drawer]):not([data-play-check]):not([data-checkout-plan]):not([data-coming-soon]):not([data-export-brief-pdf]):not([data-execution-mission]):not([data-mission-transition]), a[href="#"]');
	if (genericControl && !genericControl.disabled && !genericControl.closest('[data-drawer-text]')) {
		const text = genericControl.textContent.trim() || genericControl.getAttribute('aria-label') || routeAskDefaults[route] || 'What should I do next?';
		openAsk(text);
	}
});

document.querySelectorAll('[data-playback]').forEach(button => {
	button.addEventListener('click', () => {
		button.closest('.playback')?.querySelectorAll('[data-playback]').forEach(item => item.classList.remove('active'));
		button.classList.add('active');
		openAsk(button.dataset.playback === 'play' ? 'Play the Market Timeline and explain what changed.' : 'Pause the Market Timeline and summarize the current decision.');
	});
});

document.addEventListener('submit', event => {
	const form = event.target.closest('[data-ask-form]');
	if (!form) return;
	event.preventDefault();
	const input = form.elements.question;
	const question = input.value.trim();
	if (!question) return;
	const suggestions = form.closest('.ask-chat').querySelector('.ask-suggestions');
	suggestions.insertAdjacentHTML('beforebegin', `
		<div class="chat-message user"><span>You</span><p>${escapeHtml(question)}</p></div>
		<div class="chat-message apex"><span>ApexOneIQ</span><p>${escapeHtml(responseFor(question))}</p></div>
	`);
	input.value = '';
});

document.addEventListener('change', event => {
	if (!event.target.matches('[data-play-check]')) return;
	updatePlaybookProgress(event.target.closest('[data-drawer-text]') || document);
});

document.querySelectorAll('[data-sim]').forEach(button => {
	button.addEventListener('click', () => {
		const scenario = simScenarios[button.dataset.sim];
		if (!scenario) return;
		button.closest('.scenario-buttons').querySelectorAll('button').forEach(item => item.classList.remove('active'));
		button.classList.add('active');
		document.querySelector('[data-sim-forecast]').textContent = scenario.forecast;
		document.querySelector('[data-sim-bar]').style.width = scenario.bar;
		document.querySelector('[data-sim-timeline]').textContent = scenario.timeline;
		document.querySelector('[data-sim-leads]').textContent = scenario.leads;
		document.querySelector('[data-sim-revenue]').textContent = scenario.revenue;
		document.querySelector('[data-sim-confidence]').textContent = scenario.confidence;
	});
});

document.querySelectorAll('[data-billing]').forEach(button => {
	button.addEventListener('click', () => {
		const mode = button.dataset.billing;
		button.closest('.billing-toggle')?.querySelectorAll('[data-billing]').forEach(item => item.classList.remove('active'));
		button.classList.add('active');
		document.querySelectorAll('[data-software-price]').forEach(item => {
			item.textContent = mode === 'annual' ? item.dataset.annual : item.dataset.monthly;
			const suffix = item.nextElementSibling;
			if (suffix) suffix.textContent = mode === 'annual' ? '/ year' : '/ month';
		});
	});
});

document.querySelectorAll('[data-toggle-section]').forEach(button => {
	button.addEventListener('click', () => {
		const target = document.getElementById(button.dataset.toggleSection);
		if (!target) return;
		target.toggleAttribute('hidden');
		button.textContent = target.hidden ? 'Show Concierge tiers' : 'Hide Concierge tiers';
	});
});

function setupEnrollment() {
	const flow = document.querySelector('.enrollment-flow');
	if (!flow) return;
	let current = 1;
	const max = 7;
	const back = flow.querySelector('[data-enroll-back]');
	const next = flow.querySelector('[data-enroll-continue]');
	const submit = flow.querySelector('[data-enroll-submit]');
	const success = flow.querySelector('.enrollment-success');

	function stepEl(step) {
		return flow.querySelector(`[data-step="${step}"]`);
	}

	function values(selector) {
		return [...flow.querySelectorAll(selector)].filter(item => item.checked).map(item => item.value);
	}

	function updateSummary() {
		const summary = flow.querySelector('[data-enrollment-summary]');
		if (!summary) return;
		const get = name => flow.querySelector(`[name="${name}"]`)?.value || 'Not provided';
		summary.innerHTML = `
			<div><span class="panel-label">Selected plan</span><strong>${escapeHtml(get('selected_plan'))}</strong><p>${escapeHtml(get('selected_price'))}</p></div>
			<div><span class="panel-label">Business</span><strong>${escapeHtml(get('business_name'))}</strong><p>${escapeHtml(get('website'))}</p></div>
			<div><span class="panel-label">Contact</span><strong>${escapeHtml(get('contact'))}</strong><p>${escapeHtml(get('email'))} / ${escapeHtml(get('phone'))}</p></div>
			<div><span class="panel-label">Location</span><strong>${escapeHtml(get('location'))}</strong><p>${escapeHtml(get('industry'))} / ${escapeHtml(get('locations'))} location(s)</p></div>
			<div><span class="panel-label">Priorities</span><strong>${escapeHtml(values('[data-choice-group="priorities"] input').join(', ') || 'To be discussed')}</strong></div>
			<div><span class="panel-label">Goals</span><strong>${escapeHtml(values('[data-choice-group="goals"] input').join(', ') || 'To be discussed')}</strong></div>
			<div><span class="panel-label">Strategy call</span><strong>${escapeHtml(get('selected_meeting'))}</strong></div>
		`;
	}

	function showStep(step) {
		current = Math.min(max, Math.max(1, step));
		flow.dataset.currentStep = String(current);
		flow.querySelectorAll('.enroll-step').forEach(item => item.classList.toggle('active', item.dataset.step === String(current)));
		document.querySelectorAll('[data-step-dot]').forEach(dot => dot.classList.toggle('active', dot.dataset.stepDot === String(current)));
		back.disabled = current === 1;
		next.hidden = current === max;
		submit.hidden = current !== max;
		if (current === max) updateSummary();
	}

	function validateStep() {
		const active = stepEl(current);
		const required = [...active.querySelectorAll('[required]')];
		let ok = true;
		required.forEach(input => {
			const valid = input.checkValidity();
			input.closest('label')?.classList.toggle('invalid', !valid);
			if (!valid) ok = false;
		});
		return ok;
	}

	flow.querySelectorAll('[data-select-plan]').forEach(button => {
		button.addEventListener('click', () => {
			flow.querySelectorAll('[data-select-plan]').forEach(item => item.classList.remove('active'));
			button.classList.add('active');
			flow.querySelector('[name="selected_plan"]').value = button.dataset.selectPlan;
			flow.querySelector('[name="selected_price"]').value = button.dataset.price;
		});
	});

	flow.querySelectorAll('[data-select-meeting]').forEach(button => {
		button.addEventListener('click', () => {
			flow.querySelectorAll('[data-select-meeting]').forEach(item => item.classList.remove('active'));
			button.classList.add('active');
			flow.querySelector('[name="selected_meeting"]').value = button.dataset.selectMeeting;
		});
	});

	flow.querySelectorAll('[data-connection]').forEach(button => {
		button.addEventListener('click', () => {
			button.classList.toggle('active');
		});
	});

	back.addEventListener('click', () => {
		drawer?.classList.remove('open');
		showStep(current - 1);
	});
	next.addEventListener('click', () => {
		if (validateStep()) {
			drawer?.classList.remove('open');
			showStep(current + 1);
		}
	});
	submit.addEventListener('click', () => {
		drawer?.classList.remove('open');
		updateSummary();
		flow.querySelectorAll('.enroll-step, .enrollment-actions').forEach(item => item.hidden = true);
		success.hidden = false;
	});

	const params = new URLSearchParams(window.location.search);
	const plan = params.get('plan');
	if (plan) {
		const match = [...flow.querySelectorAll('[data-select-plan]')].find(button => button.dataset.selectPlan.toLowerCase() === plan.toLowerCase());
		match?.click();
	}
	showStep(1);
}

setupEnrollment();

document.querySelectorAll('[data-close-drawer]').forEach(button => {
	button.addEventListener('click', () => drawer?.classList.remove('open'));
});

document.addEventListener('keydown', event => {
	if (event.key === 'Escape') drawer?.classList.remove('open');
});

const params = new URLSearchParams(window.location.search);
const initialTemplate = params.get('template');
if (initialTemplate) {
	if (scanDrivenPlaybookMap[initialTemplate]) {
		openPlaybook(initialTemplate, false);
	} else {
		const template = document.getElementById(initialTemplate);
		if (template) {
		openDrawer(templateTitles[initialTemplate] || 'Executive Finding', template.content.cloneNode(true), 'Executive Intelligence');
		}
	}
}

const initialAsk = params.get('ask');
if (initialAsk) {
	openAsk(initialAsk);
}

const initialSim = params.get('sim');
if (initialSim) {
	document.querySelector(`[data-sim="${initialSim}"]`)?.click();
}

if (params.get('complete') === 'gbp') {
	updatePageProgress();
	document.querySelector('[data-sim="one"]')?.click();
}

refreshBillingStatus();

if (window.location.pathname.includes('/checkout/success')) {
	refreshBillingStatus().then(status => {
		const card = document.querySelector('.checkout-card');
		const plan = window.ApexSubscriptionConfig?.planFor?.(params.get('plan') || status.planId || 'free');
		const copy = card?.querySelector('p');
		if (copy) {
			copy.textContent = `Checkout returned for ${plan?.displayName || 'the selected plan'}. Paid access is activated only after the verified Stripe webhook updates the Apex entitlement store. Current billing status: ${status.billingStatus || 'pending'}.`;
		}
	});
}
