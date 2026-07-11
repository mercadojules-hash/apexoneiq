<?php
/**
 * ApexOneIQ Executive OS theme functions.
 *
 * @package ApexOneIQ
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'APEXONEIQ_THEME_VERSION', '0.1.0' );
define( 'APEXONEIQ_THEME_DIR', trailingslashit( get_template_directory() ) );
define( 'APEXONEIQ_THEME_URI', trailingslashit( get_template_directory_uri() ) );

require_once APEXONEIQ_THEME_DIR . 'inc/static-renderer.php';
require_once APEXONEIQ_THEME_DIR . 'inc/registration.php';
require_once APEXONEIQ_THEME_DIR . 'inc/billing-routes.php';
require_once APEXONEIQ_THEME_DIR . 'inc/admin-settings.php';
require_once APEXONEIQ_THEME_DIR . 'inc/subscription-schema.php';
require_once APEXONEIQ_THEME_DIR . 'inc/subscription-state.php';
require_once APEXONEIQ_THEME_DIR . 'inc/entitlements.php';
require_once APEXONEIQ_THEME_DIR . 'inc/stripe-webhooks.php';
require_once APEXONEIQ_THEME_DIR . 'inc/owner-admin.php';

add_action( 'after_setup_theme', 'apexoneiq_theme_setup' );
add_action( 'wp_enqueue_scripts', 'apexoneiq_enqueue_assets' );
add_action( 'init', 'apexoneiq_register_rewrite_routes' );
add_action( 'init', 'apexoneiq_maybe_flush_rewrite_routes', 20 );
add_filter( 'query_vars', 'apexoneiq_register_query_vars' );
add_filter( 'template_include', 'apexoneiq_template_include' );
add_filter( 'redirect_canonical', 'apexoneiq_disable_static_canonical_redirects', 10, 2 );
add_action( 'after_switch_theme', 'apexoneiq_theme_activation_notice' );

/**
 * Configure theme supports and navigation locations.
 */
function apexoneiq_theme_setup() {
	add_theme_support( 'title-tag' );
	add_theme_support( 'post-thumbnails' );
	add_theme_support( 'html5', array( 'script', 'style', 'navigation-widgets' ) );

	register_nav_menus(
		array(
			'primary' => __( 'Primary Workspace Navigation', 'apexoneiq' ),
		)
	);
}

/**
 * Enqueue assets for any normal WordPress-rendered pages.
 */
function apexoneiq_enqueue_assets() {
	if ( get_query_var( 'apexoneiq_static_page' ) || get_query_var( 'apexoneiq_checkout_plan' ) || get_query_var( 'apexoneiq_stripe_webhook' ) || get_query_var( 'apexoneiq_account_page' ) ) {
		return;
	}

	wp_enqueue_style(
		'apexoneiq-app',
		APEXONEIQ_THEME_URI . 'assets/css/app.css',
		array(),
		APEXONEIQ_THEME_VERSION
	);

	wp_enqueue_script(
		'apexoneiq-app',
		APEXONEIQ_THEME_URI . 'assets/js/app.js',
		array(),
		APEXONEIQ_THEME_VERSION,
		true
	);
}

/**
 * Register static concept routes and checkout API routes.
 */
function apexoneiq_register_rewrite_routes() {
	add_rewrite_rule( '^register/?$', 'index.php?apexoneiq_register_page=1', 'top' );
	add_rewrite_rule( '^oauth/google/?$', 'index.php?apexoneiq_oauth_start=google', 'top' );
	add_rewrite_rule( '^oauth/(google|apple)/callback/?$', 'index.php?apexoneiq_oauth_provider=$matches[1]', 'top' );
	add_rewrite_rule( '^sign-in/?$', 'index.php?apexoneiq_static_page=sign-in.html', 'top' );
	add_rewrite_rule( '^account(?:\.html)?/?$', 'index.php?apexoneiq_account_page=1', 'top' );
	add_rewrite_rule( '^checkout/(cloud|command|essentials|growth)/?$', 'index.php?apexoneiq_static_page=checkout/$matches[1]/index.html', 'top' );
	add_rewrite_rule( '^checkout/(success|cancel)\.html$', 'index.php?apexoneiq_static_page=checkout/$matches[1].html', 'top' );
	add_rewrite_rule( '^([a-z0-9-]+\.html)$', 'index.php?apexoneiq_static_page=$matches[1]', 'top' );
	add_rewrite_rule( '^api/billing/checkout/(cloud|command|essentials|growth)/?$', 'index.php?apexoneiq_checkout_plan=$matches[1]', 'top' );
	add_rewrite_rule( '^api/stripe/webhook/?$', 'index.php?apexoneiq_stripe_webhook=1', 'top' );
}

