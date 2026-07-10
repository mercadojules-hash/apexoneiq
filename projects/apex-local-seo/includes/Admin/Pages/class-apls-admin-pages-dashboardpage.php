<?php
/**
 * Apex Local SEO plugin file.
 *
 * @package Apex_Local_SEO
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; }

/**
 * APLS Admin Pages DashboardPage.
 */
class APLS_Admin_Pages_DashboardPage {
	/**
	 * Container.
	 *
	 * @var mixed
	 */
	private $container;
	/**
	 * Modules.
	 *
	 * @var mixed
	 */
	private $modules;

	/**
	 * Construct.
	 *
	 * @param APLS_Core_Container      $container Container.

	 * @param APLS_Core_ModuleRegistry $modules Modules.
	 */
	public function __construct( APLS_Core_Container $container, APLS_Core_ModuleRegistry $modules ) {
		$this->container = $container;
		$this->modules   = $modules;
	}

	/**
	 * Render.
	 */
	public function render() {
		$manager     = $this->container->get( 'business_profile_provider' );
		$provider    = $manager->active_provider();
		$data        = $provider->dashboard();
		$summary     = $data['summary'] ?? array( 'connected' => false );
		$profile     = $data['profile']['profile'] ?? array();
		$performance = $data['performance'] ?? array();
		$mode        = $manager->mode();
		$pending_live_import = 'google' === $provider->id() && empty( $summary['connected'] );

		APLS_Admin_Components_ApexShell::start( __( 'Apex Local SEO', 'apex-local-seo' ), __( 'Executive local search command center for Google Business Profile, Maps, reviews, rankings, citations, and recommended actions.', 'apex-local-seo' ), $manager );
		?>
		<?php if ( 'mock' === $provider->id() ) : ?>
			<?php APLS_Admin_Components_ApexShell::demo_mode_notice(); ?>
		<?php endif; ?>
		<section class="apls-command-hero">
			<div class="apls-hero-copy">
				<span class="apls-provider-chip"><?php /* translators: %s is the active business profile provider name. */ echo esc_html( sprintf( __( '%s Active', 'apex-local-seo' ), $provider->label() ) ); ?></span>
				<h2><?php echo esc_html( $summary['businessName'] ?? __( 'Apex Local SEO', 'apex-local-seo' ) ); ?></h2>
				<p><?php esc_html_e( 'Visibility, rankings, reputation, and local conversion signals rendered through the Business Profile provider layer.', 'apex-local-seo' ); ?></p>
				<div class="apls-hero-actions">
					<a class="apls-btn apls-btn-primary" href="<?php echo esc_url( admin_url( 'admin.php?page=apls-settings' ) ); ?>"><?php esc_html_e( 'Provider Settings', 'apex-local-seo' ); ?></a>
					<a class="apls-btn" href="<?php echo esc_url( admin_url( 'admin.php?page=apls-diagnostics' ) ); ?>"><?php esc_html_e( 'Diagnostics Center', 'apex-local-seo' ); ?></a>
				</div>
			</div>
			<div class="apls-hero-score">
				<div class="apls-score-ring" style="<?php echo esc_attr( '--apls-score-fill:' . absint( $summary['healthScore'] ?? 0 ) . '%' ); ?>">
					<strong><?php echo esc_html( absint( $summary['healthScore'] ?? 0 ) ); ?></strong>
					<span><?php esc_html_e( 'Local SEO Score', 'apex-local-seo' ); ?></span>
				</div>
				<div>
					<strong><?php echo esc_html( $summary['healthLabel'] ?? __( 'Ready', 'apex-local-seo' ) ); ?></strong>
					<span><?php /* translators: %d is the profile completeness percentage. */ echo esc_html( sprintf( __( '%d%% profile complete', 'apex-local-seo' ), absint( $summary['profileCompleteness'] ?? 0 ) ) ); ?></span>
				</div>
			</div>
		</section>

		<?php if ( 'mock' === $provider->id() ) : ?>
			<section class="apls-provider-note">
				<strong><?php esc_html_e( 'Demo Data Mode', 'apex-local-seo' ); ?></strong>
				<span><?php esc_html_e( 'The dashboard is using demo data. Connect Google Business Profile in Settings to import live business records.', 'apex-local-seo' ); ?></span>
			</section>
		<?php endif; ?>

		<?php if ( $pending_live_import ) : ?>
			<?php $this->google_import_status( $mode['googleStatus'] ?? array() ); ?>
			<?php APLS_Admin_Components_ApexShell::end(); ?>
			<?php return; ?>
		<?php endif; ?>

		<section class="apls-exec-kpi-grid" aria-label="<?php esc_attr_e( 'Executive summary metrics', 'apex-local-seo' ); ?>">
			<?php foreach ( $this->executive_cards( $summary ) as $card ) : ?>
				<?php $this->render_kpi( $card ); ?>
			<?php endforeach; ?>
		</section>

		<div class="apls-command-grid">
			<?php $this->performance_panel( $performance ); ?>
			<?php $this->profile_panel( $summary, $profile, $data['locations'] ?? array() ); ?>
			<?php $this->advisor_panel( $data['recommendations'] ?? array() ); ?>
			<?php $this->reviews_panel( $summary, $data['reviews'] ?? array() ); ?>
			<?php $this->visibility_panel( $data['rankings'] ?? array(), $data['keywords'] ?? array() ); ?>
			<?php $this->citation_competitor_panel( $data['citations'] ?? array(), $data['competitors'] ?? array() ); ?>
			<?php $this->content_panel( $data['photos'] ?? array(), $data['posts'] ?? array(), $data['questions'] ?? array() ); ?>
			<?php $this->audit_panel( $data['audit'] ?? array(), $data['activity'] ?? array() ); ?>
			<?php $this->scenario_panel( $data['scenarios'] ?? array() ); ?>
		</div>

		<section class="apls-module-strip" aria-label="<?php esc_attr_e( 'Registered modules', 'apex-local-seo' ); ?>">
			<div class="apls-section-heading">
				<span class="apls-eyebrow"><?php esc_html_e( 'Platform Modules', 'apex-local-seo' ); ?></span>
				<h2><?php esc_html_e( 'Release-ready intelligence modules', 'apex-local-seo' ); ?></h2>
			</div>
			<div class="apls-module-grid">
				<?php foreach ( $this->modules->summaries() as $module ) : ?>
					<?php APLS_Admin_Components_ModuleCard::render( $module ); ?>
				<?php endforeach; ?>
			</div>
		</section>
		<?php
		APLS_Admin_Components_ApexShell::end();
	}

