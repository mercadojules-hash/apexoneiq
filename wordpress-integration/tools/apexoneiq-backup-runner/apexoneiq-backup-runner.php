<?php
/**
 * Plugin Name: ApexOneIQ Backup Runner
 * Description: Temporary activation-based backup runner for the ApexOneIQ development installation.
 * Version: 0.1.0
 * Author: ApexOneIQ
 *
 * @package ApexOneIQ_Backup_Runner
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

register_activation_hook( __FILE__, 'apexoneiq_backup_runner_activate' );
add_action( 'admin_notices', 'apexoneiq_backup_runner_notice' );

/**
 * Run a one-time backup when the temporary plugin is activated.
 */
function apexoneiq_backup_runner_activate() {
	if ( ! class_exists( 'ZipArchive' ) ) {
		update_option( 'apexoneiq_backup_runner_error', 'ZipArchive is not available on this server.' );
		return;
	}

	global $wpdb;

	$upload_dir = wp_upload_dir();
	$backup_dir = trailingslashit( $upload_dir['basedir'] ) . 'apexoneiq-backups';

	if ( ! wp_mkdir_p( $backup_dir ) ) {
		update_option( 'apexoneiq_backup_runner_error', 'Unable to create backup directory.' );
		return;
	}

	$timestamp = gmdate( 'Ymd-His' );
	$sql_path  = trailingslashit( $backup_dir ) . "apexoneiq-db-{$timestamp}.sql";
	$zip_path  = trailingslashit( $backup_dir ) . "apexoneiq-fresh-wordpress-backup-{$timestamp}.zip";

	apexoneiq_backup_runner_export_database( $sql_path );

	$zip = new ZipArchive();
	if ( true !== $zip->open( $zip_path, ZipArchive::CREATE | ZipArchive::OVERWRITE ) ) {
		update_option( 'apexoneiq_backup_runner_error', 'Unable to create backup zip.' );
		return;
	}

	$root = realpath( ABSPATH );
	apexoneiq_backup_runner_zip_directory( $zip, $root, $root, $backup_dir );
	$zip->addFile( $sql_path, 'database/apexoneiq-wordpress.sql' );
	$zip->close();

	@unlink( $sql_path );

	update_option( 'apexoneiq_backup_runner_url', trailingslashit( $upload_dir['baseurl'] ) . 'apexoneiq-backups/' . basename( $zip_path ) );
	delete_option( 'apexoneiq_backup_runner_error' );
}

/**
 * Show backup result in the WordPress admin.
 */
function apexoneiq_backup_runner_notice() {
	if ( ! current_user_can( 'manage_options' ) ) {
		return;
	}

	$error = get_option( 'apexoneiq_backup_runner_error' );
	$url   = get_option( 'apexoneiq_backup_runner_url' );

	if ( $error ) {
		printf( '<div class="notice notice-error"><p>ApexOneIQ backup failed: %s</p></div>', esc_html( $error ) );
		return;
	}

	if ( $url ) {
		printf( '<div class="notice notice-success"><p>ApexOneIQ fresh WordPress backup created: <a href="%1$s">%1$s</a></p></div>', esc_url( $url ) );
	}
}

/**
 * Export WordPress tables for the current site.
 *
 * @param string $sql_path SQL export path.
 */
function apexoneiq_backup_runner_export_database( $sql_path ) {
	global $wpdb;

	$tables = $wpdb->get_col( $wpdb->prepare( 'SHOW TABLES LIKE %s', $wpdb->esc_like( $wpdb->prefix ) . '%' ) );
	$handle = fopen( $sql_path, 'wb' );

	if ( ! $handle ) {
		update_option( 'apexoneiq_backup_runner_error', 'Unable to write database export.' );
		return;
	}

	fwrite( $handle, "-- ApexOneIQ WordPress database backup\n" );
	fwrite( $handle, '-- Created: ' . gmdate( 'c' ) . "\n\n" );

	foreach ( $tables as $table ) {
		$create = $wpdb->get_row( "SHOW CREATE TABLE `{$table}`", ARRAY_N ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		fwrite( $handle, "DROP TABLE IF EXISTS `{$table}`;\n" );
		fwrite( $handle, $create[1] . ";\n\n" );

		$rows = $wpdb->get_results( "SELECT * FROM `{$table}`", ARRAY_A ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		foreach ( $rows as $row ) {
			$columns = array_map(
				static function ( $column ) {
					return '`' . str_replace( '`', '``', $column ) . '`';
				},
				array_keys( $row )
			);
			$values = array_map(
				static function ( $value ) {
					return null === $value ? 'NULL' : "'" . esc_sql( $value ) . "'";
				},
				array_values( $row )
			);
			fwrite( $handle, 'INSERT INTO `' . $table . '` (' . implode( ',', $columns ) . ') VALUES (' . implode( ',', $values ) . ");\n" );
		}
		fwrite( $handle, "\n" );
	}

	fclose( $handle );
}

/**
 * Add WordPress files to the backup archive.
 *
 * @param ZipArchive $zip        Zip archive.
 * @param string     $directory  Current directory.
 * @param string     $root       WordPress root.
 * @param string     $backup_dir Backup directory excluded from archive.
 */
function apexoneiq_backup_runner_zip_directory( ZipArchive $zip, $directory, $root, $backup_dir ) {
	$iterator = new RecursiveIteratorIterator(
		new RecursiveDirectoryIterator( $directory, FilesystemIterator::SKIP_DOTS ),
		RecursiveIteratorIterator::SELF_FIRST
	);
	$backup_root = realpath( $backup_dir );

	foreach ( $iterator as $file ) {
		$path = $file->getRealPath();
		if ( false === $path || ( $backup_root && 0 === strpos( $path, $backup_root ) ) ) {
			continue;
		}

		$relative = ltrim( str_replace( $root, '', $path ), DIRECTORY_SEPARATOR );
		if ( $file->isDir() ) {
			$zip->addEmptyDir( $relative );
			continue;
		}

		$zip->addFile( $path, $relative );
	}
}
