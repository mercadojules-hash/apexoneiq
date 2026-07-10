<?php
/**
 * Admin asset loader.
 *
 * @package Apex_Local_SEO
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * APLS Core Assets.
 */
class APLS_Core_Assets {
	/**
	 * Register hooks.
	 *
	 * @return void
	 */
	public function init() {
		add_action( 'admin_enqueue_scripts', array( $this, 'admin_assets' ) );
	}

	/**
	 * Enqueue admin assets for Apex Local SEO screens.
	 *
	 * @param string $hook Admin hook.
	 * @return void
	 */
	public function admin_assets( $hook ) {
		if ( false === strpos( (string) $hook, 'apls' ) && false === strpos( (string) $hook, 'apex-local-seo' ) ) {
			return;
		}

		$css_file = APLS_PLUGIN_DIR . 'assets/css/apex-local-seo.css';
		$js_file  = APLS_PLUGIN_DIR . 'assets/dist/admin.js';
		$css_ver  = file_exists( $css_file ) ? filemtime( $css_file ) : APLS_VERSION;
		$js_ver   = file_exists( $js_file ) ? filemtime( $js_file ) : APLS_VERSION;

		wp_enqueue_style( 'apls-admin', APLS_PLUGIN_URL . 'assets/css/apex-local-seo.css', array(), $css_ver );
		wp_enqueue_script( 'apls-admin', APLS_PLUGIN_URL . 'assets/dist/admin.js', array(), $js_ver, true );

		wp_localize_script(
			'apls-admin',
			'aplsAdmin',
			array(
				'restUrl'   => esc_url_raw( rest_url( APLS_REST_NAMESPACE ) ),
				'restNonce' => wp_create_nonce( 'wp_rest' ),
				'version'   => APLS_VERSION,
			)
		);
	}
}
