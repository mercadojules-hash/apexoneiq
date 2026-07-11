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
require_once APEXONEIQ_THEME_DIR . 'inc/billing-routes.php';

add_action( 'after_setup_theme', 'apexoneiq_theme_setup' );
add_action( 'wp_enqueue_scripts', 'apexoneiq_enqueue_assets' );
add_action( 'init', 'apexoneiq_register_rewrite_routes' );
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
	if ( get_query_var( 'apexoneiq_static_page' ) || get_query_var( 'apexoneiq_checkout_plan' ) ) {
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
	add_rewrite_rule( '^$', 'index.php?apexoneiq_static_page=dashboard.html', 'top' );
	add_rewrite_rule( '^sign-in/?$', 'index.php?apexoneiq_static_page=sign-in.html', 'top' );
	add_rewrite_rule( '^checkout/(cloud|command|essentials|growth)/?$', 'index.php?apexoneiq_static_page=checkout/$matches[1]/index.html', 'top' );
	add_rewrite_rule( '^checkout/(success|cancel)\.html$', 'index.php?apexoneiq_static_page=checkout/$matches[1].html', 'top' );
	add_rewrite_rule( '^([a-z0-9-]+\.html)$', 'index.php?apexoneiq_static_page=$matches[1]', 'top' );
	add_rewrite_rule( '^api/billing/checkout/(cloud|command|essentials|growth)/?$', 'index.php?apexoneiq_checkout_plan=$matches[1]', 'top' );
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

	return $vars;
}

/**
 * Route static dashboard pages and checkout placeholders.
 *
 * @param string $template WordPress template path.
 * @return string
 */
function apexoneiq_template_include( $template ) {
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

	if ( $path && ( preg_match( '#/(checkout/)?[a-z0-9-]+\.html$#', $path ) || preg_match( '#^/api/billing/checkout/#', $path ) ) ) {
		return false;
	}

	return $redirect_url;
}

/**
 * Add a marker option when the theme is activated.
 */
function apexoneiq_theme_activation_notice() {
	apexoneiq_register_rewrite_routes();
	flush_rewrite_rules();
	update_option( 'apexoneiq_theme_installed_at', gmdate( 'c' ) );
}
