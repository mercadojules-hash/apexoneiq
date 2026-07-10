<?php
/**
 * Apex Local SEO plugin file.
 *
 * @package Apex_Local_SEO
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; }

/**
 * APLS Services BusinessProfile Providers GoogleBusinessProfileProvider.
 */
class APLS_Services_BusinessProfile_Providers_GoogleBusinessProfileProvider implements APLS_Contracts_BusinessProfileProviderInterface {
	/**
	 * Client.
	 *
	 * @var mixed
	 */
	private $client;
	/**
	 * Repository.
	 *
	 * @var mixed
	 */
	private $repository;
	/**
	 * Oauth.
	 *
	 * @var mixed
	 */
	private $oauth;

	/**
	 * Construct.
	 *
	 * @param APLS_Services_Google_GoogleBusinessProfileClient $client Client.

	 * @param APLS_Data_Repositories_GbpRepository             $repository Repository.

	 * @param APLS_Services_Google_GoogleOAuthService          $oauth Oauth.
	 */
	public function __construct( APLS_Services_Google_GoogleBusinessProfileClient $client, APLS_Data_Repositories_GbpRepository $repository, APLS_Services_Google_GoogleOAuthService $oauth ) {
		$this->client     = $client;
		$this->repository = $repository;
		$this->oauth      = $oauth;
	}

	/**
	 * Id.
	 */
	public function id() {
		return 'google'; }
	/**
	 * Label.
	 */
	public function label() {
		return __( 'Google Provider', 'apex-local-seo' ); }

	/**
	 * Status.
	 */
	public function status() {
		return $this->client->health();
	}

	/**
	 * Diagnostics.
	 */
	public function diagnostics() {
		$status       = $this->status();
		$account      = $this->repository->connected_account();
		$trace        = get_transient( 'apls_gbp_last_request_trace' );
		$last_latency = $this->last_latency( (array) $trace );

		return array(
			$this->check( __( 'OAuth configured', 'apex-local-seo' ), ! empty( $status['configured'] ), $status['configured'] ? __( 'Configured', 'apex-local-seo' ) : __( 'Missing', 'apex-local-seo' ), __( 'Google OAuth credentials are required.', 'apex-local-seo' ), __( 'Client ID or secret is missing.', 'apex-local-seo' ), __( 'Enter credentials in Settings.', 'apex-local-seo' ), __( 'Connect button can create a Google authorization URL.', 'apex-local-seo' ) ),
			$this->check( __( 'OAuth connected', 'apex-local-seo' ), ! empty( $status['connected'] ), $status['connected'] ? __( 'Connected', 'apex-local-seo' ) : __( 'Not connected', 'apex-local-seo' ), __( 'Google has not been connected.', 'apex-local-seo' ), __( 'No connected account row is active.', 'apex-local-seo' ), __( 'Click Connect Google Account.', 'apex-local-seo' ), __( 'Dashboard can use Google account context.', 'apex-local-seo' ) ),
			$this->check( __( 'Refresh token available', 'apex-local-seo' ), ! empty( $account['refresh_token_encrypted'] ), ! empty( $account['refresh_token_encrypted'] ) ? __( 'Stored', 'apex-local-seo' ) : __( 'Missing', 'apex-local-seo' ), __( 'Long-running sync requires a refresh token.', 'apex-local-seo' ), __( 'Google did not return offline access or the account is disconnected.', 'apex-local-seo' ), __( 'Reconnect with consent prompt.', 'apex-local-seo' ), __( 'Tokens can refresh without reconnecting.', 'apex-local-seo' ) ),
			$this->check( __( 'Business Profile API access', 'apex-local-seo' ), true, __( 'Checked during sync', 'apex-local-seo' ), '', __( 'Google returns quota or permission details during sync requests.', 'apex-local-seo' ), __( 'Review Google Cloud API access if sync fails.', 'apex-local-seo' ), __( 'Account Management API returns HTTP 200.', 'apex-local-seo' ) ),
			$this->check( __( 'Last successful sync', 'apex-local-seo' ), ! empty( $status['summary']['connected'] ) && ! empty( $status['summary']['businessName'] ), $status['summary']['businessName'] ?? __( 'Pending', 'apex-local-seo' ), __( 'No live business profile has been imported.', 'apex-local-seo' ), __( 'Google sync has not completed.', 'apex-local-seo' ), __( 'Retry sync after Google API access is available.', 'apex-local-seo' ), __( 'Dashboard displays live Google data.', 'apex-local-seo' ) ),
			$this->check( __( 'API response latency', 'apex-local-seo' ), true, $last_latency, '', __( 'Measured from the latest request trace.', 'apex-local-seo' ), __( 'Review trace if latency is high.', 'apex-local-seo' ), __( 'Provider diagnostics show request health.', 'apex-local-seo' ) ),
			$this->check( __( 'Google account email', 'apex-local-seo' ), ! empty( $status['email'] ), ! empty( $status['email'] ) ? $status['email'] : __( 'Not available', 'apex-local-seo' ), __( 'Connected email is not stored.', 'apex-local-seo' ), __( 'OAuth callback did not persist account identity.', 'apex-local-seo' ), __( 'Reconnect Google Account.', 'apex-local-seo' ), __( 'Operator can identify the connected account.', 'apex-local-seo' ) ),
		);
	}

