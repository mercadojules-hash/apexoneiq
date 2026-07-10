<?php
/**
 * Apex Local SEO plugin file.
 *
 * @package Apex_Local_SEO
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; }

/**
 * APLS Modules LocalRankings Module.
 */
class APLS_Modules_LocalRankings_Module implements APLS_Contracts_ModuleInterface {
	/**
	 * Id.
	 */
	public function id() {
		return 'rankings'; }
	/**
	 * Label.
	 */
	public function label() {
		return __( 'Local Rankings', 'apex-local-seo' ); }
	/**
	 * Description.
	 */
	public function description() {
		return __( 'Local keywords, map pack positions, visibility score, ranking timeline, and competitor rankings.', 'apex-local-seo' ); }
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
		if ( ! $container->has( 'ranking_repository' ) ) {
			$container->set(
				'ranking_repository',
				/**
				 * Anonymous callback.
				 */
				function () {
					return new APLS_Data_Repositories_RankingRepository();
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
