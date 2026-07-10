<?php
/**
 * Module registry.
 *
 * @package Apex_Local_SEO
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * APLS Core ModuleRegistry.
 */
class APLS_Core_ModuleRegistry {
	/**
	 * Registered modules.
	 *
	 * @var APLS_Contracts_ModuleInterface[]
	 */
	private $modules = array();

	/**
	 * Register a module.
	 *
	 * @param APLS_Contracts_ModuleInterface $module Module instance.
	 * @return void
	 */
	public function register( APLS_Contracts_ModuleInterface $module ) {
		$this->modules[ $module->id() ] = $module;
	}

	/**
	 * Initialize modules.
	 *
	 * @param APLS_Core_Container $container Service container.
	 * @return void
	 */
	public function init_modules( APLS_Core_Container $container ) {
		foreach ( $this->modules as $module ) {
			$module->register_services( $container );
			$module->init();
		}
	}

	/**
	 * Return all modules.
	 *
	 * @return APLS_Contracts_ModuleInterface[]
	 */
	public function all() {
		return $this->modules;
	}

	/**
	 * Return dashboard cards contributed by modules.
	 *
	 * @return array
	 */
	public function dashboard_cards() {
		$cards = array();

		foreach ( $this->modules as $module ) {
			$cards = array_merge( $cards, $module->dashboard_cards() );
		}

		return $cards;
	}

	/**
	 * Return module metadata for API/UI.
	 *
	 * @return array
	 */
	public function summaries() {
		$items = array();

		foreach ( $this->modules as $module ) {
			$items[] = array(
				'id'          => $module->id(),
				'label'       => $module->label(),
				'description' => $module->description(),
				'status'      => $module->status(),
				'capability'  => $module->capability(),
			);
		}

		return $items;
	}
}
