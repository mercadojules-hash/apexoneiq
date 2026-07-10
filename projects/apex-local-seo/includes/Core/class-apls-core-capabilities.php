<?php
/**
 * Capability helper.
 *
 * @package Apex_Local_SEO
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * APLS Core Capabilities.
 */
class APLS_Core_Capabilities {
	/**
	 * Admin capability for Apex Local SEO.
	 *
	 * @return string
	 */
	public static function manage() {
		return apply_filters( 'apls_manage_capability', 'manage_options' );
	}
}
