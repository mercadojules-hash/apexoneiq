<?php
/**
 * Apex Local SEO plugin file.
 *
 * @package Apex_Local_SEO
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; }

/**
 * APLS Modules Schema Module.
 */
class APLS_Modules_Schema_Module implements APLS_Contracts_ModuleInterface {
	/**
	 * Id.
	 */
	public function id() {
		return 'schema'; }
	/**
	 * Label.
	 */
	public function label() {
		return __( 'Schema Manager', 'apex-local-seo' ); }
	/**
	 * Description.
	 */
	public function description() {
		return __( 'Local business schema generation, validation, rich results readiness, industry templates, and structured data guidance.', 'apex-local-seo' ); }
	/**
	 * Status.
	 */
	public function status() {
		return 'provider_ready'; }
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
		return array(
			array(
				'id'     => 'schema-health',
				'module' => $this->id(),
				'label'  => __( 'Schema Health', 'apex-local-seo' ),
				'value'  => '91',
				'tone'   => 'green',
				'meta'   => __( 'Provider-backed schema readiness', 'apex-local-seo' ),
			),
		);
	}
}
