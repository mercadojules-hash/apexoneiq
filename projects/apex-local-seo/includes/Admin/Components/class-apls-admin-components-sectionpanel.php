<?php
/**
 * Apex Local SEO plugin file.
 *
 * @package Apex_Local_SEO
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; }

/**
 * APLS Admin Components SectionPanel.
 */
class APLS_Admin_Components_SectionPanel {
	/**
	 * Start.
	 *
	 * @param mixed $title Title.
	 * @param mixed $subtitle Subtitle.
	 */
	public static function start( $title, $subtitle = '' ) {
		echo '<section class="apls-card"><div class="apls-card-head"><div><h2>' . esc_html( $title ) . '</h2>';
		if ( $subtitle ) {
			echo '<p>' . esc_html( $subtitle ) . '</p>';
		}
		echo '</div></div>';
	}

	/**
	 * End.
	 */
	public static function end() {
		echo '</section>';
	}
}
