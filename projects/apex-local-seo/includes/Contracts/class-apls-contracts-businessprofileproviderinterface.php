<?php
/**
 * Business Profile provider contract.
 *
 * @package Apex_Local_SEO
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * APLS Contracts BusinessProfileProviderInterface.
 */
interface APLS_Contracts_BusinessProfileProviderInterface {
	/**
	 * Id.
	 */
	public function id();
	/**
	 * Label.
	 */
	public function label();
	/**
	 * Status.
	 */
	public function status();
	/**
	 * Diagnostics.
	 */
	public function diagnostics();
	/**
	 * Dashboard.
	 */
	public function dashboard();
	/**
	 * Sync.
	 */
	public function sync();
}
