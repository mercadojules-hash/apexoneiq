<?php
/**
 * Plugin Name: ApexOneIQ Backup Utility
 * Description: Temporary backup utility for the ApexOneIQ development installation.
 * Version: 0.1.0
 * Author: ApexOneIQ
 *
 * @package ApexOneIQ_Backup_Utility
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

add_action( 'admin_post_apexoneiq_create_backup', 'apexoneiq_backup_utility_create_backup' );

/**
 * Create a database and file backup for the current WordPress installation.
 */
function apexoneiq_backup_utility_create_backup() {
	if ( ! current_user_can( 'manage_options' ) ) {
		wp_die( esc_html__( 'Insufficient permissions.', 'apexoneiq-backup-utility' ) );
	}

	check_admin_referer( 'apexoneiq_create_backup' );

	if ( ! class_exists( 'ZipArchive' ) ) {
		wp_die( esc_html__( 'ZipArchive is not available on this server.', 'apexoneiq-backup-utility' ) );
	}

	global $wpdb;

	$upload_dir = wp_upload_dir();
	$backup_dir = trailingslashit( $upload_dir['basedir'] ) . 'apexoneiq-backups';

	if ( ! wp_mkdir_p( $backup_dir ) ) {
		wp_die( esc_html__( 'Unable to create backup directory.', 'apexoneiq-backup-utility' ) );
	}

	$timestamp = gmdate( 'Ymd-His' );
	$sql_path  = trailingslashit( $backup_dir ) . "apexoneiq-db-{$timestamp}.sql";
	$zip_path  = trailingslashit( $backup_dir ) . "apexoneiq-fresh-wordpress-backup-{$timestamp}.zip";

	apexoneiq_backup_utility_export_database( $sql_path );

	$zip = new ZipArchive();
	if ( true !== $zip->open( $zip_path, ZipArchive::CREATE | ZipArchive::OVERWRITE ) ) {
		wp_die( esc_html__( 'Unable to create backup zip.', 'apexoneiq-backup-utility' ) );
	}

	$root = realpath( ABSPATH );
	apexoneiq_backup_utility_zip_directory( $zip, $root, $root, $backup_dir );
	$zip->addFile( $sql_path, 'database/apexoneiq-wordpress.sql' );
	$zip->close();

	@unlink( $sql_path );

	$zip_url = trailingslashit( $upload_dir['baseurl'] ) . 'apexoneiq-backups/' . basename( $zip_path );
	wp_safe_redirect( add_query_arg( 'apexoneiq_backup', rawurlencode( $zip_url ), admin_url( 'index.php' ) ) );
	exit;
}

/**
 * Export all WordPress tables for this installation.
 *
 * @param string $sql_path Destination SQL path.
 */
function apexoneiq_backup_utility_export_database( $sql_path ) {
	global $wpdb;

	$tables = $wpdb->get_col( $wpdb->prepare( 'SHOW TABLES LIKE %s', $wpdb->esc_like( $wpdb->prefix ) . '%' ) );
	$handle = fopen( $sql_path, 'wb' );

	if ( ! $handle ) {
		wp_die( esc_html__( 'Unable to write database export.', 'apexoneiq-backup-utility' ) );
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
				static function ( $value ) use ( $wpdb ) {
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
 * Add WordPress files to the backup zip.
 *
 * @param ZipArchive $zip        Zip instance.
 * @param string     $directory  Current directory.
 * @param string     $root       WordPress root.
 * @param string     $backup_dir Backup directory to exclude.
 */
function apexoneiq_backup_utility_zip_directory( ZipArchive $zip, $directory, $root, $backup_dir ) {
	$iterator = new RecursiveIteratorIterator(
		new RecursiveDirectoryIterator( $directory, FilesystemIterator::SKIP_DOTS ),
		RecursiveIteratorIterator::SELF_FIRST
	);

	foreach ( $iterator as $file ) {
		$path = $file->getRealPath();
		if ( false === $path || 0 === strpos( $path, realpath( $backup_dir ) ) ) {
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