	/**
	 * Dashboard.
	 */
	public function dashboard() {
		$summary = $this->repository->dashboard_summary();
		$profile = $this->repository->location_profile();
		$photos  = $this->repository->media_summary();
		$reviews = $this->repository->recent_reviews( 6 );

		return array(
			'summary'         => $summary,
			'profile'         => $profile,
			'locations'       => array(),
			'reviews'         => $reviews,
			'reviewModule'    => $this->review_module( $summary, $reviews ),
			'schemaModule'    => $this->schema_module( $summary, $profile ),
			'citationModule'  => $this->citation_module( $summary, $profile ),
			'advisorModule'   => $this->advisor_module( $summary, $profile, $reviews ),
			'performance'     => array( 'last30' => $summary['metrics30'] ?? array() ),
			'photos'          => $photos,
			'posts'           => array(),
			'questions'       => array(),
			'gbpModule'       => $this->gbp_module( $summary, $profile, $photos ),
			'recommendations' => $this->repository->recommendations(),
			'citations'       => array(),
			'rankings'        => array(),
			'competitors'     => array(),
			'audit'           => array(),
		);
	}

	/**
	 * Sync.
	 */
	public function sync() {
		return $this->client->sync_locations();
	}

	/**
	 * Gbp module.
	 *
	 * @param mixed $summary Summary.

	 * @param mixed $profile Profile.

	 * @param mixed $photos Photos.
	 */
	private function gbp_module( $summary, $profile, $photos ) {
		$profile_data = $profile['profile'] ?? array();
		$metrics      = $summary['metrics30'] ?? array();

		return array(
			'businessInformation' => array(
				'businessName'         => $summary['businessName'] ?? ( $profile_data['businessName'] ?? '' ),
				'primaryCategory'      => $summary['primaryCategory'] ?? '',
				'additionalCategories' => $profile_data['categories'] ?? array(),
				'address'              => $profile_data['address'] ?? '',
				'phone'                => $profile_data['phone'] ?? '',
				'website'              => $profile_data['website'] ?? '',
				'description'          => $profile_data['description'] ?? '',
				'openingStatus'        => __( 'Imported from Google', 'apex-local-seo' ),
				'hours'                => array(),
				'serviceAreas'         => array(),
				'attributes'           => array(),
			),
			'profileHealth'       => array(
				'completenessScore'  => absint( $summary['profileCompleteness'] ?? 0 ),
				'verificationStatus' => ! empty( $profile_data['verified'] ) ? __( 'Verified', 'apex-local-seo' ) : __( 'Not verified', 'apex-local-seo' ),
				'missingInformation' => array(),
				'missingCategories'  => array(),
				'missingServices'    => 0,
				'missingPhotos'      => array(),
				'missingAttributes'  => array(),
			),
			'services'            => array(
				'categories'            => array(),
				'items'                 => array(),
				'count'                 => 0,
				'missingServices'       => 0,
				'recentlyAddedServices' => array(),
			),
			'products'            => array(
				'count'                => 0,
				'featured'             => array(),
				'missingProductImages' => 0,
				'health'               => 0,
			),
			'photos'              => array(
				'total'          => absint( $photos['photos'] ?? ( $photos['total'] ?? 0 ) ),
				'newPhotos'      => 0,
				'ownerPhotos'    => 0,
				'customerPhotos' => 0,
				'photoViews'     => absint( $metrics['photoViews'] ?? 0 ),
				'freshnessScore' => 0,
			),
			'posts'               => array(
				'active'           => 0,
				'scheduled'        => 0,
				'expired'          => 0,
				'latestPost'       => '',
				'postingFrequency' => __( 'Pending import', 'apex-local-seo' ),
			),
			'questions'           => array(
				'total'              => 0,
				'awaitingResponse'   => 0,
				'recentlyAnswered'   => 0,
				'suggestedResponses' => array(),
			),
			'performance'         => array(
				'searches'          => absint( $metrics['searchViews'] ?? 0 ),
				'views'             => absint( $metrics['searchViews'] ?? 0 ) + absint( $metrics['mapsViews'] ?? 0 ),
				'websiteClicks'     => absint( $metrics['websiteClicks'] ?? 0 ),
				'phoneCalls'        => absint( $metrics['calls'] ?? 0 ),
				'directionRequests' => absint( $metrics['directionRequests'] ?? 0 ),
				'bookingClicks'     => 0,
			),
			'recommendations'     => $this->repository->recommendations(),
		);
	}

