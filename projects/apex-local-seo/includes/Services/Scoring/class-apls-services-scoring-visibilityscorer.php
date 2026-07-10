<?php
/**
 * Apex Local SEO plugin file.
 *
 * @package Apex_Local_SEO
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; }
/**
 * APLS Services Scoring VisibilityScorer.
 */
class APLS_Services_Scoring_VisibilityScorer implements APLS_Contracts_ScoreProviderInterface {
	/**
	 * Score.
	 *
	 * @param mixed $location_id Location id.
	 */
	public function score( $location_id = 0 ) {
		unset( $location_id );
		return null; }
}
