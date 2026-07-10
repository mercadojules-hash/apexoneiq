<?php
/**
 * Apex Local SEO plugin file.
 *
 * @package Apex_Local_SEO
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; }

/**
 * APLS Services BusinessProfile Providers MockBusinessProfileProvider.
 */
class APLS_Services_BusinessProfile_Providers_MockBusinessProfileProvider implements APLS_Contracts_BusinessProfileProviderInterface {
	/**
	 * Id.
	 */
	public function id() {
		return 'mock'; }
	/**
	 * Label.
	 */
	public function label() {
		return __( 'Mock Provider', 'apex-local-seo' ); }

	/**
	 * Status.
	 */
	public function status() {
		return array(
			'connected' => true,
			'mode'      => 'demo',
			'message'   => __( 'Using demo business data until Google Business Profile is connected.', 'apex-local-seo' ),
		);
	}

	/**
	 * Diagnostics.
	 */
	public function diagnostics() {
		return array(
			array(
				'label'      => __( 'Current data source', 'apex-local-seo' ),
				'status'     => 'pass',
				'value'      => __( 'Demo Data', 'apex-local-seo' ),
				'problem'    => '',
				'reason'     => __( 'Google Business Profile is not connected.', 'apex-local-seo' ),
				'resolution' => __( 'Connect Google Business Profile in Settings to import live business data.', 'apex-local-seo' ),
				'expected'   => __( 'Dashboard modules render before external APIs are connected.', 'apex-local-seo' ),
			),
			array(
				'label'      => __( 'Demo business data', 'apex-local-seo' ),
				'status'     => 'pass',
				'value'      => __( 'Loaded', 'apex-local-seo' ),
				'problem'    => '',
				'reason'     => __( 'Apex Local SEO ships with sample data for onboarding and review.', 'apex-local-seo' ),
				'resolution' => __( 'Use this mode to explore the dashboard before connecting Google.', 'apex-local-seo' ),
				'expected'   => __( 'Dashboard modules render without external APIs.', 'apex-local-seo' ),
			),
		);
	}

	/**
	 * Dashboard.
	 */
	public function dashboard() {
		return array(
			'summary'         => $this->summary(),
			'profile'         => $this->profile(),
			'locations'       => $this->locations(),
			'reviews'         => $this->reviews(),
			'reviewModule'    => $this->review_module(),
			'schemaModule'    => $this->schema_module(),
			'citationModule'  => $this->citation_module(),
			'advisorModule'   => $this->advisor_module(),
			'performance'     => $this->performance(),
			'photos'          => $this->photos(),
			'posts'           => $this->posts(),
			'questions'       => $this->questions(),
			'gbpModule'       => $this->gbp_module(),
			'keywords'        => $this->keywords(),
			'activity'        => $this->activity(),
			'scenarios'       => $this->scenarios(),
			'recommendations' => $this->recommendations(),
			'citations'       => $this->citations(),
			'rankings'        => $this->rankings(),
			'competitors'     => $this->competitors(),
			'audit'           => $this->audit(),
		);
	}

	/**
	 * Sync.
	 */
	public function sync() {
		return array(
			'provider' => $this->id(),
			'status'   => 'ready',
			'message'  => __( 'Mock provider data is already loaded.', 'apex-local-seo' ),
		);
	}

	/**
	 * Summary.
	 */
	private function summary() {
		return array(
			'connected'           => true,
			'businessName'        => 'Apex Sample Dental Studio',
			'averageRating'       => 4.8,
			'totalReviews'        => 186,
			'reviewsWaiting'      => 7,
			'photos'              => 94,
			'profileCompleteness' => 92,
			'healthScore'         => 88,
			'healthLabel'         => __( 'Excellent', 'apex-local-seo' ),
			'visibilityScore'     => 78,
			'mapPackVisibility'   => 78,
			'citationScore'       => 86,
			'competitorPosition'  => 2,
			'advisorHealthScore'  => 91,
			'optimizationScore'   => 84,
			'postsPublished'      => 8,
			'questionsWaiting'    => 3,
			'primaryCategory'     => __( 'Dental clinic', 'apex-local-seo' ),
			'metrics30'           => array(
				'calls'             => 128,
				'websiteClicks'     => 342,
				'directionRequests' => 96,
				'searchViews'       => 12840,
				'mapsViews'         => 9320,
				'photoViews'        => 4200,
			),
		);
	}

	/**
	 * Profile.
	 */
	private function profile() {
		return array(
			'profile' => array(
				'businessName' => 'Apex Sample Dental Studio',
				'address'      => '401 E Jackson St, Tampa, FL 33602, US',
				'phone'        => '(813) 555-0198',
				'website'      => 'https://apexdigital.design/apex-local-seo',
				'categories'   => array( 'Dental clinic', 'Cosmetic dentist', 'Emergency dental service' ),
				'description'  => 'High-trust local practice profile used for Apex Local SEO demo data.',
				'verified'     => true,
				'lastSyncedAt' => current_time( 'mysql' ),
			),
			'media'   => array(
				'logo'   => array( 'url' => APLS_PLUGIN_URL . 'assets/branding/apex-local-seo-icon-128.png' ),
				'cover'  => array( 'url' => APLS_PLUGIN_URL . 'assets/branding/apex-local-seo-banner-772x250.png' ),
				'photos' => 94,
				'items'  => array(),
			),
		);
	}

	/**
	 * Locations.
	 */
	private function locations() {
		return array(
			array(
				'name'   => 'Downtown Tampa',
				'city'   => 'Tampa',
				'region' => 'FL',
				'status' => 'optimized',
				'score'  => 88,
			),
			array(
				'name'   => 'South Tampa Service Area',
				'city'   => 'Tampa',
				'region' => 'FL',
				'status' => 'monitored',
				'score'  => 81,
			),
		);
	}

	/**
	 * Reviews.
	 */
	private function reviews() {
		return array(
			array(
				'reviewer_name'   => 'Maria S.',
				'rating'          => 5,
				'response_status' => 'waiting',
				'review_text'     => 'The office was professional and fast.',
				'reviewed_at'     => '2026-07-03',
			),
			array(
				'reviewer_name'   => 'Chris W.',
				'rating'          => 5,
				'response_status' => 'responded',
				'review_text'     => 'Clear communication and great care.',
				'reviewed_at'     => '2026-06-29',
			),
			array(
				'reviewer_name'   => 'Tanya R.',
				'rating'          => 4,
				'response_status' => 'waiting',
				'review_text'     => 'Helpful team and easy parking.',
				'reviewed_at'     => '2026-06-24',
			),
			array(
				'reviewer_name'   => 'Devin P.',
				'rating'          => 5,
				'response_status' => 'responded',
				'review_text'     => 'They explained every option and got me scheduled quickly.',
				'reviewed_at'     => '2026-06-20',
			),
			array(
				'reviewer_name'   => 'Lena M.',
				'rating'          => 4,
				'response_status' => 'waiting',
				'review_text'     => 'Great staff and clean rooms. The wait was a little long.',
				'reviewed_at'     => '2026-06-18',
			),
		);
	}

