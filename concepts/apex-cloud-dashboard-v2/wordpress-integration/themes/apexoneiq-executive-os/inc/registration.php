<?php
/**
 * Free registration and OAuth foundation routes.
 *
 * @package ApexOneIQ
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

add_action( 'login_init', 'apexoneiq_redirect_public_wp_login' );

/**
 * Return the Google OAuth client ID from secure server-side configuration.
 *
 * @return string
 */
function apexoneiq_google_client_id() {
	if ( defined( 'APEXONEIQ_GOOGLE_CLIENT_ID' ) && APEXONEIQ_GOOGLE_CLIENT_ID ) {
		return (string) APEXONEIQ_GOOGLE_CLIENT_ID;
	}

	$env = getenv( 'APEXONEIQ_GOOGLE_CLIENT_ID' );
	if ( $env ) {
		return (string) $env;
	}

	return (string) get_option( 'apexoneiq_google_client_id', '' );
}

/**
 * Return the Google OAuth client secret from secure server-side configuration.
 *
 * @return string
 */
function apexoneiq_google_client_secret() {
	if ( defined( 'APEXONEIQ_GOOGLE_CLIENT_SECRET' ) && APEXONEIQ_GOOGLE_CLIENT_SECRET ) {
		return (string) APEXONEIQ_GOOGLE_CLIENT_SECRET;
	}

	$env = getenv( 'APEXONEIQ_GOOGLE_CLIENT_SECRET' );
	if ( $env ) {
		return (string) $env;
	}

	return (string) get_option( 'apexoneiq_google_client_secret', '' );
}

/**
 * Return the canonical Google OAuth callback URL.
 *
 * @return string
 */
function apexoneiq_google_redirect_uri() {
	return home_url( '/oauth/google/callback/' );
}

/**
 * Redirect public WordPress login visits to the ApexOneIQ sign-in experience.
 */
