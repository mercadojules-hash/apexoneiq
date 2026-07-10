<?php
/**
 * Apex Local SEO plugin file.
 *
 * @package Apex_Local_SEO
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; }
/**
 * APLS Data Repositories CompetitorRepository.
 */
class APLS_Data_Repositories_CompetitorRepository implements APLS_Contracts_RepositoryInterface {
	/**
	 * Summary.
	 */
	public function summary() {
		return array(
			'competitors'          => 0,
			'visibilityComparison' => null,
			'status'               => 'not_configured',
		);
	}
}
