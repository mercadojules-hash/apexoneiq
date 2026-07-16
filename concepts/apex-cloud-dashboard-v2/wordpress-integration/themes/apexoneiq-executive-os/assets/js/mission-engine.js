(function () {
	'use strict';

	const MissionStates = Object.freeze({
		QUEUED: 'Queued',
		READY: 'Ready',
		EXECUTING: 'Executing',
		WAITING_ON_CUSTOMER: 'Waiting on Customer',
		WAITING_ON_APPROVAL: 'Waiting on Approval',
		COMPLETED: 'Completed',
		MEASURED: 'Measured',
		ARCHIVED: 'Archived'
	});

	const MissionTypes = Object.freeze({
		TRUST: 'Trust',
		AUTHORITY: 'Authority',
		AI_VISIBILITY: 'AI Visibility',
		CONTENT: 'Content',
		TECHNICAL_SEO: 'Technical SEO',
		WEBSITE_HEALTH: 'Website Health',
		LOCAL_SEO: 'Local SEO',
		SCHEMA: 'Schema',
		GBP: 'GBP',
		REVIEWS: 'Reviews',
		COMPETITORS: 'Competitors',
		PERFORMANCE: 'Performance',
		CONVERSION: 'Conversion',
		AUTOMATION: 'Automation'
	});

	const ExecutionModes = Object.freeze({
		AUTOMATIC: 'Automatic',
		APPROVAL_REQUIRED: 'Approval Required',
		CUSTOMER_REQUIRED: 'Customer Required',
		MANUAL_ONLY: 'Manual Only'
	});

	const dependencyGraph = Object.freeze({
		'gbp-verification': [],
		'faq-schema': [],
		'internal-linking': [],
		'performance-cleanup': [],
		'service-area-page': ['gbp-verification'],
		'review-authority': ['gbp-verification'],
		'ai-comparison-page': ['service-area-page'],
		'authority-citations': ['gbp-verification'],
		'competitor-response': ['ai-comparison-page'],
		'conversion-proof': ['review-authority', 'service-area-page']
	});

	function clamp(value, min, max) {
		return Math.max(min, Math.min(max, Number(value) || 0));
	}

	function clampScore(value) {
		return Math.round(clamp(value, 0, 100));
	}

	function asArray(value) {
		return Array.isArray(value) ? value : [];
	}

	function normalizePlanName(subscription) {
		const raw = String(subscription?.plan || subscription?.tier || subscription?.name || 'free').toLowerCase();
		if (raw.includes('enterprise')) return 'enterprise';
		if (raw.includes('partner') || raw.includes('999') || raw.includes('growth')) return 'growth-partner';
		if (raw.includes('autopilot') || raw.includes('499')) return 'autopilot';
		if (raw.includes('intelligence') || raw.includes('199') || raw.includes('cloud')) return 'intelligence';
		return 'free';
	}

	function defaultMetrics(input) {
		const score = clampScore(input.businessGrowthScore || input.score || input.profile?.score || 66);
		const executiveHealth = input.executiveHealth || {};
		return {
			businessGrowthScore: score,
			localSeo: clampScore(input.localSeo || executiveHealth.localSeo || score + 2),
			aiVisibility: clampScore(input.aiVisibility || executiveHealth.aiVisibility || score - 7),
			trustCoverage: clampScore(input.trustCoverage || executiveHealth.trustCoverage || score - 6),
			websiteHealth: clampScore(input.websiteHealth || executiveHealth.websiteHealth || score + 9),
			contentAuthority: clampScore(input.contentAuthority || executiveHealth.contentAuthority || score - 3),
			forecast: clampScore(input.forecast || score + 6),
			competitorPressure: clampScore(input.competitorPressure || 72),
			algorithmVolatility: clampScore(input.algorithmVolatility || 18)
		};
	}

	function baseCandidates(metrics, planName) {
		const canAutoPublish = ['autopilot', 'growth-partner', 'enterprise'].includes(planName);
		const canOptimizeContinuously = ['growth-partner', 'enterprise'].includes(planName);
		return [
			{
				id: 'gbp-verification',
				title: 'Complete Google Business Profile verification',
				type: MissionTypes.GBP,
				reason: 'Trust is currently the largest constraint preventing customers and AI systems from confidently choosing the business.',
				businessImpact: 'Completes the core local trust layer and unlocks stronger service-area, review, and AI visibility work.',
				expectedBusinessGrowthScore: 4,
				expectedVisibility: 6,
				expectedLeads: 11,
				expectedRevenueImpact: 3200,
				expectedTrust: 10,
				expectedForecast: 7,
				estimatedTime: '18 minutes',
				estimatedMinutes: 18,
				confidence: 94,
				difficulty: 'Low',
				difficultyScore: 22,
				customerEffort: 42,
				risk: 8,
				urgency: 88,
				competitivePressure: 78,
				opportunityDecay: 62,
				executionMode: ExecutionModes.CUSTOMER_REQUIRED,
				owner: 'Customer',
				status: 'Ready to Execute',
				approvalStatus: 'No approval needed',
				dependencies: []
			},
			{
				id: 'service-area-page',
				title: 'Publish a service-area proof page',
				type: MissionTypes.LOCAL_SEO,
				reason: 'Local relevance needs clearer market proof before content can reliably convert into qualified demand.',
				businessImpact: 'Creates a stronger local authority asset that supports discovery, comparison, and conversion.',
				expectedBusinessGrowthScore: 3,
				expectedVisibility: 7,
				expectedLeads: 8,
				expectedRevenueImpact: 2400,
				expectedTrust: 4,
				expectedForecast: 5,
				estimatedTime: '2.5 hours',
				estimatedMinutes: 150,
				confidence: 86,
				difficulty: 'Medium',
				difficultyScore: 48,
				customerEffort: canAutoPublish ? 12 : 35,
				risk: 18,
				urgency: 70,
				competitivePressure: 72,
				opportunityDecay: 46,
				executionMode: canAutoPublish ? ExecutionModes.APPROVAL_REQUIRED : ExecutionModes.CUSTOMER_REQUIRED,
				owner: canAutoPublish ? 'Apex' : 'Customer',
				status: 'Blocked by dependency',
				approvalStatus: canAutoPublish ? 'Waiting for approval policy' : 'Customer must complete',
				dependencies: ['gbp-verification']
			},
			{
				id: 'ai-comparison-page',
				title: 'Publish an AI-ready comparison page',
				type: MissionTypes.AI_VISIBILITY,
				reason: 'AI systems need concise comparison proof before they can recommend the business in high-intent decisions.',
				businessImpact: 'Improves recommendation confidence when buyers ask which provider to choose.',
				expectedBusinessGrowthScore: 4,
				expectedVisibility: 10,
				expectedLeads: 10,
				expectedRevenueImpact: 3600,
				expectedTrust: 3,
				expectedForecast: 8,
				estimatedTime: '3 hours',
				estimatedMinutes: 180,
				confidence: 82,
				difficulty: 'Medium',
				difficultyScore: 54,
				customerEffort: canAutoPublish ? 14 : 42,
				risk: 22,
				urgency: 63,
				competitivePressure: 84,
				opportunityDecay: 58,
				executionMode: ExecutionModes.APPROVAL_REQUIRED,
				owner: canAutoPublish ? 'Apex' : 'Customer',
				status: 'Blocked by dependency',
				approvalStatus: 'Requires approval before publish',
				dependencies: ['service-area-page']
			},
			{
				id: 'review-authority',
				title: 'Strengthen review authority and recency',
				type: MissionTypes.REVIEWS,
				reason: 'Review proof is the fastest social signal competitors can keep compounding if it is ignored.',
				businessImpact: 'Improves buyer confidence and makes local proof more durable.',
				expectedBusinessGrowthScore: 3,
				expectedVisibility: 5,
				expectedLeads: 7,
				expectedRevenueImpact: 2100,
				expectedTrust: 8,
				expectedForecast: 4,
				estimatedTime: '7 days',
				estimatedMinutes: 45,
				confidence: 84,
				difficulty: 'Medium',
				difficultyScore: 52,
				customerEffort: 58,
				risk: 14,
				urgency: 76,
				competitivePressure: 80,
				opportunityDecay: 55,
				executionMode: ExecutionModes.CUSTOMER_REQUIRED,
				owner: 'Customer',
				status: 'Blocked by dependency',
				approvalStatus: 'Needs customer participation',
				dependencies: ['gbp-verification']
			},
			{
				id: 'faq-schema',
				title: 'Add AI-readable FAQ answers',
				type: MissionTypes.SCHEMA,
				reason: 'Structured answers help AI systems understand what the business does and when to recommend it.',
				businessImpact: 'Improves answer coverage without requiring a larger content project first.',
				expectedBusinessGrowthScore: 2,
				expectedVisibility: 8,
				expectedLeads: 4,
				expectedRevenueImpact: 1200,
				expectedTrust: 2,
				expectedForecast: 3,
				estimatedTime: '35 minutes',
				estimatedMinutes: 35,
				confidence: 79,
				difficulty: 'Low',
				difficultyScore: 20,
				customerEffort: canAutoPublish ? 6 : 22,
				risk: 10,
				urgency: 52,
				competitivePressure: 56,
				opportunityDecay: 30,
				executionMode: canAutoPublish ? ExecutionModes.AUTOMATIC : ExecutionModes.APPROVAL_REQUIRED,
				owner: canAutoPublish ? 'Apex' : 'Customer',
				status: canAutoPublish ? 'Ready for automatic execution' : 'Ready for approval',
				approvalStatus: canAutoPublish ? 'Allowed by tier policy' : 'Approval required',
				dependencies: []
			},
			{
				id: 'internal-linking',
				title: 'Clarify internal links to highest-value service pages',
				type: MissionTypes.TECHNICAL_SEO,
				reason: 'Apex needs clearer paths between buyer intent, proof, and conversion pages before broader content can compound.',
				businessImpact: 'Helps existing visibility turn into more discoverable service paths.',
				expectedBusinessGrowthScore: 2,
				expectedVisibility: 4,
				expectedLeads: 3,
				expectedRevenueImpact: 900,
				expectedTrust: 1,
				expectedForecast: 2,
				estimatedTime: '45 minutes',
				estimatedMinutes: 45,
				confidence: 77,
				difficulty: 'Low',
				difficultyScore: 24,
				customerEffort: canOptimizeContinuously ? 6 : 24,
				risk: 12,
				urgency: 46,
				competitivePressure: 48,
				opportunityDecay: 22,
				executionMode: canOptimizeContinuously ? ExecutionModes.AUTOMATIC : ExecutionModes.APPROVAL_REQUIRED,
				owner: canOptimizeContinuously ? 'Apex' : 'Customer',
				status: canOptimizeContinuously ? 'Ready for automatic execution' : 'Ready for approval',
				approvalStatus: canOptimizeContinuously ? 'Allowed by tier policy' : 'Approval required',
				dependencies: []
			},
			{
				id: 'performance-cleanup',
				title: 'Improve key page speed and stability',
				type: MissionTypes.PERFORMANCE,
				reason: 'Website health is strong enough to support growth, but performance cleanup can protect conversion once visibility increases.',
				businessImpact: 'Reduces friction on high-intent visits and supports future conversion reporting.',
				expectedBusinessGrowthScore: 2,
				expectedVisibility: 2,
				expectedLeads: 2,
				expectedRevenueImpact: 650,
				expectedTrust: 1,
				expectedForecast: 2,
				estimatedTime: '90 minutes',
				estimatedMinutes: 90,
				confidence: 72,
				difficulty: 'Medium',
				difficultyScore: 50,
				customerEffort: canOptimizeContinuously ? 8 : 28,
				risk: 20,
				urgency: 34,
				competitivePressure: 36,
				opportunityDecay: 18,
				executionMode: canOptimizeContinuously ? ExecutionModes.AUTOMATIC : ExecutionModes.MANUAL_ONLY,
				owner: canOptimizeContinuously ? 'Apex' : 'Customer',
				status: 'Queued',
				approvalStatus: canOptimizeContinuously ? 'Allowed by tier policy' : 'Manual implementation',
				dependencies: []
			},
			{
				id: 'authority-citations',
				title: 'Complete priority citation consistency',
				type: MissionTypes.AUTHORITY,
				reason: 'Missing trust entities reduce confidence across local discovery, AI answers, and customer comparison.',
				businessImpact: 'Improves the business proof ecosystem so future content has a stronger authority base.',
				expectedBusinessGrowthScore: 3,
				expectedVisibility: 5,
				expectedLeads: 5,
				expectedRevenueImpact: 1700,
				expectedTrust: 7,
				expectedForecast: 4,
				estimatedTime: '2 hours',
				estimatedMinutes: 120,
				confidence: 81,
				difficulty: 'Medium',
				difficultyScore: 46,
				customerEffort: canAutoPublish ? 10 : 30,
				risk: 14,
				urgency: 61,
				competitivePressure: 66,
				opportunityDecay: 42,
				executionMode: canAutoPublish ? ExecutionModes.APPROVAL_REQUIRED : ExecutionModes.CUSTOMER_REQUIRED,
				owner: canAutoPublish ? 'Apex' : 'Customer',
				status: 'Blocked by dependency',
				approvalStatus: canAutoPublish ? 'Approval required' : 'Customer required',
				dependencies: ['gbp-verification']
			},
			{
				id: 'competitor-response',
				title: 'Create competitor response brief',
				type: MissionTypes.COMPETITORS,
				reason: 'A competitor is compounding proof faster, but a response should wait until foundational trust and comparison assets exist.',
				businessImpact: 'Turns competitor pressure into a focused positioning action instead of reactive busywork.',
				expectedBusinessGrowthScore: 2,
				expectedVisibility: 6,
				expectedLeads: 5,
				expectedRevenueImpact: 1600,
				expectedTrust: 2,
				expectedForecast: 4,
				estimatedTime: '60 minutes',
				estimatedMinutes: 60,
				confidence: 74,
				difficulty: 'Low',
				difficultyScore: 28,
				customerEffort: 18,
				risk: 16,
				urgency: 68,
				competitivePressure: 88,
				opportunityDecay: 61,
				executionMode: ExecutionModes.APPROVAL_REQUIRED,
				owner: canAutoPublish ? 'Apex' : 'Customer',
				status: 'Blocked by dependency',
				approvalStatus: 'Requires strategic approval',
				dependencies: ['ai-comparison-page']
			}
		].map(candidate => ({
			...candidate,
			forecastModel: {
				current: metrics.forecast,
				afterMission: clampScore(metrics.forecast + candidate.expectedForecast),
				thirtyDayTarget: clampScore(metrics.forecast + candidate.expectedForecast + 8)
			}
		}));
	}

	function candidateMissions(input = {}) {
		const metrics = defaultMetrics(input);
		const planName = normalizePlanName(input.subscription);
		return baseCandidates(metrics, planName);
	}

	function dependenciesMet(candidate, completedIds) {
		return asArray(candidate.dependencies).every(id => completedIds.includes(id));
	}

	function stateFor(candidate, completedIds) {
		if (!dependenciesMet(candidate, completedIds)) return MissionStates.QUEUED;
		if (candidate.executionMode === ExecutionModes.CUSTOMER_REQUIRED) return MissionStates.READY;
		if (candidate.executionMode === ExecutionModes.APPROVAL_REQUIRED) return MissionStates.WAITING_ON_APPROVAL;
		if (candidate.executionMode === ExecutionModes.MANUAL_ONLY) return MissionStates.QUEUED;
		return MissionStates.READY;
	}

	function scoreMission(candidate, input = {}) {
		const metrics = defaultMetrics(input);
		const completedIds = asArray(input.completedWork).concat(asArray(input.completedMissionIds));
		const blockedPenalty = dependenciesMet(candidate, completedIds) ? 0 : 42;
		const trustGap = Math.max(0, 100 - metrics.trustCoverage) / 100;
		const aiGap = Math.max(0, 100 - metrics.aiVisibility) / 100;
		const healthGap = Math.max(0, 100 - metrics.websiteHealth) / 100;
		const revenue = clamp(candidate.expectedRevenueImpact / 5000, 0, 1) * 24;
		const scoreLift = clamp(candidate.expectedBusinessGrowthScore / 6, 0, 1) * 19;
		const aiLift = clamp(candidate.expectedVisibility / 12, 0, 1) * 15;
		const trustLift = clamp(candidate.expectedTrust / 10, 0, 1) * 13 * (0.75 + trustGap);
		const forecastLift = clamp(candidate.expectedForecast / 9, 0, 1) * 12;
		const confidence = clamp(candidate.confidence / 100, 0, 1) * 10;
		const urgency = clamp(candidate.urgency / 100, 0, 1) * 8;
		const competitivePressure = clamp(candidate.competitivePressure / 100, 0, 1) * 7;
		const algorithmChanges = clamp(metrics.algorithmVolatility / 100, 0, 1) * 3;
		const opportunityDecay = clamp(candidate.opportunityDecay / 100, 0, 1) * 5;
		const difficultyPenalty = clamp(candidate.difficultyScore / 100, 0, 1) * 8;
		const timePenalty = clamp(candidate.estimatedMinutes / 240, 0, 1) * 5;
		const customerPenalty = clamp(candidate.customerEffort / 100, 0, 1) * 7;
		const riskPenalty = clamp(candidate.risk / 100, 0, 1) * 6;
		const gapBoost = candidate.type === MissionTypes.AI_VISIBILITY ? aiGap * 5 : candidate.type === MissionTypes.WEBSITE_HEALTH ? healthGap * 4 : trustGap * 4;

		return Math.round(
			revenue +
			scoreLift +
			aiLift +
			trustLift +
			forecastLift +
			confidence +
			urgency +
			competitivePressure +
			algorithmChanges +
			opportunityDecay +
			gapBoost -
			difficultyPenalty -
			timePenalty -
			customerPenalty -
			riskPenalty -
			blockedPenalty
		);
	}

	function missionToRecommendation(mission) {
		return {
			title: mission.title,
			why: mission.reason,
			impact: `${mission.businessImpact} Expected outcome: +${mission.expectedBusinessGrowthScore} Business Growth Score™ points, +${mission.expectedVisibility}% visibility, and ${mission.expectedLeads} estimated new leads per month.`,
			scoreLift: `+${mission.expectedBusinessGrowthScore} BGS`,
			visibility: `+${mission.expectedVisibility}%`,
			effort: mission.difficulty,
			time: mission.estimatedTime,
			owner: mission.owner,
			roi: mission.expectedRevenueImpact >= 2500 ? 'High' : mission.expectedRevenueImpact >= 1000 ? 'Medium' : 'Foundational',
			approvalStatus: mission.approvalStatus,
			dependencies: mission.dependencies.length ? mission.dependencies.map(id => id.replace(/-/g, ' ')).join(', ') : 'None',
			status: mission.state,
			expectedRevenueImpact: mission.expectedRevenueImpact,
			priorityScore: mission.priorityScore,
			executionMode: mission.executionMode
		};
	}

	function buildMissionHistory(input, metrics) {
		const stored = asArray(input.missionHistory);
		if (stored.length) return stored;
		const yesterday = new Date(Date.now() - 86400000);
		return [
			{
				id: 'initial-baseline',
				title: 'Initial executive baseline created',
				date: yesterday.toISOString(),
				reasonSelected: 'Apex needed a measurable starting point before ranking daily missions.',
				expectedImpact: '+0 Business Growth Score™',
				actualImpact: '+0 Business Growth Score™',
				executionTime: '4 minutes',
				status: MissionStates.MEASURED,
				businessGrowthScoreBefore: metrics.businessGrowthScore,
				businessGrowthScoreAfter: metrics.businessGrowthScore,
				trustBefore: metrics.trustCoverage,
				trustAfter: metrics.trustCoverage,
				forecastBefore: metrics.forecast,
				forecastAfter: metrics.forecast
			}
		];
	}

	function buildDailyBrief(primary, secondary, blocked, metrics, history) {
		const yesterday = history[history.length - 1];
		const tomorrow = secondary.find(item => item.state !== MissionStates.QUEUED) || secondary[0] || null;
		return {
			yesterday: yesterday ? `Completed: ${yesterday.title}. Actual impact: ${yesterday.actualImpact}.` : 'Apex completed the initial business baseline.',
			today: primary ? `Current mission: ${primary.title}. ${primary.reason}` : 'No mission is ready today.',
			tomorrow: tomorrow ? `Likely next mission: ${tomorrow.title}.` : 'Tomorrow depends on today’s completion signal.',
			businessGrowthScore: {
				current: metrics.businessGrowthScore,
				change: primary ? `+${primary.expectedBusinessGrowthScore} projected` : 'No projected change'
			},
			trust: {
				current: metrics.trustCoverage,
				change: primary ? `+${primary.expectedTrust} projected` : 'No projected change'
			},
			aiVisibility: {
				current: metrics.aiVisibility,
				change: primary ? `+${primary.expectedVisibility}% projected` : 'No projected change'
			},
			forecast: {
				current: metrics.forecast,
				change: primary ? `+${primary.expectedForecast} projected` : 'No projected change'
			},
			risksDetected: blocked.length ? 'Several high-value missions are blocked by unfinished prerequisites.' : 'No critical planning risks detected.',
			competitorMovement: metrics.competitorPressure >= 75 ? 'Competitor pressure is elevated; trust work should not wait.' : 'Competitor pressure is stable today.',
			blockedItems: blocked.map(item => item.title),
			approvalsNeeded: [primary].concat(secondary).filter(Boolean).filter(item => item.executionMode === ExecutionModes.APPROVAL_REQUIRED).map(item => item.title)
		};
	}

	function generateDailyMission(input = {}) {
		const metrics = defaultMetrics(input);
		const completedIds = asArray(input.completedWork).concat(asArray(input.completedMissionIds));
		const planName = normalizePlanName(input.subscription);
		const history = buildMissionHistory(input, metrics);
		const missions = candidateMissions({ ...input, subscription: { plan: planName } }).map(candidate => {
			const state = stateFor(candidate, completedIds);
			const priorityScore = scoreMission(candidate, input);
			const blockedBy = asArray(candidate.dependencies).filter(id => !completedIds.includes(id));
			return {
				...candidate,
				state,
				status: blockedBy.length ? `Blocked by ${blockedBy.map(id => id.replace(/-/g, ' ')).join(', ')}` : candidate.status,
				blockedBy,
				priorityScore,
				recommendation: missionToRecommendation({ ...candidate, state, priorityScore })
			};
		}).sort((a, b) => b.priorityScore - a.priorityScore);
		const ready = missions.filter(item => !item.blockedBy.length);
		const blocked = missions.filter(item => item.blockedBy.length);
		const primaryMission = ready[0] || missions[0] || null;
		const secondaryMissions = missions.filter(item => item.id !== primaryMission?.id).slice(0, 5);
		const recommendations = [primaryMission].concat(secondaryMissions).filter(Boolean).map(mission => missionToRecommendation(mission)).slice(0, 5);

		return {
			version: '0.1.0',
			generatedAt: new Date().toISOString(),
			subscriptionLevel: planName,
			metrics,
			primaryMission,
			secondaryMissions,
			blockedMissions: blocked,
			missionQueue: missions,
			recommendations,
			dependencyGraph,
			history,
			automationPermissions: {
				[ExecutionModes.AUTOMATIC]: ['growth-partner', 'enterprise'].includes(planName) ? 'Allowed by tier policy' : 'Simulated only until automation launch',
				[ExecutionModes.APPROVAL_REQUIRED]: ['autopilot', 'growth-partner', 'enterprise'].includes(planName) ? 'Approval workflow ready' : 'Upgrade required for Apex execution',
				[ExecutionModes.CUSTOMER_REQUIRED]: 'Customer action required',
				[ExecutionModes.MANUAL_ONLY]: 'Manual execution only'
			},
			dailyBrief: buildDailyBrief(primaryMission, secondaryMissions, blocked, metrics, history)
		};
	}

	window.ApexMissionEngine = {
		version: '0.1.0',
		MissionStates,
		MissionTypes,
		ExecutionModes,
		dependencyGraph,
		candidateMissions,
		scoreMission,
		generateDailyMission
	};
})();
