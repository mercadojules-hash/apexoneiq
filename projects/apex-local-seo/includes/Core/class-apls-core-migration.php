<?php
/**
 * Runtime migration checks.
 *
 * @package Apex_Local_SEO
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * APLS Core Migration.
 */
class APLS_Core_Migration {
	/**
	 * Ensure schema is current.
	 *
	 * @return void
	 */
	public function maybe_migrate() {
		if ( APLS_DB_VERSION !== get_option( 'apls_db_version' ) ) {
			APLS_Core_Installer::create_tables();
			APLS_Core_Installer::seed_options();
			update_option( 'apls_version', APLS_VERSION, false );
			update_option( 'apls_db_version', APLS_DB_VERSION, false );
		}
	}
}