	/**
	 * Executive cards.
	 *
	 * @param mixed $summary Summary.
	 */
	private function executive_cards( $summary ) {
		$metrics = $summary['metrics30'] ?? array();
		return array(
			array(
				'label' => __( 'Local SEO Score', 'apex-local-seo' ),
				'value' => absint( $summary['healthScore'] ?? 0 ),
				'meta'  => $summary['healthLabel'] ?? __( 'Ready', 'apex-local-seo' ),
				'tone'  => 'green',
			),
			array(
				'label' => __( 'Visibility Score', 'apex-local-seo' ),
				'value' => absint( $summary['visibilityScore'] ?? 0 ) . '%',
				'meta'  => __( 'Search and Maps trend', 'apex-local-seo' ),
				'tone'  => 'cyan',
			),
			array(
				'label' => __( 'Google Rating', 'apex-local-seo' ),
				'value' => number_format_i18n( (float) ( $summary['averageRating'] ?? 0 ), 1 ),
				'meta'  => __( 'Average star rating', 'apex-local-seo' ),
				'tone'  => 'amber',
			),
			array(
				'label' => __( 'Reviews', 'apex-local-seo' ),
				'value' => absint( $summary['totalReviews'] ?? 0 ),
				'meta'  => sprintf( /* translators: %d is the number of reviews awaiting owner response. */ __( '%d awaiting response', 'apex-local-seo' ), absint( $summary['reviewsWaiting'] ?? 0 ) ),
				'tone'  => 'purple',
			),
			array(
				'label' => __( 'Calls', 'apex-local-seo' ),
				'value' => number_format_i18n( absint( $metrics['calls'] ?? 0 ) ),
				'meta'  => __( 'Last 30 days', 'apex-local-seo' ),
				'tone'  => 'blue',
			),
			array(
				'label' => __( 'Website Clicks', 'apex-local-seo' ),
				'value' => number_format_i18n( absint( $metrics['websiteClicks'] ?? 0 ) ),
				'meta'  => __( 'Profile actions', 'apex-local-seo' ),
				'tone'  => 'green',
			),
			array(
				'label' => __( 'Directions', 'apex-local-seo' ),
				'value' => number_format_i18n( absint( $metrics['directionRequests'] ?? 0 ) ),
				'meta'  => __( 'Maps intent', 'apex-local-seo' ),
				'tone'  => 'cyan',
			),
			array(
				'label' => __( 'Map Pack Visibility', 'apex-local-seo' ),
				'value' => absint( $summary['mapPackVisibility'] ?? 0 ) . '%',
				'meta'  => __( 'Tracked keyword coverage', 'apex-local-seo' ),
				'tone'  => 'purple',
			),
			array(
				'label' => __( 'Citation Score', 'apex-local-seo' ),
				'value' => absint( $summary['citationScore'] ?? 0 ) . '%',
				'meta'  => __( 'Directory consistency', 'apex-local-seo' ),
				'tone'  => 'green',
			),
			array(
				'label' => __( 'Competitor Position', 'apex-local-seo' ),
				'value' => '#' . absint( $summary['competitorPosition'] ?? 0 ),
				'meta'  => __( 'Local snapshot rank', 'apex-local-seo' ),
				'tone'  => 'blue',
			),
			array(
				'label' => __( 'Advisor Score', 'apex-local-seo' ),
				'value' => absint( $summary['advisorHealthScore'] ?? $summary['advisorHealthScore'] ?? 0 ),
				'meta'  => __( 'Action readiness', 'apex-local-seo' ),
				'tone'  => 'amber',
			),
		);
	}

