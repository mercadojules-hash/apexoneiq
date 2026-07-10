<?php
/**
 * Apex Local SEO plugin file.
 *
 * @package Apex_Local_SEO
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; }

/**
 * APLS Modules Reviews Module.
 */
class APLS_Modules_Reviews_Module implements APLS_Contracts_ModuleInterface {
	/**
	 * Id.
	 */
	public function id() {
		return 'reviews'; }
	/**
	 * Label.
	 */
	public function label() {
		return __( 'Reviews', 'apex-local-seo' ); }
	/**
	 * Description.
	 */
	public function description() {
		return __( 'Review dashboard, trends, responses, suggested reply prompts, and sentiment summaries.', 'apex-local-seo' ); }
	/**
	 * Status.
	 */
	public function status() {
		return 'waiting_for_sync'; }
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
		if ( ! $container->has( 'review_repository' ) ) {
			$container->set(
				'review_repository',
				/**
				 * Anonymous callback.
				 */
				function () {
					return new APLS_Data_Repositories_ReviewRepository();
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
				'id'     => 'review-health',
				'module' => $this->id(),
				'label'  => __( 'Review Health', 'apex-local-seo' ),
				'value'  => '94%',
				'tone'   => 'green',
				'meta'   => __( 'High trust provider signal', 'apex-local-seo' ),
			),
		);
	}
}