	/**
	 * Review module.
	 */
	private function review_module() {
		return array(
			'summary'        => array(
				'overallRating'       => 4.8,
				'totalReviews'        => 186,
				'newReviews30'        => 24,
				'averageRatingTrend'  => '+0.2',
				'responseRate'        => 82,
				'averageResponseTime' => '9h',
			),
			'feed'           => array(
				array(
					'customerName'    => 'Maria S.',
					'rating'          => 5,
					'reviewDate'      => '2026-07-03',
					'reviewText'      => 'The office was professional, fast, and very clear about the treatment plan.',
					'source'          => 'Google',
					'responseStatus'  => 'Unanswered',
					'sentiment'       => 'Positive',
					'advisorPriority' => 'High',
					'suggestedReply'  => 'Thank you for trusting our team, Maria. We are glad the visit felt clear and efficient.',
				),
				array(
					'customerName'    => 'Chris W.',
					'rating'          => 5,
					'reviewDate'      => '2026-06-29',
					'reviewText'      => 'Clear communication and great care. The team made scheduling easy.',
					'source'          => 'Google',
					'responseStatus'  => 'Answered',
					'sentiment'       => 'Positive',
					'advisorPriority' => 'Normal',
					'suggestedReply'  => 'We appreciate the kind words, Chris. Thank you for choosing our office.',
				),
				array(
					'customerName'    => 'Tanya R.',
					'rating'          => 4,
					'reviewDate'      => '2026-06-24',
					'reviewText'      => 'Helpful team and easy parking. The wait was a little longer than expected.',
					'source'          => 'Google',
					'responseStatus'  => 'Unanswered',
					'sentiment'       => 'Neutral',
					'advisorPriority' => 'Medium',
					'suggestedReply'  => 'Thank you for the feedback, Tanya. We appreciate the note and are working to keep visits moving on time.',
				),
				array(
					'customerName'    => 'Lena M.',
					'rating'          => 2,
					'reviewDate'      => '2026-06-18',
					'reviewText'      => 'The staff was friendly, but I had trouble getting a callback about billing.',
					'source'          => 'Google',
					'responseStatus'  => 'Unanswered',
					'sentiment'       => 'Negative',
					'advisorPriority' => 'Critical',
					'suggestedReply'  => 'Lena, thank you for letting us know. Please contact our office manager so we can resolve the billing follow-up quickly.',
				),
			),
			'intelligence'   => array(
				'positiveTrends'     => array( 'Staff friendliness', 'Scheduling ease', 'Clear treatment explanations' ),
				'negativeAlerts'     => array( 'Three negative or neutral reviews remain unanswered', 'Billing callback concern needs escalation' ),
				'reputationScore'    => 88,
				'recommendedActions' => array( 'Respond to unanswered reviews within 24 hours', 'Escalate billing callback complaint', 'Ask happy patients for photo-supported reviews' ),
				'executiveSummary'   => __( 'Review volume increased 12% this month. Three negative or neutral reviews remain unanswered. Addressing them within 24 hours could improve reputation momentum and reduce conversion friction.', 'apex-local-seo' ),
			),
			'sentiment'      => array(
				'positive'          => 142,
				'neutral'           => 29,
				'negative'          => 15,
				'weeklyComparison'  => '+8% positive',
				'monthlyComparison' => '+12% review volume',
				'trend'             => array( 62, 66, 70, 68, 74, 79, 82 ),
			),
			'reputation'     => array(
				'currentScore'      => 88,
				'previousScore'     => 84,
				'trend'             => '+4',
				'industryBenchmark' => 82,
				'opportunities'     => array( 'Reply to three unanswered reviews', 'Reduce average response time below six hours', 'Request reviews for cosmetic services' ),
			),
			'analytics'      => array(
				'reviewsPerMonth'    => array( 12, 16, 18, 15, 21, 24 ),
				'averageRating'      => array( 4.5, 4.6, 4.7, 4.6, 4.8, 4.8 ),
				'responseRate'       => array( 64, 69, 72, 76, 80, 82 ),
				'responseTime'       => array( 18, 16, 13, 12, 10, 9 ),
				'ratingDistribution' => array(
					5 => 138,
					4 => 28,
					3 => 11,
					2 => 6,
					1 => 3,
				),
			),
			'filters'        => array( 'All', 'Answered', 'Unanswered', 'Positive', 'Neutral', 'Negative', 'Newest', 'Oldest', 'Highest Rating', 'Lowest Rating' ),
			'replyAssistant' => array( 'Draft Reply', 'Rewrite Reply', 'Friendly', 'Professional', 'Empathetic', 'Escalate' ),
		);
	}

