<?php
/**
 * Apex Local SEO plugin file.
 *
 * @package Apex_Local_SEO
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; }
/**
 * APLS Rest CompetitorsController.
 */
class APLS_Rest_CompetitorsController implements APLS_Contracts_RestControllerInterface {
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
			'/competitors/summary',
			array(
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => array( $this, 'summary' ),
				'permission_callback' => array( $this, 'can_manage' ),
			)
		);
	}
	/**
	 * Summary.
	 */
	public function summary() {
		return rest_ensure_response( array( 'data' => $this->container->get( 'competitor_repository' )->summary() ) ); }
	/**
	 * Can manage.
	 */
	public function can_manage() {
		return current_user_can( APLS_Core_Capabilities::manage() ); }
}
