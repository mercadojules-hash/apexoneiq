<?php
/**
 * Plugin Name: Apex Local SEO
 * Plugin URI: https://apexdigital.design/apex-local-seo
 * Description: Executive local search analytics for Google Business Profile, Maps visibility, reviews, schema, citations, diagnostics, and business decision support.
 * Version: 1.0.0
 * Author: Apex Digital Design
 * Requires at least: 6.0
 * Requires PHP: 8.2
 * License: GPL-2.0+
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: apex-local-seo
 *
 * @package Apex_Local_SEO
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'APLS_VERSION', '1.0.0' );
define( 'APLS_DB_VERSION', '1.0.0' );
define( 'APLS_PLUGIN_FILE', __FILE__ );
define( 'APLS_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'APLS_PLUGIN_URL', plugin_dir_url( __FILE__ ) );
define( 'APLS_REST_NAMESPACE', 'apls/v1' );

/**
 * Lightweight class autoloader for the Apex Local SEO runtime.
 *
 * @param string $class_name Class name.
 * @return void
 */
function apls_autoload( $class_name ) {
	if ( 0 !== strpos( $class_name, 'APLS_' ) ) {
		return;
	}

	$relative = substr( $class_name, 5 );
	$parts    = explode( '_', $relative );
	$file     = APLS_PLUGIN_DIR . 'includes/' . implode( '/', array_slice( $parts, 0, -1 ) ) . '/class-' . strtolower( str_replace( '_', '-', $class_name ) ) . '.php';

	if ( file_exists( $file ) ) {
		require_once $file;
		return;
	}

	$legacy_file = APLS_PLUGIN_DIR . 'includes/' . implode( '/', $parts ) . '.php';
	if ( file_exists( $legacy_file ) ) {
		require_once $legacy_file;
	}
}

spl_autoload_register( 'apls_autoload' );

register_activation_hook( __FILE__, array( 'APLS_Core_Installer', 'activate' ) );
register_deactivation_hook( __FILE__, array( 'APLS_Core_Installer', 'deactivate' ) );

add_action(
	'plugins_loaded',
	/**
	 * Anonymous callback.
	 */
	function () {
		APLS_Core_Plugin::instance()->init();
	}
);
