<?php
/**
 * Apex Local SEO plugin file.
 *
 * @package Apex_Local_SEO
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; }

/**
 * APLS Admin Admin.
 */
class APLS_Admin_Admin {
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
	 * Init.
	 */
	public function init() {
		add_action( 'admin_menu', array( $this, 'menu' ) );
		add_action( 'admin_post_apls_google_save_settings', array( $this, 'save_google_settings' ) );
		add_action( 'admin_post_apls_google_connect', array( $this, 'connect_google' ) );
		add_action( 'admin_post_apls_google_callback', array( $this, 'google_callback' ) );
		add_action( 'admin_post_apls_google_disconnect', array( $this, 'disconnect_google' ) );
		add_action( 'admin_post_apls_google_sync', array( $this, 'sync_google' ) );
	}

	/**
	 * Menu.
	 */
	public function menu() {
		$cap = APLS_Core_Capabilities::manage();

		add_menu_page( __( 'Apex Local SEO', 'apex-local-seo' ), __( 'Apex Local SEO', 'apex-local-seo' ), $cap, 'apls', array( $this, 'dashboard' ), 'dashicons-location-alt', 58 );
		add_submenu_page( 'apls', __( 'Dashboard', 'apex-local-seo' ), __( 'Dashboard', 'apex-local-seo' ), $cap, 'apls', array( $this, 'dashboard' ) );
		add_submenu_page( 'apls', __( 'Onboarding', 'apex-local-seo' ), __( 'Onboarding', 'apex-local-seo' ), $cap, 'apls-onboarding', array( $this, 'onboarding' ) );
		add_submenu_page( 'apls', __( 'Locations', 'apex-local-seo' ), __( 'Locations', 'apex-local-seo' ), $cap, 'apls-locations', array( $this, 'locations' ) );
		add_submenu_page( 'apls', __( 'Google Business Profile', 'apex-local-seo' ), __( 'Google Business Profile', 'apex-local-seo' ), $cap, 'apls-gbp', array( $this, 'gbp' ) );
		add_submenu_page( 'apls', __( 'Reviews', 'apex-local-seo' ), __( 'Reviews', 'apex-local-seo' ), $cap, 'apls-reviews', array( $this, 'reviews' ) );
		add_submenu_page( 'apls', __( 'Schema Manager', 'apex-local-seo' ), __( 'Schema Manager', 'apex-local-seo' ), $cap, 'apls-schema', array( $this, 'schema' ) );
		add_submenu_page( 'apls', __( 'Citation Intelligence', 'apex-local-seo' ), __( 'Citation Intelligence', 'apex-local-seo' ), $cap, 'apls-citations', array( $this, 'citations' ) );
		add_submenu_page( 'apls', __( 'Executive Advisor', 'apex-local-seo' ), __( 'Executive Advisor', 'apex-local-seo' ), $cap, 'apls-advisor', array( $this, 'advisor' ) );
		add_submenu_page( 'apls', __( 'Diagnostics', 'apex-local-seo' ), __( 'Diagnostics', 'apex-local-seo' ), $cap, 'apls-diagnostics', array( $this, 'diagnostics' ) );
		add_submenu_page( 'apls', __( 'Settings', 'apex-local-seo' ), __( 'Settings', 'apex-local-seo' ), $cap, 'apls-settings', array( $this, 'settings' ) );
	}

	/**
	 * Dashboard.
	 */
	public function dashboard() {
		( new APLS_Admin_Pages_DashboardPage( $this->container, $this->modules ) )->render(); }
	/**
	 * Onboarding.
	 */
	public function onboarding() {
		( new APLS_Admin_Pages_OnboardingPage( $this->container ) )->render(); }
	/**
	 * Locations.
	 */
	public function locations() {
		( new APLS_Admin_Pages_LocationsPage( $this->container ) )->render(); }
	/**
	 * Gbp.
	 */
	public function gbp() {
		( new APLS_Admin_Pages_GbpPage( $this->container ) )->render(); }
	/**
	 * Reviews.
	 */
	public function reviews() {
		( new APLS_Admin_Pages_ReviewsPage( $this->container ) )->render(); }
	/**
	 * Schema.
	 */
	public function schema() {
		( new APLS_Admin_Pages_SchemaPage( $this->container ) )->render(); }
	/**
	 * Rankings.
	 */
	public function rankings() {
		( new APLS_Admin_Pages_RankingsPage() )->render(); }
	/**
	 * Citations.
	 */
	public function citations() {
		( new APLS_Admin_Pages_CitationsPage( $this->container ) )->render(); }
	/**
	 * Landing pages.
	 */
	public function landing_pages() {
		( new APLS_Admin_Pages_ModulePage( __( 'Local Landing Pages', 'apex-local-seo' ), __( 'Use Schema Manager and Executive Advisor to review local content guidance for this release.', 'apex-local-seo' ) ) )->render(); }
	/**
	 * Competitors.
	 */
	public function competitors() {
		( new APLS_Admin_Pages_CompetitorsPage() )->render(); }
	/**
	 * Advisor.
	 */
	public function advisor() {
		( new APLS_Admin_Pages_AdvisorPage( $this->container ) )->render(); }
	/**
	 * Diagnostics.
	 */
	public function diagnostics() {
		( new APLS_Admin_Pages_DiagnosticsPage( $this->container ) )->render(); }
	/**
	 * Settings.
	 */
	public function settings() {
		( new APLS_Admin_Pages_SettingsPage( $this->container, $this->modules ) )->render(); }

