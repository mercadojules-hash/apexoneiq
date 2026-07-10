<?php
/**
 * Apex Local SEO plugin file.
 *
 * @package Apex_Local_SEO
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; }

/**
 * APLS Admin Components Header.
 */
class APLS_Admin_Components_Header {
	/**
	 * Render.
	 *
	 * @param mixed $title Title.
	 * @param mixed $subtitle Subtitle.
	 */
	public static function render( $title, $subtitle = '' ) {
		?>
		<header class="apls-header">
			<div class="apls-brand">
				<img class="apls-logo" src="<?php echo esc_url( APLS_PLUGIN_URL . 'assets/branding/apex-local-seo-logo-256.png' ); ?>" alt="<?php esc_attr_e( 'Apex Local SEO', 'apex-local-seo' ); ?>">
				<div>
					<h1><?php echo esc_html( $title ); ?></h1>
					<p><?php echo esc_html( $subtitle ? $subtitle : __( 'Local search command center for the Apex SEO Platform', 'apex-local-seo' ) ); ?></p>
				</div>
			</div>
			<div class="apls-header-actions">
				<span class="apls-system-pill"><?php esc_html_e( 'Foundation', 'apex-local-seo' ); ?></span>
				<a class="apls-btn" href="<?php echo esc_url( admin_url( 'admin.php?page=apls-settings' ) ); ?>"><?php esc_html_e( 'Settings', 'apex-local-seo' ); ?></a>
			</div>
		</header>
		<?php
	}
}
