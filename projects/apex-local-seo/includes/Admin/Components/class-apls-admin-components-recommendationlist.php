<?php
/**
 * Apex Local SEO plugin file.
 *
 * @package Apex_Local_SEO
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; }

/**
 * APLS Admin Components RecommendationList.
 */
class APLS_Admin_Components_RecommendationList {
	/**
	 * Render.
	 *
	 * @param mixed $recommendations Recommendations.
	 */
	public static function render( $recommendations ) {
		echo '<div class="apls-recommendations">';
		foreach ( $recommendations as $item ) {
			$title    = $item['title'] ?? '';
			$priority = $item['priority'] ?? 'normal';
			echo '<div class="apls-recommendation"><span>' . esc_html( strtoupper( $priority ) ) . '</span><strong>' . esc_html( $title ) . '</strong></div>';
		}
		echo '</div>';
	}
}
