<?php
/**
 * Apex Local SEO plugin file.
 *
 * @package Apex_Local_SEO
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; }
/**
 * APLS Admin Pages RankingsPage.
 */
class APLS_Admin_Pages_RankingsPage extends APLS_Admin_Pages_ModulePage {
	/**
	 * Construct.
	 */
	public function __construct() {
		parent::__construct( __( 'Local Rankings', 'apex-local-seo' ), __( 'Use the Dashboard and Executive Advisor to review connected visibility signals for this release.', 'apex-local-seo' ) );
	}
}