/**
 * Register ApexOneIQ query vars.
 *
 * @param array $vars Existing query vars.
 * @return array
 */
function apexoneiq_register_query_vars( $vars ) {
	$vars[] = 'apexoneiq_static_page';
	$vars[] = 'apexoneiq_checkout_plan';
	$vars[] = 'apexoneiq_stripe_webhook';
	$vars[] = 'apexoneiq_account_page';
	$vars[] = 'apexoneiq_register_page';
	$vars[] = 'apexoneiq_oauth_start';
	$vars[] = 'apexoneiq_oauth_provider';

	return $vars;
}

/**
 * Route static dashboard pages and checkout placeholders.
 *
 * @param string $template WordPress template path.
 * @return string
 */
function apexoneiq_template_include( $template ) {
	if ( get_query_var( 'apexoneiq_stripe_webhook' ) ) {
		apexoneiq_handle_stripe_webhook();
		exit;
	}

	if ( get_query_var( 'apexoneiq_account_page' ) ) {
		apexoneiq_render_account_page();
		exit;
	}

	if ( get_query_var( 'apexoneiq_register_page' ) ) {
		apexoneiq_render_register_page();
		exit;
	}

	$oauth_start = get_query_var( 'apexoneiq_oauth_start' );
	if ( $oauth_start ) {
		apexoneiq_start_oauth_flow( $oauth_start );
		exit;
	}

	$oauth_provider = get_query_var( 'apexoneiq_oauth_provider' );
	if ( $oauth_provider ) {
		apexoneiq_handle_oauth_callback( $oauth_provider );
		exit;
	}

	$checkout_plan = get_query_var( 'apexoneiq_checkout_plan' );
	if ( $checkout_plan ) {
		apexoneiq_handle_checkout_request( $checkout_plan );
		exit;
	}

	$static_page = get_query_var( 'apexoneiq_static_page' );
	if ( $static_page ) {
		apexoneiq_render_static_page( $static_page );
		exit;
	}

	return $template;
}

/**
 * Preserve exact static concept URLs such as /dashboard.html.
 *
 * @param string|false $redirect_url  Proposed redirect URL.
 * @param string       $requested_url Requested URL.
 * @return string|false
 */
function apexoneiq_disable_static_canonical_redirects( $redirect_url, $requested_url ) {
	$path = wp_parse_url( $requested_url, PHP_URL_PATH );

	if ( $path && ( preg_match( '#/(checkout/)?[a-z0-9-]+\.html$#', $path ) || preg_match( '#^/account(?:\.html)?/?$#', $path ) || preg_match( '#^/register/?$#', $path ) || preg_match( '#^/oauth/google/?$#', $path ) || preg_match( '#^/oauth/(google|apple)/callback/?$#', $path ) || preg_match( '#^/api/billing/checkout/#', $path ) || preg_match( '#^/api/stripe/webhook#', $path ) ) ) {
		return false;
	}

	return $redirect_url;
}

/**
 * Add a marker option when the theme is activated.
 */
function apexoneiq_theme_activation_notice() {
	apexoneiq_register_rewrite_routes();
	apexoneiq_install_subscription_schema();
	flush_rewrite_rules();
	update_option( 'apexoneiq_rewrite_version', '1.7.0', false );
	update_option( 'apexoneiq_theme_installed_at', gmdate( 'c' ) );
}

/**
 * Flush rewrites once when theme route definitions change.
 */
function apexoneiq_maybe_flush_rewrite_routes() {
	if ( '1.7.0' !== get_option( 'apexoneiq_rewrite_version' ) ) {
		flush_rewrite_rules( false );
		update_option( 'apexoneiq_rewrite_version', '1.7.0', false );
	}
}

