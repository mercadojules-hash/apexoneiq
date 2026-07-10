<?php
/**
 * Apex Local SEO plugin file.
 *
 * @package Apex_Local_SEO
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; }
/**
 * APLS Rest RecommendationsController.
 */
class APLS_Rest_RecommendationsController implements APLS_Contracts_RestControllerInterface {
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
			'/recommendations',
			array(
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => array( $this, 'all' ),
				'permission_callback' => array( $this, 'can_manage' ),
			)
		);
		register_rest_route(
			APLS_REST_NAMESPACE,
			'/recommendations/(?P<id>\\d+)',
			array(
				'methods'             => WP_REST_Server::EDITABLE,
				'callback'            => array( $this, 'update' ),
				'permission_callback' => array( $this, 'can_manage' ),
			)
		);
	}
	/**
	 * All.
	 */
	public function all() {
		return rest_ensure_response( array( 'data' => $this->container->get( 'advisor' )->dashboard_recommendations() ) ); }
	/**
	 * Update.
	 *
	 * @param WP_REST_Request $request Request.
	 */
	public function update( WP_REST_Request $request ) {
		return rest_ensure_response(
			array(
				'data' => array(
					'id'      => absint( $request['id'] ),
					'status'  => 'noted',
					'message' => __( 'Recommendation status noted for review.', 'apex-local-seo' ),
				),
			)
		); }
	/**
	 * Can manage.
	 */
	public function can_manage() {
		return current_user_can( APLS_Core_Capabilities::manage() ); }
}
