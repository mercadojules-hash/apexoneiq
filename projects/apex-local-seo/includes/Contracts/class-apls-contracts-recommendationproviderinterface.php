<?php
/**
 * Recommendation provider contract.
 *
 * @package Apex_Local_SEO
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * APLS Contracts RecommendationProviderInterface.
 */
interface APLS_Contracts_RecommendationProviderInterface {
	/**
	 * Recommendations.
	 *
	 * @param mixed $location_id Location id.
	 */
	public function recommendations( $location_id = 0 );
}
