<?php
/**
 * Apex Local SEO plugin file.
 *
 * @package Apex_Local_SEO
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; }

/**
 * APLS Modules Competitors Module.
 */
class APLS_Modules_Competitors_Module implements APLS_Contracts_ModuleInterface {
	/**
	 * Id.
	 */
	public function id() {
		return 'competitors'; }
	/**
	 * Label.
	 */
	public function label() {
		return __( 'Competitor Intelligence', 'apex-local-seo' ); }
	/**
	 * Description.
	 */
	public function description() {
		return __( 'Competitor rankings, reviews, photo activity, category comparison, visibility comparison, and opportunity analysis.', 'apex-local-seo' ); }
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
		if ( ! $container->has( 'competitor_repository' ) ) {
			$container->set(
				'competitor_repository',
				/**
				 * Anonymous callback.
				 */
				function () {
					return new APLS_Data_Repositories_CompetitorRepository();
				}
			);
		}
	}
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
