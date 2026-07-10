<?php
/**
 * Apex Local SEO plugin file.
 *
 * @package Apex_Local_SEO
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; }

/**
 * APLS Rest RestServiceProvider.
 */
class APLS_Rest_RestServiceProvider {
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
		add_action( 'rest_api_init', array( $this, 'register_routes' ) );
	}

	/**
	 * Register routes.
	 */
	public function register_routes() {
		$controllers = array(
			new APLS_Rest_HealthController(),
			new APLS_Rest_DashboardController( $this->container, $this->modules ),
			new APLS_Rest_SettingsController( $this->container ),
			new APLS_Rest_LocationsController( $this->container ),
			new APLS_Rest_GbpController( $this->container ),
			new APLS_Rest_ReviewsController( $this->container ),
			new APLS_Rest_RankingsController( $this->container ),
			new APLS_Rest_CitationsController( $this->container ),
			new APLS_Rest_CompetitorsController( $this->container ),
			new APLS_Rest_RecommendationsController( $this->container ),
		);

		foreach ( $controllers as $controller ) {
			$controller->register_routes();
		}
	}
}
