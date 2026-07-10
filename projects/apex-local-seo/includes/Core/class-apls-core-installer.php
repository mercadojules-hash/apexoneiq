<?php
/**
 * Installer and schema update runner.
 *
 * @package Apex_Local_SEO
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * APLS Core Installer.
 */
class APLS_Core_Installer {
	/**
	 * Plugin activation.
	 *
	 * @return void
	 */
	public static function activate() {
		self::create_tables();
		self::seed_options();
		update_option( 'apls_version', APLS_VERSION, false );
		update_option( 'apls_db_version', APLS_DB_VERSION, false );
	}

	/**
	 * Plugin deactivation.
	 *
	 * @return void
	 */
	public static function deactivate() {
		wp_clear_scheduled_hook( 'apls_daily_maintenance' );
	}

	/**
	 * Create or update tables.
	 *
	 * @return void
	 */
	public static function create_tables() {
		require_once ABSPATH . 'wp-admin/includes/upgrade.php';

		foreach ( APLS_Core_Schema::statements() as $statement ) {
			dbDelta( $statement );
		}
	}

	/**
	 * Seed default options.
	 *
	 * @return void
	 */
	public static function seed_options() {
		add_option( 'apls_enabled_modules', array( 'gbp', 'reviews', 'rankings', 'citations', 'landing_pages', 'competitors', 'advisor' ), '', false );
		add_option( 'apls_dashboard_range', '30', '', false );
		add_option( 'apls_sync_frequency', 'daily', '', false );
		add_option( 'apls_data_retention_days', 730, '', false );
		add_option( 'apls_advisor_mode', 'rule_based', '', false );
		add_option( 'apls_google_client_id', '', '', false );
		add_option( 'apls_google_client_secret', '', '', false );
		add_option( 'apls_google_connected_email', '', '', false );

		if ( ! wp_next_scheduled( 'apls_daily_maintenance' ) ) {
			wp_schedule_event( time() + HOUR_IN_SECONDS, 'daily', 'apls_daily_maintenance' );
		}
	}
}