	/**
	 * Review module.
	 *
	 * @param mixed $summary Summary.

	 * @param mixed $reviews Reviews.
	 */
	private function review_module( $summary, $reviews ) {
		$feed = array();
		foreach ( (array) $reviews as $review ) {
			$rating = (float) ( $review['rating'] ?? 0 );
			$feed[] = array(
				'customerName'    => $review['reviewer_name'] ?? __( 'Google reviewer', 'apex-local-seo' ),
				'rating'          => $rating,
				'reviewDate'      => $review['reviewed_at'] ?? '',
				'reviewText'      => $review['review_text'] ?? '',
				'source'          => 'Google',
				'responseStatus'  => $review['response_status'] ?? __( 'Unknown', 'apex-local-seo' ),
				'sentiment'       => $rating >= 4 ? __( 'Positive', 'apex-local-seo' ) : ( $rating >= 3 ? __( 'Neutral', 'apex-local-seo' ) : __( 'Negative', 'apex-local-seo' ) ),
				'advisorPriority' => $rating < 4 ? __( 'High', 'apex-local-seo' ) : __( 'Normal', 'apex-local-seo' ),
				'suggestedReply'  => __( 'Suggested reply prompts will appear here.', 'apex-local-seo' ),
			);
		}

		return array(
			'summary'        => array(
				'overallRating'       => (float) ( $summary['averageRating'] ?? 0 ),
				'totalReviews'        => absint( $summary['totalReviews'] ?? 0 ),
				'newReviews30'        => 0,
				'averageRatingTrend'  => '0',
				'responseRate'        => 0,
				'averageResponseTime' => __( 'Pending import', 'apex-local-seo' ),
			),
			'feed'           => $feed,
			'intelligence'   => array(
				'positiveTrends'     => array(),
				'negativeAlerts'     => array(),
				'reputationScore'    => absint( $summary['healthScore'] ?? 0 ),
				'recommendedActions' => array(),
				'executiveSummary'   => __( 'Live review intelligence will populate as Google review sync expands.', 'apex-local-seo' ),
			),
			'sentiment'      => array(
				'positive'          => 0,
				'neutral'           => 0,
				'negative'          => 0,
				'weeklyComparison'  => __( 'Pending import', 'apex-local-seo' ),
				'monthlyComparison' => __( 'Pending import', 'apex-local-seo' ),
				'trend'             => array(),
			),
			'reputation'     => array(
				'currentScore'      => absint( $summary['healthScore'] ?? 0 ),
				'previousScore'     => 0,
				'trend'             => '0',
				'industryBenchmark' => 0,
				'opportunities'     => array(),
			),
			'analytics'      => array(
				'reviewsPerMonth'    => array(),
				'averageRating'      => array(),
				'responseRate'       => array(),
				'responseTime'       => array(),
				'ratingDistribution' => array(
					5 => 0,
					4 => 0,
					3 => 0,
					2 => 0,
					1 => 0,
				),
			),
			'filters'        => array( 'All', 'Answered', 'Unanswered', 'Positive', 'Neutral', 'Negative', 'Newest', 'Oldest', 'Highest Rating', 'Lowest Rating' ),
			'replyAssistant' => array( 'Draft Reply', 'Rewrite Reply', 'Friendly', 'Professional', 'Empathetic', 'Escalate' ),
		);
	}

