const apexRoot = window.ApexOneIQ?.baseUrl || `${location.origin}/`;
const apexAuthUrl = window.ApexOneIQ?.authUrl || `${apexRoot}wp-login.php`;
const apexRoutePath = location.pathname.replace(/\/$/, '');
const route = apexRoutePath.split('/').pop() || 'dashboard.html';
const apexHref = href => {
	if (!href || /^(https?:|mailto:|tel:|#|\/)/.test(href)) {
		return href;
	}

	return `${apexRoot}${href}`;
};
document.body.classList.add(`route-${route.replace(/[^a-z0-9]/gi, '-').toLowerCase()}`);

const pageTitles = {
	'dashboard.html': 'ApexOneIQ - Mission Control',
	'executive-brief.html': 'ApexOneIQ - Executive Brief',
	'opportunities.html': 'ApexOneIQ - Action Center',
	'competitors.html': 'ApexOneIQ - Competitor Intelligence',
	'business-timeline.html': 'ApexOneIQ - Executive Journal',
	'monitoring-center.html': 'ApexOneIQ - Business Pulse',
	'forecast.html': 'ApexOneIQ - Future Simulation',
	'reports.html': 'ApexOneIQ - Board Briefings',
	'ai-visibility.html': 'ApexOneIQ - AI Recommendations',
	'history.html': 'ApexOneIQ - Market Intelligence',
	'alerts.html': 'ApexOneIQ - Decision Alerts',
	'website-profile.html': 'ApexOneIQ - Website Health',
	'settings.html': 'ApexOneIQ - Settings',
	'command-dashboard.html': 'ApexOneIQ - Command Center',
	'enterprise-dashboard.html': 'ApexOneIQ - Enterprise Operations',
	'concierge-dashboard.html': 'ApexOneIQ - Concierge Workspace',
	'free-dashboard.html': 'ApexOneIQ - Free Executive Snapshot',
	'concierge-essentials-dashboard.html': 'ApexOneIQ - Concierge Essentials',
	'subscription.html': 'ApexOneIQ - Subscription Plans',
	'concierge-enrollment.html': 'ApexOneIQ - Concierge Enrollment',
	'sign-in.html': 'ApexOneIQ - Executive Sign In'
};

document.title = pageTitles[route] || 'ApexOneIQ - Executive Intelligence OS';

const executiveNav = [
	['Executive', [
		['Dashboard', 'dashboard.html'],
		['Executive Brief', 'executive-brief.html'],
		['Action Center', 'opportunities.html']
	]],
	['Intelligence', [
		['Competitors', 'competitors.html'],
		['Executive Timeline', 'business-timeline.html'],
		['AI Visibility', 'ai-visibility.html'],
		['Market Intelligence', 'history.html']
	]],
	['Operations', [
		['Website Health', 'website-profile.html'],
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
		['Growth Forecast', 'forecast.html'],
		['Playbooks', 'opportunities.html?view=playbooks'],
		['Reports', 'reports.html']
	]],
	['System', [
		['Settings', 'settings.html'],
		['Integrations', null],
		['Team', null]
	]]
];

document.querySelectorAll('.nav-list').forEach(nav => {
	nav.innerHTML = executiveNav.map(([label, items]) => `
		<div class="nav-group">
			<div class="nav-group-label">${label}</div>
			${items.map(([name, href, badge]) => href
				? `<a class="nav-link" data-nav href="${apexHref(href)}"><span>${name}</span>${badge ? `<small>${badge}</small>` : ''}</a>`
				: `<span class="nav-link nav-link-muted"><span>${name}</span><small>Soon</small></span>`
			).join('')}
		</div>
	`).join('');
});

document.querySelectorAll('.brand strong').forEach(item => item.textContent = 'ApexOneIQ');
document.querySelectorAll('.brand span').forEach(item => item.textContent = 'Executive Intelligence OS');
document.querySelectorAll('.logo').forEach(item => item.textContent = 'IQ');
document.querySelectorAll('.site-card p').forEach(item => item.textContent = 'ApexOneIQ / Last update 42 seconds ago');
document.querySelectorAll('.system-card .eyebrow').forEach(item => item.textContent = 'ApexOneIQ focus');
document.querySelectorAll('.system-card p').forEach(item => item.textContent = 'Executive OS concept remains isolated until reviewed and approved.');
document.querySelectorAll('.system-card .button').forEach(item => item.textContent = 'Review ApexOneIQ');

document.querySelectorAll('.account').forEach(account => {
	if (!account.querySelector('[data-sign-in-link]')) {
		const signIn = document.createElement('a');
		signIn.className = 'ghost-button sign-in-link';
		signIn.dataset.signInLink = '';
		signIn.href = apexAuthUrl;
		signIn.textContent = 'Sign In';
		const ask = account.querySelector('[data-ask]');
		const avatar = account.querySelector('.avatar');
		if (ask) {
			ask.insertAdjacentElement('afterend', signIn);
		} else {
			account.insertBefore(signIn, avatar || null);
		}
	}
});

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
	'command-dashboard.html': 'Show active AI agent work.',
	'enterprise-dashboard.html': 'Which region needs intervention?',
	'concierge-dashboard.html': "Summarize today's Concierge progress.",
	'free-dashboard.html': 'What should I do first on the Free plan?',
	'concierge-essentials-dashboard.html': 'Explain Concierge Essentials.',
	'subscription.html': 'Which ApexOneIQ workspace should I preview first?',
	'concierge-enrollment.html': 'Help me choose a Concierge plan.',
	'sign-in.html': 'Explain the ApexOneIQ sign-in options.'
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
	'command-dashboard.html': ['Run another citation campaign.', 'Pause all publishing.', 'Show failed automations.'],
	'enterprise-dashboard.html': ['Which region needs intervention?', 'Why is Florida behind Texas?', 'Generate the executive board report.'],
	'concierge-dashboard.html': ["Summarize today's Concierge progress.", 'Show work waiting for my approval.', 'Compare Concierge tiers.'],
	'free-dashboard.html': ['What should I do first on the Free plan?', 'Why should I upgrade to Cloud?', 'Explain my Executive Score.'],
	'concierge-essentials-dashboard.html': ['Explain Concierge Essentials.', 'What is pending approval?', 'Should I upgrade to Growth?'],
	'subscription.html': ['Which plan is right for me?', 'Compare Concierge tiers.', 'Explain annual software billing.'],
	'concierge-enrollment.html': ['Help me choose a Concierge plan.', 'What happens after I submit?', 'What should I connect first?'],
	'sign-in.html': ['Explain the ApexOneIQ sign-in options.', 'What happens after I create an account?', 'Why does Free start after sign-in?']
};

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

document.querySelectorAll('.account').forEach(account => {
	if (!account.querySelector('[data-ask]')) {
		const ask = document.createElement('button');
		ask.className = 'ghost-button';
		ask.type = 'button';
		ask.dataset.ask = routeAskDefaults[route] || 'What should I do next?';
		ask.textContent = 'Ask Apex';
		account.prepend(ask);
	}
});

document.querySelectorAll('[data-explain]').forEach(button => {
	button.addEventListener('click', () => {
		openAsk(button.dataset.explain);
	});
});

document.addEventListener('click', event => {
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

	const genericControl = event.target.closest('button:not([data-range]):not([data-filter]):not([data-sim]):not([data-playback]):not([data-billing]):not([data-toggle-section]):not([data-select-plan]):not([data-select-meeting]):not([data-connection]):not([data-enroll-back]):not([data-enroll-continue]):not([data-enroll-submit]):not([data-close-drawer]):not([data-play-check]):not([data-checkout-plan]), a[href="#"]');
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
