<?php
/**
 * Apex Local SEO plugin file.
 *
 * @package Apex_Local_SEO
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; }

/**
 * APLS Admin Pages SchemaPage.
 */
class APLS_Admin_Pages_SchemaPage {
	/**
	 * Container.
	 *
	 * @var mixed
	 */
	private $container;

	/**
	 * Construct.
	 *
	 * @param APLS_Core_Container $container Container.
	 */
	public function __construct( APLS_Core_Container $container ) {
		$this->container = $container;
	}

	/**
	 * Render.
	 */
	public function render() {
		$manager  = $this->container->get( 'business_profile_provider' );
		$provider = $manager->active_provider();
		$data     = $provider->dashboard();
		$module   = $data['schemaModule'] ?? $this->fallback_module( $data );
		$summary  = $module['summary'] ?? array();
		$json_ld  = $this->generated_json_ld( $module );

		APLS_Admin_Components_ApexShell::start( __( 'Schema Manager', 'apex-local-seo' ), __( 'Local business schema generation, validation, and structured data guidance.', 'apex-local-seo' ), $manager );
		?>
		<section class="apls-schema-hero">
			<div>
				<span class="apls-provider-chip"><?php /* translators: %s is the active business profile provider name. */ echo esc_html( sprintf( __( '%s Active', 'apex-local-seo' ), $provider->label() ) ); ?></span>
				<h2><?php esc_html_e( 'Schema Manager', 'apex-local-seo' ); ?></h2>
				<p><?php esc_html_e( 'Generate, inspect, validate, and improve local business JSON-LD through connected business data and rule-based explanations.', 'apex-local-seo' ); ?></p>
			</div>
			<div class="apls-schema-status-card">
				<strong><?php echo esc_html( absint( $summary['overallHealthScore'] ?? 0 ) ); ?></strong>
				<span><?php esc_html_e( 'Overall Schema Health', 'apex-local-seo' ); ?></span>
			</div>
		</section>

		<section class="apls-exec-kpi-grid apls-schema-kpi-grid" aria-label="<?php esc_attr_e( 'Schema executive overview', 'apex-local-seo' ); ?>">
			<?php foreach ( $this->kpi_cards( $summary ) as $card ) : ?>
				<?php $this->render_kpi( $card ); ?>
			<?php endforeach; ?>
		</section>

		<div class="apls-schema-grid">
			<?php $this->visual_editor_panel( $module['businessInformation'] ?? array() ); ?>
			<?php $this->json_preview_panel( $json_ld ); ?>
			<?php $this->schema_types_panel( $module['schemaTypes'] ?? array() ); ?>
			<?php $this->validation_panel( $module['validation'] ?? array() ); ?>
			<?php $this->advisor_panel( $module['advisor'] ?? array() ); ?>
			<?php $this->templates_panel( $module['templates'] ?? array() ); ?>
			<?php $this->locations_panel( $module['locations'] ?? array() ); ?>
			<?php $this->plugin_detection_panel( $module['pluginDetection'] ?? array() ); ?>
		</div>
		<?php
		APLS_Admin_Components_ApexShell::end();
	}

	/**
	 * Kpi cards.
	 *
	 * @param mixed $summary Summary.
	 */
	private function kpi_cards( $summary ) {
		return array(
			array(
				'label' => __( 'Schema Health', 'apex-local-seo' ),
				'value' => absint( $summary['overallHealthScore'] ?? 0 ),
				'meta'  => __( 'Overall score', 'apex-local-seo' ),
				'tone'  => 'green',
			),
			array(
				'label' => __( 'Schema Types', 'apex-local-seo' ),
				'value' => absint( $summary['totalSchemaTypes'] ?? 0 ),
				'meta'  => __( 'Generated types', 'apex-local-seo' ),
				'tone'  => 'cyan',
			),
			array(
				'label' => __( 'Valid Schema', 'apex-local-seo' ),
				'value' => absint( $summary['validSchema'] ?? 0 ),
				'meta'  => __( 'Passing checks', 'apex-local-seo' ),
				'tone'  => 'blue',
			),
			array(
				'label' => __( 'Warnings', 'apex-local-seo' ),
				'value' => absint( $summary['warnings'] ?? 0 ),
				'meta'  => __( 'Needs review', 'apex-local-seo' ),
				'tone'  => 'amber',
			),
			array(
				'label' => __( 'Errors', 'apex-local-seo' ),
				'value' => absint( $summary['errors'] ?? 0 ),
				'meta'  => __( 'Must fix', 'apex-local-seo' ),
				'tone'  => 'purple',
			),
			array(
				'label' => __( 'Rich Results', 'apex-local-seo' ),
				'value' => absint( $summary['richResultsEligible'] ?? 0 ),
				'meta'  => __( 'Eligible items', 'apex-local-seo' ),
				'tone'  => 'green',
			),
			array(
				'label' => __( 'Last Validation', 'apex-local-seo' ),
				'value' => $summary['lastValidation'] ?? __( 'Pending', 'apex-local-seo' ),
				'meta'  => __( 'Validator run', 'apex-local-seo' ),
				'tone'  => 'cyan',
			),
			array(
				'label' => __( 'Advisor Schema Score', 'apex-local-seo' ),
				'value' => absint( $summary['advisorSchemaScore'] ?? $summary['advisorSchemaScore'] ?? 0 ),
				'meta'  => __( 'Advisor quality', 'apex-local-seo' ),
				'tone'  => 'blue',
			),
		);
	}

