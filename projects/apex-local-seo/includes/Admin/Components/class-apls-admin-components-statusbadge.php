<?php
/**
 * Apex Local SEO plugin file.
 *
 * @package Apex_Local_SEO
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; }

/**
 * APLS Admin Components StatusBadge.
 */
class APLS_Admin_Components_StatusBadge {
	/**
	 * Render.
	 *
	 * @param mixed $label Label.
	 * @param mixed $tone Tone.
	 */
	public static function render( $label, $tone = 'neutral' ) {
		$label = ucwords( str_replace( '_', ' ', (string) $label ) );
		echo '<span class="apls-status apls-status-' . esc_attr( sanitize_key( $tone ) ) . '">' . esc_html( $label ) . '</span>';
	}
}
