<?php
/**
 * Apex Local SEO plugin file.
 *
 * @package Apex_Local_SEO
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; }

/**
 * APLS Services Security NonceService.
 */
class APLS_Services_Security_NonceService implements APLS_Contracts_ServiceInterface {
	/**
	 * Rest.
	 */
	public function rest() {
		return wp_create_nonce( 'wp_rest' );
	}
}
