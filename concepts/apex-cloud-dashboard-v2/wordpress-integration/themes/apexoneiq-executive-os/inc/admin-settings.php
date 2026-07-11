<?php
/**
 * ApexOneIQ WordPress admin settings.
 *
 * @package ApexOneIQ
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

add_action( 'admin_menu', 'apexoneiq_register_admin_settings_page' );
add_action( 'admin_post_apexoneiq_save_stripe_settings', 'apexoneiq_save_stripe_settings' );

/**
 * Register the ApexOneIQ settings page.
 */
function apexoneiq_register_admin_settings_page() {
	add_theme_page(
		__( 'ApexOneIQ Settings', 'apexoneiq' ),
		__( 'ApexOneIQ Settings', 'apexoneiq' ),
		'manage_options',
		'apexoneiq-settings',
		'apexoneiq_render_admin_settings_page'
	);
}

/**
 * Render the ApexOneIQ settings page.
 */
function apexoneiq_render_admin_settings_page() {
	if ( ! current_user_can( 'manage_options' ) ) {
		return;
	}

	$publishable_key = get_option( 'apexoneiq_stripe_publishable_key', '' );
	$secret_key      = get_option( 'apexoneiq_stripe_secret_key', '' );
	$webhook_secret  = get_option( 'apexoneiq_stripe_webhook_secret', '' );
	$status          = isset( $_GET['apexoneiq_status'] ) ? sanitize_key( wp_unslash( $_GET['apexoneiq_status'] ) ) : '';
	?>
	<div class="wrap">
		<h1><?php esc_html_e( 'ApexOneIQ Settings', 'apexoneiq' ); ?></h1>
		<?php if ( 'saved' === $status ) : ?>
			<div class="notice notice-success"><p><?php esc_html_e( 'Sandbox Stripe settings saved.', 'apexoneiq' ); ?></p></div>
		<?php elseif ( 'invalid' === $status ) : ?>
			<div class="notice notice-error"><p><?php esc_html_e( 'Only Stripe sandbox keys are allowed.', 'apexoneiq' ); ?></p></div>
		<?php endif; ?>
		<form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>">
			<input type="hidden" name="action" value="apexoneiq_save_stripe_settings">
			<?php wp_nonce_field( 'apexoneiq_save_stripe_settings' ); ?>
			<table class="form-table" role="presentation">
				<tr>
					<th scope="row"><label for="apexoneiq_stripe_publishable_key"><?php esc_html_e( 'Stripe sandbox publishable key', 'apexoneiq' ); ?></label></th>
					<td>
						<input class="regular-text code" type="text" id="apexoneiq_stripe_publishable_key" name="apexoneiq_stripe_publishable_key" value="<?php echo esc_attr( $publishable_key ); ?>" autocomplete="off">
					</td>
				</tr>
				<tr>
					<th scope="row"><label for="apexoneiq_stripe_secret_key"><?php esc_html_e( 'Stripe sandbox secret key', 'apexoneiq' ); ?></label></th>
					<td>
						<input class="regular-text code" type="password" id="apexoneiq_stripe_secret_key" name="apexoneiq_stripe_secret_key" value="<?php echo esc_attr( $secret_key ); ?>" autocomplete="off">
						<p class="description"><?php esc_html_e( 'Development only. Live keys are rejected by the checkout route.', 'apexoneiq' ); ?></p>
					</td>
				</tr>
				<tr>
					<th scope="row"><label for="apexoneiq_stripe_webhook_secret"><?php esc_html_e( 'Stripe sandbox webhook secret', 'apexoneiq' ); ?></label></th>
					<td>
						<input class="regular-text code" type="password" id="apexoneiq_stripe_webhook_secret" name="apexoneiq_stripe_webhook_secret" value="<?php echo esc_attr( $webhook_secret ); ?>" autocomplete="off">
						<p class="description"><?php esc_html_e( 'Must start with whsec_. Used to verify Stripe Sandbox webhook signatures.', 'apexoneiq' ); ?></p>
					</td>
				</tr>
			</table>
			<?php submit_button( __( 'Save Sandbox Settings', 'apexoneiq' ) ); ?>
		</form>
	</div>
	<?php
}

/**
 * Save sandbox Stripe settings.
 */
function apexoneiq_save_stripe_settings() {
	if ( ! current_user_can( 'manage_options' ) ) {
		wp_die( esc_html__( 'Insufficient permissions.', 'apexoneiq' ) );
	}

	check_admin_referer( 'apexoneiq_save_stripe_settings' );

	$publishable_key = isset( $_POST['apexoneiq_stripe_publishable_key'] ) ? sanitize_text_field( wp_unslash( $_POST['apexoneiq_stripe_publishable_key'] ) ) : '';
	$secret_key      = isset( $_POST['apexoneiq_stripe_secret_key'] ) ? sanitize_text_field( wp_unslash( $_POST['apexoneiq_stripe_secret_key'] ) ) : '';
	$webhook_secret  = isset( $_POST['apexoneiq_stripe_webhook_secret'] ) ? sanitize_text_field( wp_unslash( $_POST['apexoneiq_stripe_webhook_secret'] ) ) : '';

	if ( $publishable_key && 0 !== strpos( $publishable_key, 'pk_test_' ) ) {
		wp_safe_redirect( add_query_arg( 'apexoneiq_status', 'invalid', wp_get_referer() ?: admin_url( 'themes.php?page=apexoneiq-settings' ) ) );
		exit;
	}

	if ( $secret_key && 0 !== strpos( $secret_key, 'sk_test_' ) ) {
		wp_safe_redirect( add_query_arg( 'apexoneiq_status', 'invalid', wp_get_referer() ?: admin_url( 'themes.php?page=apexoneiq-settings' ) ) );
		exit;
	}

	if ( $webhook_secret && 0 !== strpos( $webhook_secret, 'whsec_' ) ) {
		wp_safe_redirect( add_query_arg( 'apexoneiq_status', 'invalid', wp_get_referer() ?: admin_url( 'themes.php?page=apexoneiq-settings' ) ) );
		exit;
	}

	update_option( 'apexoneiq_stripe_publishable_key', $publishable_key, false );
	update_option( 'apexoneiq_stripe_secret_key', $secret_key, false );
	update_option( 'apexoneiq_stripe_webhook_secret', $webhook_secret, false );

	wp_safe_redirect( add_query_arg( 'apexoneiq_status', 'saved', admin_url( 'themes.php?page=apexoneiq-settings' ) ) );
	exit;
}