/**
 * Render the authenticated customer account page.
 */
function apexoneiq_render_account_page() {
	if ( ! is_user_logged_in() ) {
		wp_safe_redirect( add_query_arg( 'redirect_to', rawurlencode( home_url( '/account' ) ), home_url( '/sign-in.html' ) ) );
		exit;
	}

	$user = wp_get_current_user();
	$state = apexoneiq_get_current_user_subscription_state();
	$plan = apexoneiq_format_plan_name( $state['plan'] ?? 'free' );
	$status = apexoneiq_format_plan_name( $state['status'] ?? 'none' );
	$renewal = ! empty( $state['renewal_date'] ) ? mysql2date( get_option( 'date_format' ), $state['renewal_date'] ) : __( 'Not scheduled', 'apexoneiq' );
	$capabilities = is_array( $state['capabilities'] ?? null ) ? $state['capabilities'] : array();

	status_header( 200 );
	?>
	<!doctype html>
	<html <?php language_attributes(); ?>>
	<head>
		<meta charset="<?php bloginfo( 'charset' ); ?>">
		<meta name="viewport" content="width=device-width, initial-scale=1">
		<title><?php esc_html_e( 'ApexOneIQ Account', 'apexoneiq' ); ?></title>
		<link rel="stylesheet" href="<?php echo esc_url( APEXONEIQ_THEME_URI . 'assets/css/app.css?ver=' . APEXONEIQ_THEME_VERSION ); ?>">
	</head>
	<body>
		<div class="app account-workspace">
			<aside class="sidebar">
				<div class="brand">
					<div class="logo">A1</div>
					<div>
						<strong><?php esc_html_e( 'ApexOneIQ', 'apexoneiq' ); ?></strong>
						<span><?php esc_html_e( 'Executive OS', 'apexoneiq' ); ?></span>
					</div>
				</div>
				<nav>
					<div class="nav-section"><?php esc_html_e( 'Workspace', 'apexoneiq' ); ?></div>
					<ul class="nav-list">
						<li><a class="nav-link" href="<?php echo esc_url( home_url( '/dashboard.html' ) ); ?>"><?php esc_html_e( 'Cloud Dashboard', 'apexoneiq' ); ?><small>Cloud</small></a></li>
						<li><a class="nav-link" href="<?php echo esc_url( home_url( '/command-dashboard.html' ) ); ?>"><?php esc_html_e( 'Command Center', 'apexoneiq' ); ?><small>Command</small></a></li>
						<li><a class="nav-link" href="<?php echo esc_url( home_url( '/subscription.html' ) ); ?>"><?php esc_html_e( 'Plans', 'apexoneiq' ); ?><small>Billing</small></a></li>
						<li><a class="nav-link active" href="<?php echo esc_url( home_url( '/account' ) ); ?>"><?php esc_html_e( 'Account', 'apexoneiq' ); ?><small>Active</small></a></li>
					</ul>
				</nav>
				<div class="system-card">
					<div class="page-kicker"><?php esc_html_e( 'Billing Portal', 'apexoneiq' ); ?></div>
					<p><?php esc_html_e( 'Stripe Customer Portal actions are prepared for the next implementation phase.', 'apexoneiq' ); ?></p>
					<a class="button" href="<?php echo esc_url( home_url( '/subscription.html' ) ); ?>"><?php esc_html_e( 'View Plans', 'apexoneiq' ); ?></a>
				</div>
			</aside>
			<main class="main">
				<header class="topbar">
					<div>
						<div class="page-kicker"><?php esc_html_e( 'Customer Account', 'apexoneiq' ); ?></div>
						<strong><?php echo esc_html( $user->display_name ?: $user->user_login ); ?></strong>
					</div>
					<div class="account">
						<a class="ghost-button" href="<?php echo esc_url( home_url( '/subscription.html' ) ); ?>"><?php esc_html_e( 'Plans', 'apexoneiq' ); ?></a>
						<a class="ghost-button" href="<?php echo esc_url( wp_logout_url( home_url( '/subscription.html' ) ) ); ?>"><?php esc_html_e( 'Sign Out', 'apexoneiq' ); ?></a>
						<div class="avatar"><?php echo esc_html( strtoupper( substr( $user->user_login, 0, 2 ) ) ); ?></div>
					</div>
				</header>
				<section class="page-head">
					<div>
						<div class="page-kicker"><?php esc_html_e( 'Subscription State', 'apexoneiq' ); ?></div>
						<h1><?php esc_html_e( 'Account and billing foundation', 'apexoneiq' ); ?></h1>
					</div>
					<span class="status-pill"><?php echo esc_html( $status ); ?></span>
				</section>
				<section class="metric-grid">
					<div class="metric">
						<small><?php esc_html_e( 'Current Plan', 'apexoneiq' ); ?></small>
						<strong><?php echo esc_html( $plan ); ?></strong>
						<p><?php esc_html_e( 'Workspace access is granted from subscription capabilities, not scattered plan checks.', 'apexoneiq' ); ?></p>
					</div>
					<div class="metric">
						<small><?php esc_html_e( 'Billing Status', 'apexoneiq' ); ?></small>
						<strong><?php echo esc_html( $status ); ?></strong>
						<p><?php esc_html_e( 'Stripe webhooks synchronize this after checkout, renewal, failure, and cancellation events.', 'apexoneiq' ); ?></p>
					</div>
					<div class="metric">
						<small><?php esc_html_e( 'Renewal Date', 'apexoneiq' ); ?></small>
						<strong><?php echo esc_html( $renewal ); ?></strong>
						<p><?php esc_html_e( 'The next billing date is read from the stored subscription period end.', 'apexoneiq' ); ?></p>
					</div>
					<div class="metric">
						<small><?php esc_html_e( 'Entitlements', 'apexoneiq' ); ?></small>
						<strong><?php echo esc_html( (string) count( $capabilities ) ); ?></strong>
						<p><?php esc_html_e( 'Capabilities determine workspace access and future upgrade paths.', 'apexoneiq' ); ?></p>
					</div>
				</section>
				<section class="grid-2">
					<div class="chart-panel">
						<div class="chart-head">
							<div>
								<div class="panel-label"><?php esc_html_e( 'Billing Actions', 'apexoneiq' ); ?></div>
								<h2><?php esc_html_e( 'Prepared customer lifecycle controls', 'apexoneiq' ); ?></h2>
							</div>
							<span class="status-pill"><?php esc_html_e( 'Sandbox', 'apexoneiq' ); ?></span>
						</div>
						<div class="grid-3">
							<a class="ghost-button" href="<?php echo esc_url( home_url( '/subscription.html' ) ); ?>"><?php esc_html_e( 'Upgrade or Downgrade', 'apexoneiq' ); ?></a>
							<a class="ghost-button" href="<?php echo esc_url( 'mailto:billing@apexoneiq.com?subject=ApexOneIQ%20Billing%20Help' ); ?>"><?php esc_html_e( 'Billing Help', 'apexoneiq' ); ?></a>
							<a class="ghost-button" href="<?php echo esc_url( 'mailto:billing@apexoneiq.com?subject=ApexOneIQ%20Subscription%20Change' ); ?>"><?php esc_html_e( 'Subscription Support', 'apexoneiq' ); ?></a>
						</div>
						<p class="muted" style="margin-top:18px;"><?php esc_html_e( 'The next production phase can connect these actions to Stripe Customer Portal and subscription-change routes without altering the Executive Dashboard UI.', 'apexoneiq' ); ?></p>
					</div>
					<div class="chart-panel">
						<div class="panel-label"><?php esc_html_e( 'Enabled Capabilities', 'apexoneiq' ); ?></div>
						<div class="brief-meta" style="grid-template-columns:1fr;">
							<?php foreach ( array_slice( $capabilities, 0, 10 ) as $capability ) : ?>
								<div><strong><?php echo esc_html( $capability ); ?></strong></div>
							<?php endforeach; ?>
						</div>
					</div>
				</section>
			</main>
		</div>
	</body>
	</html>
	<?php
}

/**
 * Format a subscription key for display.
 *
 * @param string $value Plan or status key.
 * @return string
 */
function apexoneiq_format_plan_name( $value ) {
	$value = str_replace( array( '_', '-' ), ' ', sanitize_text_field( $value ) );
	return ucwords( $value ?: 'none' );
}
