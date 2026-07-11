<?php
/**
 * Database schema for ApexOneIQ subscriptions and webhook health.
 *
 * @package ApexOneIQ
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

add_action( 'init', 'apexoneiq_maybe_install_subscription_schema', 5 );

/**
 * Return the subscriptions table name.
 *
 * @return string
 */
function apexoneiq_subscriptions_table() {
	global $wpdb;
	return $wpdb->prefix . 'apexoneiq_subscriptions';
}

/**
 * Return the webhook events table name.
 *
 * @return string
 */
function apexoneiq_webhook_events_table() {
	global $wpdb;
	return $wpdb->prefix . 'apexoneiq_webhook_events';
}

/**
 * Install or update the subscription schema when needed.
 */
function apexoneiq_maybe_install_subscription_schema() {
	if ( '1.0.0' !== get_option( 'apexoneiq_subscription_schema_version' ) ) {
		apexoneiq_install_subscription_schema();
	}
}

/**
 * Install subscription and webhook tables.
 */
function apexoneiq_install_subscription_schema() {
	global $wpdb;

	require_once ABSPATH . 'wp-admin/includes/upgrade.php';

	$charset = $wpdb->get_charset_collate();
	$subscriptions = apexoneiq_subscriptions_table();
	$events = apexoneiq_webhook_events_table();

	dbDelta(
		"CREATE TABLE {$subscriptions} (
			id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
			user_id BIGINT UNSIGNED NOT NULL DEFAULT 0,
			stripe_customer_id VARCHAR(191) NOT NULL DEFAULT '',
			stripe_subscription_id VARCHAR(191) NOT NULL DEFAULT '',
			stripe_price_id VARCHAR(191) NOT NULL DEFAULT '',
			subscription_status VARCHAR(50) NOT NULL DEFAULT '',
			current_plan VARCHAR(50) NOT NULL DEFAULT '',
			billing_interval VARCHAR(20) NOT NULL DEFAULT '',
			current_period_end DATETIME NULL,
			cancel_at_period_end TINYINT(1) NOT NULL DEFAULT 0,
			trial_status VARCHAR(50) NOT NULL DEFAULT '',
			created_date DATETIME NULL,
			updated_date DATETIME NOT NULL,
			PRIMARY KEY  (id),
			UNIQUE KEY stripe_subscription_id (stripe_subscription_id),
			KEY user_id (user_id),
			KEY stripe_customer_id (stripe_customer_id),
			KEY subscription_status (subscription_status),
			KEY current_plan (current_plan)
		) {$charset};"
	);

	dbDelta(
		"CREATE TABLE {$events} (
			id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
			stripe_event_id VARCHAR(191) NOT NULL DEFAULT '',
			event_type VARCHAR(191) NOT NULL DEFAULT '',
			processing_status VARCHAR(50) NOT NULL DEFAULT '',
			error_message TEXT NULL,
			payload LONGTEXT NULL,
			created_at DATETIME NOT NULL,
			processed_at DATETIME NULL,
			PRIMARY KEY  (id),
			UNIQUE KEY stripe_event_id (stripe_event_id),
			KEY event_type (event_type),
			KEY processing_status (processing_status)
		) {$charset};"
	);

	update_option( 'apexoneiq_subscription_schema_version', '1.0.0', false );
}
