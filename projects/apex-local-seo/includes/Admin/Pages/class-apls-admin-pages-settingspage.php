<?php
/**
 * Apex Local SEO plugin file.
 *
 * @package Apex_Local_SEO
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; }

/**
 * APLS Admin Pages SettingsPage.
 */
class APLS_Admin_Pages_SettingsPage {
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
		$settings = $this->container->get( 'settings' )->all();
		$oauth    = $this->container->get( 'gbp_oauth' );
		$status   = $oauth->status();
		$manager  = $this->container->get( 'business_profile_provider' );

		APLS_Admin_Components_ApexShell::start( __( 'Apex Local SEO Settings', 'apex-local-seo' ), __( 'Settings for modules, Google connection, and data retention.', 'apex-local-seo' ), $manager );
		$this->notice();
		?>
		<div class="apls-settings-grid">
			<section class="apls-card apls-card-large">
				<div class="apls-card-head">
					<div>
						<p class="apls-eyebrow"><?php esc_html_e( 'Live Integration', 'apex-local-seo' ); ?></p>
						<h2><?php esc_html_e( 'Google Business Profile', 'apex-local-seo' ); ?></h2>
					</div>
					<?php APLS_Admin_Components_StatusBadge::render( $status['connected'] ? __( 'Connected', 'apex-local-seo' ) : __( 'Not Connected', 'apex-local-seo' ), $status['connected'] ? 'success' : 'warning' ); ?>
				</div>

				<form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>" class="apls-form">
					<input type="hidden" name="action" value="apls_google_save_settings">
					<?php wp_nonce_field( 'apls_google_settings' ); ?>
					<label>
						<span><?php esc_html_e( 'OAuth Client ID', 'apex-local-seo' ); ?></span>
						<input type="text" name="google_client_id" value="<?php echo esc_attr( $this->container->get( 'settings' )->get( 'google_client_id', '' ) ); ?>" autocomplete="off" aria-describedby="apls-google-client-id-help">
						<em id="apls-google-client-id-help"><?php esc_html_e( 'Enter the OAuth client ID from the Google Cloud project approved for Business Profile API access.', 'apex-local-seo' ); ?></em>
					</label>
					<label>
						<span><?php esc_html_e( 'OAuth Client Secret', 'apex-local-seo' ); ?></span>
						<input type="password" name="google_client_secret" value="" autocomplete="new-password" aria-describedby="apls-google-secret-help">
						<em id="apls-google-secret-help"><?php esc_html_e( 'Secrets are stored through WordPress settings. Leave blank unless replacing the current secret.', 'apex-local-seo' ); ?></em>
					</label>
					<label>
						<span><?php esc_html_e( 'Authorized Redirect URI', 'apex-local-seo' ); ?></span>
						<input type="text" readonly value="<?php echo esc_attr( $status['redirectUri'] ); ?>" aria-describedby="apls-google-redirect-help">
						<em id="apls-google-redirect-help"><?php esc_html_e( 'Copy this exact URI into the Google Cloud OAuth client before connecting.', 'apex-local-seo' ); ?></em>
					</label>
					<button class="apls-btn apls-btn-primary" type="submit"><?php esc_html_e( 'Save Google Settings', 'apex-local-seo' ); ?></button>
				</form>

				<div class="apls-action-row">
					<?php if ( ! $status['connected'] ) : ?>
						<form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>">
							<input type="hidden" name="action" value="apls_google_connect">
							<?php wp_nonce_field( 'apls_google_connect' ); ?>
							<button class="apls-btn apls-btn-primary" type="submit" <?php disabled( ! $status['configured'] ); ?>><?php esc_html_e( 'Connect Google Account', 'apex-local-seo' ); ?></button>
						</form>
					<?php else : ?>
						<div class="apls-empty">
							<img src="<?php echo esc_url( APLS_PLUGIN_URL . 'assets/branding/apex-local-seo-icon-128.png' ); ?>" alt="<?php esc_attr_e( 'Apex Local SEO icon', 'apex-local-seo' ); ?>">
							<div>
								<strong><?php echo esc_html( $status['email'] ); ?></strong>
								<p><?php esc_html_e( 'Connected with Business Profile permission. Sync imports available business locations for this Google account.', 'apex-local-seo' ); ?></p>
							</div>
						</div>
						<form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>">
							<input type="hidden" name="action" value="apls_google_sync">
							<?php wp_nonce_field( 'apls_google_sync' ); ?>
							<button class="apls-btn apls-btn-primary" type="submit"><?php esc_html_e( 'Sync Business Profile', 'apex-local-seo' ); ?></button>
						</form>
						<form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>">
							<input type="hidden" name="action" value="apls_google_disconnect">
							<?php wp_nonce_field( 'apls_google_disconnect' ); ?>
							<button class="apls-btn" type="submit"><?php esc_html_e( 'Disconnect Account', 'apex-local-seo' ); ?></button>
						</form>
					<?php endif; ?>
				</div>
			</section>

			<section class="apls-card">
				<div class="apls-card-head"><h2><?php esc_html_e( 'Data & Retention', 'apex-local-seo' ); ?></h2></div>
				<p><?php /* translators: 1: retention days, 2: sync frequency label. */ echo esc_html( sprintf( __( 'Retention: %1$d days. Sync: %2$s.', 'apex-local-seo' ), absint( $settings['dataRetentionDays'] ), sanitize_text_field( $settings['syncFrequency'] ) ) ); ?></p>
				<p><?php esc_html_e( 'Provider data is cached for responsive dashboards and refreshed through approved sync workflows. Historical cleanup runs through daily maintenance hooks.', 'apex-local-seo' ); ?></p>
			</section>
			<section class="apls-card">
				<div class="apls-card-head"><h2><?php esc_html_e( 'Modules', 'apex-local-seo' ); ?></h2></div>
				<div class="apls-readiness-list">
					<?php foreach ( $this->modules->summaries() as $module ) : ?>
						<span><?php echo esc_html( $module['label'] . ' - ' . $module['status'] ); ?></span>
					<?php endforeach; ?>
				</div>
			</section>
		</div>
		<?php
		APLS_Admin_Components_ApexShell::end();
	}

	/**
	 * Notice.
	 */
	private function notice() {
		$error  = sanitize_text_field( wp_unslash( $_GET['apls_error'] ?? '' ) ); // phpcs:ignore WordPress.Security.NonceVerification.Recommended
		$notice = sanitize_text_field( wp_unslash( $_GET['apls_notice'] ?? '' ) ); // phpcs:ignore WordPress.Security.NonceVerification.Recommended

		if ( '' !== $error ) {
			echo '<div class="apls-notice apls-notice-error">' . esc_html( $error ) . '</div>';
			return;
		}

		if ( '' !== $notice ) {
			$messages = array(
				'google-settings-saved' => __( 'Google settings saved.', 'apex-local-seo' ),
				'google-connected'      => __( 'Google account connected. Run sync to import available Business Profile locations.', 'apex-local-seo' ),
				'google-disconnected'   => __( 'Google account disconnected.', 'apex-local-seo' ),
				'google-synced'         => __( 'Google Business Profile sync completed.', 'apex-local-seo' ),
			);
			echo '<div class="apls-notice apls-notice-success">' . esc_html( $messages[ $notice ] ?? $notice ) . '</div>';
		}
	}
}
