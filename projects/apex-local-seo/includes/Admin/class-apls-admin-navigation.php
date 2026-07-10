<?php
/**
 * Apex Local SEO plugin file.
 *
 * @package Apex_Local_SEO
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; }

/**
 * APLS Admin Navigation.
 */
class APLS_Admin_Navigation {
	/**
	 * Tabs.
	 */
	public static function tabs() {
		return array(
			'apls'             => array(
				'label' => __( 'Dashboard', 'apex-local-seo' ),
				'icon'  => 'D',
			),
			'apls-onboarding'  => array(
				'label' => __( 'Onboarding', 'apex-local-seo' ),
				'icon'  => 'O',
			),
			'apls-locations'   => array(
				'label' => __( 'Locations', 'apex-local-seo' ),
				'icon'  => 'L',
			),
			'apls-gbp'         => array(
				'label' => __( 'GBP', 'apex-local-seo' ),
				'icon'  => 'G',
			),
			'apls-reviews'     => array(
				'label' => __( 'Reviews', 'apex-local-seo' ),
				'icon'  => 'R',
			),
			'apls-schema'      => array(
				'label' => __( 'Schema', 'apex-local-seo' ),
				'icon'  => 'SC',
			),
			'apls-citations'   => array(
				'label' => __( 'Citation Intelligence', 'apex-local-seo' ),
				'icon'  => 'CI',
			),
			'apls-advisor'     => array(
				'label' => __( 'Executive Advisor', 'apex-local-seo' ),
				'icon'  => 'EA',
			),
			'apls-diagnostics' => array(
				'label' => __( 'Diagnostics', 'apex-local-seo' ),
				'icon'  => 'DX',
			),
			'apls-settings'    => array(
				'label' => __( 'Settings', 'apex-local-seo' ),
				'icon'  => 'S',
			),
		);
	}

	/**
	 * Render.
	 */
	public static function render() {
		$page = isset( $_GET['page'] ) ? sanitize_key( wp_unslash( $_GET['page'] ) ) : 'apls'; // phpcs:ignore WordPress.Security.NonceVerification.Recommended
		echo '<nav class="apls-nav-pills" aria-label="' . esc_attr__( 'Apex Local SEO sections', 'apex-local-seo' ) . '">';
		foreach ( self::tabs() as $slug => $item ) {
			$class = $slug === $page ? 'apls-pill is-active' : 'apls-pill';
			echo '<a class="' . esc_attr( $class ) . '" href="' . esc_url( admin_url( 'admin.php?page=' . $slug ) ) . '"><span class="apls-pill-icon">' . esc_html( $item['icon'] ) . '</span><span>' . esc_html( $item['label'] ) . '</span></a>';
		}
		echo '</nav>';
	}
}
