(function (root) {
	const PLAN_IDS = Object.freeze({
		FREE: 'free',
		DIY: 'diy',
		AI_AUTOMATED: 'ai_automated',
		CONCIERGE: 'concierge',
		ENTERPRISE: 'enterprise',
		QA_FULL_ACCESS: 'qa_full_access'
	});

	const planAliases = Object.freeze({
		cloud: PLAN_IDS.DIY,
		command: PLAN_IDS.AI_AUTOMATED,
		essentials: PLAN_IDS.AI_AUTOMATED,
		growth: PLAN_IDS.CONCIERGE,
		'intelligence': PLAN_IDS.DIY,
		'autopilot': PLAN_IDS.AI_AUTOMATED,
		'growth-partner': PLAN_IDS.CONCIERGE
	});

	const entitlements = Object.freeze({
		free: [
			'website_scan',
			'animated_business_growth_score',
			'limited_website_health',
			'limited_ai_visibility',
			'limited_executive_summary',
			'upgrade_prompts'
		],
		diy: [
			'full_reports',
			'all_findings',
			'recommendations',
			'mission_instructions',
			'checklists',
			'prepared_content_guidance',
			'full_executive_brief',
			'mission_roadmap'
		],
		ai_automated: [
			'mission_queue',
			'automated_research',
			'automated_generation',
			'validation',
			'approval_packages',
			'evidence',
			'monitoring',
			'daily_executive_brief',
			'permission_onboarding',
			'execution_ready_packages'
		],
		concierge: [
			'mission_queue',
			'automated_research',
			'automated_generation',
			'validation',
			'approval_packages',
			'evidence',
			'monitoring',
			'daily_executive_brief',
			'permission_onboarding',
			'execution_ready_packages',
			'apex_team_assignment',
			'human_review_state',
			'concierge_queue',
			'edge_case_review',
			'priority_support',
			'expert_completion_status'
		],
			enterprise: [
				'request_information',
				'enterprise_services_description',
				'custom_scope_required'
			],
			qa_full_access: [
				'website_scan',
				'animated_business_growth_score',
				'limited_website_health',
				'limited_ai_visibility',
				'limited_executive_summary',
				'upgrade_prompts',
				'full_reports',
				'all_findings',
				'recommendations',
				'mission_instructions',
				'checklists',
				'prepared_content_guidance',
				'full_executive_brief',
				'mission_roadmap',
				'mission_queue',
				'automated_research',
				'automated_generation',
				'validation',
				'approval_packages',
				'evidence',
				'monitoring',
				'daily_executive_brief',
				'permission_onboarding',
				'execution_ready_packages',
				'apex_team_assignment',
				'human_review_state',
				'concierge_queue',
				'edge_case_review',
				'priority_support',
				'expert_completion_status',
				'request_information',
				'enterprise_services_description',
				'custom_scope_required'
			]
		});

	const plans = Object.freeze({
		free: {
			id: PLAN_IDS.FREE,
			displayName: 'Free',
			price: 0,
			priceLabel: '$0',
			stripePriceEnv: null,
			entitlements: entitlements.free,
			billingInterval: null,
			purchaseAvailable: false,
			workspace: 'free-dashboard.html',
			restrictions: ['No complete mission library', 'No execution', 'No full reports', 'No implementation packages', 'No approval controls']
		},
		diy: {
			id: PLAN_IDS.DIY,
			displayName: 'DIY',
			price: 199,
			priceLabel: '$199/month',
			stripePriceEnv: 'STRIPE_PRICE_DIY',
			entitlements: entitlements.diy,
			billingInterval: 'month',
			purchaseAvailable: true,
			workspace: 'executive-brief.html',
			restrictions: ['No production modification', 'No automatic execution', 'No Apex team assignment']
		},
		ai_automated: {
			id: PLAN_IDS.AI_AUTOMATED,
			displayName: 'AI Automated',
			price: 499,
			priceLabel: '$499/month',
			stripePriceEnv: 'STRIPE_PRICE_AI_AUTOMATED',
			entitlements: entitlements.ai_automated,
			billingInterval: 'month',
			purchaseAvailable: true,
			workspace: 'command-dashboard.html',
			restrictions: ['Provider execution staged until integrations are implemented', 'No false production execution claims']
		},
		concierge: {
			id: PLAN_IDS.CONCIERGE,
			displayName: 'Concierge',
			price: 999,
			priceLabel: '$999/month',
			stripePriceEnv: 'STRIPE_PRICE_CONCIERGE',
			entitlements: entitlements.concierge,
			billingInterval: 'month',
			purchaseAvailable: true,
			workspace: 'command-dashboard.html',
			restrictions: ['Uses same Mission Engine as AI Automated', 'Approved missions route to Apex Team assignment state']
		},
			enterprise: {
				id: PLAN_IDS.ENTERPRISE,
				displayName: 'Enterprise',
			price: 2500,
			priceLabel: 'Starting at $2,500/month',
			stripePriceEnv: null,
			entitlements: entitlements.enterprise,
			billingInterval: 'month',
			purchaseAvailable: false,
				workspace: 'enterprise-dashboard.html',
				restrictions: ['No self-service purchase', 'Request information only', 'No automatic activation']
			},
			qa_full_access: {
				id: PLAN_IDS.QA_FULL_ACCESS,
				displayName: 'QA Full Access',
				price: 1,
				priceLabel: '$1/month',
				stripePriceEnv: 'STRIPE_PRICE_QA_FULL_ACCESS',
				entitlements: entitlements.qa_full_access,
				billingInterval: 'month',
				purchaseAvailable: true,
				internalOnly: true,
				workspace: 'command-dashboard.html',
				restrictions: ['Internal regression testing only', 'Hidden from customer-facing subscription UI']
			}
		});

	function normalizePlanId(planId) {
		const value = String(planId || PLAN_IDS.FREE).toLowerCase().replace(/[^a-z0-9_\\-]/g, '_');
		return plans[value] ? value : planAliases[value] || PLAN_IDS.FREE;
	}

	function planFor(planId) {
		return plans[normalizePlanId(planId)];
	}

	function entitlementsFor(planId) {
		return Array.from(planFor(planId).entitlements);
	}

	function hasEntitlement(planId, entitlement) {
		return entitlementsFor(planId).includes(entitlement);
	}

	const api = {
		PLAN_IDS,
		plans,
		planAliases,
		normalizePlanId,
		planFor,
		entitlementsFor,
		hasEntitlement
	};

	if (typeof module !== 'undefined' && module.exports) module.exports = api;
	root.ApexSubscriptionConfig = api;
})(typeof window !== 'undefined' ? window : globalThis);
