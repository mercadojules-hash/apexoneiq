<?php
/**
 * Apex Local SEO plugin file.
 *
 * @package Apex_Local_SEO
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; }

/**
 * APLS Rest GbpController.
 */
class APLS_Rest_GbpController implements APLS_Contracts_RestControllerInterface {
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
		$this->container = $container;
	}

	/**
	 * Register routes.
	 */
	public function register_routes() {
		$routes = array(
			'/gbp/status'          => array( WP_REST_Server::READABLE, 'status' ),
			'/gbp/connect/start'   => array( WP_REST_Server::CREATABLE, 'connect_start' ),
			'/gbp/disconnect'      => array( WP_REST_Server::CREATABLE, 'disconnect' ),
			'/gbp/sync'            => array( WP_REST_Server::CREATABLE, 'sync' ),
			'/gbp/business'        => array( WP_REST_Server::READABLE, 'business' ),
			'/gbp/reviews'         => array( WP_REST_Server::READABLE, 'reviews' ),
			'/gbp/metrics'         => array( WP_REST_Server::READABLE, 'metrics' ),
			'/gbp/recommendations' => array( WP_REST_Server::READABLE, 'recommendations' ),
			'/gbp/health-score'    => array( WP_REST_Server::READABLE, 'health_score' ),
			'/gbp/diagnostics'     => array( WP_REST_Server::READABLE, 'diagnostics' ),
		);

		foreach ( $routes as $route => $config ) {
			register_rest_route(
				APLS_REST_NAMESPACE,
				$route,
				array(
					'methods'             => $config[0],
					'callback'            => array( $this, $config[1] ),
					'permission_callback' => array( $this, 'can_manage' ),
				)
			);
		}
	}

	/**
	 * Status.
	 */
	public function status() {
		return rest_ensure_response( array( 'data' => $this->container->get( 'gbp_client' )->health() ) );
	}

	/**
	 * Connect start.
	 */
	public function connect_start() {
		$url = $this->container->get( 'gbp_oauth' )->authorization_url();
		if ( is_wp_error( $url ) ) {
			return $url;
		}

		return rest_ensure_response( array( 'data' => array( 'authorizationUrl' => esc_url_raw( $url ) ) ) );
	}

	/**
	 * Disconnect.
	 */
	public function disconnect() {
		$this->container->get( 'gbp_oauth' )->disconnect();
		return rest_ensure_response( array( 'data' => array( 'disconnected' => true ) ) );
	}

	/**
	 * Sync.
	 */
	public function sync() {
		$result = $this->container->get( 'gbp_client' )->sync_locations();
		if ( is_wp_error( $result ) ) {
			return $result;
		}

		return rest_ensure_response( array( 'data' => $result ) );
	}

	/**
	 * Business.
	 */
	public function business() {
		return rest_ensure_response( array( 'data' => $this->container->get( 'gbp_repository' )->location_profile() ) );
	}

	/**
	 * Reviews.
	 */
	public function reviews() {
		return rest_ensure_response( array( 'data' => $this->container->get( 'gbp_repository' )->recent_reviews( 20 ) ) );
	}

	/**
	 * Metrics.
	 *
	 * @param WP_REST_Request $request Request.
	 */
	public function metrics( WP_REST_Request $request ) {
		$requested_days = $request->get_param( 'days' );
		$days           = absint( $requested_days ? $requested_days : 30 );
		if ( ! in_array( $days, array( 7, 30, 90 ), true ) ) {
			$days = 30;
		}

		return rest_ensure_response( array( 'data' => $this->container->get( 'gbp_repository' )->metrics( $days ) ) );
	}

	/**
	 * Recommendations.
	 */
	public function recommendations() {
		return rest_ensure_response( array( 'data' => $this->container->get( 'gbp_repository' )->recommendations() ) );
	}

	/**
	 * Health score.
	 */
	public function health_score() {
		$summary = $this->container->get( 'gbp_repository' )->dashboard_summary();
		return rest_ensure_response(
			array(
				'data' => array(
					'score' => absint( $summary['healthScore'] ?? 0 ),
					'label' => sanitize_text_field( $summary['healthLabel'] ?? __( 'Not Connected', 'apex-local-seo' ) ),
				),
			)
		);
	}

	/**
	 * Diagnostics.
	 */
	public function diagnostics() {
		return rest_ensure_response( array( 'data' => $this->container->get( 'business_profile_provider' )->diagnostics() ) );
	}

	/**
	 * Can manage.
	 */
	public function can_manage() {
		return current_user_can( APLS_Core_Capabilities::manage() );
	}
}