	/**
	 * Schema module.
	 */
	private function schema_module() {
		return array(
			'summary'             => array(
				'overallHealthScore'  => 91,
				'totalSchemaTypes'    => 22,
				'validSchema'         => 18,
				'warnings'            => 3,
				'errors'              => 1,
				'richResultsEligible' => 14,
				'lastValidation'      => current_time( 'mysql' ),
				'advisorSchemaScore'  => 94,
			),
			'businessInformation' => array(
				'businessName'            => 'Apex Sample Dental Studio',
				'schemaSubtype'           => 'Dentist',
				'address'                 => '401 E Jackson St, Tampa, FL 33602, US',
				'phone'                   => '(813) 555-0198',
				'website'                 => 'https://apexdigital.design/apex-local-seo',
				'email'                   => 'hello@apexdigital.design',
				'openingHours'            => array( 'Mo-Fr 08:00-18:00', 'Sa 09:00-13:00' ),
				'holidayHours'            => array( 'Independence Day: 09:00-12:00' ),
				'latitude'                => '27.9475',
				'longitude'               => '-82.4584',
				'serviceAreas'            => array( 'Tampa', 'Brandon', 'Riverview', 'Temple Terrace' ),
				'priceRange'              => '$$',
				'paymentMethods'          => array( 'Cash', 'Credit Card', 'Insurance Financing' ),
				'logo'                    => APLS_PLUGIN_URL . 'assets/branding/apex-local-seo-icon-128.png',
				'socialProfiles'          => array( 'https://apexdigital.design', 'https://apexdigital.design/apex-local-seo' ),
				'googleMapsUrl'           => 'https://maps.google.com/?q=Apex+Sample+Dental+Studio',
				'googleBusinessProfileId' => 'locations/1234567890',
			),
			'locations'           => array(
				array(
					'name'          => 'Downtown Tampa',
					'schemaSubtype' => 'Dentist',
					'status'        => 'Valid',
					'health'        => 91,
				),
			),
			'schemaTypes'         => array(
				'core'          => array( 'LocalBusiness', 'Organization', 'WebSite', 'WebPage', 'BreadcrumbList' ),
				'localBusiness' => array( 'Dentist', 'MedicalClinic', 'Physician', 'Chiropractor', 'Plumber', 'HVACBusiness', 'Electrician', 'RoofingContractor', 'Locksmith', 'Restaurant', 'Attorney', 'RealEstateAgent', 'InsuranceAgency', 'AutoRepair', 'Hotel', 'Spa', 'Salon', 'FinancialService', 'Contractor' ),
				'advanced'      => array( 'Review', 'AggregateRating', 'FAQ', 'Service', 'Product', 'Event', 'VideoObject', 'SearchAction', 'Offer', 'ImageObject' ),
				'nested'        => array( 'AggregateRating inside Dentist', 'Review inside Dentist', 'Offer inside Service', 'ImageObject inside Organization', 'SearchAction inside WebSite' ),
			),
			'validation'          => array(
				'status'              => 'Warnings',
				'warnings'            => array( 'Missing sameAs profile for YouTube', 'Holiday hours need confirmation', 'One service lacks Offer details' ),
				'errors'              => array( 'Geo coordinates missing from one service-area location' ),
				'missingProperties'   => array( 'geo.latitude', 'geo.longitude', 'hasOfferCatalog.itemListElement.offers' ),
				'richResultsEligible' => array( 'Local business', 'Review snippet', 'FAQ', 'Breadcrumb', 'Sitelinks search box' ),
			),
			'advisor'             => array(
				array(
					'priority' => 'High',
					'issue'    => 'Missing geo for service-area location',
					'reason'   => 'Your secondary service-area location is missing latitude and longitude. Adding coordinates helps search engines associate the location with nearby searches.',
					'action'   => 'Add latitude and longitude for the service-area schema record.',
					'benefit'  => 'High local search confidence improvement',
				),
				array(
					'priority' => 'High',
					'issue'    => 'Service offers incomplete',
					'reason'   => 'Several services are listed without Offer details. Offers help search engines understand buyer intent and availability.',
					'action'   => 'Add offer names, price ranges, and eligible service areas for priority services.',
					'benefit'  => 'Improves service relevance and rich result completeness',
				),
				array(
					'priority' => 'Medium',
					'issue'    => 'Holiday hours need validation',
					'reason'   => 'Holiday hours reduce customer confusion and help search engines avoid outdated opening-hour signals.',
					'action'   => 'Confirm holiday hours before the next seasonal search spike.',
					'benefit'  => 'Improves trust and local conversion confidence',
				),
				array(
					'priority' => 'Normal',
					'issue'    => 'Add more social profiles',
					'reason'   => 'sameAs profiles help connect your business entity across trusted external platforms.',
					'action'   => 'Add YouTube and professional association profiles when available.',
					'benefit'  => 'Moderate entity authority improvement',
				),
			),
			'templates'           => array( 'Medical', 'Dental', 'Restaurant', 'Law Firm', 'HVAC', 'Roofing', 'Plumbing', 'Electrician', 'Automotive', 'Insurance', 'Salon', 'Spa', 'Real Estate', 'Hotel', 'Financial Services' ),
			'pluginDetection'     => array(
				array(
					'plugin'    => 'WooCommerce',
					'status'    => 'Not detected',
					'extension' => 'Product and Offer schema',
				),
				array(
					'plugin'    => 'The Events Calendar',
					'status'    => 'Not detected',
					'extension' => 'Event schema',
				),
				array(
					'plugin'    => 'Appointment Booking',
					'status'    => 'Detected',
					'extension' => 'Service and booking action schema',
				),
				array(
					'plugin'    => 'LearnDash',
					'status'    => 'Not detected',
					'extension' => 'Course schema',
				),
			),
		);
	}

	/**
	 * Performance.
	 */
	private function performance() {
		return array(
			'last7'   => array(
				'calls'             => 34,
				'websiteClicks'     => 81,
				'directionRequests' => 23,
				'searchViews'       => 3120,
				'mapsViews'         => 2110,
				'photoViews'        => 880,
			),
			'last30'  => $this->summary()['metrics30'],
			'last90'  => array(
				'calls'             => 384,
				'websiteClicks'     => 918,
				'directionRequests' => 281,
				'searchViews'       => 36640,
				'mapsViews'         => 28420,
				'photoViews'        => 11280,
			),
			'daily'   => array(
				array(
					'label'      => 'Jul 1',
					'searches'   => 620,
					'calls'      => 14,
					'clicks'     => 41,
					'directions' => 12,
				),
				array(
					'label'      => 'Jul 2',
					'searches'   => 710,
					'calls'      => 19,
					'clicks'     => 47,
					'directions' => 11,
				),
				array(
					'label'      => 'Jul 3',
					'searches'   => 690,
					'calls'      => 16,
					'clicks'     => 39,
					'directions' => 15,
				),
				array(
					'label'      => 'Jul 4',
					'searches'   => 760,
					'calls'      => 21,
					'clicks'     => 55,
					'directions' => 18,
				),
				array(
					'label'      => 'Jul 5',
					'searches'   => 840,
					'calls'      => 24,
					'clicks'     => 63,
					'directions' => 20,
				),
				array(
					'label'      => 'Jul 6',
					'searches'   => 910,
					'calls'      => 27,
					'clicks'     => 70,
					'directions' => 22,
				),
				array(
					'label'      => 'Jul 7',
					'searches'   => 980,
					'calls'      => 31,
					'clicks'     => 77,
					'directions' => 25,
				),
			),
			'weekly'  => array( 62, 68, 71, 76, 82, 87, 91, 96 ),
			'monthly' => array( 54, 59, 63, 67, 73, 78, 84, 88 ),
		);
	}

