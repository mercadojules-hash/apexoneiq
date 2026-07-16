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

	const missionDefinitionCatalog = Object.freeze([
		['google-business-profile-verification', 'Google Business Profile Verification', MissionTypes.GBP, 'Complete the local trust proof layer.', true, ['Business profile', 'GBP status', 'Website scan'], ['GBP status snapshot', 'Missing field list', 'Trust score baseline'], ['Profile state improved', 'Owner action isolated']],
		['faq-generation', 'FAQ Generation', MissionTypes.CONTENT, 'Prepare buyer-answer content that improves trust and AI clarity.', true, ['Website scan', 'Service list', 'Customer questions'], ['FAQ draft', 'Source rationale', 'Validation log'], ['FAQ package approval-ready', 'Schema-ready questions']],
		['schema-generation', 'Schema Generation', MissionTypes.SCHEMA, 'Prepare valid structured data for priority pages.', true, ['Business profile', 'Page inventory', 'Service data'], ['Schema plan', 'Validation result', 'Rollback package'], ['Schema validates', 'Entity scope is correct']],
		['json-ld', 'JSON-LD', MissionTypes.SCHEMA, 'Generate clean JSON-LD packages from approved schema plans.', true, ['Schema plan', 'Entity facts', 'URL map'], ['JSON-LD file', 'Lint log', 'Validator output'], ['JSON-LD parses cleanly', 'Target pages mapped']],
		['internal-link-optimization', 'Internal Link Optimization', MissionTypes.TECHNICAL_SEO, 'Improve authority flow and customer discovery paths.', true, ['Crawl map', 'Priority pages', 'Anchor policy'], ['Link map', 'Anchor list', 'Crawl snapshot'], ['Relevant links mapped', 'No duplicate anchors']],
		['citation-package', 'Citation Package', MissionTypes.AUTHORITY, 'Prepare consistent third-party business proof.', true, ['NAP data', 'Directory targets', 'Citation scan'], ['Citation targets', 'NAP validation', 'Submission plan'], ['NAP is consistent', 'Targets are approval-ready']],
		['local-seo-improvements', 'Local SEO Improvements', MissionTypes.LOCAL_SEO, 'Prepare local relevance improvements around services and locations.', true, ['Location data', 'Service areas', 'Local rankings'], ['Local gap report', 'Competitor comparison', 'Prepared updates'], ['Local blockers ranked', 'Changes approval-ready']],
		['ai-visibility-optimization', 'AI Visibility Optimization', MissionTypes.AI_VISIBILITY, 'Improve AI-readable trust and recommendation confidence.', true, ['AI visibility score', 'Entity facts', 'Trust evidence'], ['AI baseline', 'Entity gaps', 'Prepared content'], ['Evidence-backed AI recommendations ready', 'Score forecast updated']],
		['content-refresh', 'Content Refresh', MissionTypes.CONTENT, 'Update stale or weak content with clearer proof and outcomes.', true, ['Content inventory', 'Freshness scan', 'Business facts'], ['Before content snapshot', 'Refresh draft', 'Validation log'], ['Refresh package approval-ready', 'Claims validated']],
		['competitor-analysis', 'Competitor Analysis', MissionTypes.COMPETITORS, 'Explain competitor movement and the correct response.', false, ['Competitor list', 'Market scan', 'Rankings'], ['Competitor snapshots', 'Risk score', 'Response memo'], ['Act/wait/monitor recommendation is clear', 'Confidence stated']],
		['service-page-optimization', 'Service Page Optimization', MissionTypes.LOCAL_SEO, 'Strengthen high-intent service pages for trust and conversion.', true, ['Service pages', 'Intent data', 'Competitor pages'], ['Page baseline', 'Update draft', 'Validation checklist'], ['Optimization package ready', 'Outcome tied to score']],
		['landing-page-generation', 'Landing Page Generation', MissionTypes.CONVERSION, 'Prepare focused landing pages for high-value campaigns.', true, ['Offer', 'Audience', 'Brand rules'], ['Landing page draft', 'CTA map', 'Proof checklist'], ['Page ready for approval', 'Conversion path validated']],
		['review-strategy', 'Review Strategy', MissionTypes.REVIEWS, 'Improve review depth, recency, and response quality ethically.', true, ['Review profile', 'Customer touchpoints', 'Policy constraints'], ['Review baseline', 'Message drafts', 'Policy validation'], ['Strategy is compliant', 'Trust impact is measurable']],
		['business-information-validation', 'Business Information Validation', MissionTypes.TRUST, 'Confirm core business facts across public surfaces.', true, ['Business profile', 'Website crawl', 'Citation data'], ['Source comparison', 'Discrepancy list', 'Truth record'], ['Facts confirmed', 'Conflicts isolated']],
		['knowledge-graph-improvements', 'Knowledge Graph Improvements', MissionTypes.AUTHORITY, 'Strengthen entity relationships across business proof.', true, ['Entity inventory', 'Schema scan', 'Citation data'], ['Entity map', 'Missing proof list', 'Schema recommendations'], ['Entity relationships are clear', 'Evidence is attached']],
		['forecast-update', 'Forecast Update', MissionTypes.AUTOMATION, 'Refresh expected outcomes based on mission state.', false, ['Current metrics', 'Mission queue', 'Competitor movement'], ['Forecast baseline', 'Assumption changes', 'Confidence score'], ['Forecast reflects current state', 'Uncertainty explained']],
		['technical-seo-scan', 'Technical SEO Scan', MissionTypes.TECHNICAL_SEO, 'Identify technical blockers reducing crawl and search confidence.', false, ['Crawl', 'Page speed', 'Indexability checks'], ['Issue list', 'Severity score', 'Affected URLs'], ['Blockers ranked', 'Fixes prepared for approval']],
		['website-health-scan', 'Website Health Scan', MissionTypes.WEBSITE_HEALTH, 'Summarize website health into owner-readable signals.', false, ['Website crawl', 'Performance data', 'Metadata scan'], ['Health score', 'Issue clusters', 'Scan timestamp'], ['Health status is clear', 'Next mission recommended']],
		['metadata-optimization', 'Metadata Optimization', MissionTypes.TECHNICAL_SEO, 'Improve titles and descriptions for relevance and conversion.', true, ['Page inventory', 'Intent data', 'Brand rules'], ['Metadata diff', 'Duplicate check', 'Validation log'], ['Metadata package complete', 'No duplicates']],
		['broken-link-detection', 'Broken Link Detection', MissionTypes.TECHNICAL_SEO, 'Find broken paths that hurt experience and crawl confidence.', false, ['Crawl results', 'Sitemap', 'Navigation links'], ['Broken URL list', 'Source page map', 'Fix plan'], ['Broken links ranked', 'Remediation ready']],
		['authority-improvement', 'Authority Improvement', MissionTypes.AUTHORITY, 'Increase proof, citations, internal authority, and trust signals.', true, ['Authority data', 'Content inventory', 'Competitor authority'], ['Authority baseline', 'Opportunity list', 'Forecast'], ['Opportunities prioritized', 'Risk understood']],
		['comparison-pages', 'Comparison Pages', MissionTypes.AI_VISIBILITY, 'Prepare evidence-based comparison pages for buyer decisions.', true, ['Competitors', 'Differentiators', 'Proof assets'], ['Comparison draft', 'Claim evidence', 'Risk review'], ['Claims defensible', 'Draft approval-ready']],
		['monitoring-mission', 'Monitoring Mission', MissionTypes.AUTOMATION, 'Watch business signals and trigger future missions.', false, ['Score history', 'Competitor changes', 'Rankings'], ['Signal delta', 'Confidence score', 'Recommended action'], ['Meaningful change detected', 'Noise suppressed']],
		['executive-reporting', 'Executive Reporting', MissionTypes.AUTOMATION, 'Turn mission data into concise executive briefings.', false, ['Mission history', 'Evidence', 'Forecast'], ['Brief sections', 'Metric deltas', 'Recommendation'], ['CEO understands state fast', 'Next decision is clear']]
	].map(([id, name, category, objective, approvalRequired, inputsRequired, expectedEvidence, successCriteria]) => ({
		id,
		name,
		category,
		objective,
		inputsRequired,
		approvalRequired,
		expectedEvidence,
		successCriteria,
		lifecycleStages: ['Opportunity Detected', 'Research Complete', 'Content Prepared', 'Validation Passed', 'Awaiting Approval', 'Executing', 'Verification', 'Monitoring', 'Completed'],
		automatedTasks: {
			opportunity: ['Score gaps', 'Estimate impact', 'Rank mission'],
			research: ['Website crawl', 'Competitor analysis', 'AI visibility review'],
			generate: ['Prepare assets', 'Prepare recommendations', 'Prepare evidence'],
			validate: ['Dependency checks', 'Rollback preparation', 'Execution readiness'],
			execute: ['Provider adapter placeholder only'],
			verify: ['Evidence comparison', 'Success validation', 'Confidence update'],
			monitor: ['Daily scan', 'Competitor monitoring', 'Score movement'],
			report: ['Executive Brief', 'Executive Email', 'Next mission recommendation']
		}
	})));

	const missionLibraryLifecycleStages = Object.freeze([
		'Opportunity Detected',
		'Research',
		'Generate',
		'Validate',
		'Approval',
		'Execute',
		'Verify',
		'Monitor',
		'Executive Report'
	]);

	const missionLibraryTaskDefaults = Object.freeze({
		Foundation: ['Scan current state', 'Score business signal', 'Rank constraints', 'Prepare executive finding'],
		Optimization: ['Generate improvement package', 'Validate claims and dependencies', 'Prepare approval packet', 'Attach evidence'],
		Authority: ['Compare public proof', 'Prepare trust improvements', 'Validate business facts', 'Attach verification plan'],
		Growth: ['Identify revenue constraint', 'Generate growth asset', 'Validate expected lift', 'Prepare forecast update'],
		Monitoring: ['Detect meaningful change', 'Refresh score movement', 'Suppress noise', 'Prepare executive report']
	});

	const missionLibraryRows = Object.freeze([
		['website-scan', 'Website Scan', 'Foundation', 100, 'Establish the website health baseline that powers the first Business Growth Score.', ['Website URL', 'crawl permission'], false, ['Website crawl snapshot', 'health score', 'issue clusters'], ['Crawl completes', 'health baseline created'], 4, '4 min', '0 min', [], ['Baseline exists', 'next mission recommended']],
		['technical-seo-audit', 'Technical SEO Audit', 'Foundation', 92, 'Find crawl, indexability, speed, metadata, and structural blockers.', ['Website crawl', 'sitemap', 'performance signals'], false, ['technical issue list', 'severity map', 'affected URLs'], ['Issues ranked', 'critical blockers isolated'], 5, '8 min', '0 min', ['website-scan'], ['Audit complete', 'fix package ready']],
		['google-business-profile-audit', 'Google Business Profile Audit', 'Foundation', 96, 'Measure local trust proof and profile completeness before recommending local work.', ['Business profile', 'GBP status', 'business facts'], false, ['GBP status snapshot', 'missing field list', 'trust baseline'], ['Profile state known', 'owner action isolated'], 6, '6 min', '2 min', ['website-scan'], ['GBP gaps ranked', 'verification path clear']],
		['ai-visibility-scan', 'AI Visibility Scan', 'Foundation', 90, 'Measure whether AI systems can understand and recommend the business.', ['Website crawl', 'entity facts', 'service list'], false, ['AI visibility baseline', 'citation gap list', 'answer coverage'], ['AI score calculated', 'gaps ranked'], 5, '7 min', '0 min', ['website-scan'], ['AI baseline exists', 'next AI mission queued']],
		['competitor-scan', 'Competitor Scan', 'Foundation', 88, 'Identify competitor proof, visibility, review, and content movement.', ['Competitor set', 'market query set', 'trust signals'], false, ['competitor snapshots', 'movement summary', 'risk score'], ['Competitor deltas detected', 'response priority clear'], 4, '8 min', '0 min', ['website-scan'], ['Competitor risk scored', 'response mission queued']],
		['faq-generation', 'FAQ Generation', 'Optimization', 84, 'Prepare buyer-answer content that improves trust and AI clarity.', ['Website scan', 'service list', 'customer questions'], true, ['FAQ draft', 'source rationale', 'validation log'], ['Claims validated', 'FAQ package approval-ready'], 3, '10 min', '3 min', ['ai-visibility-scan'], ['FAQ prepared', 'schema fit validated']],
		['schema-generation', 'Schema Generation', 'Optimization', 82, 'Prepare valid structured-data plans for priority pages.', ['Business facts', 'page inventory', 'existing schema scan'], true, ['schema plan', 'validation result', 'rollback package'], ['Schema maps to correct entities', 'conflicts resolved'], 4, '9 min', '4 min', ['website-scan', 'business-information-validation'], ['Schema package validates', 'approval packet ready']],
		['json-ld-package', 'JSON-LD Package', 'Optimization', 80, 'Generate clean JSON-LD from approved schema plans.', ['Schema plan', 'entity facts', 'URL map'], true, ['JSON-LD file', 'lint log', 'validator output'], ['JSON-LD parses cleanly', 'target pages mapped'], 4, '7 min', '3 min', ['schema-generation'], ['JSON-LD valid', 'rollback package prepared']],
		['metadata-optimization', 'Metadata Optimization', 'Optimization', 78, 'Improve titles and descriptions for relevance and conversion.', ['Page inventory', 'intent data', 'brand rules'], true, ['metadata diff', 'duplicate check', 'validation log'], ['No duplicate titles', 'intent alignment confirmed'], 3, '8 min', '5 min', ['technical-seo-audit'], ['Metadata package ready', 'approval decision clear']],
		['internal-link-optimization', 'Internal Link Optimization', 'Optimization', 76, 'Improve authority flow and customer discovery paths.', ['Crawl map', 'priority pages', 'anchor policy'], true, ['link map', 'anchor list', 'crawl snapshot'], ['Relevant links mapped', 'no duplicate anchors'], 3, '9 min', '5 min', ['service-page-optimization'], ['Internal link plan ready', 'risk checked']],
		['citation-package', 'Citation Package', 'Authority', 74, 'Prepare consistent third-party business proof.', ['NAP data', 'directory targets', 'citation scan'], true, ['citation targets', 'NAP validation', 'submission plan'], ['NAP consistent', 'targets approval-ready'], 4, '12 min', '6 min', ['business-information-validation'], ['Citation package prepared', 'source data validated']],
		['business-information-validation', 'Business Information Validation', 'Authority', 86, 'Confirm core business facts across website, profiles, and public sources.', ['Business profile', 'website crawl', 'citation data'], true, ['source comparison', 'discrepancy list', 'truth record'], ['Facts confirmed', 'conflicts isolated'], 5, '6 min', '6 min', ['website-scan'], ['Truth record prepared', 'owner conflicts isolated']],
		['review-strategy', 'Review Strategy', 'Authority', 72, 'Improve review depth, recency, and response quality ethically.', ['Review profile', 'customer touchpoints', 'policy constraints'], true, ['review baseline', 'message drafts', 'policy validation'], ['Strategy compliant', 'trust impact measurable'], 3, '9 min', '8 min', ['google-business-profile-audit'], ['Review plan prepared', 'policy risk checked']],
		['knowledge-graph-preparation', 'Knowledge Graph Preparation', 'Authority', 70, 'Strengthen entity relationships across business proof.', ['Entity inventory', 'schema scan', 'citation data'], true, ['entity map', 'missing proof list', 'schema recommendations'], ['Relationships clear', 'evidence attached'], 5, '12 min', '5 min', ['schema-generation', 'business-information-validation'], ['Entity map prepared', 'proof gaps ranked']],
		['comparison-content', 'Comparison Content', 'Authority', 66, 'Prepare evidence-based comparison content for buyer decisions and AI visibility.', ['Competitors', 'differentiators', 'proof assets'], true, ['comparison draft', 'claim evidence', 'risk review'], ['Claims defensible', 'approval-ready draft'], 4, '18 min', '8 min', ['competitor-scan', 'service-page-optimization'], ['Comparison package prepared', 'claim risk reviewed']],
		['content-refresh', 'Content Refresh', 'Growth', 68, 'Refresh stale or weak content with clearer proof and outcomes.', ['Content inventory', 'freshness scan', 'business facts'], true, ['before content snapshot', 'refresh draft', 'validation log'], ['Claims validated', 'refresh approval-ready'], 3, '14 min', '7 min', ['website-scan'], ['Refresh package prepared', 'expected lift modeled']],
		['service-page-optimization', 'Service Page Optimization', 'Growth', 88, 'Strengthen high-intent service pages for trust, clarity, and conversion.', ['Service pages', 'intent data', 'competitor pages'], true, ['page baseline', 'update draft', 'validation checklist'], ['Optimization package ready', 'outcome tied to score'], 5, '16 min', '8 min', ['business-information-validation'], ['Service page plan ready', 'approval package prepared']],
		['local-landing-pages', 'Local Landing Pages', 'Growth', 64, 'Prepare focused local pages for high-value services or service areas.', ['Offer', 'audience', 'service area data', 'brand rules'], true, ['landing page draft', 'CTA map', 'proof checklist'], ['Conversion path validated', 'claims approved'], 4, '22 min', '10 min', ['service-page-optimization'], ['Landing page package ready', 'proof path validated']],
		['forecast-update', 'Forecast Update', 'Growth', 62, 'Refresh projected outcomes based on mission state, evidence, and blockers.', ['Current metrics', 'mission queue', 'competitor movement'], false, ['forecast baseline', 'assumption changes', 'confidence score'], ['Forecast reflects current state', 'uncertainty explained'], 2, '5 min', '0 min', [], ['Forecast updated', 'next mission confidence recalculated']],
		['executive-weekly-report', 'Executive Weekly Report', 'Growth', 58, 'Turn mission outcomes into weekly executive operating context.', ['Mission history', 'evidence', 'forecast', 'score movement'], false, ['weekly summary', 'metric deltas', 'recommendation'], ['Owner understands progress', 'next decision clear'], 2, '8 min', '0 min', ['forecast-update'], ['Weekly report prepared', 'decision path clear']],
		['ranking-monitor', 'Ranking Monitor', 'Monitoring', 56, 'Monitor ranking movement and surface meaningful business changes.', ['Rankings', 'priority keywords', 'location set'], false, ['ranking delta', 'volatility note', 'impact score'], ['Meaningful movement detected', 'noise suppressed'], 2, '4 min', '0 min', ['website-scan'], ['Ranking monitor refreshed', 'mission trigger evaluated']],
		['competitor-change-detection', 'Competitor Change Detection', 'Monitoring', 54, 'Detect competitor movement that changes mission priority.', ['Competitor set', 'market signals', 'proof signals'], false, ['change event', 'competitor snapshot', 'response recommendation'], ['Change classified', 'response priority clear'], 2, '5 min', '0 min', ['competitor-scan'], ['Competitor deltas logged', 'response mission queued if needed']],
		['ai-visibility-refresh', 'AI Visibility Refresh', 'Monitoring', 52, 'Refresh answer-engine visibility and citation coverage after mission movement.', ['AI visibility baseline', 'entity facts', 'mission history'], false, ['AI score delta', 'citation coverage', 'answer gaps'], ['Score refreshed', 'visibility changes explained'], 2, '5 min', '0 min', ['ai-visibility-scan'], ['AI visibility refreshed', 'next AI gap ranked']],
		['website-health-monitoring', 'Website Health Monitoring', 'Monitoring', 50, 'Watch website health for regressions, drift, and new blockers.', ['Website crawl', 'performance baseline', 'technical audit'], false, ['health delta', 'regression list', 'risk note'], ['Regressions detected', 'severity ranked'], 2, '4 min', '0 min', ['technical-seo-audit'], ['Health monitor refreshed', 'regressions queued']]
	]);

	function missionLibraryDefinitionFor(row) {
		const [id, name, category, priority, businessObjective, requiredInputs, approvalRequired, evidenceProduced, verificationRequirements, businessGrowthScoreImpact, estimatedAiTime, estimatedHumanTime, dependencies, completionCriteria] = row;
		return {
			missionId: id,
			missionName: name,
			category,
			priority,
			businessObjective,
			requiredInputs,
			automatedTasks: missionLibraryLifecycleStages.reduce((tasks, stage) => {
				tasks[stage] = stage === 'Execute'
					? ['Provider adapter placeholder only; no production execution in this phase.']
					: missionLibraryTaskDefaults[category] || ['Use unified mission state', 'Prepare evidence', 'Report outcome'];
				return tasks;
			}, {}),
			approvalRequired,
			evidenceProduced,
			verificationRequirements,
			businessGrowthScoreImpact,
			estimatedAiTime,
			estimatedHumanTime,
			dependencies,
			completionCriteria,
			reusableLifecycleStages: Array.from(missionLibraryLifecycleStages)
		};
	}

	const missionLibraryCatalog = Object.freeze(missionLibraryRows.map(missionLibraryDefinitionFor));

	function subscriptionCapabilityMatrix() {
		const allMissionIds = missionLibraryCatalog.map(mission => mission.missionId);
		return {
			free: {
				label: 'FREE',
				missions: ['website-scan'],
				capabilities: ['Website Scan', 'Business Growth Score', 'AI Visibility Score', 'Limited Executive Brief', 'Animated score', 'Upgrade CTA'],
				locked: allMissionIds.filter(id => id !== 'website-scan'),
				execution: 'No execution'
			},
			intelligence: {
				label: '$199 DIY',
				missions: allMissionIds,
				capabilities: ['Full reports', 'Checklists', 'Recommendations', 'Mission instructions'],
				execution: 'Customer performs every action; Apex does not modify production'
			},
			autopilot: {
				label: '$499 AI Automated',
				missions: allMissionIds,
				capabilities: ['Research', 'Generate', 'Validate', 'Prepare Execution', 'Verify', 'Monitor', 'Daily Executive Brief'],
				execution: 'Execution placeholder only until provider adapters exist'
			},
			'growth-partner': {
				label: '$999 Concierge',
				missions: allMissionIds,
				capabilities: ['Same Mission Engine', 'Approved missions assigned to Apex Team', 'AI preparation', 'Validation', 'Monitoring', 'Reporting'],
				execution: 'Assigned to Apex Team after approval'
			},
			enterprise: {
				label: '$2,500 Enterprise',
				missions: allMissionIds,
				capabilities: ['Request Information', 'Enterprise consulting scope', 'Custom governance', 'Multi-location planning'],
				execution: 'Request Information only; No purchase flow or implementation'
			}
		};
	}

	function aiResponsibilityMatrix() {
		return {
			Research: ['Website crawl', 'Competitor analysis', 'AI visibility review', 'Technical SEO review', 'GBP audit'],
			Generation: ['FAQ', 'schema', 'JSON-LD', 'metadata', 'internal links', 'comparison content', 'citations'],
			Validation: ['Dependency checks', 'schema validation', 'business-rule checks', 'rollback readiness', 'execution readiness'],
			Forecasting: ['Business Growth Score impact', 'projected revenue lift', 'confidence updates', 'blocked-work modeling'],
			Monitoring: ['Ranking movement', 'competitor changes', 'AI visibility refresh', 'website health drift'],
			Reporting: ['Executive Brief', 'weekly report', 'timeline update', 'next mission recommendation'],
			Evidence: ['Before/after snapshots', 'validation logs', 'provider confirmation placeholder', 'score movement'],
			'Scheduling': ['Opportunity detection', 'priority ranking', 'dependency respect', 'conflict blocking', 'queue updates']
		};
	}

	function humanResponsibilityMatrix() {
		return {
			'Business decisions': ['Approve strategic changes', 'hold missions', 'request revisions'],
			'Enterprise consulting': ['Custom business rules', 'multi-location governance', 'contracted advisory scope'],
			'High-impact approvals': ['Pricing changes', 'brand changes', 'business information changes', 'customer-facing publication'],
			'Customer support': ['Resolve account issues', 'clarify business inputs', 'handle exceptions'],
			'New mission creation': ['Define new mission templates', 'set risk policy', 'approve reusable business rules'],
			'Future integrations': ['Grant provider permissions', 'review integration risk', 'approve production adapters']
		};
	}

	function buildMissionSchedulingArchitecture(input = {}) {
		const unified = buildUnifiedMissionState(input);
		const planName = normalizePlanName(input.subscription);
		const capabilities = subscriptionCapabilityMatrix()[planName] || subscriptionCapabilityMatrix().free;
		const missionState = input.missionState || {};
		const completed = completedMissionSet(missionState);
		const activeIds = new Set((unified.missionRecords || []).filter(record => /executing|awaiting approval|verification/i.test(record.currentExecutionStage)).map(record => record.id));
		const availableMissions = new Set(capabilities.missions || []);
		const scheduled = missionLibraryCatalog
			.map(mission => {
				const unmet = mission.dependencies.filter(id => !completed.has(id));
				const locked = !availableMissions.has(mission.missionId) && planName === 'free';
				const conflicting = activeIds.size && !activeIds.has(mission.missionId) && mission.approvalRequired;
				const state = locked ? 'Locked' : completed.has(mission.missionId) ? 'Completed' : unmet.length ? 'Blocked' : conflicting ? 'Queued Behind Approval Work' : 'Queued';
				return {
					missionId: mission.missionId,
					missionName: mission.missionName,
					category: mission.category,
					priority: mission.priority,
					state,
					blockedBy: unmet,
					approvalRequired: mission.approvalRequired,
					businessGrowthScoreImpact: mission.businessGrowthScoreImpact,
					executionMode: planName === 'growth-partner' ? 'Assigned to Apex Team after approval' : planName === 'autopilot' ? 'Prepared for future provider placeholder' : planName === 'intelligence' ? 'Customer instructions only' : planName === 'enterprise' ? 'Request information' : 'Locked or score-only'
				};
			})
			.sort((a, b) => {
				const stateWeight = state => state === 'Queued' ? 0 : state === 'Queued Behind Approval Work' ? 1 : state === 'Blocked' ? 2 : state === 'Locked' ? 3 : 4;
				return stateWeight(a.state) - stateWeight(b.state) || b.priority - a.priority;
			});
		return {
			version: '0.1.0',
			principle: 'Detect opportunities, prioritize automatically, respect dependencies, block conflicting work, and queue intelligently without fixed calendar days.',
			subscriptionLevel: planName,
			capabilities,
			activeMissionId: unified.primaryMission?.id || null,
			readiness: unified.executiveReadiness,
			scheduledMissions: scheduled,
			nextScheduledMission: scheduled.find(mission => mission.state === 'Queued') || null,
			blockedMissions: scheduled.filter(mission => mission.state === 'Blocked'),
			lockedMissions: scheduled.filter(mission => mission.state === 'Locked')
		};
	}

	const missionIntelligenceModel = Object.freeze({
		version: '0.1.0',
		boundary: 'Business intelligence only. No UI, provider adapter, API, scheduler, notification, or production execution.',
		sharedLifecycle: Array.from(missionLibraryLifecycleStages),
		requiredSections: [
			'missionIdentity',
			'inputs',
			'aiAnalysis',
			'deliverables',
			'humanResponsibilities',
			'aiResponsibilities',
			'dependencies',
			'successConditions',
			'failureConditions',
			'businessGrowthLogic',
			'futureExecutionPlaceholder'
		]
	});

	const categoryIntelligenceDefaults = Object.freeze({
		Foundation: {
			analyzes: ['website baseline', 'business identity', 'technical readiness', 'trust profile', 'AI visibility baseline'],
			compares: ['current state against healthy baseline', 'business proof against category expectations', 'technical health against known blockers'],
			validates: ['crawl completion', 'score inputs', 'required business facts', 'evidence freshness'],
			deliverables: ['Executive Summary', 'Evidence package', 'Baseline score', 'Opportunity ranking', 'Next mission recommendation'],
			futureProviders: ['Future Browser Automation', 'Future API', 'Future Human Team']
		},
		Optimization: {
			analyzes: ['page intent', 'content gaps', 'schema fit', 'internal authority paths', 'approval risk'],
			compares: ['current page against buyer intent', 'structured data against entity facts', 'content against competitor clarity'],
			validates: ['claim accuracy', 'duplicate risk', 'schema rules', 'rollback readiness', 'approval readiness'],
			deliverables: ['Approval package', 'Validation report', 'Rollback plan', 'Forecast', 'Prepared content or schema'],
			futureProviders: ['WordPress', 'Shopify', 'Future API', 'Future Browser Automation', 'Future Human Team']
		},
		Authority: {
			analyzes: ['business proof', 'public facts', 'review profile', 'citation consistency', 'entity relationships'],
			compares: ['business facts across public sources', 'trust signals against competitors', 'review velocity against market'],
			validates: ['NAP consistency', 'policy compliance', 'source reliability', 'claim defensibility'],
			deliverables: ['Evidence package', 'Comparison report', 'Citation package', 'Approval package', 'Validation report'],
			futureProviders: ['Google Business Profile', 'Future API', 'Future Browser Automation', 'Future Human Team']
		},
		Growth: {
			analyzes: ['revenue pages', 'conversion path', 'forecast assumptions', 'content freshness', 'local opportunity'],
			compares: ['service pages against competitor pages', 'current forecast against mission queue', 'content freshness against market'],
			validates: ['business claims', 'conversion path', 'dependency completion', 'forecast confidence', 'approval readiness'],
			deliverables: ['Executive Summary', 'Forecast', 'Approval package', 'Content package', 'Validation report'],
			futureProviders: ['WordPress', 'Shopify', 'Future API', 'Future Browser Automation', 'Future Human Team']
		},
		Monitoring: {
			analyzes: ['ranking movement', 'competitor changes', 'AI visibility drift', 'website health drift', 'score movement'],
			compares: ['latest scan against previous baseline', 'competitor movement against business movement', 'signal against noise threshold'],
			validates: ['change significance', 'measurement freshness', 'mission trigger threshold', 'regression severity'],
			deliverables: ['Executive Summary', 'Monitoring report', 'Evidence package', 'Forecast update', 'Next mission recommendation'],
			futureProviders: ['Future API', 'Future Browser Automation', 'Future Human Team']
		}
	});

	function minutesFromLabel(value) {
		const match = String(value || '').match(/\d+/);
		return match ? Number(match[0]) : 0;
	}

	function subscriptionAvailabilityForMission(missionId) {
		const matrix = subscriptionCapabilityMatrix();
		return Object.fromEntries(Object.entries(matrix).map(([key, plan]) => [key, {
			label: plan.label,
			available: (plan.missions || []).includes(missionId),
			behavior: plan.execution
		}]));
	}

	function riskForMission(mission) {
		if (mission.approvalRequired && mission.dependencies.length > 1) return 'Medium';
		if (mission.approvalRequired) return 'Controlled';
		if (mission.category === 'Monitoring' || mission.category === 'Foundation') return 'Low';
		return 'Low to controlled';
	}

	function approvalActionsForMission(mission) {
		if (!mission.approvalRequired) {
			return ['No customer approval required for analysis or preparation', 'Customer approval required only if a future production action is created'];
		}
		const categoryActions = {
			Foundation: ['Approve business information changes', 'Upload or approve profile assets', 'Confirm source of truth'],
			Optimization: ['Approve content', 'Approve schema or JSON-LD package', 'Approve navigation or internal link changes'],
			Authority: ['Approve business information', 'Approve citation submissions', 'Approve review or customer-facing language'],
			Growth: ['Approve page publication', 'Approve content and claims', 'Approve pricing, offer, or service-area details'],
			Monitoring: ['Approve response mission only if monitoring detects a meaningful change']
		};
		return categoryActions[mission.category] || ['Approve live-business change'];
	}

	function futureExecutionPlaceholdersFor(mission) {
		const defaults = categoryIntelligenceDefaults[mission.category] || categoryIntelligenceDefaults.Foundation;
		return defaults.futureProviders.map(provider => ({
			provider,
			status: 'Future placeholder only',
			implementation: 'Not implemented in Phase 7'
		}));
	}

	function buildMissionIntelligenceSpec(mission) {
		const defaults = categoryIntelligenceDefaults[mission.category] || categoryIntelligenceDefaults.Foundation;
		const aiMinutes = minutesFromLabel(mission.estimatedAiTime);
		const humanMinutes = minutesFromLabel(mission.estimatedHumanTime);
		const confidence = clampScore(mission.priority - mission.dependencies.length * 2 - (mission.approvalRequired ? 3 : 0));
		const visibilityGain = Math.max(1, Math.round(mission.businessGrowthScoreImpact * (mission.category === 'Monitoring' ? .5 : .9)));
		const trustGain = Math.max(1, Math.round(mission.businessGrowthScoreImpact * (['Authority', 'Foundation'].includes(mission.category) ? 1 : .55)));
		const blockedMissions = missionLibraryCatalog
			.filter(candidate => candidate.dependencies.includes(mission.missionId))
			.map(candidate => candidate.missionId);
		const parallelMissions = missionLibraryCatalog
			.filter(candidate => candidate.category === mission.category && candidate.missionId !== mission.missionId && !candidate.approvalRequired === !mission.approvalRequired)
			.slice(0, 4)
			.map(candidate => candidate.missionId);
		const optionalMissions = missionLibraryCatalog
			.filter(candidate => candidate.category !== mission.category && !candidate.dependencies.includes(mission.missionId))
			.slice(0, 3)
			.map(candidate => candidate.missionId);
		return {
			missionIdentity: {
				missionId: mission.missionId,
				name: mission.missionName,
				category: mission.category,
				description: mission.businessObjective,
				subscriptionAvailability: subscriptionAvailabilityForMission(mission.missionId),
				estimatedCompletionDays: Math.max(1, Math.ceil((aiMinutes + humanMinutes + (mission.approvalRequired ? 12 : 0)) / 16)),
				businessGrowthScoreValue: mission.businessGrowthScoreImpact
			},
			inputs: Array.from(new Set(['Website', 'Business name', 'Competitors', 'Existing schema', 'Existing citations', 'Trust profile', 'Review profile', 'Search readiness'].concat(mission.requiredInputs))),
			aiAnalysis: {
				analyzes: defaults.analyzes,
				compares: defaults.compares,
				calculates: ['Business Growth Score value', 'confidence', 'risk', 'visibility gain', 'trust gain', 'estimated business impact', 'dependency readiness'],
				validates: defaults.validates,
				scores: ['priority', 'confidence', 'risk', 'approval need', 'dependency state', 'mission readiness'],
				predicts: ['score movement', 'visibility gain', 'trust gain', 'business impact', 'next best mission']
			},
			deliverables: Array.from(new Set(defaults.deliverables.concat(mission.evidenceProduced).concat(['Rollback plan', 'Executive Report']))),
			humanResponsibilities: approvalActionsForMission(mission),
			aiResponsibilities: Array.from(new Set(Object.values(aiResponsibilityMatrix()).flat().concat(mission.automatedTasks.Research || []).concat(mission.automatedTasks.Generate || []).concat(mission.automatedTasks.Validate || []))),
			dependencies: {
				requiredPreviousMissions: mission.dependencies,
				blockedMissions,
				optionalMissions,
				parallelMissions
			},
			successConditions: Array.from(new Set(mission.completionCriteria.concat(mission.verificationRequirements).concat(['Evidence package attached', 'Executive Report prepared', 'Unified Mission State updated']))),
			failureConditions: {
				Blocked: ['Required previous mission incomplete', 'required input missing', 'dependency validation failed'],
				Waiting: ['Customer information needed', 'approval queue is occupied', 'mission is queued behind higher-priority work'],
				'Needs approval': mission.approvalRequired ? approvalActionsForMission(mission) : ['Future live-business action is introduced'],
				'Needs revision': ['AI confidence below threshold', 'claim cannot be validated', 'customer rejects approval package'],
				Cancelled: ['Customer cancels mission', 'business rule excludes mission', 'future provider permission is revoked']
			},
			businessGrowthLogic: {
				expectedScoreIncrease: mission.businessGrowthScoreImpact,
				confidence,
				risk: riskForMission(mission),
				visibilityGain,
				trustGain,
				estimatedBusinessImpact: `$${(mission.businessGrowthScoreImpact * 900).toLocaleString()}/mo modeled opportunity`
			},
			futureExecutionPlaceholder: {
				executeStagePolicy: 'Never execute in Phase 7. Identify future execution route only.',
				providers: futureExecutionPlaceholdersFor(mission)
			}
		};
	}

	const missionIntelligenceCatalog = Object.freeze(missionLibraryCatalog.map(buildMissionIntelligenceSpec));

	function buildMissionIntelligenceCatalog() {
		return JSON.parse(JSON.stringify(missionIntelligenceCatalog));
	}

	function getMissionIntelligenceById(missionId) {
		const spec = missionIntelligenceCatalog.find(mission => mission.missionIdentity.missionId === missionId);
		return spec ? JSON.parse(JSON.stringify(spec)) : null;
	}

	const aiWorkforceSpecialists = Object.freeze({
		website_analyst: {
			name: 'Website Analyst',
			missionCategories: ['Foundation', 'Optimization', 'Monitoring'],
			missionIds: ['website-scan', 'technical-seo-audit', 'metadata-optimization', 'internal-link-optimization', 'website-health-monitoring'],
			responsibilities: ['Website scan', 'Technical SEO audit', 'Metadata analysis', 'Heading and content structure', 'Internal links', 'Broken links', 'Sitemap and robots analysis', 'Schema detection', 'Website health findings']
		},
		local_visibility_specialist: {
			name: 'Local Visibility Specialist',
			missionCategories: ['Foundation', 'Growth', 'Authority'],
			missionIds: ['google-business-profile-audit', 'business-information-validation', 'citation-package', 'local-landing-pages', 'ranking-monitor'],
			responsibilities: ['Google Business Profile analysis', 'Local SEO readiness', 'Business-information consistency', 'Citation opportunities', 'Local landing-page opportunities', 'Geographic visibility findings']
		},
		trust_specialist: {
			name: 'Trust Specialist',
			missionCategories: ['Authority', 'Foundation'],
			missionIds: ['review-strategy', 'citation-package', 'business-information-validation', 'google-business-profile-audit', 'knowledge-graph-preparation'],
			responsibilities: ['Review readiness', 'Review coverage', 'Trust signals', 'Social proof', 'Citation consistency', 'Business legitimacy indicators', 'Reputation risks']
		},
		content_ai_visibility_strategist: {
			name: 'Content and AI Visibility Strategist',
			missionCategories: ['Optimization', 'Authority', 'Growth', 'Monitoring'],
			missionIds: ['faq-generation', 'schema-generation', 'json-ld-package', 'ai-visibility-scan', 'ai-visibility-refresh', 'comparison-content', 'service-page-optimization', 'content-refresh'],
			responsibilities: ['FAQ opportunities', 'Schema and JSON-LD preparation', 'AI visibility analysis', 'Comparison content', 'Service-page opportunities', 'Content refresh opportunities', 'Search and answer-engine optimization']
		},
		executive_analyst: {
			name: 'Executive Analyst',
			missionCategories: ['Foundation', 'Growth', 'Monitoring'],
			missionIds: ['forecast-update', 'executive-weekly-report', 'competitor-scan', 'competitor-change-detection'],
			responsibilities: ['Business Growth Score', 'Mission prioritization', 'Dependencies', 'Forecasting', 'Estimated impact', 'Executive recommendation', 'Daily and weekly reports', 'Mission scheduling']
		}
	});

	function specialistForMission(missionId) {
		return Object.values(aiWorkforceSpecialists).find(specialist => specialist.missionIds.includes(missionId))
			|| Object.values(aiWorkforceSpecialists).find(specialist => {
				const spec = getMissionIntelligenceById(missionId);
				return spec && specialist.missionCategories.includes(spec.missionIdentity.category);
			})
			|| aiWorkforceSpecialists.executive_analyst;
	}

	function runtimeModeFor(context = {}) {
		if (context.realAnalysis === true) return 'real';
		if (context.placeholderOnly === true) return 'placeholder';
		return 'simulated';
	}

	function workforceResultFor(context = {}, missionId) {
		const spec = getMissionIntelligenceById(missionId);
		if (!spec) return null;
		const specialist = specialistForMission(missionId);
		const mode = runtimeModeFor(context);
		const dependencies = spec.dependencies.requiredPreviousMissions || [];
		const completed = completedMissionSet(context.missionState || {});
		const blockedBy = dependencies.filter(id => !completed.has(id));
		const approvalRequired = spec.humanResponsibilities.some(item => !/No customer approval required/i.test(item));
		const readiness = blockedBy.length ? 'Blocked' : approvalRequired ? 'Approval package prepared' : 'Execution-ready package prepared';
		return {
			specialist: specialist.name,
			missionId,
			resultMode: mode,
			analysisCompleted: mode === 'placeholder' ? false : true,
			findings: spec.aiAnalysis.analyzes.slice(0, 4).map(item => `${item} reviewed for ${spec.missionIdentity.name}.`),
			evidence: spec.deliverables.slice(0, 5),
			recommendedAction: blockedBy.length
				? `Complete ${blockedBy.map(id => id.replace(/-/g, ' ')).join(', ')} before ${spec.missionIdentity.name}.`
				: spec.humanResponsibilities[0],
			confidence: spec.businessGrowthLogic.confidence,
			risk: spec.businessGrowthLogic.risk,
			expectedBusinessGrowthScoreImpact: spec.businessGrowthLogic.expectedScoreIncrease,
			approvalRequirement: approvalRequired ? 'Required before live-business change' : 'Not required for analysis or preparation',
			dependencies: {
				required: dependencies,
				blockedBy,
				optional: spec.dependencies.optionalMissions,
				parallel: spec.dependencies.parallelMissions
			},
			suggestedNextMission: spec.dependencies.blockedMissions[0] || spec.dependencies.optionalMissions[0] || 'forecast-update',
			executionReadiness: readiness,
			productionExecution: 'Not executed. Future provider route only.',
			createdAt: new Date().toISOString()
		};
	}

	function runAIWorkforceMission(context = {}, missionId) {
		const result = workforceResultFor(context, missionId);
		if (!result) return null;
		const nextStage = result.dependencies.blockedBy.length
			? 'Blocked'
			: result.approvalRequirement.startsWith('Required') ? 'Awaiting Approval' : 'Validation Passed';
		const missionState = {
			...(context.missionState || {}),
			[missionId]: nextStage
		};
		const timelineEvent = [
			new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
			result.specialist,
			`${result.missionId}: ${result.executionReadiness}`,
			result.resultMode === 'real' ? 'complete' : result.resultMode === 'placeholder' ? 'pending' : 'stable'
		];
		const unifiedState = buildUnifiedMissionState({ ...context, missionState });
		return {
			...result,
			updatedMissionState: missionState,
			unifiedState,
			executiveBriefUpdate: unifiedState.insights?.[0] || result.recommendedAction,
			missionWorkspaceUpdate: result.executionReadiness,
			commandCenterUpdate: unifiedState.summary,
			operationsTimelineEvent: timelineEvent
		};
	}

	function orchestrateAIWorkforce(context = {}) {
		const schedule = buildMissionSchedulingArchitecture(context);
		const missionId = context.missionId || schedule.nextScheduledMission?.missionId || 'website-scan';
		const result = runAIWorkforceMission(context, missionId);
		return {
			version: '0.1.0',
			resultMode: runtimeModeFor(context),
			selectedMissionId: missionId,
			specialist: result?.specialist || null,
			result,
			schedule,
			note: 'AI workforce runtime uses existing Mission Intelligence definitions and Unified Mission State. It does not execute production changes.'
		};
	}

	function providerPermissionFramework() {
		const providers = ['WordPress', 'Shopify', 'Google Business Profile', 'Cloudflare', 'GitHub', 'Render', 'Vercel', 'Custom APIs', 'MCP providers'];
		const permissionDefaults = {
			Read: 'Prepared',
			Prepare: 'Prepared',
			Write: 'Deferred',
			Publish: 'Deferred',
			Delete: 'Blocked',
			Rollback: 'Prepared',
			'Approve Required': 'Yes'
		};
		return providers.map(provider => ({
			provider,
			permissions: { ...permissionDefaults },
			status: 'Provider adapter placeholder'
		}));
	}

	function executionPipelineFor(mission, index = 0) {
		const approvalRequired = mission?.approvalRequired || mission?.executionMode === ExecutionModes.APPROVAL_REQUIRED || mission?.executionMode === ExecutionModes.CUSTOMER_REQUIRED;
		const activeIndex = approvalRequired ? 4 : Math.min(6, 5 + (index % 2));
		return ['Opportunity Detected', 'Research Complete', 'Content Prepared', 'Validation Passed', 'Awaiting Approval', 'Executing', 'Verification', 'Monitoring', 'Completed'].map((stage, stageIndex) => {
			const skippedApproval = stage === 'Awaiting Approval' && !approvalRequired;
			const state = skippedApproval ? 'muted' : stageIndex < activeIndex ? 'complete' : stageIndex === activeIndex ? 'active' : 'pending';
			return {
				stage,
				status: skippedApproval ? 'Not Required' : state === 'complete' ? 'Complete' : state === 'active' ? 'Current' : 'Prepared',
				timestamp: skippedApproval ? '--' : `08:${String(2 + index + stageIndex * 2).padStart(2, '0')}`,
				state
			};
		});
	}

	function executionRecordFor(definition, planMission, index, metrics) {
		const mission = planMission || {};
		const bgsLift = mission.expectedBusinessGrowthScore || Math.max(1, 4 - (index % 3));
		const revenue = mission.expectedRevenueImpact || (900 + index * 180);
		const confidence = mission.confidence || Math.max(68, 94 - index);
		const approvalRequired = definition.approvalRequired || mission.executionMode === ExecutionModes.APPROVAL_REQUIRED || mission.executionMode === ExecutionModes.CUSTOMER_REQUIRED;
		const stage = approvalRequired ? 'Awaiting Approval' : index % 4 === 0 ? 'Monitoring' : 'Validation Passed';
		return {
			id: definition.id,
			title: mission.title || definition.name,
			category: definition.category,
			objective: definition.objective,
			priority: mission.priorityScore || Math.max(42, 96 - index * 2),
			confidence,
			estimatedBusinessGrowthScoreLift: bgsLift,
			estimatedTime: mission.estimatedTime || (definition.approvalRequired ? '45 minutes' : '12 minutes'),
			owner: approvalRequired ? 'Owner + Apex' : 'Apex',
			currentExecutionStage: stage,
			approvalRequirement: approvalRequired ? 'Required' : 'Not Required',
			dependencies: asArray(mission.blockedBy).length ? mission.blockedBy : asArray(mission.dependencies),
			rollbackAvailable: true,
			reason: mission.reason || definition.objective,
			businessEvidence: `${metrics.businessGrowthScore}/100 Business Growth Score with trust, visibility, and forecast movement tracked.`,
			competitorEvidence: metrics.competitorPressure >= 75 ? 'Competitor proof pressure is elevated.' : 'Competitor movement is stable but monitored.',
			aiEvidence: `${metrics.aiVisibility}/100 AI Visibility baseline; prepared work is structured for answer-engine clarity.`,
			expectedOutcome: `+${bgsLift} Business Growth Score and +${mission.expectedVisibility || Math.max(2, 8 - (index % 5))}% visibility.`,
			projectedScoreLift: `+${bgsLift} BGS`,
			projectedRevenueLift: `$${revenue.toLocaleString()}/mo`,
			filesGenerated: definition.expectedEvidence.slice(0, 3).concat(['Approval brief']),
			contentGenerated: ['Executive summary', 'Implementation notes', 'Customer-facing copy draft'],
			schemaPrepared: definition.category === MissionTypes.SCHEMA || /schema|json/i.test(definition.name) ? 'Prepared' : 'Not required',
			internalLinksPrepared: /link|service|content|page/i.test(definition.name) ? 'Prepared' : 'Mapped if needed',
			reviewResponsesPrepared: definition.category === MissionTypes.REVIEWS ? 'Prepared' : 'Not required',
			verificationChecklist: definition.successCriteria,
			executionHistory: executionPipelineFor({ ...mission, approvalRequired }, index),
			evidenceCollected: definition.expectedEvidence,
			completionCriteria: definition.successCriteria,
			permissionMode: mission.executionMode || (approvalRequired ? ExecutionModes.APPROVAL_REQUIRED : ExecutionModes.AUTOMATIC)
		};
	}

	function approvalQueueFor(records) {
		const examples = ['Publish page', 'Update business information', 'Change pricing', 'Replace content', 'Delete content', 'Modify branding'];
		return records.filter(record => record.approvalRequirement === 'Required').map((record, index) => ({
			id: record.id,
			title: examples[index] || record.title,
			summary: record.title,
			risk: index === 2 || index === 4 ? 'High' : record.rollbackAvailable ? 'Medium' : 'Elevated',
			expectedGain: record.projectedScoreLift,
			rollbackAvailable: record.rollbackAvailable,
			status: 'Waiting for approval'
		}));
	}

	function verificationEngineFor(records) {
		return records.slice(0, 8).map((record, index) => ({
			mission: record.title,
			expectedVerification: record.verificationChecklist[0] || 'Expected outcome confirmed',
			actualVerification: index < 2 ? 'Prepared evidence baseline' : 'Pending execution',
			retryStatus: index === 3 ? 'Retry prepared' : 'Not required',
			failureReason: 'None recorded',
			confidenceAfterExecution: `${Math.max(70, record.confidence - 3)}%`,
			missionScore: record.priority
		}));
	}

	function dailyOperationsEngineFor(records, metrics) {
		return {
			businessScan: 'Prepared at 08:02',
			missionQueue: `${records.length} missions ranked`,
			completedWork: 'Research, preparation, validation, evidence package, forecast update',
			pendingApprovals: `${records.filter(record => record.approvalRequirement === 'Required').length} approval decisions`,
			forecastUpdates: `${metrics.forecast} current / ${clampScore(metrics.forecast + 7)} after approved work`,
			competitorChanges: metrics.competitorPressure >= 75 ? 'Competitor proof pressure elevated' : 'Competitor pressure stable',
			aiVisibilityChanges: `${metrics.aiVisibility} current / ${clampScore(metrics.aiVisibility + 6)} target`,
			businessGrowthScoreMovement: `${metrics.businessGrowthScore} current / ${clampScore(metrics.businessGrowthScore + 4)} prepared`,
			executiveBrief: 'Ready',
			executiveEmail: 'Prepared, delivery deferred'
		};
	}

	const missionDependencyRules = Object.freeze({
		'service-page-optimization': ['google-business-profile-verification'],
		'local-seo-improvements': ['google-business-profile-verification'],
		'citation-package': ['google-business-profile-verification'],
		'ai-visibility-optimization': ['schema-generation'],
		'comparison-pages': ['service-page-optimization'],
		'landing-page-generation': ['service-page-optimization'],
		'authority-improvement': ['citation-package'],
		'knowledge-graph-improvements': ['schema-generation', 'business-information-validation'],
		'executive-reporting': ['verification-complete'],
		'forecast-update': ['verification-complete']
	});

	function stageIndexFor(stage) {
		const stages = ['Opportunity Detected', 'Research Complete', 'Content Prepared', 'Validation Passed', 'Prepared', 'Awaiting Approval', 'Executing', 'Verified', 'Monitoring', 'Completed'];
		const index = stages.findIndex(item => item.toLowerCase() === String(stage || '').toLowerCase());
		return index === -1 ? 4 : index;
	}

	function pipelineForStage(stage, approvalRequired, index = 0, blockedReason = '') {
		const stages = ['Opportunity Detected', 'Research Complete', 'Content Prepared', 'Validation Passed', 'Awaiting Approval', 'Executing', 'Verification', 'Monitoring', 'Completed'];
		const normalized = stage === 'Prepared' ? 'Validation Passed' : stage === 'Verified' ? 'Verification' : stage;
		const activeIndex = stages.findIndex(item => item === normalized);
		return stages.map((item, stageIndex) => {
			const skippedApproval = item === 'Awaiting Approval' && !approvalRequired;
			const blocked = stage === 'Blocked' && stageIndex === 0;
			const state = blocked ? 'blocked' : skippedApproval ? 'muted' : stageIndex < activeIndex ? 'complete' : stageIndex === activeIndex ? 'active' : 'pending';
			return {
				stage: item,
				status: blocked ? blockedReason : skippedApproval ? 'Not Required' : state === 'complete' ? 'Complete' : state === 'active' ? 'Current' : 'Prepared',
				timestamp: skippedApproval || blocked ? '--' : `08:${String(2 + index + stageIndex * 2).padStart(2, '0')}`,
				state
			};
		});
	}

	function completedMissionSet(missionState = {}) {
		return new Set(Object.entries(missionState)
			.filter(([, stage]) => /completed|verified|monitoring/i.test(String(stage)))
			.map(([id]) => id));
	}

	function dynamicBusinessScore(metrics, records) {
		const components = {
			base: metrics.businessGrowthScore,
			trust: metrics.trustCoverage,
			visibility: metrics.localSeo,
			authority: metrics.contentAuthority,
			website: metrics.websiteHealth,
			aiVisibility: metrics.aiVisibility
		};
		const weightedBase = (
			components.trust * .24 +
			components.visibility * .2 +
			components.authority * .18 +
			components.website * .18 +
			components.aiVisibility * .2
		);
		const completedLift = records
			.filter(record => /completed|verified|monitoring/i.test(record.currentExecutionStage))
			.reduce((total, record) => total + Math.max(1, record.estimatedBusinessGrowthScoreLift || 0), 0);
		const preparedLift = records
			.filter(record => /prepared|awaiting approval|executing/i.test(record.currentExecutionStage))
			.reduce((total, record) => total + Math.max(1, record.estimatedBusinessGrowthScoreLift || 0) * .28, 0);
		const current = clampScore(weightedBase + completedLift);
		return {
			components,
			current,
			projected: clampScore(current + preparedLift),
			delta: current - metrics.businessGrowthScore
		};
	}

	function notificationsFor(records, score) {
		const notifications = [];
		const approval = records.find(record => record.currentExecutionStage === 'Awaiting Approval');
		const completed = records.find(record => record.currentExecutionStage === 'Completed');
		const verified = records.find(record => record.currentExecutionStage === 'Verified' || record.currentExecutionStage === 'Monitoring');
		if (completed) notifications.push(['Mission completed', completed.title, 'complete']);
		if (approval) notifications.push(['Approval required', approval.title, 'approval']);
		if (verified) notifications.push(['Verification updated', verified.title, 'verified']);
		if (score.delta > 0) notifications.push(['Business score increased', `+${score.delta} Business Growth Score`, 'growth']);
		notifications.push(['Competitor changed', 'Competitor proof pressure refreshed this morning.', 'warning']);
		if (/completed|verified|monitoring/i.test(records.find(record => record.id === 'google-business-profile-verification')?.currentExecutionStage || '')) {
			notifications.push(['Google profile verified', 'Local trust layer moved forward.', 'complete']);
		}
		if (/completed|verified|monitoring/i.test(records.find(record => record.id === 'review-strategy')?.currentExecutionStage || '')) {
			notifications.push(['Review milestone reached', 'Review strategy entered monitoring.', 'growth']);
		}
		return notifications.slice(0, 6).map(([title, detail, state]) => ({ title, detail, state }));
	}

	function timelineFor(records, score) {
		const primaryEvents = records.slice(0, 6).flatMap((record, index) => [
			[`08:${String(2 + index).padStart(2, '0')}`, 'Research', `${record.title} research refreshed.`, 'complete'],
			[`08:${String(8 + index).padStart(2, '0')}`, record.currentExecutionStage, `${record.title}: ${record.currentExecutionStage}.`, /blocked/i.test(record.currentExecutionStage) ? 'blocked' : /approval/i.test(record.currentExecutionStage) ? 'approval' : 'complete']
		]);
		return primaryEvents.concat([
			['08:18', 'Business score movement', `${score.components.base} base / ${score.current} current / ${score.projected} projected.`, 'growth'],
			['08:20', 'Forecast updated', 'Projected score recalculated from shared mission state.', 'growth']
		]).slice(0, 14);
	}

	function memoryRecordsFor(records, score) {
		return records
			.filter(record => /completed|verified|monitoring/i.test(record.currentExecutionStage))
			.map(record => ({
				missionId: record.id,
				title: record.title,
				whatChanged: record.expectedOutcome,
				why: record.reason,
				expectedOutcome: record.expectedOutcome,
				actualOutcome: record.currentExecutionStage === 'Completed' ? record.expectedOutcome : 'Verification in progress',
				evidence: record.evidenceCollected,
				businessScoreMovement: `${score.components.base} -> ${score.current}`,
				confidenceBefore: `${Math.max(50, record.confidence - 8)}%`,
				confidenceAfter: `${record.confidence}%`
			}));
	}

	function insightsFor(records, score, notifications) {
		const completedCount = records.filter(record => /completed|verified|monitoring/i.test(record.currentExecutionStage)).length;
		const approvalCount = records.filter(record => record.currentExecutionStage === 'Awaiting Approval').length;
		const blocked = records.find(record => record.currentExecutionStage === 'Blocked');
		const topReady = records.find(record => /prepared|validation passed|awaiting approval/i.test(record.currentExecutionStage));
		const insights = [
			completedCount
				? `${completedCount} missions completed or verified from the shared mission state.`
				: 'Apex prepared the mission queue and evidence package from one shared operating state.',
			`Business Growth Score recalculated from ${score.components.base} base to ${score.current} current, with ${score.projected} projected after prepared work.`,
			approvalCount
				? `${approvalCount} approval-gated decisions require human judgment.`
				: 'No approval-gated decisions are waiting right now.',
			blocked
				? `${blocked.title} is blocked: ${blocked.blockedReason}.`
				: `${topReady?.title || records[0]?.title || 'Next mission'} is ready for the next execution step.`,
			notifications[0]?.detail || 'Executive notifications are synchronized with mission status, score, approval, and verification state.'
		];
		return Array.from(new Set(insights)).slice(0, 5);
	}

	function readinessFor(records) {
		if (records.some(record => record.currentExecutionStage === 'Awaiting Approval')) return 'Waiting for Approval';
		if (records.some(record => record.currentExecutionStage === 'Verification')) return 'Needs Verification';
		if (records.some(record => record.currentExecutionStage === 'Executing')) return 'Ready';
		if (records.some(record => record.currentExecutionStage === 'Blocked')) return 'Blocked';
		if (records.every(record => record.currentExecutionStage === 'Completed')) return 'Execution Paused';
		return 'Ready';
	}

	function primaryMissionFor(records, fallbackId) {
		return records.find(record => record.currentExecutionStage === 'Executing')
			|| records.find(record => record.currentExecutionStage === 'Awaiting Approval')
			|| records.find(record => !/completed|verified|monitoring|blocked/i.test(record.currentExecutionStage))
			|| records.find(record => /blocked/i.test(record.currentExecutionStage))
			|| records.find(record => record.id === fallbackId)
			|| records[0];
	}

	function applyUnifiedMissionState(records, missionState = {}) {
		const completed = completedMissionSet(missionState);
		return records.map((record, index) => {
			const dependencies = Array.from(new Set([...(record.dependencies || []), ...(missionDependencyRules[record.id] || [])]));
			const unmet = dependencies.filter(id => id !== 'verification-complete' ? !completed.has(id) : !Array.from(completed).length);
			const requestedStage = missionState[record.id] || record.currentExecutionStage || 'Prepared';
			const currentExecutionStage = unmet.length ? 'Blocked' : requestedStage;
			const blockedReason = unmet.length ? `Waiting for ${unmet.map(id => id.replace(/-/g, ' ')).join(', ')}` : '';
			return {
				...record,
				dependencies,
				blockedReason,
				currentExecutionStage,
				approvalRequirement: currentExecutionStage === 'Awaiting Approval' ? 'Required' : record.approvalRequirement,
				executionHistory: pipelineForStage(currentExecutionStage, record.approvalRequirement === 'Required', index, blockedReason)
			};
		});
	}

	function buildExecutionCenter(input = {}) {
		const plan = generateDailyMission(input);
		const missionMap = new Map(plan.missionQueue.map(mission => [mission.id, mission]));
		const records = missionDefinitionCatalog.map((definition, index) => executionRecordFor(definition, missionMap.get(definition.id), index, plan.metrics));
		const primary = records.find(record => record.id === plan.primaryMission?.id) || records[0];
		return {
			version: '0.3.0',
			generatedAt: new Date().toISOString(),
			summary: {
				overnightChange: 'Apex scanned the business, refreshed competitor pressure, prepared the mission queue, and assembled approval packages.',
				doingNow: `${primary.title} is ${primary.currentExecutionStage.toLowerCase()}.`,
				waitingForOwner: `${records.filter(record => record.approvalRequirement === 'Required').length} missions require approval before live-business changes.`,
				improvesNext: primary.expectedOutcome
			},
			primaryMissionId: primary.id,
			missionDefinitions: missionDefinitionCatalog,
			missionRecords: records,
			approvalQueue: approvalQueueFor(records),
			providerPermissions: providerPermissionFramework(),
			verificationEngine: verificationEngineFor(records),
			evidenceEngine: ['Before scan', 'After scan', 'Schema validation', 'Google verification', 'Screenshot', 'Performance metrics', 'Citation verification', 'Internal link validation', 'Structured data validation'].map(item => ({ item, status: item === 'After scan' ? 'Reserved' : 'Prepared' })),
			dailyOperations: dailyOperationsEngineFor(records, plan.metrics),
			missionPlan: plan
		};
	}

	function buildUnifiedMissionState(input = {}) {
		const execution = buildExecutionCenter(input);
		const missionState = input.missionState || {};
		const records = applyUnifiedMissionState(execution.missionRecords, missionState);
		const score = dynamicBusinessScore(execution.missionPlan.metrics, records);
		const primary = primaryMissionFor(records, execution.primaryMissionId);
		const approvalQueue = approvalQueueFor(records.filter(record => record.currentExecutionStage === 'Awaiting Approval'));
		const notifications = notificationsFor(records, score);
		const timeline = timelineFor(records, score);
		const memoryRecords = memoryRecordsFor(records, score);
		const insights = insightsFor(records, score, notifications);
		return {
			...execution,
			version: '0.4.0',
			primaryMissionId: primary?.id,
			primaryMission: primary,
			missionRecords: records,
			approvalQueue,
			notifications,
			timeline,
			memoryRecords,
			insights,
			executiveReadiness: readinessFor(records),
			businessScore: score,
			summary: {
				overnightChange: notifications[0]?.detail || 'Apex refreshed the mission state.',
				doingNow: primary ? `${primary.title} is ${primary.currentExecutionStage.toLowerCase()}.` : 'No active mission.',
				waitingForOwner: approvalQueue.length ? `${approvalQueue.length} approvals require human judgment.` : 'No owner approvals waiting.',
				improvesNext: primary?.expectedOutcome || 'Next improvement is being calculated.'
			},
			dailyOperations: {
				...execution.dailyOperations,
				missionQueue: `${records.length} missions synchronized`,
				pendingApprovals: `${approvalQueue.length} approval decisions`,
				businessGrowthScoreMovement: `${score.components.base} base / ${score.current} current / ${score.projected} projected`,
				executiveReadiness: readinessFor(records),
				executiveEmail: 'Prepared from unified mission state'
			}
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
		version: '1.0.0-mvp',
		MissionStates,
		MissionTypes,
		ExecutionModes,
		dependencyGraph,
		candidateMissions,
		scoreMission,
		generateDailyMission,
		buildExecutionLayer,
		buildExecutionCenter,
		buildUnifiedMissionState,
		missionDefinitionCatalog,
		missionLibraryCatalog,
		subscriptionCapabilityMatrix,
		aiResponsibilityMatrix,
		humanResponsibilityMatrix,
		buildMissionSchedulingArchitecture,
		missionIntelligenceModel,
		missionIntelligenceCatalog,
		buildMissionIntelligenceCatalog,
		getMissionIntelligenceById,
		aiWorkforceSpecialists,
		runAIWorkforceMission,
		orchestrateAIWorkforce,
		providerPermissionFramework
	};
})();
