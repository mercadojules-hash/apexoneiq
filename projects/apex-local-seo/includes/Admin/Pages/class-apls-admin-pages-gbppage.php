<?php
/**
 * Apex Local SEO plugin file.
 *
 * @package Apex_Local_SEO
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; }

/**
 * APLS Admin Pages GbpPage.
 */
class APLS_Admin_Pages_GbpPage {
	/**
	 * Container.
	 *
	 * @var mixed
	 */
	private $container;

	/**
	 * Construct.
	 *
	 * @param APLS_Core_Container $container Container.
	 */
	public function __construct( APLS_Core_Container $container ) {
		$this->container = $container;
	}

	/**
	 * Render.
	 */
	public function render() {
		$manager  = $this->container->get( 'business_profile_provider' );
		$provider = $manager->active_provider();
		$data     = $provider->dashboard();
		$module   = $data['gbpModule'] ?? $this->fallback_module( $data );
		$info     = $module['businessInformation'] ?? array();
		$health   = $module['profileHealth'] ?? array();

		APLS_Admin_Components_ApexShell::start( __( 'Google Business Profile', 'apex-local-seo' ), __( 'Business profile operations for information, services, products, photos, posts, Q&A, and performance.', 'apex-local-seo' ), $manager );
		?>
		<section class="apls-gbp-hero">
			<div>
				<span class="apls-provider-chip"><?php /* translators: %s is the active business profile provider name. */ echo esc_html( sprintf( __( '%s Active', 'apex-local-seo' ), $provider->label() ) ); ?></span>
				<h2><?php echo esc_html( $info['businessName'] ?? __( 'Business Profile', 'apex-local-seo' ) ); ?></h2>
				<p><?php esc_html_e( 'This module displays connected Google Business Profile data or demo data before a Google account is connected.', 'apex-local-seo' ); ?></p>
			</div>
			<div class="apls-gbp-provider-card">
				<strong><?php echo esc_html( $provider->label() ); ?></strong>
				<span><?php echo esc_html( 'google' === $provider->id() ? __( 'Live Google data source', 'apex-local-seo' ) : __( 'Demo data source', 'apex-local-seo' ) ); ?></span>
				<a class="apls-btn" href="<?php echo esc_url( admin_url( 'admin.php?page=apls-diagnostics' ) ); ?>"><?php esc_html_e( 'Open Diagnostics', 'apex-local-seo' ); ?></a>
			</div>
		</section>

		<section class="apls-exec-kpi-grid apls-gbp-kpi-grid" aria-label="<?php esc_attr_e( 'Profile health summary', 'apex-local-seo' ); ?>">
			<?php foreach ( $this->health_cards( $health, $module ) as $card ) : ?>
				<?php $this->render_kpi( $card ); ?>
			<?php endforeach; ?>
		</section>

		<div class="apls-gbp-grid">
			<?php $this->business_information_panel( $info ); ?>
			<?php $this->profile_health_panel( $health ); ?>
			<?php $this->services_panel( $module['services'] ?? array() ); ?>
			<?php $this->products_panel( $module['products'] ?? array() ); ?>
			<?php $this->photos_panel( $module['photos'] ?? array() ); ?>
			<?php $this->posts_panel( $module['posts'] ?? array() ); ?>
			<?php $this->questions_panel( $module['questions'] ?? array() ); ?>
			<?php $this->performance_panel( $module['performance'] ?? array() ); ?>
			<?php $this->recommendations_panel( $module['recommendations'] ?? array() ); ?>
		</div>
		<?php
		APLS_Admin_Components_ApexShell::end();
	}

