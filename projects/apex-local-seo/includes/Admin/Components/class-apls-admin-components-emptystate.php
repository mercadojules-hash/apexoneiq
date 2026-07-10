<?php
/**
 * Apex Local SEO plugin file.
 *
 * @package Apex_Local_SEO
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; }

/**
 * APLS Admin Components EmptyState.
 */
class APLS_Admin_Components_EmptyState {
	/**
	 * Render.
	 *
	 * @param mixed $title Title.
	 * @param mixed $message Message.
	 */
	public static function render( $title, $message ) {
		echo '<div class="apls-empty"><img src="' . esc_url( APLS_PLUGIN_URL . 'assets/branding/apex-local-seo-icon-128.png' ) . '" alt="" aria-hidden="true"><div><strong>' . esc_html( $title ) . '</strong><p>' . esc_html( $message ) . '</p></div></div>';
	}
}
