<?php
/**
 * Subscription-state foundation for future entitlement work.
 *
 * @package ApexOneIQ
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Return the current WordPress user's ApexOneIQ subscription state.
 *
 * This intentionally does not enforce entitlements yet. The next production
 * phase can connect Stripe customer/subscription records to these user-meta
 * fields without changing the Executive Dashboard UI.
 *
 * @return array<string,mixed>
 */
function apexoneiq_get_current_user_subscription_state() {
	$user_id = get_current_user_id();

	if ( ! $user_id ) {
		return array(
			'authenticated' => false,
			'plan'          => 'visitor',
			'capabilities'  => array(),
		);
	}

	$plan         = get_user_meta( $user_id, 'apexoneiq_subscription_plan', true );
	$capabilities = get_user_meta( $user_id, 'apexoneiq_subscription_capabilities', true );

	if ( ! is_array( $capabilities ) ) {
		$capabilities = array();
	}

	return array(
		'authenticated' => true,
		'plan'          => $plan ? sanitize_key( $plan ) : 'free',
		'capabilities'  => array_values( array_map( 'sanitize_key', $capabilities ) ),
	);
}