function apexoneiq_redirect_public_wp_login() {
	$action = isset( $_REQUEST['action'] ) ? sanitize_key( wp_unslash( $_REQUEST['action'] ) ) : '';
	$admin  = isset( $_GET['apexoneiq_admin'] ) && '1' === sanitize_text_field( wp_unslash( $_GET['apexoneiq_admin'] ) );

	if ( $admin || in_array( $action, array( 'logout', 'lostpassword', 'rp', 'resetpass', 'postpass' ), true ) ) {
		return;
	}

	if ( is_user_logged_in() && current_user_can( 'manage_options' ) ) {
		return;
	}

	wp_safe_redirect( home_url( '/sign-in.html' ) );
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
			update_user_meta( $user_id, 'apexoneiq_free_snapshot_status', 'pending_executive_scan' );
			wp_set_current_user( $user_id );
			wp_set_auth_cookie( $user_id, true );
			wp_safe_redirect( home_url( '/sign-in.html' ) );
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
						<h1><?php esc_html_e( 'Create your free ApexOneIQ executive scan.', 'apexoneiq' ); ?></h1>
						<p><?php esc_html_e( 'Register your business, complete the Executive Scan, and upgrade only when you are ready for Cloud, Command, or managed Concierge support.', 'apexoneiq' ); ?></p>
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
							<p class="form-status" data-register-status><?php esc_html_e( 'After registration, your account opens the Executive Scan before any dashboard intelligence is shown.', 'apexoneiq' ); ?></p>
						</form>
						<div class="oauth-options" aria-label="<?php esc_attr_e( 'Google sign-in', 'apexoneiq' ); ?>">
							<a class="ghost-button" href="<?php echo esc_url( home_url( '/oauth/google/' ) ); ?>"><?php esc_html_e( 'Continue with Google', 'apexoneiq' ); ?><small><?php esc_html_e( 'Free account access', 'apexoneiq' ); ?></small></a>
						</div>
						<p class="auth-switch"><?php esc_html_e( 'Already have an account?', 'apexoneiq' ); ?> <a href="<?php echo esc_url( home_url( '/sign-in.html' ) ); ?>"><?php esc_html_e( 'Sign In', 'apexoneiq' ); ?></a></p>
					</div>
				</section>
			</main>
		</div>
		<script>window.ApexOneIQ=<?php echo wp_json_encode( array( 'baseUrl' => trailingslashit( home_url() ), 'authUrl' => home_url( '/sign-in.html' ), 'registerUrl' => home_url( '/register/' ) ) ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>;</script>
		<script src="<?php echo esc_url( APEXONEIQ_THEME_URI . 'assets/js/app.js?ver=' . APEXONEIQ_THEME_VERSION ); ?>"></script>
	</body>
	</html>
	<?php
}

/**
 * Start the requested OAuth provider flow.
 *
 * @param string $provider Provider slug.
 */
function apexoneiq_start_oauth_flow( $provider ) {
	if ( 'google' !== $provider ) {
		apexoneiq_render_oauth_error( __( 'This sign-in provider is not supported by ApexOneIQ.', 'apexoneiq' ) );
		return;
	}

	$client_id = apexoneiq_google_client_id();
	if ( ! $client_id || ! apexoneiq_google_client_secret() ) {
		apexoneiq_render_oauth_error( __( 'Google Sign-In is not configured yet. Add the Google OAuth client ID and secret to server-side WordPress configuration.', 'apexoneiq' ) );
		return;
	}

	$state = wp_generate_password( 40, false, false );
	$nonce = wp_generate_password( 32, false, false );
	$redirect_to = isset( $_GET['redirect_to'] ) ? apexoneiq_allowed_oauth_redirect( wp_unslash( $_GET['redirect_to'] ) ) : home_url( '/sign-in.html' );

	set_transient(
		'apexoneiq_google_oauth_' . hash( 'sha256', $state ),
		array(
			'nonce'       => $nonce,
			'redirect_to' => $redirect_to,
			'created'     => time(),
		),
		10 * MINUTE_IN_SECONDS
	);

	$auth_url = add_query_arg(
		array(
			'client_id'     => $client_id,
			'redirect_uri'  => apexoneiq_google_redirect_uri(),
			'response_type' => 'code',
			'scope'         => 'openid email profile',
			'state'         => $state,
			'nonce'         => $nonce,
			'prompt'        => 'select_account',
			'access_type'   => 'online',
		),
		'https://accounts.google.com/o/oauth2/v2/auth'
	);

	wp_redirect( $auth_url ); // phpcs:ignore WordPress.Security.SafeRedirect.wp_redirect_wp_redirect
	exit;
}

/**
 * Handle the requested OAuth provider callback.
 *
 * @param string $provider Provider slug.
 */
function apexoneiq_handle_oauth_callback( $provider ) {
	if ( 'google' !== $provider ) {
		apexoneiq_render_oauth_error( __( 'This sign-in provider is not supported by ApexOneIQ.', 'apexoneiq' ) );
		return;
	}

	apexoneiq_handle_google_oauth_callback();
}

/**
 * Handle Google OAuth callback, create/link a Free user, and sign in.
 */
function apexoneiq_handle_google_oauth_callback() {
	if ( ! empty( $_GET['error'] ) ) {
		apexoneiq_render_oauth_error( sanitize_text_field( wp_unslash( $_GET['error'] ) ) );
		return;
	}

	$code  = isset( $_GET['code'] ) ? sanitize_text_field( wp_unslash( $_GET['code'] ) ) : '';
	$state = isset( $_GET['state'] ) ? sanitize_text_field( wp_unslash( $_GET['state'] ) ) : '';

	if ( ! $code || ! $state ) {
		apexoneiq_render_oauth_error( __( 'Google Sign-In was missing the required authorization response.', 'apexoneiq' ) );
		return;
	}

	$transient_key = 'apexoneiq_google_oauth_' . hash( 'sha256', $state );
	$attempt       = get_transient( $transient_key );
	delete_transient( $transient_key );

	if ( ! is_array( $attempt ) || empty( $attempt['nonce'] ) ) {
		apexoneiq_render_oauth_error( __( 'Google Sign-In expired. Start again from the ApexOneIQ sign-in page.', 'apexoneiq' ) );
		return;
	}

	$tokens = apexoneiq_google_exchange_code( $code );
	if ( is_wp_error( $tokens ) ) {
		apexoneiq_render_oauth_error( $tokens->get_error_message() );
		return;
	}

	$profile = apexoneiq_google_validate_id_token( $tokens['id_token'] ?? '', $attempt['nonce'] );
	if ( is_wp_error( $profile ) ) {
		apexoneiq_render_oauth_error( $profile->get_error_message() );
		return;
	}

	$user_id = apexoneiq_google_resolve_user( $profile );
	if ( is_wp_error( $user_id ) ) {
		apexoneiq_render_oauth_error( $user_id->get_error_message() );
		return;
	}

	wp_set_current_user( $user_id );
	wp_set_auth_cookie( $user_id, true );
	do_action( 'wp_login', get_userdata( $user_id )->user_login, get_userdata( $user_id ) );

	wp_safe_redirect( apexoneiq_oauth_destination_for_user( $user_id, $attempt['redirect_to'] ?? home_url( '/sign-in.html' ) ) );
	exit;
}

/**
 * Exchange a Google authorization code for server-side tokens.
 *
 * @param string $code Authorization code.
 * @return array<string,mixed>|WP_Error
 */
function apexoneiq_google_exchange_code( $code ) {
	$response = wp_remote_post(
		'https://oauth2.googleapis.com/token',
		array(
			'timeout' => 15,
			'body'    => array(
				'code'          => $code,
				'client_id'     => apexoneiq_google_client_id(),
				'client_secret' => apexoneiq_google_client_secret(),
				'redirect_uri'  => apexoneiq_google_redirect_uri(),
				'grant_type'    => 'authorization_code',
			),
		)
	);

	if ( is_wp_error( $response ) ) {
		return $response;
	}

	$body = json_decode( wp_remote_retrieve_body( $response ), true );
	if ( 200 !== wp_remote_retrieve_response_code( $response ) || empty( $body['id_token'] ) ) {
		return new WP_Error( 'apexoneiq_google_token_failed', __( 'Google Sign-In could not verify this login. Try again.', 'apexoneiq' ) );
	}

	return $body;
}

/**
 * Validate a Google ID token through Google's tokeninfo endpoint.
 *
 * @param string $id_token Google ID token.
 * @param string $nonce    Expected OIDC nonce.
 * @return array<string,string>|WP_Error
 */
function apexoneiq_google_validate_id_token( $id_token, $nonce ) {
	if ( ! $id_token ) {
		return new WP_Error( 'apexoneiq_google_missing_id_token', __( 'Google did not return an identity token.', 'apexoneiq' ) );
	}

	$response = wp_remote_get(
		add_query_arg( 'id_token', $id_token, 'https://oauth2.googleapis.com/tokeninfo' ),
		array( 'timeout' => 15 )
	);

	if ( is_wp_error( $response ) ) {
		return $response;
	}

	$body = json_decode( wp_remote_retrieve_body( $response ), true );
	if ( 200 !== wp_remote_retrieve_response_code( $response ) || ! is_array( $body ) ) {
		return new WP_Error( 'apexoneiq_google_tokeninfo_failed', __( 'Google identity verification failed. Try again.', 'apexoneiq' ) );
	}

	$issuer = $body['iss'] ?? '';
	$aud    = $body['aud'] ?? '';
	$exp    = absint( $body['exp'] ?? 0 );
	$claims = apexoneiq_decode_jwt_payload( $id_token );
	$token_nonce = $body['nonce'] ?? ( $claims['nonce'] ?? '' );

	if ( ! in_array( $issuer, array( 'accounts.google.com', 'https://accounts.google.com' ), true ) || apexoneiq_google_client_id() !== $aud || $exp < time() || $token_nonce !== $nonce ) {
		return new WP_Error( 'apexoneiq_google_claims_invalid', __( 'Google identity claims did not match ApexOneIQ security requirements.', 'apexoneiq' ) );
	}

	if ( empty( $body['email'] ) || empty( $body['sub'] ) || 'true' !== (string) ( $body['email_verified'] ?? '' ) ) {
		return new WP_Error( 'apexoneiq_google_email_unverified', __( 'Google must return a verified email address to sign in.', 'apexoneiq' ) );
	}

	return array(
		'sub'     => sanitize_text_field( $body['sub'] ),
		'email'   => sanitize_email( $body['email'] ),
		'name'    => sanitize_text_field( $body['name'] ?? $body['email'] ),
		'picture' => esc_url_raw( $body['picture'] ?? '' ),
	);
}

/**
 * Decode non-sensitive JWT payload claims after tokeninfo has verified the token.
 *
 * @param string $jwt JSON web token.
 * @return array<string,mixed>
 */
function apexoneiq_decode_jwt_payload( $jwt ) {
	$parts = explode( '.', $jwt );
	if ( count( $parts ) < 2 ) {
		return array();
	}

	$payload = strtr( $parts[1], '-_', '+/' );
	$payload .= str_repeat( '=', ( 4 - strlen( $payload ) % 4 ) % 4 );
	$decoded = base64_decode( $payload, true ); // phpcs:ignore WordPress.PHP.DiscouragedPHPFunctions.obfuscation_base64_decode
	if ( false === $decoded ) {
		return array();
	}

	$claims = json_decode( $decoded, true );
	return is_array( $claims ) ? $claims : array();
}

/**
 * Resolve a Google profile to a WordPress user, creating a Free user if needed.
 *
 * @param array<string,string> $profile Google profile.
 * @return int|WP_Error
 */
function apexoneiq_google_resolve_user( $profile ) {
	$sub   = $profile['sub'];
	$email = $profile['email'];

	$users = get_users(
		array(
			'meta_key'    => 'apexoneiq_google_sub', // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_key
			'meta_value'  => $sub, // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_value
			'number'      => 1,
			'count_total' => false,
			'fields'      => 'ids',
		)
	);

	if ( $users ) {
		$user_id = absint( $users[0] );
	} else {
		$existing = get_user_by( 'email', $email );
		if ( $existing ) {
			$user_id = absint( $existing->ID );
			if ( user_can( $user_id, 'manage_options' ) ) {
				return new WP_Error( 'apexoneiq_google_admin_blocked', __( 'Administrator accounts must use the protected WordPress administrator login.', 'apexoneiq' ) );
			}
		} else {
			$username = apexoneiq_unique_oauth_username( $email );
			$user_id  = wp_create_user( $username, wp_generate_password( 32, true, true ), $email );
			if ( is_wp_error( $user_id ) ) {
				return $user_id;
			}

			wp_update_user(
				array(
					'ID'           => $user_id,
					'display_name' => $profile['name'] ?: $email,
					'nickname'     => $profile['name'] ?: $email,
				)
			);

			update_user_meta( $user_id, 'apexoneiq_registration_source', 'google_oauth_free_registration' );
			update_user_meta( $user_id, 'apexoneiq_free_snapshot_status', 'pending_executive_scan' );
			update_user_meta( $user_id, 'apexoneiq_subscription_plan', 'free' );
			update_user_meta( $user_id, 'apexoneiq_subscription_status', 'none' );
			update_user_meta( $user_id, 'apexoneiq_subscription_capabilities', apexoneiq_capabilities_for_plan( 'free' ) );
		}
	}

	if ( user_can( $user_id, 'manage_options' ) ) {
		return new WP_Error( 'apexoneiq_google_admin_blocked', __( 'Administrator accounts must use the protected WordPress administrator login.', 'apexoneiq' ) );
	}

	update_user_meta( $user_id, 'apexoneiq_google_sub', $sub );
	update_user_meta( $user_id, 'apexoneiq_google_email', $email );
	update_user_meta( $user_id, 'apexoneiq_google_picture', $profile['picture'] );
	update_user_meta( $user_id, 'apexoneiq_last_google_login', gmdate( 'c' ) );

	return $user_id;
}

/**
 * Create a unique WordPress username for an OAuth-created user.
 *
 * @param string $email Email address.
 * @return string
 */
function apexoneiq_unique_oauth_username( $email ) {
	$base = sanitize_user( current( explode( '@', $email ) ), true );
	$base = $base ?: 'apex-user';
	$name = $base;
	$i    = 2;

	while ( username_exists( $name ) ) {
		$name = $base . '-' . $i;
		$i++;
	}

	return $name;
}

/**
 * Allow only same-origin dashboard/account redirects after OAuth.
 *
 * @param string $redirect_to Requested redirect.
 * @return string
 */
function apexoneiq_allowed_oauth_redirect( $redirect_to ) {
	$redirect_to = (string) $redirect_to;
	$path        = wp_parse_url( $redirect_to, PHP_URL_PATH );

	if ( ! $path ) {
		return home_url( '/sign-in.html' );
	}

	$allowed = array(
		'/dashboard.html',
		'/sign-in.html',
		'/account',
		'/account.html',
		'/subscription.html',
	);

	return in_array( $path, $allowed, true ) ? home_url( $path ) : home_url( '/sign-in.html' );
}

/**
 * Choose the correct post-OAuth destination using completed onboarding state.
 *
 * @param int    $user_id      WordPress user ID.
 * @param string $requested_to Requested redirect URL.
 * @return string
 */
function apexoneiq_oauth_destination_for_user( $user_id, $requested_to ) {
	$requested_path = wp_parse_url( (string) $requested_to, PHP_URL_PATH );

	if ( apexoneiq_user_has_existing_workspace( $user_id ) ) {
		if ( in_array( $requested_path, array( '/account', '/account.html', '/subscription.html' ), true ) ) {
			return home_url( $requested_path );
		}

		return home_url( '/dashboard.html' );
	}

	return home_url( '/sign-in.html' );
}

/**
 * Whether a user has submitted and completed the Executive Scan onboarding.
 *
 * @param int $user_id WordPress user ID.
 * @return bool
 */
function apexoneiq_user_has_completed_onboarding( $user_id ) {
	return '1' === (string) get_user_meta( $user_id, 'apexoneiq_onboarding_completed', true );
}

/**
 * Whether a user should bypass first-run onboarding and open an existing workspace.
 *
 * @param int $user_id WordPress user ID.
 * @return bool
 */
function apexoneiq_user_has_existing_workspace( $user_id ) {
	$user_id = absint( $user_id );
	if ( ! $user_id ) {
		return false;
	}

	if ( apexoneiq_user_has_completed_onboarding( $user_id ) ) {
		return true;
	}

	$website = (string) get_user_meta( $user_id, 'apexoneiq_business_website', true );
	if ( ! $website ) {
		return false;
	}

	if ( user_can( $user_id, 'manage_options' ) ) {
		return true;
	}

	$state = function_exists( 'apexoneiq_get_user_subscription_state' ) ? apexoneiq_get_user_subscription_state( $user_id ) : array();
	return ! empty( $state['active'] ) || ! empty( $state['grace_period'] );
}

/**
 * Render a safe OAuth error page without exposing provider tokens.
 *
 * @param string $message Error message.
 */
function apexoneiq_render_oauth_error( $message ) {
	status_header( 400 );
	wp_die(
		esc_html( $message ),
		esc_html__( 'ApexOneIQ Sign-In', 'apexoneiq' ),
		array(
			'response' => 400,
			'link_url' => home_url( '/sign-in.html' ),
			'link_text' => __( 'Return to ApexOneIQ Sign In', 'apexoneiq' ),
		)
	);
}