	/**
	 * Schema module.
	 *
	 * @param mixed $summary Summary.

	 * @param mixed $profile Profile.
	 */
	private function schema_module( $summary, $profile ) {
		$profile_data = $profile['profile'] ?? array();
		return array(
			'summary'             => array(
				'overallHealthScore'  => absint( $summary['optimizationScore'] ?? $summary['healthScore'] ?? 0 ),
				'totalSchemaTypes'    => 5,
				'validSchema'         => 0,
				'warnings'            => 0,
				'errors'              => 0,
				'richResultsEligible' => 0,
				'lastValidation'      => __( 'Pending validation', 'apex-local-seo' ),
				'advisorSchemaScore'  => absint( $summary['advisorHealthScore'] ?? 0 ),
			),
			'businessInformation' => array(
				'businessName'            => $summary['businessName'] ?? ( $profile_data['businessName'] ?? '' ),
				'schemaSubtype'           => $this->schema_subtype_from_category( $summary['primaryCategory'] ?? '' ),
				'address'                 => $profile_data['address'] ?? '',
				'phone'                   => $profile_data['phone'] ?? '',
				'website'                 => $profile_data['website'] ?? '',
				'email'                   => '',
				'openingHours'            => array(),
				'holidayHours'            => array(),
				'latitude'                => '',
				'longitude'               => '',
				'serviceAreas'            => array(),
				'priceRange'              => '',
				'paymentMethods'          => array(),
				'logo'                    => APLS_PLUGIN_URL . 'assets/branding/apex-local-seo-icon-128.png',
				'socialProfiles'          => array(),
				'googleMapsUrl'           => '',
				'googleBusinessProfileId' => '',
			),
			'locations'           => array(),
			'schemaTypes'         => array(
				'core'          => array( 'LocalBusiness', 'Organization', 'WebSite', 'WebPage', 'BreadcrumbList' ),
				'localBusiness' => array( 'Dentist', 'MedicalClinic', 'Physician', 'Chiropractor', 'Plumber', 'HVACBusiness', 'Electrician', 'RoofingContractor', 'Locksmith', 'Restaurant', 'Attorney', 'RealEstateAgent', 'InsuranceAgency', 'AutoRepair', 'Hotel', 'Spa', 'Salon', 'FinancialService', 'Contractor' ),
				'advanced'      => array( 'Review', 'AggregateRating', 'FAQ', 'Service', 'Product', 'Event', 'VideoObject', 'SearchAction', 'Offer', 'ImageObject' ),
				'nested'        => array(),
			),
			'validation'          => array(
				'status'              => __( 'Pending validation', 'apex-local-seo' ),
				'warnings'            => array(),
				'errors'              => array(),
				'missingProperties'   => array(),
				'richResultsEligible' => array(),
			),
			'advisor'             => array(
				array(
					'priority' => 'High',
					'issue'    => __( 'Complete schema validation after Google data is imported', 'apex-local-seo' ),
					'reason'   => __( 'Live schema validation needs complete business profile fields, including coordinates, hours, and service details.', 'apex-local-seo' ),
					'action'   => __( 'Run schema validation after the next successful Google sync.', 'apex-local-seo' ),
					'benefit'  => __( 'Improves structured data confidence and rich result readiness.', 'apex-local-seo' ),
				),
			),
			'templates'           => array( 'Medical', 'Dental', 'Restaurant', 'Law Firm', 'HVAC', 'Roofing', 'Plumbing', 'Electrician', 'Automotive', 'Insurance', 'Salon', 'Spa', 'Real Estate', 'Hotel', 'Financial Services' ),
			'pluginDetection'     => array(),
		);
	}

