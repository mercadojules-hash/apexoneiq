<?php
/**
 * Apex Local SEO plugin file.
 *
 * @package Apex_Local_SEO
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; }

/**
 * APLS Rest HealthController.
 */
class APLS_Rest_HealthController implements APLS_Contracts_RestControllerInterface {
	/**
	 * Register routes.
	 */
	public function register_routes() {
		register_rest_route(
			APLS_REST_NAMESPACE,
			'/health',
			array(
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => array( $this, 'get' ),
				'permission_callback' => array( $this, 'can_manage' ),
			)
		);
	}

	/**
	 * Get.
	 */
	public function get() {
		return rest_ensure_response(
			array(
				'data' => array(
					'plugin'    => 'apex-local-seo',
					'version'   => APLS_VERSION,
					'dbVersion' => get_option( 'apls_db_version' ),
					'status'    => 'release_ready',
				),
			)
		);
	}

	/**
	 * Can manage.
	 */
	public function can_manage() {
		return current_user_can( APLS_Core_Capabilities::manage() );
	}
}
