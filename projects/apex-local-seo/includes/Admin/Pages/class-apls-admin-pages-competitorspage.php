<?php
/**
 * Apex Local SEO plugin file.
 *
 * @package Apex_Local_SEO
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; }
/**
 * APLS Admin Pages CompetitorsPage.
 */
class APLS_Admin_Pages_CompetitorsPage extends APLS_Admin_Pages_ModulePage {
	/**
	 * Construct.
	 */
	public function __construct() {
		parent::__construct( __( 'Competitor Intelligence', 'apex-local-seo' ), __( 'Use the Dashboard and Executive Advisor to review connected competitor movement summaries for this release.', 'apex-local-seo' ) );
	}
}
