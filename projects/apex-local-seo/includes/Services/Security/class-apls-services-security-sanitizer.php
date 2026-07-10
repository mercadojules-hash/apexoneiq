<?php
/**
 * Apex Local SEO plugin file.
 *
 * @package Apex_Local_SEO
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; }

/**
 * APLS Services Security Sanitizer.
 */
class APLS_Services_Security_Sanitizer implements APLS_Contracts_ServiceInterface {
	/**
	 * Key.
	 *
	 * @param mixed $value Value.
	 */
	public function key( $value ) {
		return sanitize_key( $value );
	}
}
