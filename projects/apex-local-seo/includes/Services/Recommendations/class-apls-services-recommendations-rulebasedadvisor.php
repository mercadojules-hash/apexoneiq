<?php
/**
 * Apex Local SEO plugin file.
 *
 * @package Apex_Local_SEO
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; }
/**
 * APLS Services Recommendations RuleBasedAdvisor.
 */
class APLS_Services_Recommendations_RuleBasedAdvisor implements APLS_Contracts_RecommendationProviderInterface {
	/**
	 * Recommendations.
	 *
	 * @param mixed $location_id Location id.
	 */
	public function recommendations( $location_id = 0 ) {
		unset( $location_id );
		return array();
	}
}
