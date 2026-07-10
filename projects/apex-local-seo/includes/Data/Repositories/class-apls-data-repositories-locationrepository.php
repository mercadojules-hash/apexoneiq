<?php
/**
 * Location repository.
 *
 * @package Apex_Local_SEO
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * APLS Data Repositories LocationRepository.
 */
class APLS_Data_Repositories_LocationRepository implements APLS_Contracts_RepositoryInterface {
	/**
	 * Table.
	 */
	public function table() {
		global $wpdb;
		return $wpdb->prefix . 'apls_locations';
	}

	/**
	 * All.
	 */
	public function all() {
		global $wpdb;

		$cache_key = 'apls_locations_all';
		$rows      = wp_cache_get( $cache_key, 'apls' );
		if ( false !== $rows ) {
			return is_array( $rows ) ? $rows : array();
		}

		$rows = $wpdb->get_results( "SELECT * FROM {$this->table()} ORDER BY name ASC LIMIT 100", ARRAY_A ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.DirectDatabaseQuery.DirectQuery
		wp_cache_set( $cache_key, $rows, 'apls', MINUTE_IN_SECONDS );
		return is_array( $rows ) ? $rows : array();
	}

	/**
	 * Default location.
	 */
	public function default_location() {
		$locations = $this->all();
		return $locations ? $locations[0] : APLS_Data_DTO_Location::empty();
	}
}