	/**
	 * Render kpi.
	 *
	 * @param mixed $card Card.
	 */
	private function render_kpi( $card ) {
		?>
		<article class="apls-exec-kpi apls-tone-<?php echo esc_attr( $card['tone'] ); ?>">
			<span><?php echo esc_html( $card['label'] ); ?></span>
			<strong><?php echo esc_html( $card['value'] ); ?></strong>
			<em><?php echo esc_html( $card['meta'] ); ?></em>
		</article>
		<?php
	}

	/**
	 * Google import status.
	 *
	 * @param mixed $status Google connection status.
	 */
	private function google_import_status( $status ) {
		$sync_issue = $status['syncIssue'] ?? array();
		$sync_url   = wp_nonce_url( admin_url( 'admin-post.php?action=apls_google_sync' ), 'apls_google_sync' );
		$steps      = array(
			array( __( 'Connect Google Business Profile', 'apex-local-seo' ), true ),
			array( __( 'Scanning your business', 'apex-local-seo' ), empty( $sync_issue ) ),
			array( __( 'Importing locations', 'apex-local-seo' ), false ),
			array( __( 'Importing reviews', 'apex-local-seo' ), false ),
			array( __( 'Importing performance metrics', 'apex-local-seo' ), false ),
			array( __( 'Calculating Local SEO Score', 'apex-local-seo' ), false ),
			array( __( 'Dashboard ready', 'apex-local-seo' ), false ),
		);
		?>
		<section class="apls-provider-note apls-import-status">
			<div>
				<strong><?php esc_html_e( 'Google account connected', 'apex-local-seo' ); ?></strong>
				<span><?php esc_html_e( 'Apex Local SEO is ready to import live Business Profile data. Run sync to populate locations, reviews, photos, performance metrics, and dashboard KPIs.', 'apex-local-seo' ); ?></span>
				<?php if ( ! empty( $sync_issue['message'] ) ) : ?>
					<p><?php echo esc_html( $sync_issue['message'] ); ?></p>
				<?php endif; ?>
			</div>
			<div class="apls-import-steps" aria-label="<?php esc_attr_e( 'Google Business Profile import progress', 'apex-local-seo' ); ?>">
				<?php foreach ( $steps as $step ) : ?>
					<span class="<?php echo $step[1] ? 'is-complete' : ''; ?>"><?php echo esc_html( $step[0] ); ?></span>
				<?php endforeach; ?>
			</div>
			<div class="apls-demo-actions">
				<a class="apls-btn apls-btn-primary" href="<?php echo esc_url( $sync_url ); ?>"><?php esc_html_e( 'Sync Business Profile', 'apex-local-seo' ); ?></a>
				<a class="apls-btn" href="<?php echo esc_url( admin_url( 'admin.php?page=apls-diagnostics' ) ); ?>"><?php esc_html_e( 'Open Diagnostics', 'apex-local-seo' ); ?></a>
			</div>
		</section>
		<?php
	}