	/**
	 * Schema subtype from category.
	 *
	 * @param mixed $category Category.
	 */
	private function schema_subtype_from_category( $category ) {
		$category = strtolower( (string) $category );
		if ( false !== strpos( $category, 'dent' ) ) {
			return 'Dentist'; }
		if ( false !== strpos( $category, 'medical' ) ) {
			return 'MedicalClinic'; }
		if ( false !== strpos( $category, 'restaurant' ) ) {
			return 'Restaurant'; }
		if ( false !== strpos( $category, 'plumb' ) ) {
			return 'Plumber'; }
		if ( false !== strpos( $category, 'electric' ) ) {
			return 'Electrician'; }
		return 'LocalBusiness';
	}

	/**
	 * Citation module.
	 *
	 * @param mixed $summary Summary.

	 * @param mixed $profile Profile.
	 */
	private function citation_module( $summary, $profile ) {
		$profile_data = $profile['profile'] ?? array();
		$score        = absint( $summary['citationScore'] ?? 0 );

		return array(
			'summary'              => array(
				'citationHealthScore'       => $score,
				'totalCitations'            => 0,
				'consistentCitations'       => 0,
				'inconsistentCitations'     => 0,
				'missingCitations'          => 0,
				'duplicateListings'         => 0,
				'localAuthorityScore'       => absint( $summary['visibilityScore'] ?? 0 ),
				'estimatedVisibilityImpact' => __( 'Pending import', 'apex-local-seo' ),
			),
			'executiveSummary'     => array(
				'briefing'                    => __( 'Citation Intelligence uses the connected Google Business Profile as the canonical business record for name, address, phone, website, and category consistency checks.', 'apex-local-seo' ),
				'priority'                    => __( 'Pending', 'apex-local-seo' ),
				'consistency'                 => $score . '%',
				'highAuthorityIssues'         => 0,
				'missingImportantDirectories' => 0,
				'estimatedLift'               => __( 'Pending', 'apex-local-seo' ),
			),
			'napConsistency'       => array(
				'overall'      => $score,
				'businessName' => array(
					'score' => ! empty( $summary['businessName'] ) ? 100 : 0,
					'note'  => $summary['businessName'] ?? __( 'Business name pending import.', 'apex-local-seo' ),
				),
				'address'      => array(
					'score' => ! empty( $profile_data['address'] ) ? 100 : 0,
					'note'  => $profile_data['address'] ?? __( 'Address pending import.', 'apex-local-seo' ),
				),
				'phone'        => array(
					'score' => ! empty( $profile_data['phone'] ) ? 100 : 0,
					'note'  => $profile_data['phone'] ?? __( 'Phone pending import.', 'apex-local-seo' ),
				),
				'website'      => array(
					'score' => ! empty( $profile_data['website'] ) ? 100 : 0,
					'note'  => $profile_data['website'] ?? __( 'Website pending import.', 'apex-local-seo' ),
				),
				'categories'   => array(
					'score' => ! empty( $profile_data['categories'] ) ? 100 : 0,
					'note'  => implode( ', ', (array) ( $profile_data['categories'] ?? array() ) ),
				),
				'hours'        => array(
					'score' => 0,
					'note'  => __( 'Hours comparison will appear when directory records are available.', 'apex-local-seo' ),
				),
				'mismatches'   => array(),
			),
			'advisor'              => array(
				array(
					'directory'                 => __( 'Citation Records', 'apex-local-seo' ),
					'issue'                     => __( 'Directory comparison data is not available yet.', 'apex-local-seo' ),
					'potentialImpact'           => __( 'Apex can use Google Business Profile as canonical business data, then compare it against directory records as they are added.', 'apex-local-seo' ),
					'estimatedVisibilityImpact' => __( 'Pending', 'apex-local-seo' ),
					'recommendedAction'         => __( 'Review key directories such as Yelp, Apple Business Connect, Bing Places, Facebook, and industry directories for consistency.', 'apex-local-seo' ),
					'estimatedBenefit'          => __( 'Improves citation intelligence and directory monitoring quality.', 'apex-local-seo' ),
					'priority'                  => 'High',
				),
			),
			'directories'          => array(),
			'opportunities'        => array(),
			'categories'           => array(),
			'opportunityScore'     => array(
				'score'           => 0,
				'highestRoiFixes' => array(),
			),
			'competitorComparison' => array(),
			'visualizations'       => array(),
		);
	}

