<?php
/**
 * Apex Local SEO plugin file.
 *
 * @package Apex_Local_SEO
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; }

/**
 * APLS Admin Pages ModulePage.
 */
class APLS_Admin_Pages_ModulePage {
	/**
	 * Title.
	 *
	 * @var mixed
	 */
	private $title;
	/**
	 * Message.
	 *
	 * @var mixed
	 */
	private $message;

	/**
	 * Construct.
	 *
	 * @param mixed $title Title.

	 * @param mixed $message Message.
	 */
	public function __construct( $title, $message ) {
		$this->title   = $title;
		$this->message = $message;
	}

	/**
	 * Render.
	 */
	public function render() {
		APLS_Admin_Components_ApexShell::start( $this->title, __( 'Apex Local SEO roadmap surface', 'apex-local-seo' ) );
		APLS_Admin_Components_SectionPanel::start( $this->title, $this->message );
		APLS_Admin_Components_EmptyState::render( __( 'Workflow guidance', 'apex-local-seo' ), __( 'Use Dashboard, Google Business Profile, Reviews, Schema, Citation Intelligence, Executive Advisor, Diagnostics, and Settings to review local search operations in this release.', 'apex-local-seo' ) );
		APLS_Admin_Components_SectionPanel::end();
		APLS_Admin_Components_ApexShell::end();
	}
}