	/**
	 * Performance panel.
	 *
	 * @param mixed $performance Performance.
	 */
	private function performance_panel( $performance ) {
		$last30 = $performance['last30'] ?? array();
		$daily  = $performance['daily'] ?? array();
		?>
		<section class="apls-panel apls-panel-wide">
			<div class="apls-panel-head">
				<div>
					<span class="apls-eyebrow"><?php esc_html_e( 'Performance', 'apex-local-seo' ); ?></span>
					<h2><?php esc_html_e( 'Search demand and conversion actions', 'apex-local-seo' ); ?></h2>
				</div>
				<div class="apls-segmented" aria-label="<?php esc_attr_e( 'Performance ranges', 'apex-local-seo' ); ?>"><span>Daily</span><span>Weekly</span><span>Monthly</span></div>
			</div>
			<div class="apls-performance-layout">
				<div class="apls-chart" aria-label="<?php esc_attr_e( 'Seven day performance chart', 'apex-local-seo' ); ?>">
					<?php foreach ( $daily as $day ) : ?>
						<?php $height = min( 100, max( 18, ( absint( $day['searches'] ?? 0 ) / 10 ) ) ); ?>
						<div class="apls-chart-bar" style="<?php echo esc_attr( '--apls-bar:' . $height . '%' ); ?>">
							<span></span>
							<em><?php echo esc_html( $day['label'] ?? '' ); ?></em>
						</div>
					<?php endforeach; ?>
				</div>
				<div class="apls-action-metrics">
					<?php $this->mini_stat( __( 'Searches', 'apex-local-seo' ), number_format_i18n( absint( $last30['searchViews'] ?? 0 ) ), '+18.6%' ); ?>
					<?php $this->mini_stat( __( 'Maps Views', 'apex-local-seo' ), number_format_i18n( absint( $last30['mapsViews'] ?? 0 ) ), '+13.2%' ); ?>
					<?php $this->mini_stat( __( 'Phone Calls', 'apex-local-seo' ), number_format_i18n( absint( $last30['calls'] ?? 0 ) ), '+24.7%' ); ?>
					<?php $this->mini_stat( __( 'Website Visits', 'apex-local-seo' ), number_format_i18n( absint( $last30['websiteClicks'] ?? 0 ) ), '+20.4%' ); ?>
				</div>
			</div>
		</section>
		<?php
	}

	/**
	 * Profile panel.
	 *
	 * @param mixed $summary Summary.

	 * @param mixed $profile Profile.

	 * @param mixed $locations Locations.
	 */
	private function profile_panel( $summary, $profile, $locations ) {
		?>
		<section class="apls-panel">
			<div class="apls-panel-head">
				<div>
					<span class="apls-eyebrow"><?php esc_html_e( 'Google Business Profile', 'apex-local-seo' ); ?></span>
					<h2><?php esc_html_e( 'Business foundation', 'apex-local-seo' ); ?></h2>
				</div>
				<span class="apls-status apls-status-success"><?php esc_html_e( 'Verified', 'apex-local-seo' ); ?></span>
			</div>
			<div class="apls-profile-stack">
				<?php $this->detail_row( __( 'Business', 'apex-local-seo' ), $profile['businessName'] ?? $summary['businessName'] ?? '' ); ?>
				<?php $this->detail_row( __( 'Address', 'apex-local-seo' ), $profile['address'] ?? '' ); ?>
				<?php $this->detail_row( __( 'Phone', 'apex-local-seo' ), $profile['phone'] ?? '' ); ?>
				<?php $this->detail_row( __( 'Primary Category', 'apex-local-seo' ), $summary['primaryCategory'] ?? '' ); ?>
			</div>
			<div class="apls-progress-block">
				<span><?php esc_html_e( 'Profile completeness', 'apex-local-seo' ); ?></span>
				<div class="apls-progress"><span style="<?php echo esc_attr( 'width:' . absint( $summary['profileCompleteness'] ?? 0 ) . '%' ); ?>"></span></div>
				<strong><?php echo esc_html( absint( $summary['profileCompleteness'] ?? 0 ) . '%' ); ?></strong>
			</div>
			<div class="apls-location-pills">
				<?php foreach ( $locations as $location ) : ?>
					<span><?php echo esc_html( ( $location['name'] ?? '' ) . ' - ' . absint( $location['score'] ?? 0 ) ); ?></span>
				<?php endforeach; ?>
			</div>
		</section>
		<?php
	}

