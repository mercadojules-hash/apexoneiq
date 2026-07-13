<?php
/**
 * Centralized subscription state service.
 *
 * @package ApexOneIQ
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Return the current WordPress user's ApexOneIQ subscription state.
 *
 * @return array<string,mixed>
 */
function apexoneiq_get_current_user_subscription_state() {
	return apexoneiq_get_user_subscription_state( get_current_user_id() );
}

/**
 * Return a user's ApexOneIQ subscription state.
 *
 * @param int $user_id WordPress user ID.
 * @return array<string,mixed>
 */
function apexoneiq_get_user_subscription_state( $user_id ) {
	$user_id = absint( $user_id );

	if ( ! $user_id ) {
		return apexoneiq_default_subscription_state( false );
	}

	if ( user_can( $user_id, 'manage_options' ) ) {
		$state = apexoneiq_default_subscription_state( true );
		$state['plan'] = 'owner';
		$state['status'] = 'active';
		$state['active'] = true;
		$state['capabilities'] = apexoneiq_all_capabilities();
		return $state;
	}

	if ( apexoneiq_user_has_qa_pro_override( $user_id ) ) {
		$state = apexoneiq_default_subscription_state( true );
		$state['plan'] = 'command';
		$state['status'] = 'qa_override';
		$state['active'] = true;
		$state['capabilities'] = apexoneiq_capabilities_for_plan( 'command' );
		return $state;
	}

	$record = apexoneiq_get_subscription_record_by_user( $user_id );
	if ( ! $record ) {
		$state = apexoneiq_default_subscription_state( true );
		$state['plan'] = 'free';
		$state['capabilities'] = apexoneiq_capabilities_for_plan( 'free' );
		return $state;
	}

	$active_statuses = array( 'active', 'trialing' );
	$grace_statuses  = array( 'past_due' );
	$plan            = $record['current_plan'] ?: apexoneiq_plan_for_price( $record['stripe_price_id'] );
	$status          = sanitize_key( $record['subscription_status'] );
	$active          = in_array( $status, $active_statuses, true );
	$grace           = in_array( $status, $grace_statuses, true );
	$expired         = in_array( $status, array( 'canceled', 'unpaid', 'incomplete_expired' ), true );
	$trial           = 'trialing' === $status || 'trialing' === $record['trial_status'];
	$capabilities    = ( $active || $grace ) ? apexoneiq_capabilities_for_plan( $plan ) : apexoneiq_capabilities_for_plan( 'free' );

	return array(
		'authenticated'          => true,
		'active'                 => $active,
		'grace_period'           => $grace,
		'trial'                  => $trial,
		'cancelled'              => (bool) absint( $record['cancel_at_period_end'] ),
		'expired'                => $expired,
		'plan'                   => $plan ?: 'free',
		'status'                 => $status ?: 'none',
		'capabilities'           => $capabilities,
		'renewal_date'           => $record['current_period_end'],
		'current_period_end'     => $record['current_period_end'],
		'billing_interval'       => $record['billing_interval'],
		'stripe_customer_id'     => $record['stripe_customer_id'],
		'stripe_subscription_id' => $record['stripe_subscription_id'],
		'stripe_price_id'        => $record['stripe_price_id'],
	);
}

/**
 * Return default subscription state.
 *
 * @param bool $authenticated Whether a WordPress user is logged in.
 * @return array<string,mixed>
 */
function apexoneiq_default_subscription_state( $authenticated ) {
	return array(
		'authenticated'          => (bool) $authenticated,
		'active'                 => false,
		'grace_period'           => false,
		'trial'                  => false,
		'cancelled'              => false,
		'expired'                => false,
		'plan'                   => $authenticated ? 'free' : 'visitor',
		'status'                 => 'none',
		'capabilities'           => $authenticated ? apexoneiq_capabilities_for_plan( 'free' ) : array(),
		'renewal_date'           => null,
		'current_period_end'     => null,
		'billing_interval'       => '',
		'stripe_customer_id'     => '',
		'stripe_subscription_id' => '',
		'stripe_price_id'        => '',
	);
}

/**
 * Return the temporary QA Pro allowlist.
 *
 * @return array<int,string>
 */
