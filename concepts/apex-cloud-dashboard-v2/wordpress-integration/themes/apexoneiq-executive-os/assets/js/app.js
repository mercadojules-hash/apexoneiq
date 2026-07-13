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
		return {
			businessName: window.ApexOneIQ.businessName || new URL(window.ApexOneIQ.businessWebsite).hostname.replace(/^www\./, ''),
			website: window.ApexOneIQ.businessWebsite,
			email: window.ApexOneIQ.businessEmail || '',
			scanCompleted: Boolean(window.ApexOneIQ.scanCompleted),
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
	'dashboard.html': 'ApexOneIQ - Mission Control',
	'executive-brief.html': 'ApexOneIQ - Executive Brief',
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
	'command-dashboard.html': 'ApexOneIQ - Command Center',
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
	['Executive', [
		['Dashboard', 'dashboard.html'],
		['Executive Brief', 'executive-brief.html'],
		['Action Center', 'opportunities.html'],
		['Forecast', 'forecast.html'],
		['Reports', 'reports.html']
	]],
	['Intelligence', [
		['Website Overview', 'website-overview.html'],
		['Organic Keywords', 'organic-keywords.html'],
		['Keyword Opportunities', 'keyword-opportunities.html'],
		['Competitor Intelligence', 'competitor-intelligence.html'],
		['Backlinks', 'backlinks.html'],
		['Content Gap', 'content-gap.html'],
		['Site Audit', 'site-audit.html'],
		['AI Visibility', 'intelligence-ai-visibility.html'],
		['Search Trends', 'search-trends.html'],
		['Local Rankings', 'local-rankings.html']
	]],
	['Operations', [
		['Website Profile', 'website-profile.html'],
		['AI Recommendations', 'ai-visibility.html'],
		['Competitors', 'competitors.html'],
		['Google Business', null],
		['Content', null],
		['Reviews', null],
		['Local Presence', null]
	]],
	['Monitoring', [
		['Monitoring Center', 'monitoring-center.html'],
		['Alerts', 'alerts.html', '3'],
		['Rank Tracking', null],
		['Performance', null]
	]],
	['Planning', [
		['Executive Timeline', 'business-timeline.html'],
		['Playbooks', 'opportunities.html?view=playbooks'],
		['Market Intelligence', 'history.html']
	]],
	['System', [
		['Settings', 'settings.html'],
		['Integrations', null],
		['Team', null]
	]]
];

const commandPreviewNav = [
	['Cloud Intelligence', [
		['Mission Control', 'dashboard.html'],
		['Executive Brief', 'executive-brief.html'],
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
		['Command Center', 'command-dashboard.html'],
		['Approval Queue', 'command-dashboard.html#approvals'],
		['Agent Work', 'command-dashboard.html#agents'],
		['Automation Health', 'command-dashboard.html#automation']
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
document.querySelectorAll('.logo').forEach(item => item.textContent = 'IQ');
document.querySelectorAll('.system-card .eyebrow').forEach(item => item.textContent = 'ApexOneIQ focus');
document.querySelectorAll('.system-card p').forEach(item => item.textContent = 'Executive OS concept remains isolated until reviewed and approved.');
document.querySelectorAll('.system-card .button').forEach(item => item.textContent = 'Review ApexOneIQ');

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
		if (!user) {
			account.innerHTML = `<a class="ghost-button sign-in-link" data-sign-in-link href="${escapeHtml(apexAuthUrl)}">Sign In</a><div class="avatar">IQ</div>`;
			return;
		}

		account.innerHTML = `
			<button class="ghost-button" type="button" data-ask="${escapeHtml(askQuestion)}">Ask Apex</button>
			<div class="account-menu" data-account-menu>
				<button class="account-trigger" type="button" data-account-toggle aria-expanded="false">
					<span class="avatar">${escapeHtml(user.initials || initialsFor(user.name || user.email))}</span>
					<span>${escapeHtml(user.initials || initialsFor(user.name || user.email))}</span>
					<small>v</small>
				</button>
				<div class="account-dropdown" role="menu">
					<a href="${escapeHtml(apexPageUrl('dashboard.html'))}" role="menuitem">My Workspace</a>
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
			link.href = apexPageUrl(getStoredProfile()?.scanCompleted ? 'dashboard.html' : 'sign-in.html');
		});
		document.querySelectorAll('.landing-nav a').forEach(link => {
			if (/sign in|google sign in/i.test(link.textContent || '')) {
				link.textContent = 'My Workspace';
				link.href = apexPageUrl(getStoredProfile()?.scanCompleted ? 'dashboard.html' : 'sign-in.html');
			}
		});
	}
	renderWorkspaceContext();
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
		<div data-drawer-text></div>
	`;
	document.body.appendChild(drawer);
}
const drawerLabel = document.querySelector('[data-drawer-label]');
const drawerTitle = document.querySelector('[data-drawer-title]');
const drawerText = document.querySelector('[data-drawer-text]');

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
	'command-dashboard.html': 'Show active AI agent work.',
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
	'command-dashboard.html': ['Run another citation campaign.', 'Pause all publishing.', 'Show failed automations.'],
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

function openDrawer(title, content, label = 'Executive Intelligence') {
	if (!drawer) return;
	if (drawerLabel) drawerLabel.textContent = label;
	drawerTitle.textContent = title;
	if (typeof content === 'string') {
		drawerText.textContent = content;
	} else {
		drawerText.replaceChildren(content);
	}
	updatePlaybookProgress(drawerText);
	drawer.classList.add('open');
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
	const originalText = control?.textContent;
	if (control) {
		control.disabled = true;
		control.textContent = 'Preparing Checkout...';
	}
	try {
		const response = await fetch(`/api/billing/checkout/${encodeURIComponent(plan)}`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' }
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
		status.textContent = 'Existing business found. Opening your Executive Dashboard...';
		setTimeout(() => window.location.assign(apexHref('dashboard.html?existing=1')), 850);
		return;
	}

	const scanSteps = [
		[9, 'Identifying Business...', 'Business Identified', 'Resolving the submitted website into a business identity and market context.'],
		[18, 'Verifying DNS...', 'DNS Verification Complete', 'Checking domain resolution and technical reachability.'],
		[27, 'Inspecting SSL...', 'SSL Inspection Complete', 'Confirming secure access and browser trust requirements.'],
		[36, 'Analyzing Website Architecture...', 'Website Architecture Mapped', 'Reviewing page hierarchy, crawl readiness, metadata, and conversion structure.'],
		[45, 'Reviewing Technical SEO...', 'Technical SEO Indexed', 'Checking indexability, titles, descriptions, headings, and structural signals.'],
		[54, 'Locating Google Business Profile...', 'Business Profile Located', 'Matching local identity signals, categories, reviews, photos, and NAP consistency.'],
		[63, 'Reading Reviews...', 'Review Layer Assessed', 'Measuring public proof, rating depth, recency, and buyer confidence.'],
		[72, 'Testing Performance...', 'Performance Baseline Created', 'Estimating responsiveness, mobile confidence, and page experience signals.'],
		[81, 'Scanning AI Visibility...', 'AI Visibility Indexed', 'Testing whether answer engines can understand and recommend the business.'],
		[90, 'Checking Local Citations...', 'Local Citations Reviewed', 'Comparing directory consistency, trust references, and location proof.'],
		[98, 'Scoring Opportunities...', 'Executive Snapshot Ready', 'Prioritizing business trust, search visibility, and the next executive action.']
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
			status.textContent = 'Scan complete. Opening Executive Dashboard...';
			persistExecutiveScan(completedProfile).then(dashboardUrl => {
				const nextUrl = new URL(dashboardUrl || apexHref('dashboard.html'), window.location.origin);
				nextUrl.searchParams.set('scan', 'complete');
				window.location.assign(nextUrl.toString());
			});
		}, 7600);
	});
}

