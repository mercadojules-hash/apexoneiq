<?php
/**
 * Apex Local SEO plugin file.
 *
 * @package Apex_Local_SEO
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; }

/**
 * APLS Services Scoring LocalSeoScoreService.
 */
class APLS_Services_Scoring_LocalSeoScoreService implements APLS_Contracts_ServiceInterface {
	/**
	 * Dashboard summary.
	 */
	public function dashboard_summary() {
		return APLS_Data_DTO_DashboardSummary::foundation();
	}

	/**
	 * Score.
	 *
	 * @param mixed $location_id Location id.
	 */
	public function score( $location_id = 0 ) {
		unset( $location_id );
		return null;
	}
}
