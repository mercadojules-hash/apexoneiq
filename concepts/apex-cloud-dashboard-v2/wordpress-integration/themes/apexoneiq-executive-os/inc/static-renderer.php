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

	if ( ! $is_demo_request && ! apexoneiq_is_public_static_page( $page ) ) {
		$required_capability = apexoneiq_required_capability_for_page( $page );
		if ( $required_capability && ! is_user_logged_in() ) {
			wp_safe_redirect( add_query_arg( 'redirect_to', rawurlencode( home_url( '/' . $page ) ), home_url( '/sign-in.html' ) ) );
			exit;
		}

		if ( $required_capability && ! apexoneiq_user_has_capability( get_current_user_id(), $required_capability ) ) {
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
 * Render an upgrade-required surface without exposing protected workspace data.
 *
 * @param string $page                Requested page.
 * @param string $required_capability Required capability.
 */
function apexoneiq_render_upgrade_required( $page, $required_capability ) {
	$subscription_url = esc_url( home_url( '/subscription.html' ) );
	$dashboard_url    = esc_url( home_url( '/free-dashboard.html' ) );
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
						<a class="ghost-button" href="<?php echo $dashboard_url; ?>">Open Free Snapshot</a>
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

	$replacements = array(
		'href="css/app.css"' => 'href="' . esc_url( $asset_uri . 'assets/css/app.css?ver=' . APEXONEIQ_THEME_VERSION ) . '"',
		'src="js/app.js"'    => 'src="' . esc_url( $asset_uri . 'assets/js/app.js?ver=' . APEXONEIQ_THEME_VERSION ) . '"',
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

	$app_script = '<script src="' . esc_url( $asset_uri . 'assets/js/app.js?ver=' . APEXONEIQ_THEME_VERSION ) . '"></script>';
	$config     = sprintf(
		'<script>window.ApexOneIQ=%s;</script>',
		wp_json_encode(
			array(
				'baseUrl'      => $site_url,
				'authUrl'      => $auth_url,
				'registerUrl'  => $register_url,
				'demoMode'     => $is_demo,
				'isLoggedIn'   => is_user_logged_in(),
				'subscription' => apexoneiq_get_current_user_subscription_state(),
				'businessName' => $user_id ? get_user_meta( $user_id, 'apexoneiq_business_name', true ) : '',
				'businessWebsite' => $user_id ? get_user_meta( $user_id, 'apexoneiq_business_website', true ) : '',
				'businessEmail' => $user_id ? wp_get_current_user()->user_email : '',
			)
		)
	);

	$html = str_replace( $app_script, $config . $app_script, $html );

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
			'concierge-essentials-dashboard.html',
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
