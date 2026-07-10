<?php
/**
 * Apex Local SEO plugin file.
 *
 * @package Apex_Local_SEO
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; }

/**
 * APLS Admin Components MetricGrid.
 */
class APLS_Admin_Components_MetricGrid {
	/**
	 * Render.
	 *
	 * @param mixed $cards Cards.
	 */
	public static function render( $cards ) {
		echo '<section class="apls-metric-grid">';
		foreach ( $cards as $card ) {
			APLS_Admin_Components_KpiCard::render( $card['label'], $card['value'], $card['meta'], $card['tone'] );
		}
		echo '</section>';
	}
}
