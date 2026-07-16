<?php
/**
 * Capability-based entitlement engine.
 *
 * @package ApexOneIQ
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Return sandbox Price ID to plan mappings.
 *
 * @return array<string,string>
 */
function apexoneiq_price_plan_map() {
	return array(
		'price_1Trqbv6cN69mDatfCqC2aa1K' => 'cloud',
		'price_1Trqfn6cN69mDatf5Pq20TGn' => 'command',
		'price_1TrqhW6cN69mDatfYcDP2YRb' => 'essentials',
		'price_1TrqjY6cN69mDatfKVG2Twwo' => 'growth',
	);
}

/**
 * Resolve a plan from a Stripe Price ID.
 *
 * @param string $price_id Stripe Price ID.
 * @return string
 */
function apexoneiq_plan_for_price( $price_id ) {
	$map = apexoneiq_price_plan_map();
	return $map[ $price_id ] ?? '';
}

/**
 * Capability sets per plan.
 *
 * @return array<string,array<int,string>>
 */
function apexoneiq_plan_capabilities() {
	$cloud = array(
		'dashboard.access',
		'ai.access',
		'reports.access',
		'competitors.access',
		'timeline.access',
		'executive_brief.access',
		'action_center.access',
		'market_intelligence.access',
		'forecast.access',
		'alerts.access',
		'website_health.access',
		'intelligence.access',
		'billing.manage',
	);

	$command = array_merge(
		$cloud,
		array(
			'command.access',
			'automation.access',
			'api.access',
			'exports.pdf',
			'exports.csv',
		)
	);

	$essentials = array_merge(
		$cloud,
		array(
			'concierge_essentials.access',
			'managed_service.access',
		)
	);

	$growth = array_merge(
		$command,
		array(
			'concierge_growth.access',
			'managed_service.access',
			'priority_support.access',
		)
	);

	return array(
		'free'        => array( 'free_dashboard.access', 'billing.manage' ),
		'cloud'       => array_values( array_unique( $cloud ) ),
		'command'     => array_values( array_unique( $command ) ),
		'essentials'  => array_values( array_unique( $essentials ) ),
		'growth'      => array_values( array_unique( $growth ) ),
		'enterprise'  => array_values(
			array_unique(
				array_merge(
					$growth,
					array(
						'enterprise.access',
						'organization.manage',
						'users.manage',
						'api.access',
					)
				)
			)
		),
	);
}

/**
 * Return the capability required by a static workspace page.
 *
 * @param string $page Static page.
 * @return string
 */
function apexoneiq_required_capability_for_page( $page ) {
	$page = apexoneiq_normalize_static_page( $page );

	$map = array(
		'dashboard.html'                       => 'free_dashboard.access',
		'executive-brief.html'                 => 'executive_brief.access',
		'mission-workspace.html'               => 'executive_brief.access',
		'opportunities.html'                   => 'action_center.access',
		'ai-visibility.html'                   => 'ai.access',
		'competitors.html'                     => 'competitors.access',
		'forecast.html'                        => 'forecast.access',
		'history.html'                         => 'market_intelligence.access',
		'alerts.html'                          => 'alerts.access',
		'reports.html'                         => 'reports.access',
		'website-profile.html'                 => 'website_health.access',
		'website-overview.html'                => 'intelligence.access',
		'organic-keywords.html'                => 'intelligence.access',
		'keyword-opportunities.html'           => 'intelligence.access',
		'competitor-intelligence.html'         => 'intelligence.access',
		'backlinks.html'                       => 'intelligence.access',
		'content-gap.html'                     => 'intelligence.access',
		'site-audit.html'                      => 'intelligence.access',
		'intelligence-ai-visibility.html'      => 'intelligence.access',
		'search-trends.html'                   => 'intelligence.access',
		'local-rankings.html'                  => 'intelligence.access',
		'settings.html'                        => 'billing.manage',
		'business-timeline.html'               => 'timeline.access',
		'monitoring-center.html'               => 'dashboard.access',
		'command-dashboard.html'               => 'command.access',
		'enterprise-dashboard.html'            => 'enterprise.access',
		'concierge-essentials-dashboard.html'  => 'concierge_essentials.access',
		'concierge-dashboard.html'             => 'concierge_growth.access',
		'free-dashboard.html'                  => 'free_dashboard.access',
	);

	return $map[ $page ] ?? '';
}

/**
 * Whether a page can be viewed without subscription enforcement.
 *
 * @param string $page Static page.
 * @return bool
 */
function apexoneiq_is_public_static_page( $page ) {
	$page = apexoneiq_normalize_static_page( $page );

	return in_array(
		$page,
		array(
			'subscription.html',
			'index.html',
			'concierge-enrollment.html',
			'checkout/cloud/index.html',
			'checkout/command/index.html',
			'checkout/essentials/index.html',
			'checkout/growth/index.html',
			'checkout/success.html',
			'checkout/cancel.html',
		),
		true
	);
}

/**
 * Check a user's ApexOneIQ capability.
 *
 * @param int    $user_id    WordPress user ID.
 * @param string $capability Capability key.
 * @return bool
 */
function apexoneiq_user_has_capability( $user_id, $capability ) {
	if ( user_can( $user_id, 'manage_options' ) ) {
		return true;
	}

	$state = apexoneiq_get_user_subscription_state( $user_id );
	return in_array( $capability, $state['capabilities'], true );
}