	/**
	 * Health cards.
	 *
	 * @param mixed $health Health.

	 * @param mixed $module Module.
	 */
	private function health_cards( $health, $module ) {
		$photos    = $module['photos'] ?? array();
		$posts     = $module['posts'] ?? array();
		$questions = $module['questions'] ?? array();
		return array(
			array(
				'label' => __( 'Completeness', 'apex-local-seo' ),
				'value' => absint( $health['completenessScore'] ?? 0 ) . '%',
				'meta'  => __( 'Profile health', 'apex-local-seo' ),
				'tone'  => 'green',
			),
			array(
				'label' => __( 'Verification', 'apex-local-seo' ),
				'value' => $health['verificationStatus'] ?? __( 'Pending', 'apex-local-seo' ),
				'meta'  => __( 'Google status', 'apex-local-seo' ),
				'tone'  => 'cyan',
			),
			array(
				'label' => __( 'Missing Info', 'apex-local-seo' ),
				'value' => count( (array) ( $health['missingInformation'] ?? array() ) ),
				'meta'  => __( 'Business fields', 'apex-local-seo' ),
				'tone'  => 'amber',
			),
			array(
				'label' => __( 'Missing Categories', 'apex-local-seo' ),
				'value' => count( (array) ( $health['missingCategories'] ?? array() ) ),
				'meta'  => __( 'Category gaps', 'apex-local-seo' ),
				'tone'  => 'purple',
			),
			array(
				'label' => __( 'Missing Services', 'apex-local-seo' ),
				'value' => absint( $health['missingServices'] ?? 0 ),
				'meta'  => __( 'Service gaps', 'apex-local-seo' ),
				'tone'  => 'blue',
			),
			array(
				'label' => __( 'Missing Photos', 'apex-local-seo' ),
				'value' => count( (array) ( $health['missingPhotos'] ?? array() ) ),
				'meta'  => __( 'Media gaps', 'apex-local-seo' ),
				'tone'  => 'green',
			),
			array(
				'label' => __( 'Missing Attributes', 'apex-local-seo' ),
				'value' => count( (array) ( $health['missingAttributes'] ?? array() ) ),
				'meta'  => __( 'Trust signals', 'apex-local-seo' ),
				'tone'  => 'cyan',
			),
			array(
				'label' => __( 'Photo Freshness', 'apex-local-seo' ),
				'value' => absint( $photos['freshnessScore'] ?? 0 ) . '%',
				'meta'  => __( 'Visual activity', 'apex-local-seo' ),
				'tone'  => 'purple',
			),
			array(
				'label' => __( 'Active Posts', 'apex-local-seo' ),
				'value' => absint( $posts['active'] ?? 0 ),
				'meta'  => __( 'Google Posts', 'apex-local-seo' ),
				'tone'  => 'blue',
			),
			array(
				'label' => __( 'Q&A Waiting', 'apex-local-seo' ),
				'value' => absint( $questions['awaitingResponse'] ?? 0 ),
				'meta'  => __( 'Needs response', 'apex-local-seo' ),
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
	 * Business information panel.
	 *
	 * @param mixed $info Info.
	 */
	private function business_information_panel( $info ) {
		?>
		<section class="apls-panel apls-gbp-panel apls-gbp-panel-wide">
			<div class="apls-panel-head">
				<div>
					<span class="apls-eyebrow"><?php esc_html_e( 'Business Information', 'apex-local-seo' ); ?></span>
					<h2><?php esc_html_e( 'Core profile data', 'apex-local-seo' ); ?></h2>
				</div>
				<span class="apls-status apls-status-success"><?php echo esc_html( $info['openingStatus'] ?? __( 'Ready', 'apex-local-seo' ) ); ?></span>
			</div>
			<div class="apls-gbp-info-grid">
				<?php $this->detail_row( __( 'Business Name', 'apex-local-seo' ), $info['businessName'] ?? '' ); ?>
				<?php $this->detail_row( __( 'Primary Category', 'apex-local-seo' ), $info['primaryCategory'] ?? '' ); ?>
				<?php $this->detail_row( __( 'Additional Categories', 'apex-local-seo' ), $this->join_values( $info['additionalCategories'] ?? array() ) ); ?>
				<?php $this->detail_row( __( 'Address', 'apex-local-seo' ), $info['address'] ?? '' ); ?>
				<?php $this->detail_row( __( 'Phone Number', 'apex-local-seo' ), $info['phone'] ?? '' ); ?>
				<?php $this->detail_row( __( 'Website', 'apex-local-seo' ), $info['website'] ?? '' ); ?>
			</div>
			<div class="apls-gbp-description">
				<span><?php esc_html_e( 'Business Description', 'apex-local-seo' ); ?></span>
				<p><?php echo esc_html( $info['description'] ?? '' ); ?></p>
			</div>
			<div class="apls-gbp-list-grid">
				<?php $this->token_list( __( 'Hours', 'apex-local-seo' ), $info['hours'] ?? array() ); ?>
				<?php $this->token_list( __( 'Service Areas', 'apex-local-seo' ), $info['serviceAreas'] ?? array() ); ?>
				<?php $this->token_list( __( 'Attributes', 'apex-local-seo' ), $info['attributes'] ?? array() ); ?>
			</div>
		</section>
		<?php
	}

	/**
	 * Profile health panel.
	 *
	 * @param mixed $health Health.
	 */
	private function profile_health_panel( $health ) {
		?>
		<section class="apls-panel apls-gbp-panel">
			<div class="apls-panel-head">
				<div>
					<span class="apls-eyebrow"><?php esc_html_e( 'Profile Health', 'apex-local-seo' ); ?></span>
					<h2><?php esc_html_e( 'Completion gaps', 'apex-local-seo' ); ?></h2>
				</div>
				<span class="apls-status apls-status-success"><?php echo esc_html( absint( $health['completenessScore'] ?? 0 ) . '%' ); ?></span>
			</div>
			<?php $this->token_list( __( 'Missing Information', 'apex-local-seo' ), $health['missingInformation'] ?? array() ); ?>
			<?php $this->token_list( __( 'Missing Categories', 'apex-local-seo' ), $health['missingCategories'] ?? array() ); ?>
			<?php $this->token_list( __( 'Missing Photos', 'apex-local-seo' ), $health['missingPhotos'] ?? array() ); ?>
			<?php $this->token_list( __( 'Missing Attributes', 'apex-local-seo' ), $health['missingAttributes'] ?? array() ); ?>
		</section>
		<?php
	}

	/**
	 * Services panel.
	 *
	 * @param mixed $services Services.
	 */
	private function services_panel( $services ) {
		?>
		<section class="apls-panel apls-gbp-panel">
			<div class="apls-panel-head">
				<div>
					<span class="apls-eyebrow"><?php esc_html_e( 'Services', 'apex-local-seo' ); ?></span>
					<h2><?php esc_html_e( 'Service catalog', 'apex-local-seo' ); ?></h2>
				</div>
			</div>
			<div class="apls-content-signal-grid">
				<?php $this->mini_stat( __( 'Services', 'apex-local-seo' ), absint( $services['count'] ?? 0 ), __( 'Published', 'apex-local-seo' ) ); ?>
				<?php $this->mini_stat( __( 'Missing', 'apex-local-seo' ), absint( $services['missingServices'] ?? 0 ), __( 'Service gaps', 'apex-local-seo' ) ); ?>
			</div>
			<?php $this->token_list( __( 'Service Categories', 'apex-local-seo' ), $services['categories'] ?? array() ); ?>
			<?php $this->token_list( __( 'Individual Services', 'apex-local-seo' ), $services['items'] ?? array() ); ?>
			<?php $this->token_list( __( 'Recently Added', 'apex-local-seo' ), $services['recentlyAddedServices'] ?? array() ); ?>
		</section>
		<?php
	}

	/**
	 * Products panel.
	 *
	 * @param mixed $products Products.
	 */
	private function products_panel( $products ) {
		?>
		<section class="apls-panel apls-gbp-panel">
			<div class="apls-panel-head">
				<div>
					<span class="apls-eyebrow"><?php esc_html_e( 'Products', 'apex-local-seo' ); ?></span>
					<h2><?php esc_html_e( 'Product visibility', 'apex-local-seo' ); ?></h2>
				</div>
				<span class="apls-status apls-status-neutral"><?php echo esc_html( absint( $products['health'] ?? 0 ) . '%' ); ?></span>
			</div>
			<div class="apls-content-signal-grid">
				<?php $this->mini_stat( __( 'Products', 'apex-local-seo' ), absint( $products['count'] ?? 0 ), __( 'Total', 'apex-local-seo' ) ); ?>
				<?php $this->mini_stat( __( 'Missing Images', 'apex-local-seo' ), absint( $products['missingProductImages'] ?? 0 ), __( 'Needs media', 'apex-local-seo' ) ); ?>
			</div>
			<?php $this->token_list( __( 'Featured Products', 'apex-local-seo' ), $products['featured'] ?? array() ); ?>
		</section>
		<?php
	}

	/**
	 * Photos panel.
	 *
	 * @param mixed $photos Photos.
	 */
	private function photos_panel( $photos ) {
		?>
		<section class="apls-panel apls-gbp-panel">
			<div class="apls-panel-head">
				<div>
					<span class="apls-eyebrow"><?php esc_html_e( 'Photos', 'apex-local-seo' ); ?></span>
					<h2><?php esc_html_e( 'Media performance', 'apex-local-seo' ); ?></h2>
				</div>
			</div>
			<div class="apls-gbp-metric-grid">
				<?php $this->mini_stat( __( 'Total Photos', 'apex-local-seo' ), absint( $photos['total'] ?? 0 ), __( 'All media', 'apex-local-seo' ) ); ?>
				<?php $this->mini_stat( __( 'New Photos', 'apex-local-seo' ), absint( $photos['newPhotos'] ?? 0 ), __( 'This month', 'apex-local-seo' ) ); ?>
				<?php $this->mini_stat( __( 'Owner Photos', 'apex-local-seo' ), absint( $photos['ownerPhotos'] ?? 0 ), __( 'Brand controlled', 'apex-local-seo' ) ); ?>
				<?php $this->mini_stat( __( 'Customer Photos', 'apex-local-seo' ), absint( $photos['customerPhotos'] ?? 0 ), __( 'User generated', 'apex-local-seo' ) ); ?>
				<?php $this->mini_stat( __( 'Photo Views', 'apex-local-seo' ), number_format_i18n( absint( $photos['photoViews'] ?? 0 ) ), __( '30 days', 'apex-local-seo' ) ); ?>
				<?php $this->mini_stat( __( 'Freshness', 'apex-local-seo' ), absint( $photos['freshnessScore'] ?? 0 ) . '%', __( 'Activity score', 'apex-local-seo' ) ); ?>
			</div>
		</section>
		<?php
	}

	/**
	 * Posts panel.
	 *
	 * @param mixed $posts Posts.
	 */
	private function posts_panel( $posts ) {
		?>
		<section class="apls-panel apls-gbp-panel">
			<div class="apls-panel-head">
				<div>
					<span class="apls-eyebrow"><?php esc_html_e( 'Google Posts', 'apex-local-seo' ); ?></span>
					<h2><?php esc_html_e( 'Publishing cadence', 'apex-local-seo' ); ?></h2>
				</div>
			</div>
			<div class="apls-content-signal-grid">
				<?php $this->mini_stat( __( 'Active', 'apex-local-seo' ), absint( $posts['active'] ?? 0 ), __( 'Visible', 'apex-local-seo' ) ); ?>
				<?php $this->mini_stat( __( 'Scheduled', 'apex-local-seo' ), absint( $posts['scheduled'] ?? 0 ), __( 'Queued', 'apex-local-seo' ) ); ?>
				<?php $this->mini_stat( __( 'Expired', 'apex-local-seo' ), absint( $posts['expired'] ?? 0 ), __( 'Archive', 'apex-local-seo' ) ); ?>
				<?php $this->mini_stat( __( 'Frequency', 'apex-local-seo' ), $posts['postingFrequency'] ?? '', __( 'Cadence', 'apex-local-seo' ) ); ?>
			</div>
			<?php $this->detail_row( __( 'Latest Post', 'apex-local-seo' ), $posts['latestPost'] ?? '' ); ?>
		</section>
		<?php
	}

	/**
	 * Questions panel.
	 *
	 * @param mixed $questions Questions.
	 */
	private function questions_panel( $questions ) {
		?>
		<section class="apls-panel apls-gbp-panel">
			<div class="apls-panel-head">
				<div>
					<span class="apls-eyebrow"><?php esc_html_e( 'Questions & Answers', 'apex-local-seo' ); ?></span>
					<h2><?php esc_html_e( 'Public questions', 'apex-local-seo' ); ?></h2>
				</div>
			</div>
			<div class="apls-content-signal-grid">
				<?php $this->mini_stat( __( 'Total Questions', 'apex-local-seo' ), absint( $questions['total'] ?? 0 ), __( 'All time', 'apex-local-seo' ) ); ?>
				<?php $this->mini_stat( __( 'Awaiting Response', 'apex-local-seo' ), absint( $questions['awaitingResponse'] ?? 0 ), __( 'Needs owner', 'apex-local-seo' ) ); ?>
				<?php $this->mini_stat( __( 'Recently Answered', 'apex-local-seo' ), absint( $questions['recentlyAnswered'] ?? 0 ), __( 'Recent activity', 'apex-local-seo' ) ); ?>
				<?php $this->mini_stat( __( 'Suggested Responses', 'apex-local-seo' ), count( (array) ( $questions['suggestedResponses'] ?? $questions['suggestedResponses'] ?? array() ) ), __( 'Rule-based', 'apex-local-seo' ) ); ?>
			</div>
			<?php $this->token_list( __( 'Suggested Responses', 'apex-local-seo' ), $questions['suggestedResponses'] ?? $questions['suggestedResponses'] ?? array() ); ?>
		</section>
		<?php
	}

	/**
	 * Performance panel.
	 *
	 * @param mixed $performance Performance.
	 */
	private function performance_panel( $performance ) {
		?>
		<section class="apls-panel apls-gbp-panel apls-gbp-panel-wide">
			<div class="apls-panel-head">
				<div>
					<span class="apls-eyebrow"><?php esc_html_e( 'Performance Summary', 'apex-local-seo' ); ?></span>
					<h2><?php esc_html_e( 'Customer action signals', 'apex-local-seo' ); ?></h2>
				</div>
			</div>
			<div class="apls-gbp-metric-grid apls-gbp-performance-grid">
				<?php $this->mini_stat( __( 'Searches', 'apex-local-seo' ), number_format_i18n( absint( $performance['searches'] ?? 0 ) ), __( 'Search demand', 'apex-local-seo' ) ); ?>
				<?php $this->mini_stat( __( 'Views', 'apex-local-seo' ), number_format_i18n( absint( $performance['views'] ?? 0 ) ), __( 'Search and Maps', 'apex-local-seo' ) ); ?>
				<?php $this->mini_stat( __( 'Website Clicks', 'apex-local-seo' ), number_format_i18n( absint( $performance['websiteClicks'] ?? 0 ) ), __( 'Site intent', 'apex-local-seo' ) ); ?>
				<?php $this->mini_stat( __( 'Phone Calls', 'apex-local-seo' ), number_format_i18n( absint( $performance['phoneCalls'] ?? 0 ) ), __( 'Lead intent', 'apex-local-seo' ) ); ?>
				<?php $this->mini_stat( __( 'Directions', 'apex-local-seo' ), number_format_i18n( absint( $performance['directionRequests'] ?? 0 ) ), __( 'Visit intent', 'apex-local-seo' ) ); ?>
				<?php $this->mini_stat( __( 'Booking Clicks', 'apex-local-seo' ), number_format_i18n( absint( $performance['bookingClicks'] ?? 0 ) ), __( 'Appointment intent', 'apex-local-seo' ) ); ?>
			</div>
		</section>
		<?php
	}

	/**
	 * Recommendations panel.
	 *
	 * @param mixed $recommendations Recommendations.
	 */
	private function recommendations_panel( $recommendations ) {
		?>
		<section class="apls-panel apls-gbp-panel apls-gbp-panel-wide">
			<div class="apls-panel-head">
				<div>
					<span class="apls-eyebrow"><?php esc_html_e( 'Recommendations', 'apex-local-seo' ); ?></span>
					<h2><?php esc_html_e( 'Profile actions to prioritize', 'apex-local-seo' ); ?></h2>
				</div>
				<span class="apls-status apls-status-success"><?php esc_html_e( 'Provider Driven', 'apex-local-seo' ); ?></span>
			</div>
			<div class="apls-gbp-recommendations">
				<?php foreach ( $recommendations as $recommendation ) : ?>
					<div class="apls-gbp-recommendation apls-priority-<?php echo esc_attr( $recommendation['priority'] ?? 'normal' ); ?>">
						<span><?php echo esc_html( strtoupper( $recommendation['priority'] ?? 'normal' ) ); ?></span>
						<strong><?php echo esc_html( $recommendation['title'] ?? '' ); ?></strong>
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

	/**
	 * Token list.
	 *
	 * @param mixed $label Label.

	 * @param mixed $items Items.
	 */
	private function token_list( $label, $items ) {
		$items = array_filter( (array) $items );
		?>
		<div class="apls-gbp-token-block">
			<span><?php echo esc_html( $label ); ?></span>
			<div>
				<?php if ( empty( $items ) ) : ?>
					<em><?php esc_html_e( 'No provider data yet', 'apex-local-seo' ); ?></em>
				<?php else : ?>
					<?php foreach ( $items as $item ) : ?>
						<strong><?php echo esc_html( (string) $item ); ?></strong>
					<?php endforeach; ?>
				<?php endif; ?>
			</div>
		</div>
		<?php
	}

	/**
	 * Join values.
	 *
	 * @param mixed $items Items.
	 */
	private function join_values( $items ) {
		$items = array_filter( (array) $items );
		return empty( $items ) ? __( 'No provider data yet', 'apex-local-seo' ) : implode( ', ', $items );
	}

	/**
	 * Fallback module.
	 *
	 * @param mixed $data Data.
	 */
	private function fallback_module( $data ) {
		$summary = $data['summary'] ?? array();
		$profile = $data['profile']['profile'] ?? array();
		$metrics = $summary['metrics30'] ?? array();
		return array(
			'businessInformation' => array(
				'businessName'         => $summary['businessName'] ?? '',
				'primaryCategory'      => $summary['primaryCategory'] ?? '',
				'additionalCategories' => $profile['categories'] ?? array(),
				'address'              => $profile['address'] ?? '',
				'phone'                => $profile['phone'] ?? '',
				'website'              => $profile['website'] ?? '',
				'description'          => $profile['description'] ?? '',
				'openingStatus'        => __( 'Provider ready', 'apex-local-seo' ),
				'hours'                => array(),
				'serviceAreas'         => array(),
				'attributes'           => array(),
			),
			'profileHealth'       => array(
				'completenessScore'  => absint( $summary['profileCompleteness'] ?? 0 ),
				'verificationStatus' => __( 'Provider ready', 'apex-local-seo' ),
			),
			'services'            => array(),
			'products'            => array(),
			'photos'              => array(
				'total'      => absint( $summary['photos'] ?? 0 ),
				'photoViews' => absint( $metrics['photoViews'] ?? 0 ),
			),
			'posts'               => array(),
			'questions'           => array(),
			'performance'         => array(
				'searches'          => absint( $metrics['searchViews'] ?? 0 ),
				'views'             => absint( $metrics['searchViews'] ?? 0 ) + absint( $metrics['mapsViews'] ?? 0 ),
				'websiteClicks'     => absint( $metrics['websiteClicks'] ?? 0 ),
				'phoneCalls'        => absint( $metrics['calls'] ?? 0 ),
				'directionRequests' => absint( $metrics['directionRequests'] ?? 0 ),
				'bookingClicks'     => 0,
			),
			'recommendations'     => $data['recommendations'] ?? array(),
		);
	}
}
