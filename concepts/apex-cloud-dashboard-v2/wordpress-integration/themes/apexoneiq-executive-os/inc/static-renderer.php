<?php
/**
 * Static ApexOneIQ concept renderer.
 *
 * @package ApexOneIQ
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Render a saved Executive OS HTML page through WordPress.
 *
 * @param string $page Requested static page.
 */
function apexoneiq_render_static_page( $page ) {
	$page = apexoneiq_normalize_static_page( $page );
	$is_demo_request = apexoneiq_is_demo_request( $page );
	$user_id = get_current_user_id();
	$workspace_ready = $user_id ? apexoneiq_user_has_existing_workspace( $user_id ) : false;
	if ( ! $is_demo_request && is_user_logged_in() && 'sign-in.html' === $page && $workspace_ready ) {
		wp_safe_redirect( home_url( '/executive-brief.html' ) );
		exit;
	}
	if ( ! $is_demo_request && is_user_logged_in() && 'dashboard.html' === $page && ! $workspace_ready ) {
		wp_safe_redirect( home_url( '/sign-in.html' ) );
		exit;
	}

	if ( ! $is_demo_request && ! apexoneiq_is_public_static_page( $page ) ) {
		$required_capability = apexoneiq_required_capability_for_page( $page );
		if ( $required_capability && ! is_user_logged_in() ) {
			wp_safe_redirect( add_query_arg( 'redirect_to', rawurlencode( home_url( '/' . $page ) ), home_url( '/sign-in.html' ) ) );
			exit;
		}

		if ( $required_capability && ! apexoneiq_user_has_capability( get_current_user_id(), $required_capability ) ) {
			if ( 'action_center.access' === $required_capability ) {
				apexoneiq_render_action_center_upgrade( $page );
				return;
			}
			apexoneiq_render_upgrade_required( $page, $required_capability );
			return;
		}
	}

	$file = realpath( APEXONEIQ_THEME_DIR . 'templates/static/' . $page );
	$root = realpath( APEXONEIQ_THEME_DIR . 'templates/static' );

	if ( ! $file || ! $root || 0 !== strpos( $file, $root ) || ! is_readable( $file ) ) {
		status_header( 404 );
		apexoneiq_render_static_page( 'dashboard.html' );
		return;
	}

	$html = file_get_contents( $file );
	if ( false === $html ) {
		status_header( 500 );
		wp_die( esc_html__( 'ApexOneIQ page could not be loaded.', 'apexoneiq' ) );
	}

	$html = apexoneiq_transform_static_html( $html );

	echo $html; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
}

/**
 * Build the active workspace context shown throughout authenticated pages.
 *
 * @param int $user_id WordPress user ID.
 * @return array<string,string>
 */
function apexoneiq_get_workspace_context( $user_id ) {
	$website        = $user_id ? (string) get_user_meta( $user_id, 'apexoneiq_business_website', true ) : '';
	$scan_completed = $user_id ? apexoneiq_user_has_existing_workspace( $user_id ) : false;
	$scan_at        = $user_id ? (string) get_user_meta( $user_id, 'apexoneiq_scan_completed_at', true ) : '';
	$business_name  = $user_id ? (string) get_user_meta( $user_id, 'apexoneiq_business_name', true ) : '';
	$host           = $website ? wp_parse_url( $website, PHP_URL_HOST ) : '';
	$domain         = $host ? preg_replace( '/^www\./', '', $host ) : '';

	if ( ! $domain && $business_name ) {
		$domain = $business_name;
	}

	$last_scan = __( 'No completed scan', 'apexoneiq' );
	if ( $scan_at ) {
		$timestamp = strtotime( $scan_at );
		$last_scan = $timestamp ? date_i18n( 'M j, Y g:i A', $timestamp ) : $scan_at;
	}

	return array(
		'domain'      => $domain ?: __( 'Business not selected', 'apexoneiq' ),
		'status'      => $scan_completed ? __( 'Executive profile active', 'apexoneiq' ) : __( 'Executive scan pending', 'apexoneiq' ),
		'last_scan'   => $last_scan,
		'last_update' => $scan_completed ? $last_scan : __( 'Awaiting first scan', 'apexoneiq' ),
		'website'     => $website,
	);
}

/**
 * Render the Action Center paywall as a free-user executive summary.
 *
 * @param string $page Requested page.
 */
