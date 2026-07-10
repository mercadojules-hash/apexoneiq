<?php
/**
 * Module contract.
 *
 * @package Apex_Local_SEO
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * APLS Contracts ModuleInterface.
 */
interface APLS_Contracts_ModuleInterface {
	/**
	 * Id.
	 */
	public function id();
	/**
	 * Label.
	 */
	public function label();
	/**
	 * Description.
	 */
	public function description();
	/**
	 * Status.
	 */
	public function status();
	/**
	 * Capability.
	 */
	public function capability();
	/**
	 * Register services.
	 *
	 * @param APLS_Core_Container $container Container.
	 */
	public function register_services( APLS_Core_Container $container );
	/**
	 * Init.
	 */
	public function init();
	/**
	 * Dashboard cards.
	 */
	public function dashboard_cards();
}
