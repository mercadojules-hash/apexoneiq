<?php
/**
 * Score provider contract.
 *
 * @package Apex_Local_SEO
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * APLS Contracts ScoreProviderInterface.
 */
interface APLS_Contracts_ScoreProviderInterface {
	/**
	 * Score.
	 *
	 * @param mixed $location_id Location id.
	 */
	public function score( $location_id = 0 );
}