function apexoneiq_render_action_center_upgrade( $page ) {
	$subscription_url = esc_url( home_url( '/subscription.html' ) );
	$dashboard_url    = esc_url( home_url( '/executive-brief.html' ) );
	$context          = apexoneiq_get_workspace_context( get_current_user_id() );

	status_header( 403 );
	?>
	<!doctype html>
	<html lang="en">
	<head>
		<meta charset="utf-8">
		<meta name="viewport" content="width=device-width, initial-scale=1">
		<title>ApexOneIQ - Executive Summary</title>
		<link rel="stylesheet" href="<?php echo esc_url( APEXONEIQ_THEME_URI . 'assets/css/app.css?ver=' . APEXONEIQ_THEME_VERSION ); ?>">
	</head>
	<body>
		<div class="app subscription-workspace">
			<aside class="sidebar">
				<div class="brand"><div class="logo">IQ</div><div><strong>ApexOneIQ</strong><span>Executive Intelligence OS</span></div></div>
				<div class="site-card" data-workspace-context>
					<span class="eyebrow"><span class="live-dot"></span><?php echo esc_html( $context['status'] ); ?></span>
					<strong><?php echo esc_html( $context['domain'] ); ?></strong>
					<p>Last scan: <?php echo esc_html( $context['last_scan'] ); ?> / Last update: <?php echo esc_html( $context['last_update'] ); ?></p>
				</div>
				<div class="nav-section">Workspace</div>
				<nav class="workspace-nav">
					<a class="nav-link" href="<?php echo $dashboard_url; ?>"><span>Executive Brief</span></a>
					<a class="nav-link active" href="<?php echo esc_url( home_url( '/' . $page ) ); ?>"><span>Action Center</span><small>Pro</small></a>
					<a class="nav-link" href="<?php echo $subscription_url; ?>"><span>Upgrade</span></a>
				</nav>
			</aside>
			<main class="main">
				<header class="topbar"><div><span class="eyebrow"><span class="live-dot"></span>Executive Summary</span></div><div class="account"><span class="status-pill status-ok"><?php echo esc_html( $context['domain'] ); ?></span><a class="ghost-button" href="<?php echo $dashboard_url; ?>">My Workspace</a></div></header>
				<section class="subscription-hero">
					<div>
						<div class="page-kicker">Free executive summary</div>
						<h1>Your scan is ready. The full Action Center is included with Apex Cloud.</h1>
						<p>Free users can review the executive snapshot and recommended upgrade path. Upgrade to unlock prioritized actions, playbooks, evidence, and execution tracking.</p>
					</div>
					<div class="plan-actions">
						<a class="button" href="<?php echo $subscription_url; ?>">Upgrade to Pro</a>
						<a class="ghost-button" href="<?php echo $dashboard_url; ?>">Return to Summary</a>
					</div>
				</section>
				<section class="landing-grid three">
					<article>
						<span>Current workspace</span>
						<h3><?php echo esc_html( $context['domain'] ); ?></h3>
						<p><?php echo esc_html( $context['status'] ); ?>. Last scan: <?php echo esc_html( $context['last_scan'] ); ?>.</p>
					</article>
					<article>
						<span>Included on Free</span>
						<h3>Executive Summary</h3>
						<p>Score, health snapshot, summary, and one recommended next step after scan completion.</p>
					</article>
					<article>
						<span>Unlock with Pro</span>
						<h3>Action Center</h3>
						<p>Prioritized opportunities, playbooks, forecast impact, evidence, and owner-level execution workflow.</p>
					</article>
				</section>
			</main>
		</div>
	</body>
	</html>
	<?php
}

/**
 * Render an upgrade-required surface without exposing protected workspace data.
 *
 * @param string $page                Requested page.
 * @param string $required_capability Required capability.
 */
function apexoneiq_render_upgrade_required( $page, $required_capability ) {
	$subscription_url = esc_url( home_url( '/subscription.html' ) );
	$dashboard_url    = esc_url( home_url( '/sign-in.html' ) );
	$capability       = esc_html( $required_capability );

	status_header( 403 );
	?>
	<!doctype html>
	<html lang="en">
	<head>
		<meta charset="utf-8">
		<meta name="viewport" content="width=device-width, initial-scale=1">
		<title>ApexOneIQ - Upgrade Required</title>
		<link rel="stylesheet" href="<?php echo esc_url( APEXONEIQ_THEME_URI . 'assets/css/app.css?ver=' . APEXONEIQ_THEME_VERSION ); ?>">
	</head>
	<body>
		<div class="app subscription-workspace">
			<main class="main" style="grid-column: 1 / -1;">
				<section class="subscription-hero">
					<div>
						<div class="page-kicker">ApexOneIQ Access</div>
						<h1>This workspace requires a higher ApexOneIQ subscription.</h1>
						<p>Your current subscription does not include <strong><?php echo $capability; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?></strong>. Choose the operating level that matches the work you want ApexOneIQ to perform.</p>
					</div>
					<div class="plan-actions">
						<a class="button" href="<?php echo $subscription_url; ?>">View Plans</a>
						<a class="ghost-button" href="<?php echo $dashboard_url; ?>">Start Executive Scan</a>
					</div>
				</section>
			</main>
		</div>
	</body>
	</html>
	<?php
}