	/**
	 * Render kpi.
	 *
	 * @param mixed $card Card.
	 */
	private function render_kpi( $card ) {
		?>
		<article class="apls-exec-kpi apls-tone-<?php echo esc_attr( $card['tone'] ); ?>">
			<span><?php echo esc_html( $card['label'] ); ?></span>
			<strong><?php echo esc_html( $card['value'] ); ?></strong>
			<em><?php echo esc_html( $card['meta'] ); ?></em>
		</article>
		<?php
	}

	/**
	 * Visual editor panel.
	 *
	 * @param mixed $info Info.
	 */
	private function visual_editor_panel( $info ) {
		?>
		<section class="apls-panel apls-schema-panel apls-schema-panel-wide">
			<div class="apls-panel-head">
				<div>
					<span class="apls-eyebrow"><?php esc_html_e( 'Visual Editor', 'apex-local-seo' ); ?></span>
					<h2><?php esc_html_e( 'Business information schema inputs', 'apex-local-seo' ); ?></h2>
				</div>
				<span class="apls-status apls-status-success"><?php echo esc_html( $info['schemaSubtype'] ?? 'LocalBusiness' ); ?></span>
			</div>
			<div class="apls-schema-editor-grid">
				<?php $this->detail_row( __( 'Business Name', 'apex-local-seo' ), $info['businessName'] ?? '' ); ?>
				<?php $this->detail_row( __( 'Schema Type', 'apex-local-seo' ), $info['schemaSubtype'] ?? '' ); ?>
				<?php $this->detail_row( __( 'Address', 'apex-local-seo' ), $info['address'] ?? '' ); ?>
				<?php $this->detail_row( __( 'Phone', 'apex-local-seo' ), $info['phone'] ?? '' ); ?>
				<?php $this->detail_row( __( 'Website', 'apex-local-seo' ), $info['website'] ?? '' ); ?>
				<?php $this->detail_row( __( 'Email', 'apex-local-seo' ), $info['email'] ?? '' ); ?>
				<?php $this->detail_row( __( 'Latitude', 'apex-local-seo' ), $info['latitude'] ?? '' ); ?>
				<?php $this->detail_row( __( 'Longitude', 'apex-local-seo' ), $info['longitude'] ?? '' ); ?>
				<?php $this->detail_row( __( 'Price Range', 'apex-local-seo' ), $info['priceRange'] ?? '' ); ?>
				<?php $this->detail_row( __( 'GBP ID', 'apex-local-seo' ), $info['googleBusinessProfileId'] ?? '' ); ?>
			</div>
			<div class="apls-schema-token-grid">
				<?php $this->token_block( __( 'Opening Hours', 'apex-local-seo' ), $info['openingHours'] ?? array() ); ?>
				<?php $this->token_block( __( 'Holiday Hours', 'apex-local-seo' ), $info['holidayHours'] ?? array() ); ?>
				<?php $this->token_block( __( 'Service Areas', 'apex-local-seo' ), $info['serviceAreas'] ?? array() ); ?>
				<?php $this->token_block( __( 'Payment Methods', 'apex-local-seo' ), $info['paymentMethods'] ?? array() ); ?>
				<?php $this->token_block( __( 'Social Profiles', 'apex-local-seo' ), $info['socialProfiles'] ?? array() ); ?>
				<?php $this->detail_row( __( 'Google Maps URL', 'apex-local-seo' ), $info['googleMapsUrl'] ?? '' ); ?>
			</div>
		</section>
		<?php
	}