	/**
	 * Advisor module.
	 *
	 * @param mixed $summary Summary.

	 * @param mixed $profile Profile.

	 * @param mixed $reviews Reviews.
	 */
	private function advisor_module( $summary, $profile, $reviews ) {
		$recommendations = array();
		foreach ( (array) $this->repository->recommendations() as $recommendation ) {
			$title             = is_array( $recommendation ) ? ( $recommendation['title'] ?? __( 'Review provider recommendation', 'apex-local-seo' ) ) : (string) $recommendation;
			$recommendations[] = array(
				'title'                   => $title,
				'problem'                 => __( 'Provider-backed recommendation requires operator review.', 'apex-local-seo' ),
				'reason'                  => __( 'The Google Business Profile data shows a local search improvement opportunity that should be reviewed by the site owner.', 'apex-local-seo' ),
				'businessImpact'          => __( 'Acting on provider recommendations can improve local trust and conversion confidence.', 'apex-local-seo' ),
				'seoImpact'               => __( 'Improves local profile completeness and signal consistency.', 'apex-local-seo' ),
				'estimatedVisibilityGain' => __( 'Pending', 'apex-local-seo' ),
				'estimatedTime'           => __( '10 minutes', 'apex-local-seo' ),
				'recommendedAction'       => $title,
				'actionButton'            => __( 'Plan Action', 'apex-local-seo' ),
				'priority'                => 'High',
			);
		}

		return array(
			'summary'                 => array(
				'advisorHealthScore'         => absint( $summary['advisorHealthScore'] ?? $summary['healthScore'] ?? 0 ),
				'criticalIssues'             => 0,
				'todaysOpportunities'        => count( $recommendations ),
				'estimatedVisibilityGain'    => __( 'Pending', 'apex-local-seo' ),
				'completedRecommendations'   => 0,
				'averageWeeklyImprovement'   => __( 'Pending', 'apex-local-seo' ),
				'overallLocalAuthorityTrend' => __( 'Pending', 'apex-local-seo' ),
			),
			'dailyBrief'              => array(
				'greeting'             => __( 'Good Morning,', 'apex-local-seo' ),
				'businessName'         => $summary['businessName'] ?? '',
				'summary'              => __( 'Executive Advisor is using Google Business Profile data where available to prioritize the next local search improvements.', 'apex-local-seo' ),
				'sinceYesterday'       => array(),
				'attention'            => array( __( 'Run a Google Business Profile sync when data looks incomplete.', 'apex-local-seo' ) ),
				'estimatedOpportunity' => __( 'Pending', 'apex-local-seo' ),
				'estimatedWork'        => __( 'Pending', 'apex-local-seo' ),
			),
			'priorityCenter'          => array(
				'critical' => array(),
				'high'     => $recommendations,
				'medium'   => array(),
				'low'      => array(),
			),
			'opportunityEngine'       => array(),
			'crossModuleIntelligence' => array(
				array(
					'module' => 'Google Business Profile',
					'score'  => absint( $summary['profileCompleteness'] ?? 0 ) . '%',
					'signal' => __( 'Canonical provider data source.', 'apex-local-seo' ),
				),
				array(
					'module' => 'Reviews',
					'score'  => absint( $summary['totalReviews'] ?? 0 ),
					'signal' => __( 'Recent review feed imported where available.', 'apex-local-seo' ),
				),
				array(
					'module' => 'Performance',
					'score'  => absint( $summary['visibilityScore'] ?? 0 ),
					'signal' => __( 'Visibility score from provider dashboard summary.', 'apex-local-seo' ),
				),
			),
			'timeline'                => array(
				'today'     => array(),
				'week'      => array(),
				'month'     => array(),
				'completed' => array(),
				'upcoming'  => array(),
				'missed'    => array(),
				'wins'      => array(),
			),
			'competitorSummary'       => array(),
			'executiveScore'          => array(
				'current'    => absint( $summary['advisorHealthScore'] ?? $summary['healthScore'] ?? 0 ),
				'trend30'    => 0,
				'trend90'    => 0,
				'components' => array(
					array(
						'label' => 'Reviews',
						'score' => absint( $summary['totalReviews'] ?? 0 ) > 0 ? absint( $summary['healthScore'] ?? 0 ) : 0,
					),
					array(
						'label' => 'GBP Completeness',
						'score' => absint( $summary['profileCompleteness'] ?? 0 ),
					),
					array(
						'label' => 'Performance',
						'score' => absint( $summary['visibilityScore'] ?? 0 ),
					),
					array(
						'label' => 'Diagnostics',
						'score' => 90,
					),
				),
			),
		);
	}

