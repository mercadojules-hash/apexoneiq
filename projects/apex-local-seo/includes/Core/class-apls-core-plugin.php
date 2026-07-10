<?php
/**
 * Main plugin runtime.
 *
 * @package Apex_Local_SEO
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * APLS Core Plugin.
 */
class APLS_Core_Plugin {
	/**
	 * Singleton instance.
	 *
	 * @var self|null
	 */
	private static $instance = null;

	/**
	 * Service container.
	 *
	 * @var APLS_Core_Container
	 */
	private $container;

	/**
	 * Module registry.
	 *
	 * @var APLS_Core_ModuleRegistry
	 */
	private $modules;

	/**
	 * Return singleton.
	 *
	 * @return self
	 */
	public static function instance() {
		if ( null === self::$instance ) {
			self::$instance = new self();
		}

		return self::$instance;
	}

	/**
	 * Constructor.
	 */
	private function __construct() {
		$this->container = new APLS_Core_Container();
		$this->modules   = new APLS_Core_ModuleRegistry();
	}

	/**
	 * Initialize plugin.
	 *
	 * @return void
	 */
	public function init() {
		( new APLS_Core_Migration() )->maybe_migrate();
		$this->register_services();
		$this->register_modules();
		$this->modules->init_modules( $this->container );

		( new APLS_Core_Cron() )->init();
		( new APLS_Core_Assets() )->init();
		( new APLS_Admin_Admin( $this->container, $this->modules ) )->init();
		( new APLS_Rest_RestServiceProvider( $this->container, $this->modules ) )->init();
	}

	/**
	 * Register shared services.
	 *
	 * @return void
	 */
	private function register_services() {
		$this->container->set(
			'settings',
			/**
			 * Anonymous callback.
			 */
			function () {
				return new APLS_Data_Repositories_SettingsRepository();
			}
		);
		$this->container->set(
			'locations',
			/**
			 * Anonymous callback.
			 */
			function () {
				return new APLS_Data_Repositories_LocationRepository();
			}
		);
		$this->container->set(
			'recommendations',
			/**
			 * Anonymous callback.
			 */
			function () {
				return new APLS_Data_Repositories_RecommendationRepository();
			}
		);
		$this->container->set(
			'scoring',
			/**
			 * Anonymous callback.
			 */
			function () {
				return new APLS_Services_Scoring_LocalSeoScoreService();
			}
		);
		$this->container->set(
			'advisor',
			/**
			 * Anonymous callback.
			 */
			function ( $container ) {
				return new APLS_Services_Recommendations_RecommendationEngine( $container->get( 'recommendations' ) );
			}
		);
		$this->container->set(
			'gbp_repository',
			/**
			 * Anonymous callback.
			 */
			function () {
				return new APLS_Data_Repositories_GbpRepository();
			}
		);
		$this->container->set(
			'gbp_oauth',
			/**
			 * Anonymous callback.
			 */
			function ( $container ) {
				return new APLS_Services_Google_GoogleOAuthService( $container->get( 'settings' ), $container->get( 'gbp_repository' ) );
			}
		);
		$this->container->set(
			'gbp_client',
			/**
			 * Anonymous callback.
			 */
			function ( $container ) {
				return new APLS_Services_Google_GoogleBusinessProfileClient( $container->get( 'gbp_oauth' ), $container->get( 'gbp_repository' ) );
			}
		);
		$this->container->set(
			'business_profile_google_provider',
			/**
			 * Anonymous callback.
			 */
			function ( $container ) {
				return new APLS_Services_BusinessProfile_Providers_GoogleBusinessProfileProvider( $container->get( 'gbp_client' ), $container->get( 'gbp_repository' ), $container->get( 'gbp_oauth' ) );
			}
		);
		$this->container->set(
			'business_profile_mock_provider',
			/**
			 * Anonymous callback.
			 */
			function () {
				return new APLS_Services_BusinessProfile_Providers_MockBusinessProfileProvider();
			}
		);
		$this->container->set(
			'business_profile_provider',
			/**
			 * Anonymous callback.
			 */
			function ( $container ) {
				return new APLS_Services_BusinessProfile_BusinessProfileProviderManager( $container->get( 'business_profile_google_provider' ), $container->get( 'business_profile_mock_provider' ) );
			}
		);
	}

	/**
	 * Register Apex Local SEO modules.
	 *
	 * @return void
	 */
	private function register_modules() {
		$this->modules->register( new APLS_Modules_GoogleBusinessProfile_Module() );
		$this->modules->register( new APLS_Modules_Reviews_Module() );
		$this->modules->register( new APLS_Modules_Schema_Module() );
		$this->modules->register( new APLS_Modules_LocalRankings_Module() );
		$this->modules->register( new APLS_Modules_Citations_Module() );
		$this->modules->register( new APLS_Modules_LocalLandingPages_Module() );
		$this->modules->register( new APLS_Modules_Competitors_Module() );
		$this->modules->register( new APLS_Modules_Advisor_Module() );
	}

	/**
	 * Expose container.
	 *
	 * @return APLS_Core_Container
	 */
	public function container() {
		return $this->container;
	}

	/**
	 * Expose module registry.
	 *
	 * @return APLS_Core_ModuleRegistry
	 */
	public function modules() {
		return $this->modules;
	}
}
