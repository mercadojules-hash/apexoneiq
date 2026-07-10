<?php
/**
 * Apex Local SEO plugin file.
 *
 * @package Apex_Local_SEO
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; }

/**
 * APLS Admin Pages LocationsPage.
 */
class APLS_Admin_Pages_LocationsPage {
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
		$manager   = $this->container->get( 'business_profile_provider' );
		$provider  = $manager->active_provider();
		$data      = $provider->dashboard();
		$summary   = $data['summary'] ?? array();
		$profile   = $data['profile']['profile'] ?? array();
		$locations = $data['locations'] ?? array();

		APLS_Admin_Components_ApexShell::start( __( 'Locations', 'apex-local-seo' ), __( 'Business identity and location readiness for connected Google Business Profile records.', 'apex-local-seo' ), $manager );
		?>
		<section class="apls-provider-note">
			<strong><?php /* translators: %s is the active business profile provider name. */ echo esc_html( sprintf( __( '%s Active', 'apex-local-seo' ), $provider->label() ) ); ?></strong>
			<span><?php esc_html_e( 'Location data is read through the active data source. Connect Google Business Profile to import live business records.', 'apex-local-seo' ); ?></span>
		</section>

		<div class="apls-dashboard-grid">
			<section class="apls-card apls-card-large">
				<div class="apls-card-head">
					<div>
						<p class="apls-eyebrow"><?php esc_html_e( 'Primary Business', 'apex-local-seo' ); ?></p>
						<h2><?php echo esc_html( $summary['businessName'] ?? __( 'Business profile not connected', 'apex-local-seo' ) ); ?></h2>
					</div>
					<?php APLS_Admin_Components_StatusBadge::render( ! empty( $summary['connected'] ) ? __( 'Ready', 'apex-local-seo' ) : __( 'Setup Needed', 'apex-local-seo' ), ! empty( $summary['connected'] ) ? 'success' : 'warning' ); ?>
				</div>
				<div class="apls-gbp-info-grid">
					<?php $this->detail_row( __( 'Address', 'apex-local-seo' ), $profile['address'] ?? __( 'Connect your account to import address.', 'apex-local-seo' ) ); ?>
					<?php $this->detail_row( __( 'Phone', 'apex-local-seo' ), $profile['phone'] ?? __( 'Connect your account to import phone.', 'apex-local-seo' ) ); ?>
					<?php $this->detail_row( __( 'Website', 'apex-local-seo' ), $profile['website'] ?? __( 'Connect your account to import website.', 'apex-local-seo' ) ); ?>
					<?php $this->detail_row( __( 'Primary Category', 'apex-local-seo' ), $summary['primaryCategory'] ?? __( 'Connect your account to import category.', 'apex-local-seo' ) ); ?>
				</div>
			</section>

			<section class="apls-card">
				<div class="apls-card-head"><h2><?php esc_html_e( 'Location Readiness', 'apex-local-seo' ); ?></h2></div>
				<div class="apls-readiness-list">
					<span><?php /* translators: %d is the profile completeness percentage. */ echo esc_html( sprintf( __( 'Profile completeness: %d%%', 'apex-local-seo' ), absint( $summary['profileCompleteness'] ?? 0 ) ) ); ?></span>
					<span><?php /* translators: %d is the local visibility score. */ echo esc_html( sprintf( __( 'Visibility score: %d', 'apex-local-seo' ), absint( $summary['visibilityScore'] ?? 0 ) ) ); ?></span>
					<span><?php /* translators: %d is the citation score percentage. */ echo esc_html( sprintf( __( 'Citation score: %d%%', 'apex-local-seo' ), absint( $summary['citationScore'] ?? 0 ) ) ); ?></span>
				</div>
			</section>

			<section class="apls-card apls-card-large">
				<div class="apls-card-head"><h2><?php esc_html_e( 'Configured Locations', 'apex-local-seo' ); ?></h2></div>
				<div class="apls-readiness-rows">
					<?php if ( empty( $locations ) ) : ?>
						<div>
							<strong><?php esc_html_e( 'No Google Business Profile connected yet.', 'apex-local-seo' ); ?></strong>
							<span><?php esc_html_e( 'Connect your account to begin importing business data.', 'apex-local-seo' ); ?></span>
						</div>
					<?php else : ?>
						<?php foreach ( (array) $locations as $location ) : ?>
							<div>
								<strong><?php echo esc_html( $location['name'] ?? __( 'Location', 'apex-local-seo' ) ); ?></strong>
								<span><?php echo esc_html( sprintf( '%s, %s / %s / %d', $location['city'] ?? '', $location['region'] ?? '', $location['status'] ?? '', absint( $location['score'] ?? 0 ) ) ); ?></span>
							</div>
						<?php endforeach; ?>
					<?php endif; ?>
				</div>
			</section>

			<section class="apls-card">
				<div class="apls-card-head"><h2><?php esc_html_e( 'Location Coverage', 'apex-local-seo' ); ?></h2></div>
				<p><?php esc_html_e( 'Apex Local SEO imports available Google Business Profile locations returned for the connected account and displays them for review.', 'apex-local-seo' ); ?></p>
			</section>
		</div>
		<?php
		APLS_Admin_Components_ApexShell::end();
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
