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
 * Normalize request paths to theme static files.
 *
 * @param string $page Requested page.
 * @return string
 */
function apexoneiq_normalize_static_page( $page ) {
	$page = ltrim( sanitize_text_field( wp_unslash( $page ) ), '/' );
	$page = preg_replace( '#/{2,}#', '/', $page );

	if ( '' === $page || 'index.html' === $page ) {
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
	$auth_url  = wp_login_url( home_url( '/dashboard.html' ) );

	$replacements = array(
		'href="css/app.css"' => 'href="' . esc_url( $asset_uri . 'assets/css/app.css?ver=' . APEXONEIQ_THEME_VERSION ) . '"',
		'src="js/app.js"'    => 'src="' . esc_url( $asset_uri . 'assets/js/app.js?ver=' . APEXONEIQ_THEME_VERSION ) . '"',
		'href="sign-in.html"' => 'href="' . esc_url( $auth_url ) . '"',
		'href="/sign-in/"'   => 'href="' . esc_url( $auth_url ) . '"',
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
				'isLoggedIn'   => is_user_logged_in(),
				'subscription' => apexoneiq_get_current_user_subscription_state(),
			)
		)
	);

	$html = str_replace( $app_script, $config . $app_script, $html );

	return $html;
}
