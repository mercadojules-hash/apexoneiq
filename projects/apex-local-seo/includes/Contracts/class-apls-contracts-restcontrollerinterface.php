<?php
/**
 * REST controller contract.
 *
 * @package Apex_Local_SEO
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * APLS Contracts RestControllerInterface.
 */
interface APLS_Contracts_RestControllerInterface {
	/**
	 * Register routes.
	 */
	public function register_routes();
}
