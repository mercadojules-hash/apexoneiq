<?php
/**
 * Location DTO.
 *
 * @package Apex_Local_SEO
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * APLS Data DTO Location.
 */
class APLS_Data_DTO_Location {
	/**
	 * Empty location payload.
	 *
	 * @return array
	 */
	public static function empty() {
		return array(
			'id'           => 0,
			'name'         => '',
			'businessName' => '',
			'city'         => '',
			'region'       => '',
			'countryCode'  => '',
			'status'       => 'not_configured',
		);
	}
}