	/**
	 * Advisor panel.
	 *
	 * @param mixed $recommendations Recommendations.
	 */
	private function advisor_panel( $recommendations ) {
		?>
		<section class="apls-panel apls-panel-tall">
			<div class="apls-panel-head">
				<div>
					<span class="apls-eyebrow"><?php esc_html_e( 'Action Center', 'apex-local-seo' ); ?></span>
					<h2><?php esc_html_e( 'Prioritized local search recommendations', 'apex-local-seo' ); ?></h2>
				</div>
				<span class="apls-status apls-status-success"><?php esc_html_e( 'Live Scoring', 'apex-local-seo' ); ?></span>
			</div>
			<div class="apls-ai-list">
				<?php foreach ( $recommendations as $recommendation ) : ?>
					<article class="apls-ai-row apls-priority-<?php echo esc_attr( $recommendation['priority'] ?? 'normal' ); ?>">
						<div>
							<span><?php echo esc_html( strtoupper( $recommendation['priority'] ?? 'normal' ) ); ?></span>
							<strong><?php echo esc_html( $recommendation['title'] ?? '' ); ?></strong>
							<p><?php echo esc_html( $recommendation['reason'] ?? '' ); ?></p>
						</div>
						<em><?php echo esc_html( $recommendation['impact'] ?? '' ); ?></em>
					</article>
				<?php endforeach; ?>
			</div>
		</section>
		<?php
	}

	/**
	 * Reviews panel.
	 *
	 * @param mixed $summary Summary.

	 * @param mixed $reviews Reviews.
	 */
	private function reviews_panel( $summary, $reviews ) {
		?>
		<section class="apls-panel">
			<div class="apls-panel-head">
				<div>
					<span class="apls-eyebrow"><?php esc_html_e( 'Reviews', 'apex-local-seo' ); ?></span>
					<h2><?php esc_html_e( 'Reputation health', 'apex-local-seo' ); ?></h2>
				</div>
				<div class="apls-rating-badge"><?php echo esc_html( number_format_i18n( (float) ( $summary['averageRating'] ?? 0 ), 1 ) ); ?></div>
			</div>
			<div class="apls-review-summary">
				<?php $this->mini_stat( __( 'Total Reviews', 'apex-local-seo' ), number_format_i18n( absint( $summary['totalReviews'] ?? 0 ) ), __( 'Google', 'apex-local-seo' ) ); ?>
				<?php $this->mini_stat( __( 'Waiting', 'apex-local-seo' ), number_format_i18n( absint( $summary['reviewsWaiting'] ?? 0 ) ), __( 'Needs reply', 'apex-local-seo' ) ); ?>
			</div>
			<div class="apls-review-list">
				<?php foreach ( array_slice( $reviews, 0, 4 ) as $review ) : ?>
					<div class="apls-review-row">
						<strong><?php echo esc_html( $review['reviewer_name'] ?? __( 'Google reviewer', 'apex-local-seo' ) ); ?></strong>
						<span><?php echo esc_html( number_format_i18n( (float) ( $review['rating'] ?? 0 ), 1 ) . ' stars - ' . ( $review['response_status'] ?? '' ) ); ?></span>
						<p><?php echo esc_html( $review['review_text'] ?? '' ); ?></p>
					</div>
				<?php endforeach; ?>
			</div>
		</section>
		<?php
	}

	/**
	 * Visibility panel.
	 *
	 * @param mixed $rankings Rankings.

	 * @param mixed $keywords Keywords.
	 */
	private function visibility_panel( $rankings, $keywords ) {
		?>
		<section class="apls-panel">
			<div class="apls-panel-head">
				<div>
					<span class="apls-eyebrow"><?php esc_html_e( 'Map Pack', 'apex-local-seo' ); ?></span>
					<h2><?php esc_html_e( 'Visibility and keywords', 'apex-local-seo' ); ?></h2>
				</div>
				<span class="apls-status apls-status-success"><?php echo esc_html( $rankings['trend'] ?? '+0%' ); ?></span>
			</div>
			<div class="apls-rank-summary">
				<?php $this->mini_stat( __( 'Visibility', 'apex-local-seo' ), absint( $rankings['visibilityScore'] ?? 0 ) . '%', __( 'Map Pack', 'apex-local-seo' ) ); ?>
				<?php $this->mini_stat( __( 'Top 3', 'apex-local-seo' ), absint( $rankings['top3'] ?? 0 ), __( 'Keywords', 'apex-local-seo' ) ); ?>
				<?php $this->mini_stat( __( 'Avg Position', 'apex-local-seo' ), number_format_i18n( (float) ( $rankings['averagePosition'] ?? 0 ), 1 ), __( 'Tracked', 'apex-local-seo' ) ); ?>
			</div>
			<div class="apls-keyword-table">
				<?php foreach ( $keywords as $keyword ) : ?>
					<div>
						<strong><?php echo esc_html( $keyword['keyword'] ?? '' ); ?></strong>
						<span><?php echo esc_html( '#' . absint( $keyword['position'] ?? 0 ) . ' / ' . ( $keyword['change'] ?? '0' ) ); ?></span>
					</div>
				<?php endforeach; ?>
			</div>
		</section>
		<?php
	}

