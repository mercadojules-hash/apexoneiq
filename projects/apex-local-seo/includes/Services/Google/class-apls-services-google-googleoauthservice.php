<?php
/**
 * Apex Local SEO plugin file.
 *
 * @package Apex_Local_SEO
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; }

/**
 * APLS Services Google GoogleOAuthService.
 */
class APLS_Services_Google_GoogleOAuthService implements APLS_Contracts_ServiceInterface {
	const AUTH_URL     = 'https://accounts.google.com/o/oauth2/v2/auth';
	const TOKEN_URL    = 'https://oauth2.googleapis.com/token';
	const USERINFO_URL = 'https://www.googleapis.com/oauth2/v3/userinfo';
	const SCOPE        = 'openid email profile https://www.googleapis.com/auth/business.manage';

	/**
	 * Settings.
	 *
	 * @var mixed
	 */
	private $settings;
	/**
	 * Repository.
	 *
	 * @var mixed
	 */
	private $repository;

	/**
	 * Construct.
	 *
	 * @param APLS_Data_Repositories_SettingsRepository $settings Settings.

	 * @param APLS_Data_Repositories_GbpRepository      $repository Repository.
	 */
	public function __construct( APLS_Data_Repositories_SettingsRepository $settings, APLS_Data_Repositories_GbpRepository $repository ) {
		$this->settings   = $settings;
		$this->repository = $repository;
	}

	/**
	 * Configured.
	 */
	public function configured() {
		return '' !== trim( (string) $this->settings->get( 'google_client_id', '' ) ) && '' !== trim( (string) $this->settings->get( 'google_client_secret', '' ) );
	}

	/**
	 * Redirect uri.
	 */
	public function redirect_uri() {
		return admin_url( 'admin-post.php?action=apls_google_callback' );
	}

	/**
	 * Status.
	 */
	public function status() {
		$account = $this->repository->connected_account();

		return array(
			'configured'  => $this->configured(),
			'connected'   => is_array( $account ),
			'email'       => is_array( $account ) ? sanitize_email( $account['email'] ?? '' ) : '',
			'scopes'      => is_array( $account ) ? sanitize_text_field( $account['scopes'] ?? '' ) : '',
			'expiresAt'   => is_array( $account ) ? sanitize_text_field( $account['access_token_expires_at'] ?? '' ) : '',
			'redirectUri' => $this->redirect_uri(),
		);
	}

	/**
	 * Authorization url.
	 */
	public function authorization_url() {
		if ( ! $this->configured() ) {
			$this->log( 'Authorization URL requested but credentials are not configured.' );
			return new WP_Error( 'apls_google_not_configured', __( 'Google OAuth client ID and secret are required before connecting.', 'apex-local-seo' ) );
		}

		$state = wp_generate_password( 32, false, false );
		$this->log( 'Creating OAuth state transient for user ' . absint( get_current_user_id() ) . '.' );
		set_transient(
			'apls_google_oauth_state_' . $state,
			array(
				'user_id' => get_current_user_id(),
				'created' => time(),
			),
			10 * MINUTE_IN_SECONDS
		);

		$url = add_query_arg(
			array(
				'client_id'              => trim( (string) $this->settings->get( 'google_client_id', '' ) ),
				'redirect_uri'           => $this->redirect_uri(),
				'response_type'          => 'code',
				'scope'                  => self::SCOPE,
				'access_type'            => 'offline',
				'prompt'                 => 'consent',
				'include_granted_scopes' => 'true',
				'state'                  => $state,
			),
			self::AUTH_URL
		);

		$this->log( 'Authorization URL generated with redirect_uri=' . $this->redirect_uri() . ', response_type=code, scope=openid email profile business.manage, access_type=offline, prompt=consent, state_present=yes.' );
		return $url;
	}

