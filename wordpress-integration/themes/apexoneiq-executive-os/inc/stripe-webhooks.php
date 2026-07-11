<?php
/**
 * Stripe Sandbox webhook handling.
 *
 * @package ApexOneIQ
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Handle Stripe webhook requests.
 */
function apexoneiq_handle_stripe_webhook() {
	if ( 'POST' !== strtoupper( $_SERVER['REQUEST_METHOD'] ?? '' ) ) {
		wp_send_json_error( array( 'code' => 'method_not_allowed' ), 405 );
	}

	$payload = file_get_contents( 'php://input' );
	$signature = sanitize_text_field( wp_unslash( $_SERVER['HTTP_STRIPE_SIGNATURE'] ?? '' ) );
	$secret = apexoneiq_get_env_value( 'STRIPE_WEBHOOK_SECRET' );

	if ( ! $secret || 0 !== strpos( $secret, 'whsec_' ) ) {
		wp_send_json_error( array( 'code' => 'webhook_not_configured' ), 503 );
	}

	if ( ! apexoneiq_verify_stripe_signature( $payload, $signature, $secret ) ) {
		wp_send_json_error( array( 'code' => 'invalid_signature' ), 400 );
	}

	$event = json_decode( $payload, true );
	if ( ! is_array( $event ) || empty( $event['id'] ) || empty( $event['type'] ) ) {
		wp_send_json_error( array( 'code' => 'invalid_payload' ), 400 );
	}

	if ( ! empty( $event['livemode'] ) ) {
		apexoneiq_record_webhook_event( $event, 'rejected', 'Live mode events are not accepted in this environment.' );
		wp_send_json_error( array( 'code' => 'live_mode_rejected' ), 400 );
	}

	if ( apexoneiq_webhook_event_exists( $event['id'] ) ) {
		wp_send_json_success( array( 'duplicate' => true ) );
	}

	$result = apexoneiq_process_stripe_event( $event );
	apexoneiq_record_webhook_event( $event, $result['status'], $result['message'] ?? '' );

	if ( 'processed' !== $result['status'] ) {
		wp_send_json_error( array( 'code' => 'processing_failed', 'message' => $result['message'] ), 422 );
	}

	wp_send_json_success( array( 'processed' => true ) );
}

/**
 * Verify Stripe webhook signature.
 *
 * @param string $payload   Raw payload.
 * @param string $signature Stripe-Signature header.
 * @param string $secret    Webhook signing secret.
 * @return bool
 */
function apexoneiq_verify_stripe_signature( $payload, $signature, $secret ) {
	if ( ! $payload || ! $signature ) {
		return false;
	}

	$timestamp = '';
	$signatures = array();
	foreach ( explode( ',', $signature ) as $part ) {
		$pair = explode( '=', $part, 2 );
		if ( 2 !== count( $pair ) ) {
			continue;
		}
		if ( 't' === $pair[0] ) {
			$timestamp = $pair[1];
		}
		if ( 'v1' === $pair[0] ) {
			$signatures[] = $pair[1];
		}
	}

	if ( ! $timestamp || empty( $signatures ) || abs( time() - absint( $timestamp ) ) > 300 ) {
		return false;
	}

	$expected = hash_hmac( 'sha256', $timestamp . '.' . $payload, $secret );
	foreach ( $signatures as $provided ) {
		if ( hash_equals( $expected, $provided ) ) {
			return true;
		}
	}

	return false;
}

/**
 * Process supported Stripe events.
 *
 * @param array<string,mixed> $event Stripe event.
 * @return array<string,string>
 */
function apexoneiq_process_stripe_event( $event ) {
	$type = sanitize_text_field( $event['type'] );
	$object = $event['data']['object'] ?? array();

	switch ( $type ) {
		case 'checkout.session.completed':
			return apexoneiq_process_checkout_completed( $object );

		case 'customer.subscription.created':
		case 'customer.subscription.updated':
		case 'customer.subscription.deleted':
			return apexoneiq_process_subscription_event( $object );

		case 'invoice.paid':
		case 'invoice.payment_failed':
			return apexoneiq_process_invoice_event( $object );
	}

	return array(
		'status'  => 'ignored',
		'message' => 'Unsupported event type.',
	);
}

/**
 * Process checkout completion.
 *
 * @param array<string,mixed> $session Checkout Session object.
 * @return array<string,string>
 */
