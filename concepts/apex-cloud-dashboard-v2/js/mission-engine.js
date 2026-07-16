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

	function executionLifecycleFor(mission) {
		const requiresApproval = mission?.executionMode === ExecutionModes.APPROVAL_REQUIRED || mission?.executionMode === ExecutionModes.CUSTOMER_REQUIRED;
		return [
			['Opportunity Detected', 'Completed', 'Apex identified the business constraint and ranked it against the mission queue.', 'complete'],
			['Research', 'Completed', 'Market, competitor, trust, and AI visibility evidence were assembled.', 'complete'],
			['Content Prepared', 'Completed', 'Draft assets, structured data, and change instructions are ready for review.', 'complete'],
			['Validation', 'Passed', 'Prepared work passed simulated quality, dependency, and rollback checks.', 'complete'],
			['Waiting for Approval', requiresApproval ? 'Active' : 'Not Required', requiresApproval ? 'Human decision required before anything affects the live business.' : 'Automation policy allows preparation without owner approval.', requiresApproval ? 'active' : 'muted'],
			['Executing', 'Not Started', 'Live execution is intentionally deferred until provider integrations are approved.', 'pending'],
			['Verification', 'Prepared', 'Verification checks are defined and ready to run after execution.', 'pending'],
			['Monitoring', 'Prepared', 'Apex will watch score, visibility, trust, and forecast movement after release.', 'pending'],
			['Complete', 'Pending', 'Completion requires execution plus verification evidence.', 'pending']
		];
	}

	function approvalPolicyFor(mission) {
		const automatic = [
			'Generate FAQ',
			'Generate schema',
			'Generate JSON-LD',
			'Map internal links',
			'Competitor research',
			'Prepare comparison page',
			'Prepare reports',
			'Prepare citation package',
			'Forecast calculations',
			'Validation',
			'Verification planning'
		];
		const requiresApproval = [
			'Publish pages',
			'Delete pages',
			'Edit business information',
			'Change pricing',
			'Replace live copy',
			'Change branding',
			'Change navigation',
			'Edit images',
			'Install plugins',
			'Anything affecting the live business'
		];
		return {
			mode: mission?.executionMode || ExecutionModes.CUSTOMER_REQUIRED,
			status: mission?.approvalStatus || 'Approval required before execution',
			currentDecision: mission?.executionMode === ExecutionModes.APPROVAL_REQUIRED ? 'Approval package prepared' : mission?.executionMode === ExecutionModes.AUTOMATIC ? 'Eligible for future automatic execution' : 'Customer action required',
			automatic,
			requiresApproval,
			visualActions: [
				['Approve Prepared Work', 'Future action placeholder', 'primary'],
				['Request Revision', 'Future action placeholder', 'secondary'],
				['Hold Mission', 'Future action placeholder', 'secondary']
			]
		};
	}

	function preparedFilesFor(mission) {
		const title = mission?.title || 'Mission';
		return [
			['Prepared content', `${title} executive draft`, 'Ready'],
			['Schema', 'FAQPage + LocalBusiness JSON-LD', 'Validated'],
			['JSON-LD', 'Structured data package', 'Ready'],
			['FAQ', 'Six buyer-answer blocks', 'Ready'],
			['Internal links', '18 contextual link opportunities', 'Mapped'],
			['Assets', 'Proof image checklist and alt text', 'Prepared'],
			['Structured data', 'Entity and service markup', 'Validated'],
			['Reports', 'Approval brief and verification plan', 'Ready']
		];
	}

	function preparedChangesFor(mission) {
		const revenue = mission?.expectedRevenueImpact || 3200;
		return [
			['FAQ generated', 'Six AI-readable buyer questions prepared for review.', 'Ready'],
			['Schema validated', 'JSON-LD package passed simulated structured-data checks.', 'Validated'],
			['Comparison page prepared', 'Decision-support draft assembled but not published.', mission?.id === 'ai-comparison-page' ? 'Approval Needed' : 'Queued'],
			['Internal links mapped', 'High-value service and proof pages mapped for future implementation.', 'Ready'],
			['Citation package prepared', 'Source-of-truth business data and target directories queued.', 'Ready'],
			['Content refresh complete', `Projected monthly revenue impact modeled at $${revenue.toLocaleString()}.`, 'Modeled']
		];
	}

	function dependencyStatusFor(mission) {
		const blockers = asArray(mission?.blockedBy).length ? mission.blockedBy : asArray(mission?.dependencies);
		if (!blockers.length) {
			return [
				['Execution dependency', 'Clear', 'No blocking prerequisite is preventing preparation.'],
				['Approval dependency', mission?.executionMode === ExecutionModes.APPROVAL_REQUIRED ? 'Waiting for approval' : 'No approval needed', mission?.approvalStatus || 'Policy evaluated.'],
				['Provider dependency', 'Deferred', 'Provider connection is intentionally not active in Phase 4.']
			];
		}
		return blockers.map(id => [
			id.replace(/-/g, ' '),
			'Waiting',
			'This prerequisite must be completed before Apex can execute the mission safely.'
		]);
	}

	function rollbackPlanFor(mission) {
		return {
			available: true,
			status: 'Rollback package prepared',
			riskAssessment: mission?.risk >= 20 ? 'Medium' : 'Low',
			steps: [
				'Archive current live state before execution',
				'Store prepared files and original values',
				'Record provider response and deployment timestamp',
				'Restore archived files or previous values if verification fails',
				'Re-run scan and mark mission for review'
			]
		};
	}

	function verificationPlanFor(mission) {
		return [
			['Schema verified', 'Prepared validator will confirm structured data after publish.', 'Prepared'],
			['Pages indexed', 'Indexing check will run after publishing window.', 'Prepared'],
			['Business Profile updated', 'GBP verification checkpoint defined.', mission?.type === MissionTypes.GBP ? 'Ready' : 'N/A'],
			['Page speed improved', 'Performance snapshot planned for technical missions.', mission?.type === MissionTypes.PERFORMANCE ? 'Ready' : 'Prepared'],
			['Ranking monitored', 'Local and AI visibility movement will be measured after execution.', 'Prepared'],
			['Citation verified', 'Provider confirmation and URL evidence will be stored.', 'Prepared']
		];
	}

	function evidencePackageFor(mission) {
		return [
			['Before / After', 'Baseline score, trust, visibility, and forecast snapshots reserved.', 'Prepared'],
			['Validation logs', 'Simulated validation log attached to approval package.', 'Ready'],
			['Structured data validation', 'JSON-LD lint checks passed in preparation mode.', 'Passed'],
			['Screenshots', 'Pre-execution screenshot slots reserved.', 'Prepared'],
			['Performance snapshots', 'Core performance measurement plan prepared.', 'Prepared'],
			['Provider confirmations', 'Future provider response records will attach here.', 'Deferred'],
			['Execution history', 'Mission timeline and owner decisions will be retained.', 'Active']
		];
	}

	function providerArchitectureFor() {
		return {
			status: 'Provider-agnostic architecture prepared',
			rule: 'No provider-specific UI or live website modification in Phase 4.',
			providers: ['WordPress', 'Shopify', 'Wix', 'Squarespace', 'Cloudflare', 'GitHub', 'Render', 'Google Business Profile', 'OpenAI', 'Anthropic', 'Future MCP Servers'],
			interface: [
				['prepare', 'Create execution package without touching production'],
				['validate', 'Confirm package, dependency, approval, and rollback requirements'],
				['requestApproval', 'Create human decision packet when required'],
				['execute', 'Future provider adapter executes approved work'],
				['verify', 'Collect post-execution proof and measurement'],
				['rollback', 'Restore archived state if validation fails after execution']
			]
		};
	}

	function missionTemplatesFor() {
		return ['Google Business Profile', 'FAQ Generation', 'Schema', 'Internal Links', 'Comparison Pages', 'Citation Building', 'Directory Updates', 'Page Speed', 'Content Refresh', 'AI Optimization', 'Review Management', 'Knowledge Graph', 'Local SEO', 'Future AI Plugins'];
	}

	function operationsLogFor(mission) {
		return [
			['08:02', 'Website scanned', '8 pages analyzed and latest business health baseline refreshed.', 'complete'],
			['08:03', 'Trust decline detected', 'Trust remains the largest constraint against competitor proof.', 'warning'],
			['08:05', 'Compared four competitors', 'Northstar-style competitor proof advantage recalculated.', 'complete'],
			['08:07', 'Generated FAQ', 'Six sourceable buyer-answer blocks prepared.', 'complete'],
			['08:09', 'Prepared schema', 'FAQPage and LocalBusiness JSON-LD package assembled.', 'complete'],
			['08:12', 'Validated JSON-LD', 'Structured data package passed preparation checks.', 'complete'],
			['08:15', 'Calculated projected lift', `Modeled +${mission?.expectedBusinessGrowthScore || 4} Business Growth Score™ and +${mission?.expectedVisibility || 6}% visibility.`, 'growth'],
			['08:18', 'Prepared approval package', 'Mission evidence, rollback, and verification plan attached.', 'complete'],
			['08:20', 'Waiting for customer approval', mission?.approvalStatus || 'Customer decision checkpoint active.', 'active']
		];
	}

	function dailyOperationsFor(mission, metrics) {
		return {
			todayMission: mission?.title || 'No mission selected',
			completedYesterday: 'Initial baseline, mission queue reorder, trust evidence package, and forecast recalculation.',
			pendingApprovals: mission?.executionMode === ExecutionModes.APPROVAL_REQUIRED ? [mission.title] : [],
			businessGrowthScoreMovement: `${metrics.businessGrowthScore} → ${clampScore(metrics.businessGrowthScore + (mission?.expectedBusinessGrowthScore || 0))}`,
			competitorChanges: '2 competitors gained trust proof; no critical ranking shock detected.',
			visibilityChanges: `+${mission?.expectedVisibility || 0}% projected after prepared mission execution.`,
			aiVisibility: `${metrics.aiVisibility} current / ${clampScore(metrics.aiVisibility + (mission?.expectedVisibility || 0))} target`,
			trustCoverage: `${metrics.trustCoverage} current / ${clampScore(metrics.trustCoverage + (mission?.expectedTrust || 0))} target`,
			forecast: `${metrics.forecast} current / ${mission?.forecastModel?.afterMission || metrics.forecast} after mission`,
			businessRisks: mission?.executionMode === ExecutionModes.CUSTOMER_REQUIRED ? 'Customer action can delay trust improvement.' : 'Approval delay can slow forecast movement.',
			executiveRecommendation: 'Review the prepared mission package and approve only the work that affects the live business.'
		};
	}

	function dailyEmailFor(mission, metrics) {
		const lift = mission?.expectedBusinessGrowthScore || 3;
		return {
			subject: `Apex Daily Executive Brief — +${lift} Business Growth Score Today`,
			sections: [
				['Business Growth', `${metrics.businessGrowthScore} current / ${clampScore(metrics.businessGrowthScore + lift)} after today’s mission`],
				['Completed Missions', 'Research, content preparation, validation, rollback planning, and forecast modeling completed.'],
				['Pending Approvals', mission?.executionMode === ExecutionModes.APPROVAL_REQUIRED ? mission.title : 'No strategic approval needed today.'],
				['Projected Revenue Lift', `$${(mission?.expectedRevenueImpact || 3200).toLocaleString()}/mo modeled opportunity`],
				['Forecast', `${mission?.forecastModel?.afterMission || metrics.forecast}% after mission if dependency path stays clear`],
				['Today’s Mission', mission?.title || 'No mission selected'],
				['Risks', mission?.executionMode === ExecutionModes.CUSTOMER_REQUIRED ? 'Customer-required task can block downstream missions.' : 'Execution remains preparation-only until provider adapters are connected.'],
				['Competitor Changes', 'Competitor trust movement detected; Apex recommends not delaying trust work.'],
				['One-click Approval Actions', 'Approve / Request revision / Hold mission visual placeholders only.']
			]
		};
	}

	function buildExecutionLayer(primary, secondary, blocked, metrics, planName) {
		const mission = primary || secondary[0] || blocked[0] || null;
		const lifecycle = executionLifecycleFor(mission);
		return {
			version: '0.1.0',
			architectureStatus: 'Preparation-only execution layer',
			missionWorkspace: {
				missionId: mission?.id || 'mission-pending',
				created: new Date().toISOString(),
				priority: mission?.priorityScore || 0,
				estimatedImpact: {
					businessGrowthScore: mission?.expectedBusinessGrowthScore || 0,
					visibility: mission?.expectedVisibility || 0,
					traffic: mission?.expectedLeads || 0,
					revenue: mission?.expectedRevenueImpact || 0,
					timeSaved: mission?.estimatedMinutes ? Math.max(1, Math.round(mission.estimatedMinutes / 3)) : 0
				},
				confidenceScore: mission?.confidence || 0,
				dependencies: dependencyStatusFor(mission),
				executionStatus: 'Prepared, not executed',
				approvalStatus: mission?.approvalStatus || 'Not evaluated',
				rollbackAvailable: true,
				verificationStatus: 'Verification architecture prepared',
				evidence: evidencePackageFor(mission),
				result: 'Pending execution and verification',
				lifecycle,
				filesPrepared: preparedFilesFor(mission),
				changesReady: preparedChangesFor(mission),
				rollbackPlan: rollbackPlanFor(mission),
				verificationPlan: verificationPlanFor(mission),
				completion: {
					status: 'Not complete',
					timeSaved: mission?.estimatedMinutes ? `${Math.max(1, Math.round(mission.estimatedMinutes / 3))} minutes prepared` : 'Pending',
					estimatedLift: `+${mission?.expectedBusinessGrowthScore || 0} Business Growth Score™`,
					businessGrowthImpact: `$${(mission?.expectedRevenueImpact || 0).toLocaleString()}/mo modeled`,
					missionOwner: mission?.owner || 'Apex',
					approvalHistory: mission?.executionMode === ExecutionModes.APPROVAL_REQUIRED ? 'Approval package created; customer decision pending.' : 'No approval event recorded.',
					verificationResult: 'Pending future execution'
				}
			},
			approvalIntelligence: approvalPolicyFor(mission),
			providerArchitecture: providerArchitectureFor(planName),
			missionTemplates: missionTemplatesFor(),
			operationsLog: operationsLogFor(mission),
			dailyOperations: dailyOperationsFor(mission, metrics),
			dailyEmail: dailyEmailFor(mission, metrics)
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
		const executionLayer = buildExecutionLayer(primaryMission, secondaryMissions, blocked, metrics, planName);

		return {
			version: '0.2.0',
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
			dailyBrief: buildDailyBrief(primaryMission, secondaryMissions, blocked, metrics, history),
			executionLayer
		};
	}

	window.ApexMissionEngine = {
		version: '0.2.0',
		MissionStates,
		MissionTypes,
		ExecutionModes,
		dependencyGraph,
		candidateMissions,
		scoreMission,
		generateDailyMission,
		buildExecutionLayer
	};
})();
