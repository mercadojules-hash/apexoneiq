<?php
/**
 * Apex Local SEO plugin file.
 *
 * @package Apex_Local_SEO
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; }

/**
 * APLS Services Google GoogleAccountRepository.
 */
class APLS_Services_Google_GoogleAccountRepository implements APLS_Contracts_ServiceInterface {
	/**
	 * Accounts.
	 */
	public function accounts() {
		return array();
	}
}