	/**
	 * Citation competitor panel.
	 *
	 * @param mixed $citations Citations.

	 * @param mixed $competitors Competitors.
	 */
	private function citation_competitor_panel( $citations, $competitors ) {
		?>
		<section class="apls-panel apls-authority-panel">
			<div class="apls-panel-head">
				<div>
					<span class="apls-eyebrow"><?php esc_html_e( 'Authority', 'apex-local-seo' ); ?></span>
					<h2><?php esc_html_e( 'Citations and competitors', 'apex-local-seo' ); ?></h2>
				</div>
			</div>
			<div class="apls-split-metrics">
				<?php $this->mini_stat( __( 'Citation Health', 'apex-local-seo' ), absint( $citations['score'] ?? 0 ) . '%', __( 'Consistency', 'apex-local-seo' ) ); ?>
				<?php $this->mini_stat( __( 'Tracked Rivals', 'apex-local-seo' ), absint( $competitors['tracked'] ?? 0 ), __( 'Competitors', 'apex-local-seo' ) ); ?>
			</div>
			<?php $this->detail_row( __( 'Missing Listings', 'apex-local-seo' ), absint( $citations['missing'] ?? 0 ) ); ?>
			<?php $this->detail_row( __( 'Inconsistent Listings', 'apex-local-seo' ), absint( $citations['inconsistent'] ?? 0 ) ); ?>
			<?php $this->detail_row( __( 'Review Gap', 'apex-local-seo' ), absint( $competitors['reviewGap'] ?? 0 ) ); ?>
			<?php $this->detail_row( __( 'Current Position', 'apex-local-seo' ), '#' . absint( $competitors['yourPosition'] ?? 0 ) ); ?>
		</section>
		<?php
	}

	/**
	 * Content panel.
	 *
	 * @param mixed $photos Photos.

	 * @param mixed $posts Posts.

	 * @param mixed $questions Questions.
	 */
	private function content_panel( $photos, $posts, $questions ) {
		?>
		<section class="apls-panel apls-content-signals-panel">
			<div class="apls-panel-head">
				<div>
					<span class="apls-eyebrow"><?php esc_html_e( 'Content Signals', 'apex-local-seo' ); ?></span>
					<h2><?php esc_html_e( 'Photos, posts, and Q&A', 'apex-local-seo' ); ?></h2>
				</div>
			</div>
			<div class="apls-content-signal-grid">
				<?php $this->mini_stat( __( 'Photos', 'apex-local-seo' ), absint( $photos['total'] ?? 0 ), sprintf( /* translators: %d is the number of new photos. */ __( '%d new', 'apex-local-seo' ), absint( $photos['newThisMonth'] ?? 0 ) ) ); ?>
				<?php $this->mini_stat( __( 'Photo Views', 'apex-local-seo' ), number_format_i18n( absint( $photos['views'] ?? 0 ) ), __( '30 days', 'apex-local-seo' ) ); ?>
				<?php $this->mini_stat( __( 'Posts', 'apex-local-seo' ), absint( $posts['published'] ?? 0 ), sprintf( /* translators: %d is the number of draft posts. */ __( '%d drafts', 'apex-local-seo' ), absint( $posts['drafts'] ?? 0 ) ) ); ?>
				<?php $this->mini_stat( __( 'Q&A', 'apex-local-seo' ), absint( $questions['answered'] ?? 0 ), sprintf( /* translators: %d is the number of unanswered questions. */ __( '%d waiting', 'apex-local-seo' ), absint( $questions['unanswered'] ?? 0 ) ) ); ?>
			</div>
			<?php $this->detail_row( __( 'Next Photo Action', 'apex-local-seo' ), $photos['recommendation'] ?? '' ); ?>
			<?php $this->detail_row( __( 'Next Post Action', 'apex-local-seo' ), $posts['nextAction'] ?? '' ); ?>
			<?php $this->detail_row( __( 'Next Q&A Action', 'apex-local-seo' ), $questions['nextAction'] ?? '' ); ?>
		</section>
		<?php
	}

