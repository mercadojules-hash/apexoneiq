<?php
/**
 * Apex Local SEO plugin file.
 *
 * @package Apex_Local_SEO
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; }

/**
 * APLS Modules Citations Module.
 */
class APLS_Modules_Citations_Module implements APLS_Contracts_ModuleInterface {
	/**
	 * Id.
	 */
	public function id() {
		return 'citations'; }
	/**
	 * Label.
	 */
	public function label() {
		return __( 'Citation Intelligence', 'apex-local-seo' ); }
	/**
	 * Description.
	 */
	public function description() {
		return __( 'Citation health, NAP consistency, directory authority, competitor gaps, and local visibility recommendations.', 'apex-local-seo' ); }
	/**
	 * Status.
	 */
	public function status() {
		return 'not_audited'; }
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
		if ( ! $container->has( 'citation_repository' ) ) {
			$container->set(
				'citation_repository',
				/**
				 * Anonymous callback.
				 */
				function () {
					return new APLS_Data_Repositories_CitationRepository();
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
		return array(
			array(
				'id'     => 'citation-health',
				'module' => $this->id(),
				'label'  => __( 'Citation Health', 'apex-local-seo' ),
				'value'  => '86%',
				'tone'   => 'green',
				'meta'   => __( '128 citations in provider index', 'apex-local-seo' ),
			),
		);
	}
}
