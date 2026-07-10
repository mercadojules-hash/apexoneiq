<?php
/**
 * Apex Local SEO plugin file.
 *
 * @package Apex_Local_SEO
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; }
/**
 * APLS Data Repositories AuditRepository.
 */
class APLS_Data_Repositories_AuditRepository implements APLS_Contracts_RepositoryInterface {
	/**
	 * Latest.
	 */
	public function latest() {
		return array();
	}
}
