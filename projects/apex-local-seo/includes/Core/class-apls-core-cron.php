<?php
/**
 * Scheduled maintenance hooks.
 *
 * @package Apex_Local_SEO
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * APLS Core Cron.
 */
class APLS_Core_Cron {
	/**
	 * Register cron callbacks.
	 *
	 * @return void
	 */
	public function init() {
		add_action( 'apls_daily_maintenance', array( $this, 'daily_maintenance' ) );
	}

	/**
	 * Run daily provider and module maintenance hooks.
	 *
	 * @return void
	 */
	public function daily_maintenance() {
		do_action( 'apls_daily_maintenance_modules' );
	}
}