/**
 * Normalize request paths to theme static files.
 *
 * @param string $page Requested page.
 * @return string
 */
function apexoneiq_normalize_static_page( $page ) {
	$page = ltrim( sanitize_text_field( wp_unslash( $page ) ), '/' );
	$page = preg_replace( '#/{2,}#', '/', $page );

	if ( '' === $page ) {
		return 'dashboard.html';
	}

	return $page;
}

/**
 * Replace concept-local paths with WordPress-aware URLs.
 *
 * @param string $html Raw static HTML.
 * @return string
 */
function apexoneiq_transform_static_html( $html ) {
	$asset_uri = APEXONEIQ_THEME_URI;
	$site_url  = trailingslashit( home_url() );
	$auth_url  = home_url( '/sign-in.html' );
	$register_url = home_url( '/register/' );
	$is_demo = apexoneiq_is_demo_request( get_query_var( 'apexoneiq_static_page' ) );
	$user_id = get_current_user_id();
	$current_user = $user_id ? wp_get_current_user() : null;
	$scan_completed = $user_id ? apexoneiq_user_has_completed_onboarding( $user_id ) : false;
	$workspace_ready = $user_id ? apexoneiq_user_has_existing_workspace( $user_id ) : false;
	$scan_score = $user_id ? absint( get_user_meta( $user_id, 'apexoneiq_executive_score', true ) ) : 0;
	$scan_trend = $user_id ? json_decode( (string) get_user_meta( $user_id, 'apexoneiq_executive_trend', true ), true ) : array();
	if ( ! is_array( $scan_trend ) ) {
		$scan_trend = array();
	}
	$user_name = $current_user ? ( $current_user->display_name ?: $current_user->user_email ) : '';
	$workspace_context = $user_id ? apexoneiq_get_workspace_context( $user_id ) : array();
	$user_initials = '';
	if ( $user_name ) {
		$name_parts = preg_split( '/[\s._-]+/', preg_replace( '/@.*$/', '', $user_name ) );
		$name_parts = array_values( array_filter( (array) $name_parts ) );
		$user_initials = strtoupper( substr( $name_parts[0] ?? 'A', 0, 1 ) . substr( $name_parts[1] ?? ( $name_parts[0] ?? 'I' ), 0, 1 ) );
	}

	$replacements = array(
		'href="css/app.css"'        => 'href="' . esc_url( $asset_uri . 'assets/css/app.css?ver=' . APEXONEIQ_THEME_VERSION ) . '"',
		'src="js/mission-engine.js"' => 'src="' . esc_url( $asset_uri . 'assets/js/mission-engine.js?ver=' . APEXONEIQ_THEME_VERSION ) . '"',
		'src="js/app.js"'           => 'src="' . esc_url( $asset_uri . 'assets/js/app.js?ver=' . APEXONEIQ_THEME_VERSION ) . '"',
		'href="sign-in.html"' => 'href="' . esc_url( $auth_url ) . '"',
		'href="/sign-in/"'   => 'href="' . esc_url( $auth_url ) . '"',
		'href="/register/"'  => 'href="' . esc_url( $register_url ) . '"',
	);

	$html = strtr( $html, $replacements );

	$html = preg_replace_callback(
		'/(href|src)="((?!https?:|mailto:|tel:|#|\/|data:)[^"]+)"/',
		static function ( $matches ) use ( $site_url ) {
			$path = $matches[2];
			if ( 0 === strpos( $path, '../' ) ) {
				return $matches[0];
			}

			return $matches[1] . '="' . esc_url( $site_url . ltrim( $path, '/' ) ) . '"';
		},
		$html
	);

	$mission_script = '<script src="' . esc_url( $asset_uri . 'assets/js/mission-engine.js?ver=' . APEXONEIQ_THEME_VERSION ) . '"></script>';
	$app_script     = '<script src="' . esc_url( $asset_uri . 'assets/js/app.js?ver=' . APEXONEIQ_THEME_VERSION ) . '"></script>';
	if ( false === strpos( $html, $mission_script ) ) {
		$html = str_replace( $app_script, $mission_script . $app_script, $html );
	}
	$config     = sprintf(
		'<script>window.ApexOneIQ=%s;</script>',
		wp_json_encode(
			array(
				'baseUrl'      => $site_url,
				'authUrl'      => $auth_url,
				'registerUrl'  => $register_url,
				'demoMode'     => $is_demo,
				'isLoggedIn'   => is_user_logged_in(),
				'userName'     => $user_name,
				'userInitials' => $user_initials,
				'subscription' => apexoneiq_get_current_user_subscription_state(),
				'businessName' => $user_id ? get_user_meta( $user_id, 'apexoneiq_business_name', true ) : '',
				'businessWebsite' => $user_id ? get_user_meta( $user_id, 'apexoneiq_business_website', true ) : '',
				'businessEmail' => $current_user ? $current_user->user_email : '',
				'scanCompleted' => $workspace_ready,
				'workspaceReady' => $workspace_ready,
				'hasWorkspace' => $user_id ? (bool) get_user_meta( $user_id, 'apexoneiq_business_website', true ) : false,
				'isOwnerAdmin' => $user_id ? user_can( $user_id, 'manage_options' ) : false,
				'scanScore' => $scan_score,
				'scanTrend' => array_values( array_map( 'absint', $scan_trend ) ),
				'scanCompletedAt' => $user_id ? get_user_meta( $user_id, 'apexoneiq_scan_completed_at', true ) : '',
				'scanEndpoint' => home_url( '/api/onboarding/scan/' ),
				'scanNonce' => wp_create_nonce( 'apexoneiq_scan' ),
			)
		)
	);

	$html = str_replace( $app_script, $config . $app_script, $html );

	if ( is_user_logged_in() ) {
		$workspace_url = $workspace_ready ? home_url( '/executive-brief.html' ) : home_url( '/sign-in.html' );
		$workspace_domain = $workspace_context['domain'] ?? __( 'Business not selected', 'apexoneiq' );
		$account_html = sprintf(
			'<span class="status-pill status-ok">%6$s</span><button class="ghost-button" type="button" data-ask="What should I do next?">Ask Apex</button><div class="account-menu" data-account-menu><button class="account-trigger" type="button" data-account-toggle aria-expanded="false"><span class="avatar">%1$s</span><span>%1$s</span><small>v</small></button><div class="account-dropdown" role="menu"><a href="%2$s" role="menuitem">My Workspace</a><a href="%3$s" role="menuitem">Account</a><a href="%4$s" role="menuitem">Billing</a><a href="%5$s" role="menuitem">Settings</a><button type="button" data-apex-logout role="menuitem">Logout</button></div></div>',
			esc_html( $user_initials ?: 'IQ' ),
			esc_url( $workspace_url ),
			esc_url( home_url( '/account.html' ) ),
			esc_url( home_url( '/subscription.html' ) ),
			esc_url( home_url( '/settings.html' ) ),
			esc_html( $workspace_domain )
		);
		$html = preg_replace( '/<div class="account">.*?<\/div>\s*<\/header>/s', '<div class="account">' . $account_html . '</div></header>', $html );
		$html = preg_replace( '/<a class="nav-cta" href="[^"]*">[^<]*<\/a>/', '<a class="nav-cta" href="' . esc_url( $workspace_url ) . '">My Workspace</a>', $html );
		$html = preg_replace( '/<a href="[^"]*sign-in\.html[^"]*">Sign In<\/a>/', '<a href="' . esc_url( $workspace_url ) . '">My Workspace</a>', $html );
		$site_card_html = sprintf(
			'<div class="site-card" data-workspace-context><span class="eyebrow"><span class="live-dot"></span>%1$s</span><strong>%2$s</strong><p>Last scan: %3$s / Last update: %4$s</p></div>',
			esc_html( $workspace_context['status'] ?? __( 'Executive scan pending', 'apexoneiq' ) ),
			esc_html( $workspace_context['domain'] ?? __( 'Business not selected', 'apexoneiq' ) ),
			esc_html( $workspace_context['last_scan'] ?? __( 'No completed scan', 'apexoneiq' ) ),
			esc_html( $workspace_context['last_update'] ?? __( 'Awaiting first scan', 'apexoneiq' ) )
		);
		$html = preg_replace( '/<div class="site-card">.*?<\/div>/s', $site_card_html, $html );
	}

	return $html;
}

/**
 * Whether a static request should render a safe public demo.
 *
 * @param string $page Static page.
 * @return bool
 */
function apexoneiq_is_demo_request( $page ) {
	$page = apexoneiq_normalize_static_page( $page );
	if ( empty( $_GET['demo'] ) ) {
		return false;
	}

	return in_array(
		$page,
		array(
			'free-dashboard.html',
			'dashboard.html',
			'command-dashboard.html',
			'mission-workspace.html',
			'concierge-essentials-dashboard.html',
			'executive-brief.html',
			'opportunities.html',
			'forecast.html',
			'reports.html',
			'monitoring-center.html',
			'ai-visibility.html',
			'competitors.html',
			'business-timeline.html',
			'history.html',
			'alerts.html',
			'website-profile.html',
			'website-overview.html',
			'organic-keywords.html',
			'keyword-opportunities.html',
			'competitor-intelligence.html',
			'backlinks.html',
			'content-gap.html',
			'site-audit.html',
			'intelligence-ai-visibility.html',
			'search-trends.html',
			'local-rankings.html',
		),
		true
	);
}
