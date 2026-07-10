<?php
/**
 * Dashboard summary DTO.
 *
 * @package Apex_Local_SEO
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * APLS Data DTO DashboardSummary.
 */
class APLS_Data_DTO_DashboardSummary {
	/**
	 * Return empty metrics before provider data is available.
	 *
	 * @return array
	 */
	public static function foundation() {
		return array(
			'localSeoScore'          => null,
			'gbpHealth'              => 'not_connected',
			'mapPackVisibility'      => null,
			'reviewHealth'           => null,
			'averageRating'          => null,
			'reviewsWaiting'         => null,
			'profileCompleteness'    => null,
			'photos'                 => null,
			'googlePosts'            => null,
			'citationHealth'         => null,
			'competitorSnapshot'     => null,
			'advisorRecommendations' => 4,
		);
	}
}
