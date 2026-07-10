<?php
/**
 * Apex Local SEO plugin file.
 *
 * @package Apex_Local_SEO
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; }

/**
 * APLS Services Formatting MetricFormatter.
 */
class APLS_Services_Formatting_MetricFormatter implements APLS_Contracts_ServiceInterface {
	/**
	 * Value.
	 *
	 * @param mixed $value Value.

	 * @param mixed $empty_value Empty value.
	 */
	public function value( $value, $empty_value = '--' ) {
		return null === $value || '' === $value ? $empty_value : (string) $value;
	}
}
