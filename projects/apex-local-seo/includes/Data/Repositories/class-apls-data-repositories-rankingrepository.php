<?php
/**
 * Apex Local SEO plugin file.
 *
 * @package Apex_Local_SEO
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; }
/**
 * APLS Data Repositories RankingRepository.
 */
class APLS_Data_Repositories_RankingRepository implements APLS_Contracts_RepositoryInterface {
	/**
	 * Summary.
	 */
	public function summary() {
		return array(
			'visibility' => null,
			'keywords'   => 0,
			'status'     => 'not_configured',
		);
	}
}
