<?php
/**
 * Apex Local SEO plugin file.
 *
 * @package Apex_Local_SEO
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; }
/**
 * APLS Data Repositories CitationRepository.
 */
class APLS_Data_Repositories_CitationRepository implements APLS_Contracts_RepositoryInterface {
	/**
	 * Summary.
	 */
	public function summary() {
		return array(
			'health'  => null,
			'missing' => 0,
			'status'  => 'not_audited',
		);
	}
}