	/**
	 * Json preview panel.
	 *
	 * @param mixed $json_ld Json ld.
	 */
	private function json_preview_panel( $json_ld ) {
		?>
		<section class="apls-panel apls-schema-panel apls-schema-panel-wide">
			<div class="apls-panel-head">
				<div>
					<span class="apls-eyebrow"><?php esc_html_e( 'Generated JSON-LD', 'apex-local-seo' ); ?></span>
					<h2><?php esc_html_e( 'Live schema preview', 'apex-local-seo' ); ?></h2>
				</div>
				<span class="apls-status apls-status-neutral"><?php esc_html_e( 'Auto Generated', 'apex-local-seo' ); ?></span>
			</div>
			<pre class="apls-schema-code"><code><?php echo esc_html( $json_ld ); ?></code></pre>
		</section>
		<?php
	}

	/**
	 * Schema types panel.
	 *
	 * @param mixed $types Types.
	 */
	private function schema_types_panel( $types ) {
		?>
		<section class="apls-panel apls-schema-panel">
			<div class="apls-panel-head"><div><span class="apls-eyebrow"><?php esc_html_e( 'Schema Types', 'apex-local-seo' ); ?></span><h2><?php esc_html_e( 'Supported hierarchy', 'apex-local-seo' ); ?></h2></div></div>
			<?php $this->token_block( __( 'Core', 'apex-local-seo' ), $types['core'] ?? array() ); ?>
			<?php $this->token_block( __( 'Local Business Types', 'apex-local-seo' ), $types['localBusiness'] ?? array() ); ?>
			<?php $this->token_block( __( 'Advanced Types', 'apex-local-seo' ), $types['advanced'] ?? array() ); ?>
			<?php $this->token_block( __( 'Nested Schema', 'apex-local-seo' ), $types['nested'] ?? array() ); ?>
		</section>
		<?php
	}

	/**
	 * Validation panel.
	 *
	 * @param mixed $validation Validation.
	 */
	private function validation_panel( $validation ) {
		?>
		<section class="apls-panel apls-schema-panel">
			<div class="apls-panel-head">
				<div><span class="apls-eyebrow"><?php esc_html_e( 'Rich Results Validation', 'apex-local-seo' ); ?></span><h2><?php esc_html_e( 'Built-in schema validator', 'apex-local-seo' ); ?></h2></div>
				<span class="apls-status apls-status-warning"><?php echo esc_html( $validation['status'] ?? __( 'Pending', 'apex-local-seo' ) ); ?></span>
			</div>
			<?php $this->token_block( __( 'Warnings', 'apex-local-seo' ), $validation['warnings'] ?? array() ); ?>
			<?php $this->token_block( __( 'Errors', 'apex-local-seo' ), $validation['errors'] ?? array() ); ?>
			<?php $this->token_block( __( 'Missing Properties', 'apex-local-seo' ), $validation['missingProperties'] ?? array() ); ?>
			<?php $this->token_block( __( 'Rich Results Eligibility', 'apex-local-seo' ), $validation['richResultsEligible'] ?? array() ); ?>
		</section>
		<?php
	}

	/**
	 * Advisor panel.
	 *
	 * @param mixed $advisor Advisor.
	 */
	private function advisor_panel( $advisor ) {
		?>
		<section class="apls-panel apls-schema-panel apls-schema-panel-wide">
			<div class="apls-panel-head"><div><span class="apls-eyebrow"><?php esc_html_e( 'Schema Advisor', 'apex-local-seo' ); ?></span><h2><?php esc_html_e( 'Actionable structured data guidance', 'apex-local-seo' ); ?></h2></div></div>
			<div class="apls-schema-advisor-list">
				<?php foreach ( (array) $advisor as $item ) : ?>
					<article class="apls-schema-advisor-row">
						<span><?php echo esc_html( $item['priority'] ?? '' ); ?></span>
						<strong><?php echo esc_html( $item['issue'] ?? '' ); ?></strong>
						<p><?php echo esc_html( $item['reason'] ?? '' ); ?></p>
						<em><?php echo esc_html( __( 'Recommended Action:', 'apex-local-seo' ) . ' ' . ( $item['action'] ?? '' ) ); ?></em>
						<small><?php echo esc_html( __( 'Estimated SEO Benefit:', 'apex-local-seo' ) . ' ' . ( $item['benefit'] ?? '' ) ); ?></small>
					</article>
				<?php endforeach; ?>
			</div>
		</section>
		<?php
	}

