<?php
/**
 * Apex Local SEO plugin file.
 *
 * @package Apex_Local_SEO
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; }

/**
 * APLS Services Integrations ApexViewInsightsBridge.
 */
class APLS_Services_Integrations_ApexViewInsightsBridge implements APLS_Contracts_ServiceInterface {
	/**
	 * Detected.
	 */
	public function detected() {
		return defined( 'AVIN_VERSION' );
	}
}
