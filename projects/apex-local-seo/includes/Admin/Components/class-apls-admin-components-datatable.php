<?php
/**
 * Apex Local SEO plugin file.
 *
 * @package Apex_Local_SEO
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; }

/**
 * APLS Admin Components DataTable.
 */
class APLS_Admin_Components_DataTable {
	/**
	 * Preview.
	 *
	 * @param mixed $title Title.
	 */
	public static function preview( $title ) {
		echo '<div class="apls-card"><div class="apls-card-head"><h2>' . esc_html( $title ) . '</h2></div>';
		echo '<div class="apls-readiness-rows">';
		echo '<div><span>' . esc_html__( 'Current', 'apex-local-seo' ) . '</span><strong>' . esc_html( self::preview_value( $title, 0 ) ) . '</strong></div>';
		echo '<div><span>' . esc_html__( 'Trend', 'apex-local-seo' ) . '</span><strong>' . esc_html( self::preview_value( $title, 1 ) ) . '</strong></div>';
		echo '<div><span>' . esc_html__( 'Next Action', 'apex-local-seo' ) . '</span><strong>' . esc_html( self::preview_value( $title, 2 ) ) . '</strong></div>';
		echo '</div>';
		echo '</div>';
	}

	/**
	 * Preview value.
	 *
	 * @param mixed $title Title.
	 * @param mixed $index Index.
	 */
	private static function preview_value( $title, $index ) {
		$data = array(
			__( 'Map Pack Visibility', 'apex-local-seo' ) => array( '78%', '+16.3%', __( 'Track 12 keywords', 'apex-local-seo' ) ),
			__( 'Review Trends', 'apex-local-seo' )       => array( '4.8 stars', '+24 reviews', __( 'Reply to 4 reviews', 'apex-local-seo' ) ),
			__( 'Citation Health', 'apex-local-seo' )     => array( '86%', '9 missing', __( 'Fix inconsistent NAP', 'apex-local-seo' ) ),
			__( 'Competitor Snapshot', 'apex-local-seo' ) => array( '#2 local gap', '+11 points', __( 'Add service photos', 'apex-local-seo' ) ),
		);

		return isset( $data[ $title ][ $index ] ) ? $data[ $title ][ $index ] : '--';
	}
}