	/**
	 * Photos.
	 */
	private function photos() {
		return array(
			'total'          => 94,
			'newThisMonth'   => 12,
			'views'          => 4200,
			'competitorGap'  => 31,
			'recommendation' => __( 'Add team and exterior photos this week.', 'apex-local-seo' ),
		); }
	/**
	 * Posts.
	 */
	private function posts() {
		return array(
			'published'  => 8,
			'drafts'     => 2,
			'lastPosted' => '2026-07-01',
			'engagement' => 312,
			'nextAction' => __( 'Publish a weekly offer post.', 'apex-local-seo' ),
		); }
	/**
	 * Questions.
	 */
	private function questions() {
		return array(
			'answered'     => 14,
			'unanswered'   => 3,
			'responseRate' => 82,
			'nextAction'   => __( 'Answer three public questions.', 'apex-local-seo' ),
		); }
	/**
	 * Citations.
	 */
	private function citations() {
		return array(
			'score'        => 86,
			'consistent'   => 74,
			'missing'      => 9,
			'inconsistent' => 6,
		); }

	/**
	 * Citation module.
	 */
	private function citation_module() {
		return array(
			'summary'              => array(
				'citationHealthScore'       => 91,
				'totalCitations'            => 128,
				'consistentCitations'       => 117,
				'inconsistentCitations'     => 6,
				'missingCitations'          => 9,
				'duplicateListings'         => 2,
				'localAuthorityScore'       => 84,
				'estimatedVisibilityImpact' => '+6%',
			),
			'executiveSummary'     => array(
				'briefing'                    => __( 'Citation consistency is 91%. Three high-authority directories contain outdated information. Fixing these issues is estimated to improve local trust signals and increase Local Visibility by approximately 6%. Two important industry directories are still missing.', 'apex-local-seo' ),
				'priority'                    => __( 'High', 'apex-local-seo' ),
				'consistency'                 => '91%',
				'highAuthorityIssues'         => 3,
				'missingImportantDirectories' => 2,
				'estimatedLift'               => '+6%',
			),
			'napConsistency'       => array(
				'overall'      => 91,
				'businessName' => array(
					'score' => 98,
					'note'  => __( 'Business name is consistent across nearly all indexed listings.', 'apex-local-seo' ),
				),
				'address'      => array(
					'score' => 94,
					'note'  => __( 'Suite formatting differs on two secondary directories.', 'apex-local-seo' ),
				),
				'phone'        => array(
					'score' => 89,
					'note'  => __( 'Yelp and one aggregator use an older tracking number.', 'apex-local-seo' ),
				),
				'website'      => array(
					'score' => 96,
					'note'  => __( 'Canonical website URL is consistent on priority directories.', 'apex-local-seo' ),
				),
				'categories'   => array(
					'score' => 84,
					'note'  => __( 'Several directories omit cosmetic and emergency dental categories.', 'apex-local-seo' ),
				),
				'hours'        => array(
					'score' => 86,
					'note'  => __( 'Weekend hours need confirmation on Apple and Facebook.', 'apex-local-seo' ),
				),
				'mismatches'   => array( 'Yelp phone number does not match Google Business Profile.', 'Apple Maps Saturday hours are outdated.', 'Facebook category does not include Emergency dental service.' ),
			),
			'directories'          => array(
				array(
					'directory'          => 'Google Business Profile',
					'status'             => 'Consistent',
					'authority'          => 100,
					'accuracy'           => 99,
					'trustScore'         => 98,
					'lastUpdated'        => '2026-07-07',
					'advisorPriority'    => 'Monitor',
					'estimatedSeoImpact' => '+0',
				),
				array(
					'directory'          => 'Yelp',
					'status'             => 'Inconsistent',
					'authority'          => 94,
					'accuracy'           => 82,
					'trustScore'         => 76,
					'lastUpdated'        => '2026-06-21',
					'advisorPriority'    => 'High',
					'estimatedSeoImpact' => '-4 authority',
				),
				array(
					'directory'          => 'Apple Maps',
					'status'             => 'Inconsistent',
					'authority'          => 92,
					'accuracy'           => 86,
					'trustScore'         => 81,
					'lastUpdated'        => '2026-06-18',
					'advisorPriority'    => 'High',
					'estimatedSeoImpact' => '-3 visibility',
				),
				array(
					'directory'          => 'Bing Places',
					'status'             => 'Consistent',
					'authority'          => 87,
					'accuracy'           => 96,
					'trustScore'         => 91,
					'lastUpdated'        => '2026-07-02',
					'advisorPriority'    => 'Normal',
					'estimatedSeoImpact' => '+1',
				),
				array(
					'directory'          => 'Facebook',
					'status'             => 'Inconsistent',
					'authority'          => 89,
					'accuracy'           => 84,
					'trustScore'         => 79,
					'lastUpdated'        => '2026-05-30',
					'advisorPriority'    => 'Medium',
					'estimatedSeoImpact' => '-2 trust',
				),
				array(
					'directory'          => 'Healthgrades',
					'status'             => 'Missing',
					'authority'          => 88,
					'accuracy'           => 0,
					'trustScore'         => 0,
					'lastUpdated'        => 'Not listed',
					'advisorPriority'    => 'High',
					'estimatedSeoImpact' => '+5 visibility',
				),
				array(
					'directory'          => 'Zocdoc',
					'status'             => 'Missing',
					'authority'          => 82,
					'accuracy'           => 0,
					'trustScore'         => 0,
					'lastUpdated'        => 'Not listed',
					'advisorPriority'    => 'High',
					'estimatedSeoImpact' => '+4 bookings',
				),
				array(
					'directory'          => 'Nextdoor',
					'status'             => 'Consistent',
					'authority'          => 78,
					'accuracy'           => 93,
					'trustScore'         => 87,
					'lastUpdated'        => '2026-06-27',
					'advisorPriority'    => 'Normal',
					'estimatedSeoImpact' => '+1',
				),
			),
			'advisor'              => array(
				array(
					'directory'                 => 'Yelp',
					'issue'                     => __( 'Phone number does not match Google Business Profile.', 'apex-local-seo' ),
					'potentialImpact'           => __( 'Lower local trust signals because a high-authority citation shows conflicting contact information.', 'apex-local-seo' ),
					'estimatedVisibilityImpact' => '-4 Local Authority Points',
					'recommendedAction'         => __( 'Update Yelp to use (813) 555-0198 and remove the old tracking number.', 'apex-local-seo' ),
					'estimatedBenefit'          => '+5 Local Visibility Points',
					'priority'                  => 'High',
				),
				array(
					'directory'                 => 'Apple Maps',
					'issue'                     => __( 'Saturday hours do not match the provider business profile.', 'apex-local-seo' ),
					'potentialImpact'           => __( 'Customers may see outdated availability in map results, reducing confidence before calls or directions.', 'apex-local-seo' ),
					'estimatedVisibilityImpact' => '-3 Local Trust Points',
					'recommendedAction'         => __( 'Update Apple Business Connect with Saturday 9:00 AM-1:00 PM hours.', 'apex-local-seo' ),
					'estimatedBenefit'          => '+4 Local Visibility Points',
					'priority'                  => 'High',
				),
				array(
					'directory'                 => 'Healthgrades',
					'issue'                     => __( 'A high-authority dental citation is missing.', 'apex-local-seo' ),
					'potentialImpact'           => __( 'Competitors have coverage on healthcare-specific directories where patients compare providers.', 'apex-local-seo' ),
					'estimatedVisibilityImpact' => '-5 Industry Coverage Points',
					'recommendedAction'         => __( 'Create a complete Healthgrades profile with matching NAP, services, photos, and appointment URL.', 'apex-local-seo' ),
					'estimatedBenefit'          => '+6 Local Visibility Points',
					'priority'                  => 'High',
				),
				array(
					'directory'                 => 'Facebook',
					'issue'                     => __( 'Primary category is too broad for emergency dental searches.', 'apex-local-seo' ),
					'potentialImpact'           => __( 'Category mismatch weakens service relevance across local entity signals.', 'apex-local-seo' ),
					'estimatedVisibilityImpact' => '-2 Relevance Points',
					'recommendedAction'         => __( 'Add Cosmetic dentist and Emergency dental service as supporting categories where available.', 'apex-local-seo' ),
					'estimatedBenefit'          => '+3 Local Visibility Points',
					'priority'                  => 'Medium',
				),
			),
			'opportunities'        => array(
				'highAuthority'    => array(
					array(
						'directory'        => 'Healthgrades',
						'estimatedBenefit' => '+6 visibility',
					),
					array(
						'directory'        => 'Zocdoc',
						'estimatedBenefit' => '+4 booking intent',
					),
					array(
						'directory'        => 'Vitals',
						'estimatedBenefit' => '+3 healthcare trust',
					),
				),
				'industrySpecific' => array(
					array(
						'directory'        => 'DentalPlans.com',
						'estimatedBenefit' => '+3 dental relevance',
					),
					array(
						'directory'        => 'CareDash',
						'estimatedBenefit' => '+2 provider discovery',
					),
				),
				'locationSpecific' => array(
					array(
						'directory'        => 'Tampa Bay Chamber',
						'estimatedBenefit' => '+3 local authority',
					),
					array(
						'directory'        => 'Visit Tampa Bay Business Directory',
						'estimatedBenefit' => '+2 local entity trust',
					),
				),
			),
			'categories'           => array(
				array(
					'name'     => 'General',
					'coverage' => 96,
					'priority' => 'Monitor',
				),
				array(
					'name'     => 'Medical',
					'coverage' => 74,
					'priority' => 'High',
				),
				array(
					'name'     => 'Legal',
					'coverage' => 0,
					'priority' => 'Not applicable',
				),
				array(
					'name'     => 'Restaurant',
					'coverage' => 0,
					'priority' => 'Not applicable',
				),
				array(
					'name'     => 'Home Services',
					'coverage' => 0,
					'priority' => 'Not applicable',
				),
				array(
					'name'     => 'Automotive',
					'coverage' => 0,
					'priority' => 'Not applicable',
				),
				array(
					'name'     => 'Financial',
					'coverage' => 0,
					'priority' => 'Not applicable',
				),
				array(
					'name'     => 'Hospitality',
					'coverage' => 0,
					'priority' => 'Not applicable',
				),
				array(
					'name'     => 'Beauty',
					'coverage' => 0,
					'priority' => 'Not applicable',
				),
				array(
					'name'     => 'Education',
					'coverage' => 28,
					'priority' => 'Low',
				),
				array(
					'name'     => 'Professional Services',
					'coverage' => 68,
					'priority' => 'Medium',
				),
			),
			'opportunityScore'     => array(
				'score'           => 87,
				'highestRoiFixes' => array( 'Fix Yelp phone number', 'Claim Healthgrades', 'Correct Apple Maps hours', 'Add emergency dental category to Facebook', 'Claim Zocdoc' ),
			),
			'competitorComparison' => array(
				'yourCitations'        => 128,
				'competitorCitations'  => 144,
				'authorityGap'         => '-7',
				'consistencyGap'       => '+5',
				'coverageGap'          => '16 listings',
				'missingOpportunities' => array( 'Healthgrades', 'Zocdoc', 'Vitals', 'Tampa Bay Chamber', 'DentalPlans.com' ),
			),
			'visualizations'       => array(
				'citationGrowth'        => array( 98, 104, 111, 119, 124, 128 ),
				'consistencyTrend'      => array( 82, 84, 86, 88, 90, 91 ),
				'authorityTrend'        => array( 72, 74, 77, 79, 82, 84 ),
				'directoryDistribution' => array( 42, 24, 19, 14, 9, 7 ),
				'industryCoverage'      => array( 96, 74, 68, 28, 12, 9 ),
			),
		);
	}

