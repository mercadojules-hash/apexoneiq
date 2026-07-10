<?php
/**
 * Apex Local SEO plugin file.
 *
 * @package Apex_Local_SEO
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; }

/**
 * APLS Services Integrations ApexSeoIntelligenceBridge.
 */
class APLS_Services_Integrations_ApexSeoIntelligenceBridge implements APLS_Contracts_ServiceInterface {
	/**
	 * Detected.
	 */
	public function detected() {
		return defined( 'ASEOI_VERSION' );
	}
}
