<?php
/**
 * Apex Local SEO plugin file.
 *
 * @package Apex_Local_SEO
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; }

/**
 * APLS Modules LocalLandingPages Module.
 */
class APLS_Modules_LocalLandingPages_Module implements APLS_Contracts_ModuleInterface {
	/**
	 * Id.
	 */
	public function id() {
		return 'landing_pages'; }
	/**
	 * Label.
	 */
	public function label() {
		return __( 'Local Landing Pages', 'apex-local-seo' ); }
	/**
	 * Description.
	 */
	public function description() {
		return __( 'Landing page health, local content analysis, internal linking, schema status, and local optimization score.', 'apex-local-seo' ); }
	/**
	 * Status.
	 */
	public function status() {
		return 'deferred_roadmap'; }
	/**
	 * Capability.
	 */
	public function capability() {
		return APLS_Core_Capabilities::manage(); }
	/**
	 * Register services.
	 *
	 * @param APLS_Core_Container $container Container.
	 */
	public function register_services( APLS_Core_Container $container ) {
		unset( $container ); }
	/**
	 * Init.
	 */
	public function init() {}
	/**
	 * Dashboard cards.
	 */
	public function dashboard_cards() {
		return array(); }
}
