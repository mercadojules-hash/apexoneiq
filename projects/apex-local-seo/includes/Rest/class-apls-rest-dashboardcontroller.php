<?php
/**
 * Apex Local SEO plugin file.
 *
 * @package Apex_Local_SEO
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; }

/**
 * APLS Rest DashboardController.
 */
class APLS_Rest_DashboardController implements APLS_Contracts_RestControllerInterface {
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
	 * Register routes.
	 */
	public function register_routes() {
		register_rest_route(
			APLS_REST_NAMESPACE,
			'/dashboard',
			array(
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => array( $this, 'get' ),
				'permission_callback' => array( $this, 'can_manage' ),
			)
		);
		register_rest_route(
			APLS_REST_NAMESPACE,
			'/modules',
			array(
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => array( $this, 'modules' ),
				'permission_callback' => array( $this, 'can_manage' ),
			)
		);
	}

	/**
	 * Get.
	 */
	public function get() {
		$scoring          = $this->container->get( 'scoring' );
		$provider_manager = $this->container->get( 'business_profile_provider' );
		$provider         = $provider_manager->active_provider();
		$provider_data    = $provider->dashboard();

		return rest_ensure_response(
			array(
				'data' => array(
					'summary'                 => $scoring ? $scoring->dashboard_summary() : APLS_Data_DTO_DashboardSummary::foundation(),
					'businessProfileProvider' => $provider_manager->mode(),
					'googleBusiness'          => $provider_data['summary'] ?? array(),
					'businessProfile'         => $provider_data['profile'] ?? array(),
					'cards'                   => $this->live_cards( $provider_data['summary'] ?? array() ),
					'modules'                 => $this->modules->summaries(),
					'recommendations'         => $provider_data['recommendations'] ?? array(),
					'providerData'            => $provider_data,
				),
				'meta' => array(
					'phase'            => 'gbp-integration',
					'dataSourcesReady' => true,
				),
			)
		);
	}

	/**
	 * Modules.
	 */
	public function modules() {
		return rest_ensure_response( array( 'data' => $this->modules->summaries() ) );
	}

	/**
	 * Can manage.
	 */
	public function can_manage() {
		return current_user_can( APLS_Core_Capabilities::manage() );
	}

	/**
	 * Live cards.
	 *
	 * @param mixed $summary Summary.
	 */
	private function live_cards( $summary ) {
		if ( empty( $summary['connected'] ) ) {
			return array();
		}

		return array(
			array(
				'id'    => 'gbp-health',
				'label' => __( 'Google Business Score', 'apex-local-seo' ),
				'value' => absint( $summary['healthScore'] ?? 0 ),
				'meta'  => sanitize_text_field( $summary['healthLabel'] ?? '' ),
			),
			array(
				'id'    => 'profile-completeness',
				'label' => __( 'Profile Completeness', 'apex-local-seo' ),
				'value' => absint( $summary['profileCompleteness'] ?? 0 ) . '%',
				'meta'  => __( 'Live GBP fields', 'apex-local-seo' ),
			),
			array(
				'id'    => 'reviews',
				'label' => __( 'Reviews', 'apex-local-seo' ),
				'value' => absint( $summary['totalReviews'] ?? 0 ),
				'meta'  => sprintf( /* translators: %d is the number of reviews awaiting response. */ __( '%d waiting', 'apex-local-seo' ), absint( $summary['reviewsWaiting'] ?? 0 ) ),
			),
			array(
				'id'    => 'rating',
				'label' => __( 'Average Rating', 'apex-local-seo' ),
				'value' => number_format_i18n( (float) ( $summary['averageRating'] ?? 0 ), 1 ),
				'meta'  => __( 'Google reviews', 'apex-local-seo' ),
			),
			array(
				'id'    => 'photos',
				'label' => __( 'Photos', 'apex-local-seo' ),
				'value' => absint( $summary['photos'] ?? 0 ),
				'meta'  => __( 'GBP media', 'apex-local-seo' ),
			),
		);
	}
}