	/**
	 * Rankings.
	 */
	private function rankings() {
		return array(
			'visibilityScore' => 78,
			'mapPackKeywords' => 12,
			'top3'            => 7,
			'opportunities'   => 5,
			'averagePosition' => 2.4,
			'trend'           => '+12%',
		); }
	/**
	 * Competitors.
	 */
	private function competitors() {
		return array(
			'tracked'      => 5,
			'reviewGap'    => 42,
			'photoGap'     => 31,
			'categoryGap'  => 2,
			'leader'       => 'BrightSmile Tampa',
			'yourPosition' => 2,
		); }
	/**
	 * Audit.
	 */
	private function audit() {
		return array(
			'score'         => 84,
			'schema'        => 'ready',
			'landingPages'  => 6,
			'internalLinks' => 22,
		); }

	/**
	 * Gbp module.
	 */
	private function gbp_module() {
		return array(
			'businessInformation' => array(
				'businessName'         => 'Apex Sample Dental Studio',
				'primaryCategory'      => __( 'Dental clinic', 'apex-local-seo' ),
				'additionalCategories' => array( __( 'Cosmetic dentist', 'apex-local-seo' ), __( 'Emergency dental service', 'apex-local-seo' ), __( 'Teeth whitening service', 'apex-local-seo' ) ),
				'address'              => '401 E Jackson St, Tampa, FL 33602, US',
				'phone'                => '(813) 555-0198',
				'website'              => 'https://apexdigital.design/apex-local-seo',
				'description'          => __( 'High-trust local practice profile used for Apex Local SEO demo data.', 'apex-local-seo' ),
				'openingStatus'        => __( 'Open - normal hours', 'apex-local-seo' ),
				'hours'                => array( 'Mon-Fri 8:00 AM-6:00 PM', 'Sat 9:00 AM-1:00 PM', 'Sun Closed' ),
				'serviceAreas'         => array( 'Tampa', 'Brandon', 'Riverview', 'Temple Terrace' ),
				'attributes'           => array( __( 'Wheelchair accessible', 'apex-local-seo' ), __( 'Appointment required', 'apex-local-seo' ), __( 'Accepts new patients', 'apex-local-seo' ) ),
			),
			'profileHealth'       => array(
				'completenessScore'  => 92,
				'verificationStatus' => __( 'Verified', 'apex-local-seo' ),
				'missingInformation' => array( __( 'Holiday hours', 'apex-local-seo' ), __( 'Booking URL', 'apex-local-seo' ) ),
				'missingCategories'  => array( __( 'Pediatric dentist', 'apex-local-seo' ) ),
				'missingServices'    => 4,
				'missingPhotos'      => array( __( 'Interior waiting room', 'apex-local-seo' ), __( 'Team photos', 'apex-local-seo' ) ),
				'missingAttributes'  => array( __( 'Online care', 'apex-local-seo' ) ),
			),
			'services'            => array(
				'categories'            => array( __( 'Preventive Care', 'apex-local-seo' ), __( 'Cosmetic Dentistry', 'apex-local-seo' ), __( 'Emergency Dentistry', 'apex-local-seo' ) ),
				'items'                 => array( 'Teeth cleaning', 'Dental implants', 'Emergency exam', 'Teeth whitening', 'Veneers', 'Invisalign consultation' ),
				'count'                 => 18,
				'missingServices'       => 4,
				'recentlyAddedServices' => array( 'Same-day crown consultation', 'Emergency tooth repair' ),
			),
			'products'            => array(
				'count'                => 6,
				'featured'             => array( 'Whitening Kit', 'Night Guard', 'Smile Design Consultation' ),
				'missingProductImages' => 2,
				'health'               => 78,
			),
			'photos'              => array(
				'total'          => 94,
				'newPhotos'      => 12,
				'ownerPhotos'    => 61,
				'customerPhotos' => 33,
				'photoViews'     => 4200,
				'freshnessScore' => 81,
			),
			'posts'               => array(
				'active'           => 3,
				'scheduled'        => 2,
				'expired'          => 5,
				'latestPost'       => __( 'Summer whitening consultation offer', 'apex-local-seo' ),
				'postingFrequency' => __( 'Weekly', 'apex-local-seo' ),
			),
			'questions'           => array(
				'total'              => 17,
				'awaitingResponse'   => 3,
				'recentlyAnswered'   => 5,
				'suggestedResponses' => array( __( 'Explain emergency appointment availability.', 'apex-local-seo' ), __( 'Clarify insurance and payment options.', 'apex-local-seo' ) ),
			),
			'performance'         => array(
				'searches'          => 12840,
				'views'             => 22160,
				'websiteClicks'     => 342,
				'phoneCalls'        => 128,
				'directionRequests' => 96,
				'bookingClicks'     => 44,
			),
			'recommendations'     => array(
				array(
					'priority' => 'high',
					'title'    => __( 'Add more interior photos to improve appointment trust.', 'apex-local-seo' ),
				),
				array(
					'priority' => 'high',
					'title'    => __( 'Update holiday hours before the next local search spike.', 'apex-local-seo' ),
				),
				array(
					'priority' => 'medium',
					'title'    => __( 'Publish a Google Post for this week\'s strongest service offer.', 'apex-local-seo' ),
				),
				array(
					'priority' => 'medium',
					'title'    => __( 'Complete four missing services across cosmetic and emergency categories.', 'apex-local-seo' ),
				),
				array(
					'priority' => 'normal',
					'title'    => __( 'Respond to three unanswered public questions.', 'apex-local-seo' ),
				),
			),
		);
	}