function apexoneiq_qa_pro_override_emails() {
	$raw = '';

	if ( defined( 'APEXONEIQ_QA_PRO_EMAILS' ) ) {
		$raw = (string) APEXONEIQ_QA_PRO_EMAILS;
	} elseif ( getenv( 'APEXONEIQ_QA_PRO_EMAILS' ) ) {
		$raw = (string) getenv( 'APEXONEIQ_QA_PRO_EMAILS' );
	}

	$emails = array_filter( array_map( 'trim', explode( ',', strtolower( $raw ) ) ) );
	$emails[] = 'mercadojules@gmail.com';

	return array_values( array_unique( array_filter( $emails, 'is_email' ) ) );
}

/**
 * Return temporary QA Pro display-name or login allowlist entries.
 *
 * @return array<int,string>
 */
function apexoneiq_qa_pro_override_identities() {
	$raw = '';

	if ( defined( 'APEXONEIQ_QA_PRO_IDENTITIES' ) ) {
		$raw = (string) APEXONEIQ_QA_PRO_IDENTITIES;
	} elseif ( getenv( 'APEXONEIQ_QA_PRO_IDENTITIES' ) ) {
		$raw = (string) getenv( 'APEXONEIQ_QA_PRO_IDENTITIES' );
	}

	$identities = array_filter( array_map( 'trim', explode( ',', strtolower( $raw ) ) ) );
	$identities[] = 'jules mercado (mixtapepsd)';

	return array_values( array_unique( $identities ) );
}

/**
 * Check whether a logged-in user has the temporary QA Pro override.
 *
 * @param int $user_id WordPress user ID.
 * @return bool
 */
function apexoneiq_user_has_qa_pro_override( $user_id ) {
	$user = get_user_by( 'id', absint( $user_id ) );
	if ( ! $user || empty( $user->user_email ) ) {
		return false;
	}

	$identities = apexoneiq_qa_pro_override_identities();

	return in_array( strtolower( $user->user_email ), apexoneiq_qa_pro_override_emails(), true )
		|| in_array( strtolower( $user->display_name ), $identities, true )
		|| in_array( strtolower( $user->user_login ), $identities, true );
}

/**
 * Return a subscription record by WordPress user.
 *
 * @param int $user_id WordPress user ID.
 * @return array<string,string>|null
 */
function apexoneiq_get_subscription_record_by_user( $user_id ) {
	global $wpdb;

	$table = apexoneiq_subscriptions_table();
	$row = $wpdb->get_row(
		$wpdb->prepare(
			"SELECT * FROM {$table} WHERE user_id = %d ORDER BY updated_date DESC, id DESC LIMIT 1", // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
			absint( $user_id )
		),
		ARRAY_A
	);

	return $row ?: null;
}

/**
 * Return a subscription record by Stripe subscription ID.
 *
 * @param string $subscription_id Stripe subscription ID.
 * @return array<string,string>|null
 */
function apexoneiq_get_subscription_record_by_stripe_subscription( $subscription_id ) {
	global $wpdb;

	$table = apexoneiq_subscriptions_table();
	$row = $wpdb->get_row(
		$wpdb->prepare(
			"SELECT * FROM {$table} WHERE stripe_subscription_id = %s LIMIT 1", // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
			sanitize_text_field( $subscription_id )
		),
		ARRAY_A
	);

	return $row ?: null;
}

/**
 * Return a subscription record by Stripe customer ID.
 *
 * @param string $customer_id Stripe customer ID.
 * @return array<string,string>|null
 */
function apexoneiq_get_subscription_record_by_stripe_customer( $customer_id ) {
	global $wpdb;

	$table = apexoneiq_subscriptions_table();
	$row = $wpdb->get_row(
		$wpdb->prepare(
			"SELECT * FROM {$table} WHERE stripe_customer_id = %s ORDER BY updated_date DESC, id DESC LIMIT 1", // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
			sanitize_text_field( $customer_id )
		),
		ARRAY_A
	);

	return $row ?: null;
}

/**
 * Return capabilities for a plan.
 *
 * @param string $plan Plan key.
 * @return array<int,string>
 */