	/**
	 * Handle callback.
	 *
	 * @param mixed $code Code.

	 * @param mixed $state State.
	 */
	public function handle_callback( $code, $state ) {
		$this->log( 'Callback handler loading. code_present=' . ( '' === (string) $code ? 'no' : 'yes' ) . ', state_present=' . ( '' === (string) $state ? 'no' : 'yes' ) . '.' );
		$state_key = 'apls_google_oauth_state_' . sanitize_text_field( $state );
		$stored    = get_transient( $state_key );
		delete_transient( $state_key );

		if ( empty( $stored['user_id'] ) || absint( $stored['user_id'] ) !== get_current_user_id() ) {
			$this->log( 'Callback state verification failed.' );
			return new WP_Error( 'apls_google_invalid_state', __( 'Google OAuth state could not be verified. Please reconnect.', 'apex-local-seo' ) );
		}

		$this->log( 'Callback state verified. Starting token exchange.' );
		$token = $this->request_token(
			array(
				'code'          => sanitize_text_field( $code ),
				'client_id'     => trim( (string) $this->settings->get( 'google_client_id', '' ) ),
				'client_secret' => trim( (string) $this->settings->get( 'google_client_secret', '' ) ),
				'redirect_uri'  => $this->redirect_uri(),
				'grant_type'    => 'authorization_code',
			)
		);

		if ( is_wp_error( $token ) ) {
			$this->log( 'Token exchange failed: ' . $token->get_error_message() );
			return $token;
		}

		$this->log( 'Token exchange succeeded. access_token_present=' . ( empty( $token['access_token'] ) ? 'no' : 'yes' ) . ', refresh_token_present=' . ( empty( $token['refresh_token'] ) ? 'no' : 'yes' ) . ', id_token_present=' . ( empty( $token['id_token'] ) ? 'no' : 'yes' ) . ', expires_in=' . absint( $token['expires_in'] ?? 0 ) . ', returned_scope=' . sanitize_text_field( $token['scope'] ?? '' ) . '. Requesting Google userinfo.' );
		$user  = $this->request_userinfo( $token['access_token'] );
		$email = '';
		if ( is_wp_error( $user ) ) {
			$this->log( 'Userinfo request failed: ' . $user->get_error_message() );
			$email = $this->email_from_id_token( $token['id_token'] ?? '' );
			if ( '' === $email ) {
				return $user;
			}
			$this->log( 'Recovered connected Google email from id_token after userinfo failure.' );
		} else {
			$email = sanitize_email( $user['email'] ?? '' );
		}

		if ( '' === $email ) {
			$this->log( 'Userinfo response did not include an email address.' );
			return new WP_Error( 'apls_google_missing_email', __( 'Google did not return an email address. Please reconnect and approve email access.', 'apex-local-seo' ) );
		}
		$expires_at = gmdate( 'Y-m-d H:i:s', time() + absint( $token['expires_in'] ?? 3600 ) );
		$this->repository->save_connected_account(
			$email,
			$this->encrypt( $token['access_token'] ?? '' ),
			$this->encrypt( $token['refresh_token'] ?? '' ),
			$expires_at,
			sanitize_text_field( $token['scope'] ?? self::SCOPE )
		);
		$this->settings->set( 'google_connected_email', $email );
		$this->log( 'Token storage completed for connected Google email: ' . $email . ', expires_at=' . $expires_at . ', refresh_token_saved=' . ( empty( $token['refresh_token'] ) ? 'no' : 'yes' ) . '.' );

		return array(
			'email'     => $email,
			'expiresAt' => $expires_at,
		);
	}

	/**
	 * Access token.
	 */
	public function access_token() {
		$account = $this->repository->connected_account();
		if ( ! is_array( $account ) ) {
			return new WP_Error( 'apls_google_not_connected', __( 'Google Business Profile is not connected.', 'apex-local-seo' ) );
		}

		$expires = strtotime( $account['access_token_expires_at'] ?? '' );
		if ( $expires && $expires <= time() + 120 ) {
			return $this->refresh_access_token( $account );
		}

		$token = $this->decrypt( $account['access_token_encrypted'] ?? '' );
		if ( '' === $token ) {
			return $this->refresh_access_token( $account );
		}

		return $token;
	}

	/**
	 * Refresh access token.
	 *
	 * @param mixed $account Account.
	 */
	public function refresh_access_token( $account ) {
		$this->log( 'Access token refresh requested for account ID ' . absint( $account['id'] ?? 0 ) . '.' );
		$refresh_token = $this->decrypt( $account['refresh_token_encrypted'] ?? '' );
		if ( '' === $refresh_token ) {
			$this->log( 'Access token refresh failed: missing refresh token.' );
			return new WP_Error( 'apls_google_missing_refresh_token', __( 'Google refresh token is missing. Disconnect and reconnect the account.', 'apex-local-seo' ) );
		}

		$token = $this->request_token(
			array(
				'client_id'     => trim( (string) $this->settings->get( 'google_client_id', '' ) ),
				'client_secret' => trim( (string) $this->settings->get( 'google_client_secret', '' ) ),
				'refresh_token' => $refresh_token,
				'grant_type'    => 'refresh_token',
			)
		);

		if ( is_wp_error( $token ) ) {
			$this->log( 'Access token refresh failed: ' . $token->get_error_message() );
			return $token;
		}

		$expires_at = gmdate( 'Y-m-d H:i:s', time() + absint( $token['expires_in'] ?? 3600 ) );
		$this->repository->update_access_token( $account['id'], $this->encrypt( $token['access_token'] ?? '' ), $expires_at );
		$this->log( 'Access token refresh succeeded. New expiry: ' . $expires_at . '.' );

		return sanitize_text_field( $token['access_token'] ?? '' );
	}

	/**
	 * Disconnect.
	 */
	public function disconnect() {
		return $this->repository->disconnect();
	}

