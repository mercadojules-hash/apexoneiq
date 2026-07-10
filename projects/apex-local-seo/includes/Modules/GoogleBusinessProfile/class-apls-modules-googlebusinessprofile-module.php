<?php
/**
 * Apex Local SEO plugin file.
 *
 * @package Apex_Local_SEO
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; }

/**
 * APLS Modules GoogleBusinessProfile Module.
 */
class APLS_Modules_GoogleBusinessProfile_Module implements APLS_Contracts_ModuleInterface {
	/**
	 * Id.
	 */
	public function id() {
		return 'gbp'; }
	/**
	 * Label.
	 */
	public function label() {
		return __( 'Google Business Profile', 'apex-local-seo' ); }
	/**
	 * Description.
	 */
	public function description() {
		return __( 'Business profile, categories, services, products, hours, posts, photos, Q&A, and GBP performance.', 'apex-local-seo' ); }
	/**
	 * Status.
	 */
	public function status() {
		return 'not_connected'; }
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
		if ( ! $container->has( 'gbp_repository' ) ) {
			$container->set(
				'gbp_repository',
				/**
				 * Anonymous callback.
				 */
				function () {
					return new APLS_Data_Repositories_GbpRepository();
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
				'id'     => 'gbp-health',
				'module' => $this->id(),
				'label'  => __( 'Google Business Profile Health', 'apex-local-seo' ),
				'value'  => '82%',
				'tone'   => 'green',
				'meta'   => __( 'Provider health score', 'apex-local-seo' ),
			),
			array(
				'id'     => 'google-posts',
				'module' => $this->id(),
				'label'  => __( 'Google Posts', 'apex-local-seo' ),
				'value'  => '6',
				'tone'   => 'blue',
				'meta'   => __( 'Published in provider period', 'apex-local-seo' ),
			),
			array(
				'id'     => 'photos',
				'module' => $this->id(),
				'label'  => __( 'Photos', 'apex-local-seo' ),
				'value'  => '128',
				'tone'   => 'purple',
				'meta'   => __( 'Profile media signal', 'apex-local-seo' ),
			),
			array(
				'id'     => 'business-completeness',
				'module' => $this->id(),
				'label'  => __( 'Business Completeness', 'apex-local-seo' ),
				'value'  => '91%',
				'tone'   => 'green',
				'meta'   => __( 'Core fields complete', 'apex-local-seo' ),
			),
		);
	}
}
