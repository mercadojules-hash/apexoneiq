<?php
/**
 * Recommendation repository.
 *
 * @package Apex_Local_SEO
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * APLS Data Repositories RecommendationRepository.
 */
class APLS_Data_Repositories_RecommendationRepository implements APLS_Contracts_RepositoryInterface {
	/**
	 * Table.
	 */
	public function table() {
		global $wpdb;
		return $wpdb->prefix . 'apls_recommendations';
	}

	/**
	 * Recent.
	 *
	 * @param mixed $limit Limit.
	 */
	public function recent( $limit = 10 ) {
		global $wpdb;

		$limit     = max( 1, min( 50, absint( $limit ) ) );
		$cache_key = 'apls_recommendations_recent_' . $limit;
		$rows      = wp_cache_get( $cache_key, 'apls' );
		if ( false !== $rows ) {
			return is_array( $rows ) ? $rows : array();
		}

		$rows = $wpdb->get_results( $wpdb->prepare( "SELECT * FROM {$this->table()} ORDER BY created_at DESC LIMIT %d", $limit ), ARRAY_A ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.DirectDatabaseQuery.DirectQuery
		wp_cache_set( $cache_key, $rows, 'apls', MINUTE_IN_SECONDS );
		return is_array( $rows ) ? $rows : array();
	}
}