async function persistExecutiveScan(profile) {
	if (!window.ApexOneIQ?.scanEndpoint || !window.ApexOneIQ?.scanNonce || !profile?.website) {
		return apexHref('dashboard.html');
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

	return apexHref('dashboard.html');
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
	return;
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
				<p>ApexOneIQ will hold the Executive Score, summary, opportunities, and recommendations until the scan is complete.</p>
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
	renderWorkspaceContext();
	pageHead.querySelector('h1').textContent = `${businessName} Executive Intelligence profile is ready.`;
	const kicker = pageHead.querySelector('.page-kicker');
	if (kicker) kicker.textContent = 'Mission Control';

	if (!main.querySelector('[data-executive-live-dashboard]')) {
		pageHead.insertAdjacentHTML('afterend', `
			<section class="executive-live-dashboard" data-executive-live-dashboard>
				<article class="live-score-card" data-assemble-card style="--delay:0ms">
					<div class="panel-label">Executive Score</div>
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
					<div class="panel-label">Executive Score Trend</div>
					<h3>First scan baseline created.</h3>
					<svg viewBox="0 0 320 170" role="img" aria-label="Executive Score Trend">
						<polyline points="${escapeHtml(trendPath(trend))}" fill="none" stroke="url(#apexTrend)" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" class="live-trend-line"/>
						<defs><linearGradient id="apexTrend" x1="0" x2="1"><stop stop-color="#22e7ff"/><stop offset="1" stop-color="#21f2a6"/></linearGradient></defs>
					</svg>
					<p>Future scans will populate historical movement over time.</p>
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
					<div class="panel-label">Recommended Action</div>
					<h3>Complete Google Business Profile trust proof.</h3>
					<p>This is the fastest next step because it supports search, AI recommendations, and buyer confidence at the same time.</p>
					<button class="ghost-button" data-template="drawer-gbp">View Playbook</button>
				</article>
				<article class="live-feed-card" data-assemble-card style="--delay:2100ms">
					<div class="panel-label">Activity Feed</div>
					<div class="mini-timeline">
						<button><span>Now</span><strong>Executive scan completed</strong><small>${escapeHtml(profile.website)}</small></button>
						<button><span>Now</span><strong>Score baseline created</strong><small>${score}/100 ${escapeHtml(status)}</small></button>
						<button><span>Next</span><strong>Trend history ready</strong><small>Future scans compound the chart</small></button>
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

renderAccountState();
setupLandingCapture();
setupExecutiveScan();
setupRegistrationForm();
applyFreeProfileSnapshot();
setupExecutiveDashboard();

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

	const templateButton = event.target.closest('[data-template]');
	if (templateButton) {
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

	const genericControl = event.target.closest('button:not([data-range]):not([data-filter]):not([data-sim]):not([data-playback]):not([data-billing]):not([data-toggle-section]):not([data-select-plan]):not([data-select-meeting]):not([data-connection]):not([data-enroll-back]):not([data-enroll-continue]):not([data-enroll-submit]):not([data-close-drawer]):not([data-play-check]):not([data-checkout-plan]):not([data-coming-soon]), a[href="#"]');
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
	const template = document.getElementById(initialTemplate);
	if (template) {
		openDrawer(templateTitles[initialTemplate] || 'Executive Finding', template.content.cloneNode(true), 'Executive Intelligence');
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