function apexoneiq_capabilities_for_plan( $plan ) {
	$sets = function_exists( 'apexoneiq_plan_capabilities' ) ? apexoneiq_plan_capabilities() : array();
	return isset( $sets[ $plan ] ) ? $sets[ $plan ] : array();
}

/**
 * Return every known ApexOneIQ capability.
 *
 * @return array<int,string>
 */
function apexoneiq_all_capabilities() {
	$all = array();
	foreach ( apexoneiq_plan_capabilities() as $capabilities ) {
		$all = array_merge( $all, $capabilities );
	}
	return array_values( array_unique( $all ) );
}

/**
 * Persist a Stripe subscription to the local subscription table.
 *
 * @param array<string,mixed> $subscription Stripe subscription object.
 * @param int                $user_id       WordPress user ID.
 * @param string             $plan_hint     Optional plan hint.
 * @return bool
 */
function apexoneiq_sync_subscription_from_stripe( $subscription, $user_id = 0, $plan_hint = '' ) {
	global $wpdb;

	$subscription_id = sanitize_text_field( $subscription['id'] ?? '' );
	if ( ! $subscription_id ) {
		return false;
	}

	$customer_id = sanitize_text_field( is_array( $subscription['customer'] ?? '' ) ? ( $subscription['customer']['id'] ?? '' ) : ( $subscription['customer'] ?? '' ) );
	$item        = $subscription['items']['data'][0] ?? array();
	$price       = $item['price'] ?? array();
	$price_id    = sanitize_text_field( $price['id'] ?? '' );
	$plan        = sanitize_key( $plan_hint ?: apexoneiq_plan_for_price( $price_id ) );
	$status      = sanitize_key( $subscription['status'] ?? '' );
	$user_id     = absint( $user_id ?: ( $subscription['metadata']['wordpress_user_id'] ?? 0 ) );

	if ( ! $user_id && $customer_id ) {
		$existing = apexoneiq_get_subscription_record_by_stripe_customer( $customer_id );
		$user_id  = absint( $existing['user_id'] ?? 0 );
	}

	$data = array(
		'user_id'                => $user_id,
		'stripe_customer_id'     => $customer_id,
		'stripe_subscription_id' => $subscription_id,
		'stripe_price_id'        => $price_id,
		'subscription_status'    => $status,
		'current_plan'           => $plan,
		'billing_interval'       => sanitize_key( $price['recurring']['interval'] ?? '' ),
		'current_period_end'     => ! empty( $subscription['current_period_end'] ) ? gmdate( 'Y-m-d H:i:s', absint( $subscription['current_period_end'] ) ) : null,
		'cancel_at_period_end'   => ! empty( $subscription['cancel_at_period_end'] ) ? 1 : 0,
		'trial_status'           => ( ! empty( $subscription['trial_end'] ) && absint( $subscription['trial_end'] ) > time() ) ? 'trialing' : '',
		'created_date'           => ! empty( $subscription['created'] ) ? gmdate( 'Y-m-d H:i:s', absint( $subscription['created'] ) ) : current_time( 'mysql', true ),
		'updated_date'           => current_time( 'mysql', true ),
	);

	$formats = array( '%d', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%d', '%s', '%s', '%s' );
	$existing = apexoneiq_get_subscription_record_by_stripe_subscription( $subscription_id );

	if ( $existing ) {
		$wpdb->update( apexoneiq_subscriptions_table(), $data, array( 'id' => absint( $existing['id'] ) ), $formats, array( '%d' ) );
	} else {
		$wpdb->insert( apexoneiq_subscriptions_table(), $data, $formats );
	}

	if ( $user_id ) {
		update_user_meta( $user_id, 'apexoneiq_subscription_plan', $plan );
		update_user_meta( $user_id, 'apexoneiq_subscription_status', $status );
		update_user_meta( $user_id, 'apexoneiq_subscription_capabilities', apexoneiq_capabilities_for_plan( $plan ) );
		update_user_meta( $user_id, 'apexoneiq_stripe_customer_id', $customer_id );
		update_user_meta( $user_id, 'apexoneiq_stripe_subscription_id', $subscription_id );
	}

	return true;
}