	/**
	 * Templates panel.
	 *
	 * @param mixed $templates Templates.
	 */
	private function templates_panel( $templates ) {
		?>
		<section class="apls-panel apls-schema-panel">
			<div class="apls-panel-head"><div><span class="apls-eyebrow"><?php esc_html_e( 'Industry Templates', 'apex-local-seo' ); ?></span><h2><?php esc_html_e( 'Intelligent schema presets', 'apex-local-seo' ); ?></h2></div></div>
			<?php $this->token_block( __( 'Templates', 'apex-local-seo' ), $templates ); ?>
		</section>
		<?php
	}

	/**
	 * Locations panel.
	 *
	 * @param mixed $locations Locations.
	 */
	private function locations_panel( $locations ) {
		?>
		<section class="apls-panel apls-schema-panel">
			<div class="apls-panel-head"><div><span class="apls-eyebrow"><?php esc_html_e( 'Location Schema', 'apex-local-seo' ); ?></span><h2><?php esc_html_e( 'Location-level schema', 'apex-local-seo' ); ?></h2></div></div>
			<div class="apls-schema-location-list">
				<?php foreach ( (array) $locations as $location ) : ?>
					<?php $this->detail_row( $location['name'] ?? __( 'Location', 'apex-local-seo' ), sprintf( '%s / %s / %d', $location['schemaSubtype'] ?? 'LocalBusiness', $location['status'] ?? __( 'Pending', 'apex-local-seo' ), absint( $location['health'] ?? 0 ) ) ); ?>
				<?php endforeach; ?>
				<?php if ( empty( $locations ) ) : ?>
					<?php $this->detail_row( __( 'Location Data', 'apex-local-seo' ), __( 'Connect Google Business Profile to import location records.', 'apex-local-seo' ) ); ?>
				<?php endif; ?>
			</div>
		</section>
		<?php
	}

	/**
	 * Plugin detection panel.
	 *
	 * @param mixed $plugins Plugins.
	 */
	private function plugin_detection_panel( $plugins ) {
		?>
		<section class="apls-panel apls-schema-panel">
			<div class="apls-panel-head"><div><span class="apls-eyebrow"><?php esc_html_e( 'Automatic Detection', 'apex-local-seo' ); ?></span><h2><?php esc_html_e( 'Plugin-aware schema extension', 'apex-local-seo' ); ?></h2></div></div>
			<div class="apls-schema-plugin-list">
				<?php foreach ( (array) $plugins as $plugin ) : ?>
					<?php $this->detail_row( ( $plugin['plugin'] ?? '' ) . ' - ' . ( $plugin['status'] ?? '' ), $plugin['extension'] ?? '' ); ?>
				<?php endforeach; ?>
				<?php if ( empty( $plugins ) ) : ?>
					<?php $this->detail_row( __( 'Plugin Detection', 'apex-local-seo' ), __( 'Pending scan', 'apex-local-seo' ) ); ?>
				<?php endif; ?>
			</div>
		</section>
		<?php
	}

	/**
	 * Detail row.
	 *
	 * @param mixed $label Label.

	 * @param mixed $value Value.
	 */
	private function detail_row( $label, $value ) {
		?>
		<div class="apls-detail-row">
			<span><?php echo esc_html( $label ); ?></span>
			<strong><?php echo esc_html( (string) $value ); ?></strong>
		</div>
		<?php
	}

	/**
	 * Token block.
	 *
	 * @param mixed $label Label.

	 * @param mixed $items Items.
	 */
	private function token_block( $label, $items ) {
		$items = array_filter( (array) $items );
		?>
		<div class="apls-schema-token-block">
			<span><?php echo esc_html( $label ); ?></span>
			<div>
				<?php if ( empty( $items ) ) : ?>
					<em><?php esc_html_e( 'No provider data yet', 'apex-local-seo' ); ?></em>
				<?php else : ?>
					<?php foreach ( $items as $item ) : ?>
						<strong><?php echo esc_html( (string) $item ); ?></strong>
					<?php endforeach; ?>
				<?php endif; ?>
			</div>
		</div>
		<?php
	}

