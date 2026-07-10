<?php
/**
 * Apex Local SEO plugin file.
 *
 * @package Apex_Local_SEO
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; }

/**
 * APLS Services Formatting LocationFormatter.
 */
class APLS_Services_Formatting_LocationFormatter implements APLS_Contracts_ServiceInterface {
	/**
	 * Format.
	 *
	 * @param mixed $location Location.
	 */
	public function format( $location ) {
		$parts = array_filter(
			array(
				$location['city'] ?? '',
				$location['region'] ?? '',
				$location['country_code'] ?? '',
			)
		);
		return $parts ? implode( ', ', array_map( 'sanitize_text_field', $parts ) ) : __( 'No location configured', 'apex-local-seo' );
	}
}
