<?php
/**
 * Apex Local SEO plugin file.
 *
 * @package Apex_Local_SEO
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; }

/**
 * APLS Admin Components ApexShell.
 */
class APLS_Admin_Components_ApexShell {
	/**
	 * Start.
	 *
	 * @param mixed                                                        $title Title.
	 * @param mixed                                                        $subtitle Subtitle.
	 * @param APLS_Services_BusinessProfile_BusinessProfileProviderManager $provider_manager Provider manager.
	 */
	public static function start( $title, $subtitle = '', $provider_manager = null ) {
		self::help_tab( $title, $subtitle );
		echo '<div class="wrap apls-wrap"><div class="apls-root">';
		APLS_Admin_Components_Header::render( $title, $subtitle );
		if ( $provider_manager instanceof APLS_Services_BusinessProfile_BusinessProfileProviderManager ) {
			self::connection_badge( $provider_manager );
		}
		APLS_Admin_Navigation::render();
	}

	/**
	 * End.
	 */
	public static function end() {
		echo '</div></div>';
	}

	/**
	 * Help tab.
	 *
	 * @param mixed $title Title.
	 * @param mixed $subtitle Subtitle.
	 */
	private static function help_tab( $title, $subtitle ) {
		$screen = function_exists( 'get_current_screen' ) ? get_current_screen() : null;
		if ( ! $screen ) {
			return;
		}

		$screen->add_help_tab(
			array(
				'id'      => 'apls_context_help',
				'title'   => __( 'Apex Help', 'apex-local-seo' ),
				'content' => '<p><strong>' . esc_html( $title ) . '</strong></p><p>' . esc_html( $subtitle ) . '</p><p>' . esc_html__( 'Best practice: review the provider badge, resolve high-priority guidance first, and use Diagnostics when provider data is missing or stale. Documentation links are prepared for the public knowledge base.', 'apex-local-seo' ) . '</p>',
			)
		);
	}

	/**
	 * Connection badge.
	 *
	 * @param APLS_Services_BusinessProfile_BusinessProfileProviderManager $provider_manager Provider manager.
	 */
	public static function connection_badge( APLS_Services_BusinessProfile_BusinessProfileProviderManager $provider_manager ) {
		$provider = $provider_manager->active_provider();
		$data     = $provider->dashboard();
		$summary  = $data['summary'] ?? array();
		$name     = sanitize_text_field( $summary['businessName'] ?? '' );
		$mode     = $provider_manager->mode();
		$status   = $mode['googleStatus'] ?? array();

		if ( 'mock' === $provider->id() ) {
			echo '<section class="apls-connection-badge apls-is-demo" aria-label="' . esc_attr__( 'Demo mode connection status', 'apex-local-seo' ) . '">';
			echo '<strong>' . esc_html__( 'Demo Mode', 'apex-local-seo' ) . '</strong>';
			echo '<span>' . esc_html__( 'Connected to Apex Sample Dental Studio', 'apex-local-seo' ) . '</span>';
			echo '</section>';
			return;
		}

		echo '<section class="apls-connection-badge" aria-label="' . esc_attr__( 'Business connection status', 'apex-local-seo' ) . '">';
		if ( empty( $summary['connected'] ) ) {
			echo '<strong>' . esc_html__( 'Google Connected', 'apex-local-seo' ) . '</strong>';
			echo '<span>' . esc_html( ! empty( $status['syncIssue']['message'] ) ? __( 'Import paused. Review Diagnostics for the Google API response.', 'apex-local-seo' ) : __( 'Ready to import Business Profile data.', 'apex-local-seo' ) ) . '</span>';
		} else {
			echo '<strong>' . esc_html__( 'Connected to:', 'apex-local-seo' ) . '</strong>';
			echo '<span>' . esc_html( '' !== $name ? $name : __( 'Google Business Profile', 'apex-local-seo' ) ) . '</span>';
		}
		echo '</section>';
	}

	/**
	 * Demo mode notice.
	 */
	public static function demo_mode_notice() {
		$connect_url = wp_nonce_url( admin_url( 'admin-post.php?action=apls_google_connect' ), 'apls_google_connect' );
		?>
		<section class="apls-demo-welcome" aria-label="<?php esc_attr_e( 'Apex Local SEO demo mode introduction', 'apex-local-seo' ); ?>">
			<div>
				<span class="apls-eyebrow"><?php esc_html_e( 'Welcome to Apex Local SEO', 'apex-local-seo' ); ?></span>
				<h2><?php esc_html_e( 'Explore every feature with Apex Sample Dental Studio.', 'apex-local-seo' ); ?></h2>
				<p><?php esc_html_e( 'You are currently exploring Apex Local SEO using Apex Sample Dental Studio, a fully interactive demonstration that allows you to experience every feature immediately.', 'apex-local-seo' ); ?></p>
				<p><?php esc_html_e( 'To begin analyzing your own business, click Connect Google Business Profile. After authorization, Apex Local SEO will automatically replace the sample business with your own Google Business Profile data. Until then, Demo Mode remains fully functional so you can explore every feature.', 'apex-local-seo' ); ?></p>
			</div>
			<div class="apls-demo-actions">
				<a class="apls-btn" href="<?php echo esc_url( admin_url( 'admin.php?page=apls' ) ); ?>"><?php esc_html_e( 'Continue in Demo Mode', 'apex-local-seo' ); ?></a>
				<a class="apls-btn apls-btn-primary" href="<?php echo esc_url( $connect_url ); ?>"><?php esc_html_e( 'Connect Google Business Profile', 'apex-local-seo' ); ?></a>
			</div>
		</section>
		<?php
	}
}
