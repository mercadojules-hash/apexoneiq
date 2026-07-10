<?php
/**
 * Apex Local SEO plugin file.
 *
 * @package Apex_Local_SEO
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; }

/**
 * APLS Rest LocationsController.
 */
class APLS_Rest_LocationsController implements APLS_Contracts_RestControllerInterface {
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
			'/locations',
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( $this, 'all' ),
					'permission_callback' => array( $this, 'can_manage' ),
				),
				array(
					'methods'             => WP_REST_Server::CREATABLE,
					'callback'            => array( $this, 'create' ),
					'permission_callback' => array( $this, 'can_manage' ),
				),
			)
		);
		register_rest_route(
			APLS_REST_NAMESPACE,
			'/locations/(?P<id>\\d+)',
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( $this, 'one' ),
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
	 * All.
	 */
	public function all() {
		return rest_ensure_response( array( 'data' => $this->container->get( 'locations' )->all() ) ); }
	/**
	 * One.
	 *
	 * @param WP_REST_Request $request Request.
	 */
	public function one( WP_REST_Request $request ) {
		return rest_ensure_response(
			array(
				'data' => array(
					'id'      => absint( $request['id'] ),
					'status'  => 'provider_managed',
					'message' => __( 'Location details are managed through the active Business Profile provider.', 'apex-local-seo' ),
				),
			)
		);
	}
	/**
	 * Create.
	 */
	public function create() {
		return rest_ensure_response(
			array(
				'data' => array(
					'status'  => 'provider_managed',
					'message' => __( 'Create and edit locations through Google Business Profile. Apex Local SEO imports provider-approved business records for this release.', 'apex-local-seo' ),
				),
			)
		);
	}
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
					'status'  => 'provider_managed',
					'message' => __( 'Location updates are provider-managed in Version 1.0.0.', 'apex-local-seo' ),
				),
			)
		);
	}
	/**
	 * Can manage.
	 */
	public function can_manage() {
		return current_user_can( APLS_Core_Capabilities::manage() ); }
}