	/**
	 * Save google settings.
	 */
	public function save_google_settings() {
		$this->guard_admin_action( 'apls_google_settings' );
		$settings = $this->container->get( 'settings' );
		$settings->set( 'google_client_id', sanitize_text_field( wp_unslash( $_POST['google_client_id'] ?? '' ) ) ); // phpcs:ignore WordPress.Security.NonceVerification.Missing

		$secret = trim( sanitize_text_field( wp_unslash( $_POST['google_client_secret'] ?? '' ) ) ); // phpcs:ignore WordPress.Security.NonceVerification.Missing
		if ( '' !== $secret ) {
			$settings->set( 'google_client_secret', sanitize_text_field( $secret ) );
		}

		$this->redirect_settings( 'google-settings-saved' );
	}

	/**
	 * Connect google.
	 */
	public function connect_google() {
		$this->oauth_log( 'Connect button clicked.' );
		$this->guard_admin_action( 'apls_google_connect' );
		$url = $this->container->get( 'gbp_oauth' )->authorization_url();
		if ( is_wp_error( $url ) ) {
			$this->oauth_log( 'Authorization URL generation failed: ' . $url->get_error_message() );
			$this->redirect_settings( '', $url->get_error_message() );
		}

		$host = wp_parse_url( $url, PHP_URL_HOST );
		if ( 'accounts.google.com' !== $host ) {
			$this->oauth_log( 'Authorization redirect rejected because host was not Google: ' . sanitize_text_field( (string) $host ) );
			$this->redirect_settings( '', __( 'Google authorization URL was invalid. Please verify OAuth settings.', 'apex-local-seo' ) );
		}

		$this->oauth_log( 'Redirect initiated to Google authorization endpoint.' );
		wp_redirect( esc_url_raw( $url ), 302, 'Apex Local SEO' ); // phpcs:ignore WordPress.Security.SafeRedirect.wp_redirect_wp_redirect
		exit;
	}

	/**
	 * Google callback.
	 */
	public function google_callback() {
		$this->oauth_log( 'Callback received.' );
		if ( ! current_user_can( APLS_Core_Capabilities::manage() ) ) {
			$this->oauth_log( 'Callback rejected: current user lacks capability.' );
			wp_die( esc_html__( 'You do not have permission to connect Google Business Profile.', 'apex-local-seo' ) );
		}

		$error = sanitize_text_field( wp_unslash( $_GET['error'] ?? '' ) ); // phpcs:ignore WordPress.Security.NonceVerification.Recommended
		if ( '' !== $error ) {
			$this->oauth_log( 'Callback returned Google error: ' . $error );
			$this->redirect_settings( '', $error );
		}

		$this->oauth_log( 'Authorization code received: ' . ( empty( $_GET['code'] ) ? 'no' : 'yes' ) . '; state received: ' . ( empty( $_GET['state'] ) ? 'no' : 'yes' ) ); // phpcs:ignore WordPress.Security.NonceVerification.Recommended
		$result = $this->container->get( 'gbp_oauth' )->handle_callback(
			sanitize_text_field( wp_unslash( $_GET['code'] ?? '' ) ), // phpcs:ignore WordPress.Security.NonceVerification.Recommended
			sanitize_text_field( wp_unslash( $_GET['state'] ?? '' ) ) // phpcs:ignore WordPress.Security.NonceVerification.Recommended
		);

		if ( is_wp_error( $result ) ) {
			$this->oauth_log( 'Callback handling failed: ' . $result->get_error_message() );
			$this->redirect_settings( '', $result->get_error_message() );
		}

		$this->oauth_log( 'Callback handling completed and account stored.' );
		$this->redirect_settings( 'google-connected' );
	}

	/**
	 * Disconnect google.
	 */
	public function disconnect_google() {
		$this->guard_admin_action( 'apls_google_disconnect' );
		$this->container->get( 'gbp_oauth' )->disconnect();
		$this->redirect_settings( 'google-disconnected' );
	}

	/**
	 * Sync google.
	 */
	public function sync_google() {
		$this->guard_admin_action( 'apls_google_sync' );
		$result = $this->container->get( 'gbp_client' )->sync_locations();
		if ( is_wp_error( $result ) ) {
			$this->redirect_settings( '', $result->get_error_message() );
		}

		$this->redirect_settings( 'google-synced' );
	}

	/**
	 * Guard admin action.
	 *
	 * @param mixed $nonce_action Nonce action.
	 */
	private function guard_admin_action( $nonce_action ) {
		if ( ! current_user_can( APLS_Core_Capabilities::manage() ) ) {
			wp_die( esc_html__( 'You do not have permission to manage Apex Local SEO.', 'apex-local-seo' ) );
		}

		check_admin_referer( $nonce_action );
	}

	/**
	 * Redirect settings.
	 *
	 * @param mixed $notice Notice.

	 * @param mixed $error Error.
	 */
	private function redirect_settings( $notice = '', $error = '' ) {
		$url = admin_url( 'admin.php?page=apls-settings' );
		if ( '' !== $notice ) {
			$url = add_query_arg( 'apls_notice', rawurlencode( $notice ), $url );
		}
		if ( '' !== $error ) {
			$url = add_query_arg( 'apls_error', rawurlencode( $error ), $url );
		}

		wp_safe_redirect( $url );
		exit;
	}

	/**
	 * Oauth log.
	 *
	 * @param mixed $message Message.
	 */
	private function oauth_log( $message ) {
		unset( $message );
	}
}