	/**
	 * Check.
	 *
	 * @param mixed $label Label.

	 * @param mixed $passed Passed.

	 * @param mixed $value Value.

	 * @param mixed $problem Problem.

	 * @param mixed $reason Reason.

	 * @param mixed $resolution Resolution.

	 * @param mixed $expected Expected.
	 */
	private function check( $label, $passed, $value, $problem, $reason, $resolution, $expected ) {
		return array(
			'label'      => $label,
			'status'     => $passed ? 'pass' : 'warning',
			'value'      => $value,
			'problem'    => $passed ? '' : $problem,
			'reason'     => $reason,
			'resolution' => $resolution,
			'expected'   => $expected,
		);
	}

	/**
	 * Last latency.
	 *
	 * @param mixed $trace Trace.
	 */
	private function last_latency( $trace ) {
		$start = '';
		$end   = '';
		foreach ( $trace as $entry ) {
			if ( 'start' === ( $entry['event'] ?? '' ) && '' === $start ) {
				$start = $entry['time'] ?? ''; }
			if ( 'response' === ( $entry['event'] ?? '' ) ) {
				$end = $entry['time'] ?? ''; }
		}
		if ( ! $start || ! $end ) {
			return __( 'No request trace yet', 'apex-local-seo' ); }
		return human_time_diff( strtotime( $start ), strtotime( $end ) );
	}
}