	/**
	 * Request token.
	 *
	 * @param mixed $body Body.
	 */
	private function request_token( $body ) {
		$this->log( 'Token endpoint request initiated. grant_type=' . sanitize_text_field( $body['grant_type'] ?? '' ) . '.' );
		$response = wp_remote_post(
			self::TOKEN_URL,
			array(
				'timeout' => 20,
				'body'    => $body,
			)
		);

		return $this->decode_response( $response, 'apls_google_token_error' );
	}

	/**
	 * Request userinfo.
	 *
	 * @param mixed $access_token Access token.
	 */
	private function request_userinfo( $access_token ) {
		$this->log( 'Userinfo endpoint request initiated.' );
		$response = wp_remote_get(
			self::USERINFO_URL,
			array(
				'timeout' => 20,
				'headers' => array( 'Authorization' => 'Bearer ' . $access_token ),
			)
		);

		return $this->decode_response( $response, 'apls_google_userinfo_error' );
	}

	/**
	 * Decode response.
	 *
	 * @param mixed $response Response.

	 * @param mixed $code Code.
	 */
	private function decode_response( $response, $code ) {
		if ( is_wp_error( $response ) ) {
			return $response;
		}

		$status = wp_remote_retrieve_response_code( $response );
		$body   = json_decode( wp_remote_retrieve_body( $response ), true );

		if ( $status < 200 || $status >= 300 ) {
			$message = is_array( $body ) ? ( $body['error_description'] ?? $body['error']['message'] ?? $body['error'] ?? __( 'Google returned an OAuth error.', 'apex-local-seo' ) ) : __( 'Google returned an OAuth error.', 'apex-local-seo' );
			$this->log( 'OAuth HTTP response failed. status=' . absint( $status ) . ', message=' . ( is_string( $message ) ? $message : wp_json_encode( $message ) ) . '.' );
			return new WP_Error(
				$code,
				is_string( $message ) ? $message : wp_json_encode( $message ),
				array(
					'status' => $status,
					'body'   => $body,
				)
			);
		}

		$this->log( 'OAuth HTTP response succeeded. status=' . absint( $status ) . '.' );
		return is_array( $body ) ? $body : array();
	}

	/**
	 * Encrypt.
	 *
	 * @param mixed $value Value.
	 */
	private function encrypt( $value ) {
		$value = (string) $value;
		if ( '' === $value || ! function_exists( 'openssl_encrypt' ) ) {
			return $value;
		}

		$key = hash( 'sha256', AUTH_KEY . SECURE_AUTH_KEY, true );
		$iv  = random_bytes( 16 );
		$raw = openssl_encrypt( $value, 'aes-256-cbc', $key, OPENSSL_RAW_DATA, $iv );

			return base64_encode( $iv . $raw ); // phpcs:ignore WordPress.PHP.DiscouragedPHPFunctions.obfuscation_base64_encode -- Encodes encrypted token bytes for option storage.
	}

	/**
	 * Decrypt.
	 *
	 * @param mixed $value Value.
	 */
	private function decrypt( $value ) {
		$value = (string) $value;
		if ( '' === $value || ! function_exists( 'openssl_decrypt' ) ) {
			return $value;
		}

		$decoded = base64_decode( $value, true ); // phpcs:ignore WordPress.PHP.DiscouragedPHPFunctions.obfuscation_base64_decode -- Decodes encrypted token bytes from option storage.
		if ( false === $decoded || strlen( $decoded ) <= 16 ) {
			return $value;
		}

		$key = hash( 'sha256', AUTH_KEY . SECURE_AUTH_KEY, true );
		$iv  = substr( $decoded, 0, 16 );
		$raw = substr( $decoded, 16 );
		$out = openssl_decrypt( $raw, 'aes-256-cbc', $key, OPENSSL_RAW_DATA, $iv );

		return false === $out ? '' : $out;
	}

	/**
	 * Email from id token.
	 *
	 * @param mixed $id_token Id token.
	 */
	private function email_from_id_token( $id_token ) {
		$parts = explode( '.', (string) $id_token );
		if ( count( $parts ) < 2 ) {
			return '';
		}

		$payload  = $parts[1];
		$payload .= str_repeat( '=', ( 4 - strlen( $payload ) % 4 ) % 4 );
		$json     = base64_decode( strtr( $payload, '-_', '+/' ), true ); // phpcs:ignore WordPress.PHP.DiscouragedPHPFunctions.obfuscation_base64_decode -- Decodes the JSON payload segment of Google's ID token.
		if ( false === $json ) {
			return '';
		}

		$data = json_decode( $json, true );
		return sanitize_email( $data['email'] ?? '' );
	}

	/**
	 * Log.
	 *
	 * @param mixed $message Message.
	 */
	private function log( $message ) {
		unset( $message );
	}
}