	/**
	 * Keywords.
	 */
	private function keywords() {
		return array(
			array(
				'keyword'  => 'emergency dentist tampa',
				'position' => 1,
				'change'   => '+2',
				'intent'   => 'High',
			),
			array(
				'keyword'  => 'cosmetic dentist near me',
				'position' => 2,
				'change'   => '+1',
				'intent'   => 'High',
			),
			array(
				'keyword'  => 'teeth whitening tampa',
				'position' => 3,
				'change'   => '0',
				'intent'   => 'Medium',
			),
			array(
				'keyword'  => 'dental implants tampa fl',
				'position' => 5,
				'change'   => '+3',
				'intent'   => 'High',
			),
			array(
				'keyword'  => 'family dentist downtown tampa',
				'position' => 4,
				'change'   => '-1',
				'intent'   => 'Medium',
			),
		);
	}

	/**
	 * Activity.
	 */
	private function activity() {
		return array(
			array(
				'time'  => '09:20',
				'label' => __( 'New five-star review imported from Google.', 'apex-local-seo' ),
				'type'  => 'review',
			),
			array(
				'time'  => '10:05',
				'label' => __( 'Citation audit found two high-priority directory fixes.', 'apex-local-seo' ),
				'type'  => 'citation',
			),
			array(
				'time'  => '11:40',
				'label' => __( 'Map Pack visibility improved for emergency dentist tampa.', 'apex-local-seo' ),
				'type'  => 'ranking',
			),
			array(
				'time'  => '13:15',
				'label' => __( 'Executive Advisor generated a photo freshness recommendation.', 'apex-local-seo' ),
				'type'  => 'advisor',
			),
		);
	}

