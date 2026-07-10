<?php
/**
 * Apex Local SEO plugin file.
 *
 * @package Apex_Local_SEO
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; }

/**
 * APLS Admin Components ModuleCard.
 */
class APLS_Admin_Components_ModuleCard {
	/**
	 * Render.
	 *
	 * @param mixed $module Module.
	 */
	public static function render( $module ) {
		echo '<article class="apls-card">';
		echo '<div class="apls-card-head"><h2>' . esc_html( $module['label'] ) . '</h2>';
		APLS_Admin_Components_StatusBadge::render( $module['status'], 'neutral' );
		echo '</div><p>' . esc_html( $module['description'] ) . '</p></article>';
	}
}
