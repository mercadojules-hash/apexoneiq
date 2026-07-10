<?php
/**
 * Apex Local SEO plugin file.
 *
 * @package Apex_Local_SEO
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; }

/**
 * APLS Admin Components KpiCard.
 */
class APLS_Admin_Components_KpiCard {
	/**
	 * Render.
	 *
	 * @param mixed $label Label.
	 * @param mixed $value Value.
	 * @param mixed $meta Meta.
	 * @param mixed $tone Tone.
	 */
	public static function render( $label, $value, $meta = '', $tone = 'blue' ) {
		?>
		<div class="apls-kpi apls-tone-<?php echo esc_attr( sanitize_key( $tone ) ); ?>">
			<span><?php echo esc_html( $label ); ?></span>
			<strong><?php echo esc_html( $value ); ?></strong>
			<em><?php echo esc_html( $meta ); ?></em>
		</div>
		<?php
	}
}