	/**
	 * Scenarios.
	 */
	private function scenarios() {
		return array(
			array(
				'id'        => 'small-business',
				'label'     => __( 'Small business', 'apex-local-seo' ),
				'score'     => 74,
				'reviews'   => 42,
				'locations' => 1,
			),
			array(
				'id'        => 'medium-business',
				'label'     => __( 'Medium business', 'apex-local-seo' ),
				'score'     => 86,
				'reviews'   => 186,
				'locations' => 1,
			),
			array(
				'id'        => 'agency',
				'label'     => __( 'Agency portfolio', 'apex-local-seo' ),
				'score'     => 82,
				'reviews'   => 1240,
				'locations' => 14,
			),
			array(
				'id'        => 'multi-location',
				'label'     => __( 'Multi-location', 'apex-local-seo' ),
				'score'     => 79,
				'reviews'   => 680,
				'locations' => 6,
			),
			array(
				'id'        => 'low-review',
				'label'     => __( 'Low review count', 'apex-local-seo' ),
				'score'     => 61,
				'reviews'   => 12,
				'locations' => 1,
			),
			array(
				'id'        => 'poor-profile',
				'label'     => __( 'Poor SEO profile', 'apex-local-seo' ),
				'score'     => 42,
				'reviews'   => 19,
				'locations' => 1,
			),
			array(
				'id'        => 'excellent-profile',
				'label'     => __( 'Excellent SEO profile', 'apex-local-seo' ),
				'score'     => 94,
				'reviews'   => 540,
				'locations' => 3,
			),
		);
	}

	/**
	 * Advisor module.
	 */
	private function advisor_module() {
		return array(
			'summary'                 => array(
				'advisorHealthScore'         => 92,
				'criticalIssues'             => 2,
				'todaysOpportunities'        => 7,
				'estimatedVisibilityGain'    => '+9',
				'completedRecommendations'   => 14,
				'averageWeeklyImprovement'   => '+4.8%',
				'overallLocalAuthorityTrend' => '+7',
			),
			'dailyBrief'              => array(
				'greeting'             => __( 'Good Morning,', 'apex-local-seo' ),
				'businessName'         => 'Apex Sample Dental Studio',
				'summary'              => __( 'The business is gaining visibility, but today has a short list of high-leverage actions that can protect trust signals and defend against competitor review growth.', 'apex-local-seo' ),
				'sinceYesterday'       => array( 'Visibility increased 3.4%', 'Website clicks increased 8%', 'Map Pack visibility improved for emergency dentist tampa' ),
				'attention'            => array( 'Two unanswered Google reviews', 'Holiday hours missing', 'Yelp contains an outdated phone number', 'Competitor Smile Dental added 12 new reviews' ),
				'estimatedOpportunity' => '+9 Local Visibility Points',
				'estimatedWork'        => '18 minutes',
			),
			'priorityCenter'          => array(
				'critical' => array(
					$this->advisor_recommendation( 'Fix Yelp phone mismatch', 'Yelp still shows an outdated tracking number.', 'Conflicting phone data weakens local trust because Yelp is a high-authority citation source.', 'Patients may call the wrong number or lose confidence before booking.', 'Citation consistency and local authority signals decrease.', '+5 Local Visibility Points', '4 minutes', 'Update Citation', 'High' ),
					$this->advisor_recommendation( 'Reply to two unanswered reviews', 'Two recent Google reviews are still waiting for owner replies.', 'Response recency is one of the fastest reputation improvements available today.', 'Unanswered reviews make the practice look less attentive.', 'Review response rate and reputation momentum improve when replies are timely.', '+4 Local Visibility Points', '6 minutes', 'Open Reviews', 'High' ),
				),
				'high'     => array(
					$this->advisor_recommendation( 'Fix Holiday Hours', 'Holiday hours are missing.', 'Holiday hours help Google and customers understand exceptional opening times.', 'Customers may arrive during incorrect business hours.', 'Google Business Profile completeness decreases when holiday hours are incomplete.', '+3 Local Visibility Points', '2 minutes', 'Update Hours', 'High' ),
					$this->advisor_recommendation( 'Add FAQ schema for emergency appointments', 'Emergency appointment questions are not represented in FAQ schema.', 'FAQ schema helps search engines understand service availability and urgent intent.', 'Patients with urgent needs may not see answers before calling.', 'Structured data completeness and service relevance can improve.', '+3 Local Visibility Points', '5 minutes', 'Add FAQ Schema', 'Medium' ),
				),
				'medium'   => array(
					$this->advisor_recommendation( 'Publish a Google Post', 'No current offer post is scheduled for this week.', 'Fresh posts give searchers timely reasons to engage with the profile.', 'The practice misses a conversion prompt for whitening and emergency services.', 'Profile activity and engagement signals improve.', '+4 Engagement Points', '5 minutes', 'Draft Post', 'Medium' ),
					$this->advisor_recommendation( 'Add interior and team photos', 'Competitors have thirty-one more recent photos across comparable profiles.', 'Fresh photos improve appointment confidence and profile engagement.', 'New patients may choose a competitor with more visual trust signals.', 'Photo freshness and profile engagement can improve.', '+5 Trust Points', '12 minutes', 'Upload Photos', 'Medium' ),
				),
				'low'      => array(
					$this->advisor_recommendation( 'Add YouTube sameAs profile', 'Schema is missing a YouTube sameAs profile.', 'Entity links help connect the business across trusted external profiles.', 'Minor entity authority opportunity remains unclaimed.', 'Structured data entity confidence may improve.', '+1 Authority Point', '3 minutes', 'Add Profile', 'Low' ),
				),
			),
			'opportunityEngine'       => array(
				array(
					'title'                 => 'Reply to three reviews',
					'rankingImprovement'    => '+2 ranking confidence',
					'visibilityImprovement' => '+4 visibility',
					'estimatedTime'         => '6 minutes',
					'difficulty'            => 'Easy',
					'priority'              => 'Critical',
				),
				array(
					'title'                 => 'Fix citation inconsistencies',
					'rankingImprovement'    => '+3 local authority',
					'visibilityImprovement' => '+5 visibility',
					'estimatedTime'         => '4 minutes',
					'difficulty'            => 'Easy',
					'priority'              => 'Critical',
				),
				array(
					'title'                 => 'Publish a Google Post',
					'rankingImprovement'    => '+1 activity signal',
					'visibilityImprovement' => '+4 engagement',
					'estimatedTime'         => '5 minutes',
					'difficulty'            => 'Easy',
					'priority'              => 'Medium',
				),
				array(
					'title'                 => 'Add business photos',
					'rankingImprovement'    => '+2 trust signal',
					'visibilityImprovement' => '+5 trust',
					'estimatedTime'         => '12 minutes',
					'difficulty'            => 'Medium',
					'priority'              => 'Medium',
				),
				array(
					'title'                 => 'Add FAQ schema',
					'rankingImprovement'    => '+2 relevance',
					'visibilityImprovement' => '+3 visibility',
					'estimatedTime'         => '5 minutes',
					'difficulty'            => 'Medium',
					'priority'              => 'High',
				),
			),
			'crossModuleIntelligence' => array(
				array(
					'module' => 'Google Business Profile',
					'score'  => '92%',
					'signal' => 'Holiday hours and photos need attention',
				),
				array(
					'module' => 'Reviews',
					'score'  => '88%',
					'signal' => 'Two unanswered reviews are time-sensitive',
				),
				array(
					'module' => 'Schema',
					'score'  => '91%',
					'signal' => 'FAQ and service offer schema can improve relevance',
				),
				array(
					'module' => 'Citation Intelligence',
					'score'  => '91%',
					'signal' => 'Yelp phone mismatch is the top authority risk',
				),
				array(
					'module' => 'Diagnostics',
					'score'  => 'Pass',
					'signal' => 'Data layer healthy; Google sync should be reviewed when live data is incomplete',
				),
				array(
					'module' => 'Performance',
					'score'  => '+8%',
					'signal' => 'Website clicks improved since yesterday',
				),
				array(
					'module' => 'Profile Completeness',
					'score'  => '92%',
					'signal' => 'Missing holiday hours and booking URL',
				),
				array(
					'module' => 'Dashboard KPIs',
					'score'  => '88%',
					'signal' => 'Local visibility is trending upward',
				),
			),
			'timeline'                => array(
				'today'     => array( 'Reply to two Google reviews', 'Fix Yelp phone number', 'Add holiday hours' ),
				'week'      => array( 'Publish one Google Post', 'Upload team and interior photos', 'Add FAQ schema for emergency appointments' ),
				'month'     => array( 'Claim Healthgrades and Zocdoc', 'Complete missing services', 'Improve service descriptions' ),
				'completed' => array( 'Schema Manager validated', 'Citation Intelligence launched', 'GBP profile foundation stabilized' ),
				'upcoming'  => array( 'Competitor intelligence expansion', 'Rankings module production pass', 'Reports module planning' ),
				'missed'    => array( 'Weekend photo upload window missed', 'Last week had no offer post' ),
				'wins'      => array( 'Visibility increased 3.4%', 'Website clicks increased 8%', 'Citation consistency reached 91%' ),
			),
			'competitorSummary'       => array(
				array(
					'name'     => 'Smile Dental Tampa',
					'movement' => '+14 reviews / +3 photos / +2 categories',
					'impact'   => __( 'Higher response rate and recent review velocity may pressure local rankings if not answered today.', 'apex-local-seo' ),
				),
				array(
					'name'     => 'BrightSmile Tampa',
					'movement' => '+6 reviews / +8 photos',
					'impact'   => __( 'Photo freshness is stronger than yours and may improve appointment confidence.', 'apex-local-seo' ),
				),
				array(
					'name'     => 'Downtown Dental Care',
					'movement' => '+1 category / new emergency post',
					'impact'   => __( 'Competitor is reinforcing emergency intent where your profile already ranks well.', 'apex-local-seo' ),
				),
			),
			'executiveScore'          => array(
				'current'    => 92,
				'trend30'    => 88,
				'trend90'    => 81,
				'components' => array(
					array(
						'label' => 'Reviews',
						'score' => 88,
					),
					array(
						'label' => 'Schema',
						'score' => 91,
					),
					array(
						'label' => 'Citation Health',
						'score' => 91,
					),
					array(
						'label' => 'GBP Completeness',
						'score' => 92,
					),
					array(
						'label' => 'Photos',
						'score' => 81,
					),
					array(
						'label' => 'Categories',
						'score' => 86,
					),
					array(
						'label' => 'Posts',
						'score' => 78,
					),
					array(
						'label' => 'Authority',
						'score' => 84,
					),
					array(
						'label' => 'Technical Health',
						'score' => 94,
					),
					array(
						'label' => 'Diagnostics',
						'score' => 96,
					),
					array(
						'label' => 'Performance',
						'score' => 89,
					),
				),
			),
		);
	}

