<?php
/**
 * Database schema definitions.
 *
 * @package Apex_Local_SEO
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * APLS Core Schema.
 */
class APLS_Core_Schema {
	/**
	 * Return dbDelta statements for Apex Local SEO tables.
	 *
	 * @return array
	 */
	public static function statements() {
		global $wpdb;

		$charset = $wpdb->get_charset_collate();
		$p       = $wpdb->prefix;

		return array(
			"CREATE TABLE {$p}apls_locations (
				id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
				wp_site_id BIGINT UNSIGNED NOT NULL DEFAULT 0,
				name VARCHAR(190) NOT NULL DEFAULT '',
				slug VARCHAR(190) NOT NULL DEFAULT '',
				business_name VARCHAR(190) NOT NULL DEFAULT '',
				address_line_1 VARCHAR(190) NOT NULL DEFAULT '',
				address_line_2 VARCHAR(190) NOT NULL DEFAULT '',
				city VARCHAR(120) NOT NULL DEFAULT '',
				region VARCHAR(120) NOT NULL DEFAULT '',
				postal_code VARCHAR(40) NOT NULL DEFAULT '',
				country_code VARCHAR(2) NOT NULL DEFAULT '',
				phone VARCHAR(80) NOT NULL DEFAULT '',
				website_url VARCHAR(255) NOT NULL DEFAULT '',
				latitude DECIMAL(10,7) NULL,
				longitude DECIMAL(10,7) NULL,
				status VARCHAR(40) NOT NULL DEFAULT 'active',
				created_at DATETIME NOT NULL,
				updated_at DATETIME NOT NULL,
				PRIMARY KEY  (id),
				UNIQUE KEY slug (slug),
				KEY status (status)
			) {$charset};",
			"CREATE TABLE {$p}apls_sync_runs (
				id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
				module_id VARCHAR(80) NOT NULL DEFAULT '',
				location_id BIGINT UNSIGNED NULL,
				provider VARCHAR(80) NOT NULL DEFAULT '',
				status VARCHAR(40) NOT NULL DEFAULT '',
				started_at DATETIME NOT NULL,
				finished_at DATETIME NULL,
				records_seen INT UNSIGNED NOT NULL DEFAULT 0,
				records_changed INT UNSIGNED NOT NULL DEFAULT 0,
				error_code VARCHAR(120) NOT NULL DEFAULT '',
				error_message TEXT NULL,
				PRIMARY KEY  (id),
				KEY module_status (module_id, status),
				KEY location_id (location_id)
			) {$charset};",
			"CREATE TABLE {$p}apls_recommendations (
				id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
				location_id BIGINT UNSIGNED NULL,
				module_id VARCHAR(80) NOT NULL DEFAULT '',
				type VARCHAR(80) NOT NULL DEFAULT '',
				title VARCHAR(190) NOT NULL DEFAULT '',
				description TEXT NULL,
				priority VARCHAR(40) NOT NULL DEFAULT 'normal',
				confidence DECIMAL(5,2) NOT NULL DEFAULT 0,
				estimated_visibility_lift DECIMAL(6,2) NULL,
				status VARCHAR(40) NOT NULL DEFAULT 'new',
				action_url VARCHAR(255) NOT NULL DEFAULT '',
				metadata LONGTEXT NULL,
				created_at DATETIME NOT NULL,
				updated_at DATETIME NOT NULL,
				PRIMARY KEY  (id),
				KEY module_status (module_id, status),
				KEY location_id (location_id)
			) {$charset};",
			"CREATE TABLE {$p}apls_gbp_accounts (
				id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
				google_account_id VARCHAR(190) NOT NULL DEFAULT '',
				email VARCHAR(190) NOT NULL DEFAULT '',
				access_token_encrypted LONGTEXT NULL,
				refresh_token_encrypted LONGTEXT NULL,
				access_token_expires_at DATETIME NULL,
				scopes TEXT NULL,
				status VARCHAR(40) NOT NULL DEFAULT 'disconnected',
				error_message TEXT NULL,
				connected_at DATETIME NULL,
				updated_at DATETIME NOT NULL,
				PRIMARY KEY  (id),
				UNIQUE KEY google_account_id (google_account_id),
				KEY email (email),
				KEY status (status)
			) {$charset};",
			"CREATE TABLE {$p}apls_gbp_locations (
				id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
				location_id BIGINT UNSIGNED NOT NULL,
				gbp_account_id BIGINT UNSIGNED NOT NULL,
				gbp_location_name VARCHAR(255) NOT NULL DEFAULT '',
				gbp_place_id VARCHAR(190) NOT NULL DEFAULT '',
				primary_category VARCHAR(190) NOT NULL DEFAULT '',
				additional_categories LONGTEXT NULL,
				profile_state VARCHAR(80) NOT NULL DEFAULT '',
				verified TINYINT(1) NOT NULL DEFAULT 0,
				completeness_score DECIMAL(5,2) NOT NULL DEFAULT 0,
				raw_payload LONGTEXT NULL,
				last_synced_at DATETIME NULL,
				PRIMARY KEY  (id),
				UNIQUE KEY location_id (location_id),
				KEY gbp_place_id (gbp_place_id)
			) {$charset};",
			"CREATE TABLE {$p}apls_gbp_assets (
				id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
				location_id BIGINT UNSIGNED NOT NULL,
				asset_type VARCHAR(40) NOT NULL DEFAULT '',
				provider_asset_id VARCHAR(190) NOT NULL DEFAULT '',
				title VARCHAR(190) NOT NULL DEFAULT '',
				url VARCHAR(255) NOT NULL DEFAULT '',
				thumbnail_url VARCHAR(255) NOT NULL DEFAULT '',
				status VARCHAR(40) NOT NULL DEFAULT '',
				metadata LONGTEXT NULL,
				published_at DATETIME NULL,
				created_at DATETIME NOT NULL,
				PRIMARY KEY  (id),
				UNIQUE KEY provider_asset (location_id, provider_asset_id),
				KEY location_type (location_id, asset_type)
			) {$charset};",
			"CREATE TABLE {$p}apls_reviews (
				id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
				location_id BIGINT UNSIGNED NOT NULL,
				provider VARCHAR(80) NOT NULL DEFAULT '',
				provider_review_id VARCHAR(190) NOT NULL DEFAULT '',
				reviewer_name VARCHAR(190) NOT NULL DEFAULT '',
				reviewer_avatar_url VARCHAR(255) NOT NULL DEFAULT '',
				rating DECIMAL(3,2) NOT NULL DEFAULT 0,
				review_text TEXT NULL,
				sentiment VARCHAR(40) NOT NULL DEFAULT '',
				response_text TEXT NULL,
				response_status VARCHAR(40) NOT NULL DEFAULT 'none',
				reviewed_at DATETIME NULL,
				updated_at DATETIME NOT NULL,
				raw_payload LONGTEXT NULL,
				PRIMARY KEY  (id),
				UNIQUE KEY provider_review (provider, provider_review_id),
				KEY location_status (location_id, response_status)
			) {$charset};",
			"CREATE TABLE {$p}apls_review_reply_drafts (
				id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
				review_id BIGINT UNSIGNED NOT NULL,
				source VARCHAR(40) NOT NULL DEFAULT '',
				draft_text TEXT NULL,
				status VARCHAR(40) NOT NULL DEFAULT 'draft',
				created_by BIGINT UNSIGNED NULL,
				created_at DATETIME NOT NULL,
				updated_at DATETIME NOT NULL,
				PRIMARY KEY  (id),
				KEY review_status (review_id, status)
			) {$charset};",
			"CREATE TABLE {$p}apls_keywords (
				id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
				location_id BIGINT UNSIGNED NOT NULL,
				keyword VARCHAR(190) NOT NULL DEFAULT '',
				intent VARCHAR(80) NOT NULL DEFAULT '',
				status VARCHAR(40) NOT NULL DEFAULT 'active',
				created_at DATETIME NOT NULL,
				updated_at DATETIME NOT NULL,
				PRIMARY KEY  (id),
				KEY location_keyword (location_id, keyword)
			) {$charset};",
			"CREATE TABLE {$p}apls_rank_snapshots (
				id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
				keyword_id BIGINT UNSIGNED NOT NULL,
				location_id BIGINT UNSIGNED NOT NULL,
				search_lat DECIMAL(10,7) NULL,
				search_lng DECIMAL(10,7) NULL,
				organic_position INT UNSIGNED NULL,
				map_pack_position INT UNSIGNED NULL,
				visibility_score DECIMAL(6,2) NOT NULL DEFAULT 0,
				snapshot_date DATE NOT NULL,
				raw_payload LONGTEXT NULL,
				PRIMARY KEY  (id),
				KEY keyword_date (keyword_id, snapshot_date),
				KEY location_date (location_id, snapshot_date)
			) {$charset};",
			"CREATE TABLE {$p}apls_citation_sources (
				id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
				name VARCHAR(190) NOT NULL DEFAULT '',
				domain VARCHAR(190) NOT NULL DEFAULT '',
				category VARCHAR(80) NOT NULL DEFAULT '',
				priority VARCHAR(40) NOT NULL DEFAULT 'normal',
				active TINYINT(1) NOT NULL DEFAULT 1,
				PRIMARY KEY  (id),
				KEY active_priority (active, priority),
				KEY domain (domain)
			) {$charset};",
			"CREATE TABLE {$p}apls_citations (
				id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
				location_id BIGINT UNSIGNED NOT NULL,
				source_id BIGINT UNSIGNED NOT NULL,
				listing_url VARCHAR(255) NOT NULL DEFAULT '',
				business_name VARCHAR(190) NOT NULL DEFAULT '',
				phone VARCHAR(80) NOT NULL DEFAULT '',
				address_hash CHAR(64) NOT NULL DEFAULT '',
				status VARCHAR(40) NOT NULL DEFAULT 'unknown',
				consistency_score DECIMAL(5,2) NOT NULL DEFAULT 0,
				last_checked_at DATETIME NULL,
				metadata LONGTEXT NULL,
				PRIMARY KEY  (id),
				KEY location_status (location_id, status),
				KEY source_id (source_id)
			) {$charset};",
			"CREATE TABLE {$p}apls_competitors (
				id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
				location_id BIGINT UNSIGNED NOT NULL,
				name VARCHAR(190) NOT NULL DEFAULT '',
				website_url VARCHAR(255) NOT NULL DEFAULT '',
				gbp_place_id VARCHAR(190) NOT NULL DEFAULT '',
				phone VARCHAR(80) NOT NULL DEFAULT '',
				city VARCHAR(120) NOT NULL DEFAULT '',
				region VARCHAR(120) NOT NULL DEFAULT '',
				country_code VARCHAR(2) NOT NULL DEFAULT '',
				status VARCHAR(40) NOT NULL DEFAULT 'active',
				created_at DATETIME NOT NULL,
				updated_at DATETIME NOT NULL,
				PRIMARY KEY  (id),
				KEY location_status (location_id, status),
				KEY gbp_place_id (gbp_place_id)
			) {$charset};",
			"CREATE TABLE {$p}apls_competitor_snapshots (
				id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
				competitor_id BIGINT UNSIGNED NOT NULL,
				snapshot_date DATE NOT NULL,
				rating DECIMAL(3,2) NOT NULL DEFAULT 0,
				review_count INT UNSIGNED NOT NULL DEFAULT 0,
				photo_count INT UNSIGNED NOT NULL DEFAULT 0,
				post_count INT UNSIGNED NOT NULL DEFAULT 0,
				category_match_score DECIMAL(5,2) NOT NULL DEFAULT 0,
				visibility_score DECIMAL(6,2) NOT NULL DEFAULT 0,
				raw_payload LONGTEXT NULL,
				PRIMARY KEY  (id),
				KEY competitor_date (competitor_id, snapshot_date)
			) {$charset};",
			"CREATE TABLE {$p}apls_landing_page_audits (
				id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
				location_id BIGINT UNSIGNED NOT NULL,
				post_id BIGINT UNSIGNED NOT NULL,
				audit_date DATE NOT NULL,
				page_url VARCHAR(255) NOT NULL DEFAULT '',
				local_content_score DECIMAL(5,2) NOT NULL DEFAULT 0,
				internal_link_score DECIMAL(5,2) NOT NULL DEFAULT 0,
				schema_score DECIMAL(5,2) NOT NULL DEFAULT 0,
				optimization_score DECIMAL(5,2) NOT NULL DEFAULT 0,
				issues LONGTEXT NULL,
				created_at DATETIME NOT NULL,
				PRIMARY KEY  (id),
				KEY location_date (location_id, audit_date),
				KEY post_id (post_id)
			) {$charset};",
			"CREATE TABLE {$p}apls_gbp_metrics_daily (
				id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
				location_id BIGINT UNSIGNED NOT NULL,
				metric_date DATE NOT NULL,
				calls INT UNSIGNED NOT NULL DEFAULT 0,
				website_clicks INT UNSIGNED NOT NULL DEFAULT 0,
				direction_requests INT UNSIGNED NOT NULL DEFAULT 0,
				search_views INT UNSIGNED NOT NULL DEFAULT 0,
				maps_views INT UNSIGNED NOT NULL DEFAULT 0,
				photo_views INT UNSIGNED NOT NULL DEFAULT 0,
				raw_payload LONGTEXT NULL,
				created_at DATETIME NOT NULL,
				updated_at DATETIME NOT NULL,
				PRIMARY KEY  (id),
				UNIQUE KEY location_date (location_id, metric_date),
				KEY metric_date (metric_date)
			) {$charset};",
		);
	}
}