function apexoneiq_process_checkout_completed( $session ) {
	$user_id = absint( $session['metadata']['wordpress_user_id'] ?? $session['client_reference_id'] ?? 0 );
	$plan = sanitize_key( $session['metadata']['apex_plan'] ?? '' );
	$subscription_id = sanitize_text_field( is_array( $session['subscription'] ?? '' ) ? ( $session['subscription']['id'] ?? '' ) : ( $session['subscription'] ?? '' ) );

	if ( ! $subscription_id ) {
		return array( 'status' => 'failed', 'message' => 'Checkout Session did not include a subscription ID.' );
	}

	$subscription = apexoneiq_stripe_get_subscription( $subscription_id );
	if ( is_wp_error( $subscription ) ) {
		return array( 'status' => 'failed', 'message' => $subscription->get_error_message() );
	}

	apexoneiq_sync_subscription_from_stripe( $subscription, $user_id, $plan );
	return array( 'status' => 'processed', 'message' => '' );
}

/**
 * Process subscription lifecycle event.
 *
 * @param array<string,mixed> $subscription Subscription object.
 * @return array<string,string>
 */
function apexoneiq_process_subscription_event( $subscription ) {
	$user_id = absint( $subscription['metadata']['wordpress_user_id'] ?? 0 );
	$plan = sanitize_key( $subscription['metadata']['apex_plan'] ?? '' );
	apexoneiq_sync_subscription_from_stripe( $subscription, $user_id, $plan );
	return array( 'status' => 'processed', 'message' => '' );
}

/**
 * Process invoice events by refreshing the attached subscription.
 *
 * @param array<string,mixed> $invoice Invoice object.
 * @return array<string,string>
 */
function apexoneiq_process_invoice_event( $invoice ) {
	$subscription_id = sanitize_text_field( is_array( $invoice['subscription'] ?? '' ) ? ( $invoice['subscription']['id'] ?? '' ) : ( $invoice['subscription'] ?? '' ) );
	if ( ! $subscription_id ) {
		return array( 'status' => 'processed', 'message' => 'Invoice has no subscription.' );
	}

	$subscription = apexoneiq_stripe_get_subscription( $subscription_id );
	if ( is_wp_error( $subscription ) ) {
		return array( 'status' => 'failed', 'message' => $subscription->get_error_message() );
	}

	apexoneiq_sync_subscription_from_stripe( $subscription );
	return array( 'status' => 'processed', 'message' => '' );
}

/**
 * Retrieve a Stripe subscription.
 *
 * @param string $subscription_id Stripe subscription ID.
 * @return array<string,mixed>|WP_Error
 */
function apexoneiq_stripe_get_subscription( $subscription_id ) {
	$secret_key = apexoneiq_get_env_value( 'STRIPE_SECRET_KEY' );
	if ( ! $secret_key || 0 !== strpos( $secret_key, 'sk_test_' ) ) {
		return new WP_Error( 'stripe_not_configured', 'Stripe sandbox secret key is not configured.' );
	}

	$response = wp_remote_get(
		'https://api.stripe.com/v1/subscriptions/' . rawurlencode( $subscription_id ),
		array(
			'timeout' => 20,
			'headers' => array(
				'Authorization' => 'Bearer ' . $secret_key,
			),
		)
	);

	if ( is_wp_error( $response ) ) {
		return $response;
	}

	$status = wp_remote_retrieve_response_code( $response );
	$body = json_decode( wp_remote_retrieve_body( $response ), true );
	if ( 200 > $status || 300 <= $status || ! is_array( $body ) || empty( $body['id'] ) ) {
		return new WP_Error( 'stripe_subscription_fetch_failed', $body['error']['message'] ?? 'Unable to retrieve Stripe subscription.' );
	}

	return $body;
}

/**
 * Determine whether a webhook event was already processed.
 *
 * @param string $event_id Stripe event ID.
 * @return bool
 */
function apexoneiq_webhook_event_exists( $event_id ) {
	global $wpdb;
	$table = apexoneiq_webhook_events_table();
	return (bool) $wpdb->get_var(
		$wpdb->prepare(
			"SELECT id FROM {$table} WHERE stripe_event_id = %s LIMIT 1", // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
			sanitize_text_field( $event_id )
		)
	);
}

/**
 * Record webhook processing health.
 *
 * @param array<string,mixed> $event   Stripe event.
 * @param string             $status  Processing status.
 * @param string             $message Optional message.
 */
function apexoneiq_record_webhook_event( $event, $status, $message = '' ) {
	global $wpdb;

	$wpdb->insert(
		apexoneiq_webhook_events_table(),
		array(
			'stripe_event_id'   => sanitize_text_field( $event['id'] ?? '' ),
			'event_type'        => sanitize_text_field( $event['type'] ?? '' ),
			'processing_status' => sanitize_key( $status ),
			'error_message'     => sanitize_textarea_field( $message ),
			'payload'           => wp_json_encode( $event ),
			'created_at'        => current_time( 'mysql', true ),
			'processed_at'      => current_time( 'mysql', true ),
		),
		array( '%s', '%s', '%s', '%s', '%s', '%s', '%s' )
	);
}

