<?php
/**
 * Apex Local SEO plugin file.
 *
 * @package Apex_Local_SEO
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; }
/**
 * APLS Data Repositories ReviewRepository.
 */
class APLS_Data_Repositories_ReviewRepository implements APLS_Contracts_RepositoryInterface {
	/**
	 * Summary.
	 */
	public function summary() {
		return array(
			'reviews'       => null,
			'averageRating' => null,
			'waiting'       => null,
			'health'        => 'pending_connection',
		);
	}
}
