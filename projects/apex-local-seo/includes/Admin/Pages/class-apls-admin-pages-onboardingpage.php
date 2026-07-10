<?php
/**
 * Apex Local SEO plugin file.
 *
 * @package Apex_Local_SEO
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; }

/**
 * APLS Admin Pages OnboardingPage.
 */
class APLS_Admin_Pages_OnboardingPage {
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
		$oauth   = $this->container->get( 'gbp_oauth' )->status();
		$manager = $this->container->get( 'business_profile_provider' );
		$mode    = $manager->mode();
		$data    = $manager->active_provider()->dashboard();
		$summary = $data['summary'] ?? array();

		APLS_Admin_Components_ApexShell::start( __( 'Apex Local SEO Onboarding', 'apex-local-seo' ), __( 'A guided first-run path for connecting Google, preparing business data, enabling schema, and reaching dashboard readiness.', 'apex-local-seo' ), $manager );
		?>
		<?php if ( 'mock' === ( $mode['activeProvider'] ?? '' ) ) : ?>
			<?php APLS_Admin_Components_ApexShell::demo_mode_notice(); ?>
		<?php endif; ?>
		<section class="apls-onboarding-hero">
			<div>
				<span class="apls-provider-chip"><?php /* translators: %s is the active business profile provider name. */ echo esc_html( sprintf( __( '%s Active', 'apex-local-seo' ), $mode['label'] ?? __( 'Provider', 'apex-local-seo' ) ) ); ?></span>
				<h2><?php esc_html_e( 'Version 1.0 readiness path', 'apex-local-seo' ); ?></h2>
				<p><?php esc_html_e( 'Complete these steps to move from install to a working local search command center.', 'apex-local-seo' ); ?></p>
			</div>
			<div class="apls-onboarding-readiness">
				<strong><?php echo esc_html( absint( $summary['advisorHealthScore'] ?? $summary['healthScore'] ?? 0 ) ); ?></strong>
				<span><?php esc_html_e( 'Readiness Score', 'apex-local-seo' ); ?></span>
			</div>
		</section>

		<div class="apls-onboarding-grid">
			<?php
			$this->step( '01', __( 'Welcome', 'apex-local-seo' ), __( 'Review the Apex Local SEO command center and confirm this site is ready for local search setup.', 'apex-local-seo' ), true, admin_url( 'admin.php?page=apls' ), __( 'Open Dashboard', 'apex-local-seo' ) );
			$this->step( '02', __( 'Connect Google', 'apex-local-seo' ), __( 'Add OAuth credentials and connect a Google account with Business Profile access.', 'apex-local-seo' ), ! empty( $oauth['connected'] ), admin_url( 'admin.php?page=apls-settings' ), __( 'Connect Google', 'apex-local-seo' ) );
			$this->step( '03', __( 'Sync Locations', 'apex-local-seo' ), __( 'Run a Google Business Profile sync to import available business locations, reviews, photos, and performance metrics.', 'apex-local-seo' ), ! empty( $summary['businessName'] ), admin_url( 'admin.php?page=apls-settings' ), __( 'Sync Business', 'apex-local-seo' ) );
			$this->step( '04', __( 'Configure Business', 'apex-local-seo' ), __( 'Verify business name, address, phone, website, categories, hours, services, and location details.', 'apex-local-seo' ), ! empty( $summary['businessName'] ), admin_url( 'admin.php?page=apls-locations' ), __( 'Review Business', 'apex-local-seo' ) );
			$this->step( '05', __( 'Schema Setup', 'apex-local-seo' ), __( 'Confirm Schema Manager can generate the right local business type and explain rich result readiness.', 'apex-local-seo' ), true, admin_url( 'admin.php?page=apls-schema' ), __( 'Open Schema', 'apex-local-seo' ) );
			$this->step( '06', __( 'Review Settings', 'apex-local-seo' ), __( 'Confirm provider status, retention settings, module readiness, and diagnostics before inviting real businesses.', 'apex-local-seo' ), true, admin_url( 'admin.php?page=apls-diagnostics' ), __( 'Open Diagnostics', 'apex-local-seo' ) );
			$this->step( '07', __( 'Dashboard Ready', 'apex-local-seo' ), __( 'Use Executive Advisor and the Dashboard to prioritize daily local search work after setup is complete.', 'apex-local-seo' ), true, admin_url( 'admin.php?page=apls-advisor' ), __( 'Open Advisor', 'apex-local-seo' ) );
			?>
		</div>
		<?php
		APLS_Admin_Components_ApexShell::end();
	}

	/**
	 * Step.
	 *
	 * @param mixed $number Number.

	 * @param mixed $title Title.

	 * @param mixed $message Message.

	 * @param mixed $complete Complete.

	 * @param mixed $url Url.

	 * @param mixed $action Action.
	 */
	private function step( $number, $title, $message, $complete, $url, $action ) {
		?>
		<section class="apls-panel apls-onboarding-step <?php echo $complete ? 'is-complete' : 'is-pending'; ?>">
			<div class="apls-onboarding-step-number"><?php echo esc_html( $number ); ?></div>
			<div>
				<span><?php echo esc_html( $complete ? __( 'Ready', 'apex-local-seo' ) : __( 'Action Needed', 'apex-local-seo' ) ); ?></span>
				<h2><?php echo esc_html( $title ); ?></h2>
				<p><?php echo esc_html( $message ); ?></p>
				<a class="apls-btn" href="<?php echo esc_url( $url ); ?>"><?php echo esc_html( $action ); ?></a>
			</div>
		</section>
		<?php
	}
}
