<?php
/**
 * Remove Apex Local SEO plugin-owned data on uninstall.
 *
 * @package Apex_Local_SEO
 */

if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) ) {
	exit;
}

global $wpdb;

$apls_options = array(
	'apls_version',
	'apls_db_version',
	'apls_google_connected_email',
	'apls_google_oauth_state',
	'apls_default_location_id',
	'apls_enabled_modules',
	'apls_dashboard_range',
	'apls_sync_frequency',
	'apls_data_retention_days',
	'apls_advisor_mode',
	'apls_google_client_id',
	'apls_google_client_secret',
);

foreach ( $apls_options as $apls_option ) {
	delete_option( $apls_option );
}

$apls_tables = array(
	'apls_locations',
	'apls_sync_runs',
	'apls_recommendations',
	'apls_gbp_accounts',
	'apls_gbp_locations',
	'apls_gbp_assets',
	'apls_reviews',
	'apls_review_reply_drafts',
	'apls_keywords',
	'apls_rank_snapshots',
	'apls_citation_sources',
	'apls_citations',
	'apls_competitors',
	'apls_competitor_snapshots',
	'apls_landing_page_audits',
	'apls_gbp_metrics_daily',
);

foreach ( $apls_tables as $apls_table ) {
	$wpdb->query( "DROP TABLE IF EXISTS {$wpdb->prefix}{$apls_table}" ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.DirectDatabaseQuery.SchemaChange, WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- Drops plugin-owned custom tables during uninstall only.
}
