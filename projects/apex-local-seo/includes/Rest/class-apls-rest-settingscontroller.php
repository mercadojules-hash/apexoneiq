<?php
/**
 * Apex Local SEO plugin file.
 *
 * @package Apex_Local_SEO
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; }

/**
 * APLS Rest SettingsController.
 */
class APLS_Rest_SettingsController implements APLS_Contracts_RestControllerInterface {
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
		$this->container = $container; }
	/**
	 * Register routes.
	 */
	public function register_routes() {
		register_rest_route(
			APLS_REST_NAMESPACE,
			'/settings',
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( $this, 'get' ),
					'permission_callback' => array( $this, 'can_manage' ),
				),
				array(
					'methods'             => WP_REST_Server::EDITABLE,
					'callback'            => array( $this, 'update' ),
					'permission_callback' => array( $this, 'can_manage' ),
				),
			)
		);
	}
	/**
	 * Get.
	 */
	public function get() {
		return rest_ensure_response( array( 'data' => $this->container->get( 'settings' )->all() ) ); }
	/**
	 * Update.
	 *
	 * @param WP_REST_Request $request Request.
	 */
	public function update( WP_REST_Request $request ) {
		$settings        = $this->container->get( 'settings' );
		$dashboard_range = $request->get_param( 'dashboardRange' );
		$settings->set( 'dashboard_range', sanitize_text_field( $dashboard_range ? $dashboard_range : $settings->get( 'dashboard_range', '30' ) ) );
		return $this->get();
	}
	/**
	 * Can manage.
	 */
	public function can_manage() {
		return current_user_can( APLS_Core_Capabilities::manage() ); }
}
