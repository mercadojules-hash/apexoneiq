<?php
/**
 * Free registration and OAuth foundation routes.
 *
 * @package ApexOneIQ
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Render and process the public Free registration route.
 */
function apexoneiq_render_register_page() {
	$errors = array();
	$posted = array(
		'business_name'    => '',
		'business_website' => isset( $_GET['website'] ) ? esc_url_raw( wp_unslash( $_GET['website'] ) ) : '',
		'email'            => isset( $_GET['email'] ) ? sanitize_email( wp_unslash( $_GET['email'] ) ) : '',
	);

	if ( 'POST' === $_SERVER['REQUEST_METHOD'] ) {
		$posted = array(
			'business_name'    => isset( $_POST['business_name'] ) ? sanitize_text_field( wp_unslash( $_POST['business_name'] ) ) : '',
			'business_website' => isset( $_POST['business_website'] ) ? esc_url_raw( wp_unslash( $_POST['business_website'] ) ) : '',
			'email'            => isset( $_POST['email'] ) ? sanitize_email( wp_unslash( $_POST['email'] ) ) : '',
		);
		$password = isset( $_POST['password'] ) ? (string) wp_unslash( $_POST['password'] ) : '';
		$confirm  = isset( $_POST['confirm_password'] ) ? (string) wp_unslash( $_POST['confirm_password'] ) : '';

		if ( ! isset( $_POST['apexoneiq_register_nonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['apexoneiq_register_nonce'] ) ), 'apexoneiq_register' ) ) {
			$errors[] = __( 'Registration expired. Refresh and try again.', 'apexoneiq' );
		}
		if ( '' === $posted['business_name'] ) {
			$errors[] = __( 'Business name is required.', 'apexoneiq' );
		}
		if ( ! wp_http_validate_url( $posted['business_website'] ) ) {
			$errors[] = __( 'Enter a full business website URL including https://.', 'apexoneiq' );
		}
		if ( ! is_email( $posted['email'] ) ) {
			$errors[] = __( 'Enter a valid business email.', 'apexoneiq' );
		}
		if ( email_exists( $posted['email'] ) ) {
			$errors[] = __( 'An account already exists for that email. Use Sign In or connect OAuth from the existing account.', 'apexoneiq' );
		}
		if ( strlen( $password ) < 8 ) {
			$errors[] = __( 'Password must be at least 8 characters.', 'apexoneiq' );
		}
		if ( $password !== $confirm ) {
			$errors[] = __( 'Passwords must match.', 'apexoneiq' );
		}

		if ( empty( $errors ) ) {
			$user_id = wp_create_user( $posted['email'], $password, $posted['email'] );
			if ( is_wp_error( $user_id ) ) {
				$errors[] = $user_id->get_error_message();
			} else {
				wp_update_user(
					array(
						'ID'           => $user_id,
						'display_name' => $posted['business_name'],
						'nickname'     => $posted['business_name'],
					)
				);
				update_user_meta( $user_id, 'apexoneiq_business_name', $posted['business_name'] );
				update_user_meta( $user_id, 'apexoneiq_business_website', $posted['business_website'] );
				update_user_meta( $user_id, 'apexoneiq_registration_source', 'free_public_registration' );
				update_user_meta( $user_id, 'apexoneiq_free_snapshot_status', 'pending_snapshot_generation' );
				wp_set_current_user( $user_id );
				wp_set_auth_cookie( $user_id, true );
				wp_safe_redirect( home_url( '/free-dashboard.html' ) );
				exit;
			}
		}
	}

	status_header( 200 );
	?>
	<!doctype html>
	<html <?php language_attributes(); ?>>
	<head>
		<meta charset="<?php bloginfo( 'charset' ); ?>">
		<meta name="viewport" content="width=device-width, initial-scale=1">
		<title><?php esc_html_e( 'ApexOneIQ - Create Free Account', 'apexoneiq' ); ?></title>
		<link rel="stylesheet" href="<?php echo esc_url( APEXONEIQ_THEME_URI . 'assets/css/app.css?ver=' . APEXONEIQ_THEME_VERSION ); ?>">
	</head>
	<body data-route="register" class="auth-page">
		<div class="app auth-workspace">
			<main class="main">
				<section class="auth-hero register-hero">
					<div>
						<div class="page-kicker"><?php esc_html_e( 'Start Free', 'apexoneiq' ); ?></div>
						<h1><?php esc_html_e( 'Create your free ApexOneIQ business snapshot.', 'apexoneiq' ); ?></h1>
						<p><?php esc_html_e( 'Register your business, review a controlled Free Dashboard, and upgrade only when you are ready for Cloud, Command, or managed Concierge support.', 'apexoneiq' ); ?></p>
					</div>
					<div class="auth-panel register-card">
						<?php if ( $errors ) : ?>
							<div class="status-pill status-critical"><?php echo esc_html( implode( ' ', $errors ) ); ?></div>
						<?php endif; ?>
						<form class="auth-form register-form" method="post" data-register-form>
							<?php wp_nonce_field( 'apexoneiq_register', 'apexoneiq_register_nonce' ); ?>
							<label><span><?php esc_html_e( 'Business name', 'apexoneiq' ); ?></span><input name="business_name" autocomplete="organization" value="<?php echo esc_attr( $posted['business_name'] ); ?>" required></label>
							<label><span><?php esc_html_e( 'Business website', 'apexoneiq' ); ?></span><input name="business_website" type="url" autocomplete="url" value="<?php echo esc_url( $posted['business_website'] ); ?>" required></label>
							<label><span><?php esc_html_e( 'Email', 'apexoneiq' ); ?></span><input name="email" type="email" autocomplete="email" value="<?php echo esc_attr( $posted['email'] ); ?>" required></label>
							<label><span><?php esc_html_e( 'Password', 'apexoneiq' ); ?></span><input name="password" type="password" autocomplete="new-password" minlength="8" required></label>
							<label><span><?php esc_html_e( 'Confirm password', 'apexoneiq' ); ?></span><input name="confirm_password" type="password" autocomplete="new-password" minlength="8" required></label>
							<button class="button" type="submit"><?php esc_html_e( 'Create Free Account', 'apexoneiq' ); ?></button>
							<p class="form-status" data-register-status><?php esc_html_e( 'After registration, your account opens the Free Dashboard with safe snapshot data and upgrade options.', 'apexoneiq' ); ?></p>
						</form>
						<div class="oauth-options" aria-label="<?php esc_attr_e( 'OAuth sign-in foundations', 'apexoneiq' ); ?>">
							<button class="ghost-button" type="button" data-oauth-provider="google"><?php esc_html_e( 'Continue with Google', 'apexoneiq' ); ?><small><?php esc_html_e( 'Setup required', 'apexoneiq' ); ?></small></button>
							<button class="ghost-button" type="button" data-oauth-provider="apple"><?php esc_html_e( 'Continue with Apple', 'apexoneiq' ); ?><small><?php esc_html_e( 'Setup required', 'apexoneiq' ); ?></small></button>
						</div>
						<p class="auth-switch"><?php esc_html_e( 'Already have an account?', 'apexoneiq' ); ?> <a href="<?php echo esc_url( wp_login_url( home_url( '/free-dashboard.html' ) ) ); ?>"><?php esc_html_e( 'Sign In', 'apexoneiq' ); ?></a></p>
					</div>
				</section>
			</main>
		</div>
		<script>window.ApexOneIQ=<?php echo wp_json_encode( array( 'baseUrl' => trailingslashit( home_url() ), 'authUrl' => wp_login_url( home_url( '/free-dashboard.html' ) ), 'registerUrl' => home_url( '/register/' ) ) ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>;</script>
		<script src="<?php echo esc_url( APEXONEIQ_THEME_URI . 'assets/js/app.js?ver=' . APEXONEIQ_THEME_VERSION ); ?>"></script>
	</body>
	</html>
	<?php
}

/**
 * Render inactive OAuth callback placeholders so redirect URIs can be configured safely.
 *
 * @param string $provider Provider slug.
 */
function apexoneiq_render_oauth_placeholder( $provider ) {
	status_header( 501 );
	wp_die(
		esc_html( sprintf( __( '%s OAuth is not active yet. Configure credentials, state validation, nonce handling, and account-linking safeguards before enabling this callback.', 'apexoneiq' ), ucfirst( $provider ) ) ),
		esc_html__( 'OAuth Setup Required', 'apexoneiq' ),
		array( 'response' => 501 )
	);
}