	/**
	 * Generated json ld.
	 *
	 * @param mixed $module Module.
	 */
	private function generated_json_ld( $module ) {
		$info     = $module['businessInformation'] ?? array();
		$type     = $info['schemaSubtype'] ?? 'LocalBusiness';
		$business = array(
			'@type'           => $type,
			'@id'             => trailingslashit( (string) ( $info['website'] ?? home_url() ) ) . '#local-business',
			'name'            => $info['businessName'] ?? '',
			'url'             => $info['website'] ?? '',
			'telephone'       => $info['phone'] ?? '',
			'email'           => $info['email'] ?? '',
			'address'         => array(
				'@type'         => 'PostalAddress',
				'streetAddress' => $info['address'] ?? '',
			),
			'openingHours'    => $info['openingHours'] ?? array(),
			'areaServed'      => $info['serviceAreas'] ?? array(),
			'priceRange'      => $info['priceRange'] ?? '',
			'paymentAccepted' => $info['paymentMethods'] ?? array(),
			'logo'            => $info['logo'] ?? '',
			'sameAs'          => $info['socialProfiles'] ?? array(),
			'hasMap'          => $info['googleMapsUrl'] ?? '',
		);

		if ( ! empty( $info['latitude'] ) && ! empty( $info['longitude'] ) ) {
			$business['geo'] = array(
				'@type'     => 'GeoCoordinates',
				'latitude'  => $info['latitude'],
				'longitude' => $info['longitude'],
			);
		}

		$graph = array(
			$business,
			array(
				'@type' => 'Organization',
				'@id'   => trailingslashit( (string) ( $info['website'] ?? home_url() ) ) . '#organization',
				'name'  => $info['businessName'] ?? '',
				'url'   => $info['website'] ?? '',
				'logo'  => $info['logo'] ?? '',
			),
			array(
				'@type'           => 'WebSite',
				'@id'             => trailingslashit( (string) ( $info['website'] ?? home_url() ) ) . '#website',
				'url'             => $info['website'] ?? '',
				'name'            => $info['businessName'] ?? '',
				'potentialAction' => array(
					'@type'       => 'SearchAction',
					'target'      => trailingslashit( (string) ( $info['website'] ?? home_url() ) ) . '?s={search_term_string}',
					'query-input' => 'required name=search_term_string',
				),
			),
			array(
				'@type'           => 'BreadcrumbList',
				'itemListElement' => array(
					array(
						'@type'    => 'ListItem',
						'position' => 1,
						'name'     => 'Home',
						'item'     => $info['website'] ?? home_url(),
					),
				),
			),
		);

		return wp_json_encode(
			array(
				'@context' => 'https://schema.org',
				'@graph'   => $graph,
			),
			JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES
		);
	}

	/**
	 * Fallback module.
	 *
	 * @param mixed $data Data.
	 */
	private function fallback_module( $data ) {
		$summary = $data['summary'] ?? array();
		$profile = $data['profile']['profile'] ?? array();
		return array(
			'summary'             => array(
				'overallHealthScore'  => absint( $summary['optimizationScore'] ?? $summary['healthScore'] ?? 0 ),
				'totalSchemaTypes'    => 5,
				'validSchema'         => 0,
				'warnings'            => 0,
				'errors'              => 0,
				'richResultsEligible' => 0,
				'lastValidation'      => __( 'Pending validation', 'apex-local-seo' ),
				'advisorSchemaScore'  => absint( $summary['advisorHealthScore'] ?? 0 ),
			),
			'businessInformation' => array(
				'businessName'            => $summary['businessName'] ?? '',
				'schemaSubtype'           => 'LocalBusiness',
				'address'                 => $profile['address'] ?? '',
				'phone'                   => $profile['phone'] ?? '',
				'website'                 => $profile['website'] ?? '',
				'email'                   => '',
				'openingHours'            => array(),
				'holidayHours'            => array(),
				'latitude'                => '',
				'longitude'               => '',
				'serviceAreas'            => array(),
				'priceRange'              => '',
				'paymentMethods'          => array(),
				'logo'                    => APLS_PLUGIN_URL . 'assets/branding/apex-local-seo-icon-128.png',
				'socialProfiles'          => array(),
				'googleMapsUrl'           => '',
				'googleBusinessProfileId' => '',
			),
			'locations'           => array(),
			'schemaTypes'         => array(
				'core'          => array( 'LocalBusiness', 'Organization', 'WebSite', 'WebPage', 'BreadcrumbList' ),
				'localBusiness' => array(),
				'advanced'      => array(),
				'nested'        => array(),
			),
			'validation'          => array(
				'status'              => __( 'Pending validation', 'apex-local-seo' ),
				'warnings'            => array(),
				'errors'              => array(),
				'missingProperties'   => array(),
				'richResultsEligible' => array(),
			),
			'advisor'             => array(),
			'templates'           => array(),
			'pluginDetection'     => array(),
		);
	}
}
