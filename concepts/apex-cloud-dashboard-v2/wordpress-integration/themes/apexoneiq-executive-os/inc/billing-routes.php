<?php
/**
 * Sandbox-safe billing route placeholders.
 *
 * @package ApexOneIQ
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Handle checkout session creation requests.
 *
 * @param string $plan Plan key.
 */
function apexoneiq_handle_checkout_request( $plan ) {
	if ( 'POST' !== strtoupper( $_SERVER['REQUEST_METHOD'] ?? '' ) ) {
		wp_send_json_error(
			array(
				'code'    => 'method_not_allowed',
				'message' => 'Checkout routes require POST.',
			),
			405
		);
	}

	$prices = apexoneiq_checkout_prices();
	if ( ! isset( $prices[ $plan ] ) ) {
		wp_send_json_error(
			array(
				'code'    => 'unknown_plan',
				'message' => 'Unknown ApexOneIQ checkout plan.',
			),
			404
		);
	}

	$secret_key = apexoneiq_get_env_value( 'STRIPE_SECRET_KEY' );
	if ( ! $secret_key ) {
		wp_send_json_error(
			array(
				'code'    => 'stripe_not_configured',
				'message' => 'Stripe sandbox secret key is not configured for this WordPress environment.',
			),
			503
		);
	}

	if ( 0 !== strpos( $secret_key, 'sk_test_' ) ) {
		wp_send_json_error(
			array(
				'code'    => 'live_key_rejected',
				'message' => 'Only Stripe sandbox keys are allowed in this development environment.',
			),
			400
		);
	}

	$response = wp_remote_post(
		'https://api.stripe.com/v1/checkout/sessions',
		array(
			'timeout' => 20,
			'headers' => array(
				'Authorization' => 'Bearer ' . $secret_key,
			),
			'body'    => array(
				'mode'                  => 'subscription',
				'line_items[0][price]'  => $prices[ $plan ],
				'line_items[0][quantity]' => 1,
				'success_url'           => home_url( '/checkout/success.html?session_id={CHECKOUT_SESSION_ID}' ),
				'cancel_url'            => home_url( '/checkout/cancel.html' ),
				'metadata[apex_plan]'   => $plan,
			),
		)
	);

	if ( is_wp_error( $response ) ) {
		wp_send_json_error(
			array(
				'code'    => 'stripe_request_failed',
				'message' => $response->get_error_message(),
			),
			502
		);
	}

	$status = wp_remote_retrieve_response_code( $response );
	$body   = json_decode( wp_remote_retrieve_body( $response ), true );

	if ( 200 > $status || 300 <= $status || empty( $body['url'] ) ) {
		wp_send_json_error(
			array(
				'code'    => 'stripe_session_failed',
				'message' => $body['error']['message'] ?? 'Stripe did not return a checkout URL.',
				'status'  => $status,
			),
			502
		);
	}

	wp_send_json_success(
		array(
			'url' => esc_url_raw( $body['url'] ),
		)
	);
}

/**
 * Checkout price IDs for the sandbox catalog.
 *
 * @return array<string,string>
 */
function apexoneiq_checkout_prices() {
	return array(
		'cloud'      => apexoneiq_get_env_value( 'NEXT_PUBLIC_STRIPE_PRICE_CLOUD' ) ?: 'price_1Trqbv6cN69mDatfCqC2aa1K',
		'command'    => apexoneiq_get_env_value( 'NEXT_PUBLIC_STRIPE_PRICE_COMMAND' ) ?: 'price_1Trqfn6cN69mDatf5Pq20TGn',
		'essentials' => apexoneiq_get_env_value( 'NEXT_PUBLIC_STRIPE_PRICE_ESSENTIALS' ) ?: 'price_1TrqhW6cN69mDatfYcDP2YRb',
		'growth'     => apexoneiq_get_env_value( 'NEXT_PUBLIC_STRIPE_PRICE_GROWTH' ) ?: 'price_1TrqjY6cN69mDatfKVG2Twwo',
	);
}

/**
 * Read environment values without hardcoding secrets.
 *
 * @param string $key Environment key.
 * @return string
 */
function apexoneiq_get_env_value( $key ) {
	$value = getenv( $key );

	if ( false === $value && defined( $key ) ) {
		$value = constant( $key );
	}

	if ( false === $value || '' === $value ) {
		$options = array(
			'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY' => 'apexoneiq_stripe_publishable_key',
			'STRIPE_SECRET_KEY'                 => 'apexoneiq_stripe_secret_key',
		);

		if ( isset( $options[ $key ] ) ) {
			$value = get_option( $options[ $key ], '' );
		}
	}

	return is_string( $value ) ? trim( $value ) : '';
}