	/**
	 * Advisor recommendation.
	 *
	 * @param mixed $title Title.

	 * @param mixed $problem Problem.

	 * @param mixed $reason Reason.

	 * @param mixed $business_impact Business impact.

	 * @param mixed $seo_impact Seo impact.

	 * @param mixed $gain Gain.

	 * @param mixed $time Time.

	 * @param mixed $button Button.

	 * @param mixed $priority Priority.
	 */
	private function advisor_recommendation( $title, $problem, $reason, $business_impact, $seo_impact, $gain, $time, $button, $priority ) {
		return array(
			'title'                   => $title,
			'problem'                 => $problem,
			'reason'                  => $reason,
			'businessImpact'          => $business_impact,
			'seoImpact'               => $seo_impact,
			'estimatedVisibilityGain' => $gain,
			'estimatedTime'           => $time,
			'recommendedAction'       => $title,
			'actionButton'            => $button,
			'priority'                => $priority,
		);
	}

	/**
	 * Recommendations.
	 */
	private function recommendations() {
		return array(
			array(
				'priority' => 'high',
				'impact'   => '+9 visibility',
				'title'    => __( 'Respond to seven recent reviews awaiting owner replies.', 'apex-local-seo' ),
				'reason'   => __( 'Owner response rate is one of the fastest reputation improvements available this week.', 'apex-local-seo' ),
			),
			array(
				'priority' => 'high',
				'impact'   => '+6 conversions',
				'title'    => __( 'Improve citation consistency across top local directories.', 'apex-local-seo' ),
				'reason'   => __( 'Nine listings are missing and six contain inconsistent NAP details.', 'apex-local-seo' ),
			),
			array(
				'priority' => 'medium',
				'impact'   => '+4 engagement',
				'title'    => __( 'Publish a Google Post for this week\'s strongest service offer.', 'apex-local-seo' ),
				'reason'   => __( 'Posting cadence is healthy but no current offer is scheduled.', 'apex-local-seo' ),
			),
			array(
				'priority' => 'medium',
				'impact'   => '+5 trust',
				'title'    => __( 'Upload exterior, team, and treatment-room photos.', 'apex-local-seo' ),
				'reason'   => __( 'Competitors have thirty-one more recent photos across comparable profiles.', 'apex-local-seo' ),
			),
			array(
				'priority' => 'normal',
				'impact'   => '+3 relevance',
				'title'    => __( 'Add one secondary service category for cosmetic dentistry.', 'apex-local-seo' ),
				'reason'   => __( 'Keyword rankings show opportunity around high-intent cosmetic searches.', 'apex-local-seo' ),
			),
		);
	}
}
