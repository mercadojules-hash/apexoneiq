<?php
/**
 * Apex Local SEO plugin file.
 *
 * @package Apex_Local_SEO
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; }

/**
 * APLS Admin Pages DiagnosticsPage.
 */
class APLS_Admin_Pages_DiagnosticsPage {
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
		$manager = $this->container->get( 'business_profile_provider' );
		$data    = $manager->diagnostics();
		$mode    = $manager->mode();
		$trace   = get_transient( 'apls_gbp_last_request_trace' );

		APLS_Admin_Components_ApexShell::start( __( 'Diagnostics Center', 'apex-local-seo' ), __( 'Data source readiness, Google connection status, sync health, and onboarding guidance.', 'apex-local-seo' ), $manager );
		?>
		<div class="apls-dashboard-grid">
			<section class="apls-card apls-card-large">
				<div class="apls-card-head">
					<div>
						<p class="apls-eyebrow"><?php esc_html_e( 'Provider', 'apex-local-seo' ); ?></p>
						<h2><?php echo esc_html( $mode['label'] ); ?></h2>
					</div>
					<?php APLS_Admin_Components_StatusBadge::render( $mode['activeProvider'], 'success' ); ?>
				</div>
				<div class="apls-readiness-list">
					<span><?php /* translators: %s is the Google connection status. */ echo esc_html( sprintf( __( 'Google status: %s', 'apex-local-seo' ), $mode['googleStatus']['status'] ?? 'unknown' ) ); ?></span>
					<span><?php /* translators: %s is the connected Google account email or fallback status. */ echo esc_html( sprintf( __( 'Google account: %s', 'apex-local-seo' ), $mode['googleStatus']['email'] ?? __( 'Not connected', 'apex-local-seo' ) ) ); ?></span>
					<span><?php esc_html_e( 'Business Profile API access is checked during sync.', 'apex-local-seo' ); ?></span>
				</div>
			</section>

			<section class="apls-card">
				<div class="apls-card-head"><h2><?php esc_html_e( 'Current Provider Checks', 'apex-local-seo' ); ?></h2></div>
				<?php $this->checks( $data['mock'] ?? array() ); ?>
			</section>

			<section class="apls-card apls-card-large">
				<div class="apls-card-head"><h2><?php esc_html_e( 'Google Readiness', 'apex-local-seo' ); ?></h2></div>
				<?php $this->checks( $data['google'] ?? array() ); ?>
			</section>

			<section class="apls-card apls-card-large">
				<div class="apls-card-head"><h2><?php esc_html_e( 'Last Request Trace', 'apex-local-seo' ); ?></h2></div>
				<div class="apls-readiness-rows">
					<?php if ( empty( $trace ) ) : ?>
						<div><strong><?php esc_html_e( 'No sync trace recorded yet.', 'apex-local-seo' ); ?></strong><span><?php esc_html_e( 'Run Sync Business Profile', 'apex-local-seo' ); ?></span></div>
					<?php else : ?>
						<?php foreach ( array_slice( (array) $trace, -8 ) as $entry ) : ?>
							<div>
								<strong><?php echo esc_html( ( $entry['label'] ?? $entry['event'] ?? 'event' ) . ' - ' . ( $entry['status'] ?? '' ) ); ?></strong>
								<span><?php echo esc_html( trim( ( $entry['method'] ?? '' ) . ' ' . ( $entry['host'] ?? '' ) . ( $entry['path'] ?? '' ) ) ); ?></span>
								<?php if ( ! empty( $entry['message'] ) ) : ?>
									<p><?php echo esc_html( $entry['message'] ); ?></p>
								<?php endif; ?>
								<?php if ( ! empty( $entry['responseBody'] ) ) : ?>
									<pre class="apls-trace-body"><?php echo esc_html( $entry['responseBody'] ); ?></pre>
								<?php endif; ?>
							</div>
						<?php endforeach; ?>
					<?php endif; ?>
				</div>
			</section>
		</div>
		<?php
		APLS_Admin_Components_ApexShell::end();
	}

	/**
	 * Checks.
	 *
	 * @param mixed $checks Checks.
	 */
	private function checks( $checks ) {
		echo '<div class="apls-readiness-rows">';
		foreach ( (array) $checks as $check ) {
			echo '<div>';
			echo '<strong>' . esc_html( ( $check['label'] ?? '' ) . ': ' . ( $check['value'] ?? '' ) ) . '</strong>';
			echo '<span>' . esc_html( strtoupper( $check['status'] ?? 'info' ) ) . '</span>';
			if ( ! empty( $check['problem'] ) ) {
				echo '<p>' . esc_html( $check['problem'] ) . '</p>';
			}
			echo '<p>' . esc_html( $check['reason'] ?? '' ) . '</p>';
			echo '<p>' . esc_html( $check['resolution'] ?? '' ) . '</p>';
			echo '</div>';
		}
		echo '</div>';
	}
}