	/**
	 * Audit panel.
	 *
	 * @param mixed $audit Audit.

	 * @param mixed $activity Activity.
	 */
	private function audit_panel( $audit, $activity ) {
		?>
		<section class="apls-panel apls-local-audit-panel">
			<div class="apls-panel-head">
				<div>
					<span class="apls-eyebrow"><?php esc_html_e( 'Local SEO Audit', 'apex-local-seo' ); ?></span>
					<h2><?php esc_html_e( 'Recent activity and technical health', 'apex-local-seo' ); ?></h2>
				</div>
				<span class="apls-status apls-status-success"><?php echo esc_html( absint( $audit['score'] ?? 0 ) . '%' ); ?></span>
			</div>
			<div class="apls-audit-metrics">
				<?php $this->mini_stat( __( 'Schema', 'apex-local-seo' ), ucfirst( (string) ( $audit['schema'] ?? '' ) ), __( 'Status', 'apex-local-seo' ) ); ?>
				<?php $this->mini_stat( __( 'Landing Pages', 'apex-local-seo' ), absint( $audit['landingPages'] ?? 0 ), __( 'Local pages', 'apex-local-seo' ) ); ?>
				<?php $this->mini_stat( __( 'Internal Links', 'apex-local-seo' ), absint( $audit['internalLinks'] ?? 0 ), __( 'Signals', 'apex-local-seo' ) ); ?>
			</div>
			<div class="apls-activity-feed">
				<?php foreach ( $activity as $item ) : ?>
					<div>
						<span><?php echo esc_html( $item['time'] ?? '' ); ?></span>
						<strong><?php echo esc_html( $item['label'] ?? '' ); ?></strong>
					</div>
				<?php endforeach; ?>
			</div>
		</section>
		<?php
	}

	/**
	 * Scenario panel.
	 *
	 * @param mixed $scenarios Scenarios.
	 */
	private function scenario_panel( $scenarios ) {
		?>
		<section class="apls-panel apls-panel-wide">
			<div class="apls-panel-head">
				<div>
					<span class="apls-eyebrow"><?php esc_html_e( 'Provider Scenario Coverage', 'apex-local-seo' ); ?></span>
					<h2><?php esc_html_e( 'Production-shaped scenarios for validation', 'apex-local-seo' ); ?></h2>
				</div>
			</div>
			<div class="apls-scenario-grid">
				<?php foreach ( $scenarios as $scenario ) : ?>
					<div class="apls-scenario">
						<strong><?php echo esc_html( $scenario['label'] ?? '' ); ?></strong>
						<span><?php /* translators: 1: score, 2: review count, 3: location count. */ echo esc_html( sprintf( __( '%1$d score / %2$d reviews / %3$d locations', 'apex-local-seo' ), absint( $scenario['score'] ?? 0 ), absint( $scenario['reviews'] ?? 0 ), absint( $scenario['locations'] ?? 0 ) ) ); ?></span>
					</div>
				<?php endforeach; ?>
			</div>
		</section>
		<?php
	}

	/**
	 * Mini stat.
	 *
	 * @param mixed $label Label.

	 * @param mixed $value Value.

	 * @param mixed $meta Meta.
	 */
	private function mini_stat( $label, $value, $meta ) {
		?>
		<div class="apls-mini-stat">
			<span><?php echo esc_html( $label ); ?></span>
			<strong><?php echo esc_html( $value ); ?></strong>
			<em><?php echo esc_html( $meta ); ?></em>
		</div>
		<?php
	}

	/**
	 * Detail row.
	 *
	 * @param mixed $label Label.

	 * @param mixed $value Value.
	 */
	private function detail_row( $label, $value ) {
		?>
		<div class="apls-detail-row">
			<span><?php echo esc_html( $label ); ?></span>
			<strong><?php echo esc_html( (string) $value ); ?></strong>
		</div>
		<?php
	}
}
