<?php
/**
 * Apex Local SEO plugin file.
 *
 * @package Apex_Local_SEO
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; }

/**
 * APLS Admin Pages CitationsPage.
 */
class APLS_Admin_Pages_CitationsPage {
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
		$module   = $data['citationModule'] ?? $this->fallback_module( $data );
		$summary  = $module['summary'] ?? array();

		APLS_Admin_Components_ApexShell::start( __( 'Citation Intelligence', 'apex-local-seo' ), __( 'Local citation analysis, NAP consistency, authority coverage, and consultant-grade recommendations.', 'apex-local-seo' ), $manager );
		?>
		<section class="apls-citations-hero">
			<div>
				<span class="apls-provider-chip"><?php /* translators: %s is the active business profile provider name. */ echo esc_html( sprintf( __( '%s Active', 'apex-local-seo' ), $provider->label() ) ); ?></span>
				<h2><?php esc_html_e( 'Citation Intelligence Center', 'apex-local-seo' ); ?></h2>
				<p><?php esc_html_e( 'Understand which citation issues matter, why they affect local trust signals, and which fixes are most likely to improve visibility.', 'apex-local-seo' ); ?></p>
			</div>
			<div class="apls-citation-score-card" style="<?php echo esc_attr( '--apls-score-fill:' . absint( $summary['citationHealthScore'] ?? 0 ) . '%' ); ?>">
				<strong><?php echo esc_html( absint( $summary['citationHealthScore'] ?? 0 ) ); ?></strong>
				<span><?php esc_html_e( 'Citation Health', 'apex-local-seo' ); ?></span>
			</div>
		</section>

		<section class="apls-exec-kpi-grid apls-citations-kpi-grid" aria-label="<?php esc_attr_e( 'Citation executive metrics', 'apex-local-seo' ); ?>">
			<?php foreach ( $this->kpi_cards( $summary ) as $card ) : ?>
				<?php $this->render_kpi( $card ); ?>
			<?php endforeach; ?>
		</section>

		<div class="apls-citations-grid">
			<?php $this->executive_summary_panel( $module['executiveSummary'] ?? array() ); ?>
			<?php $this->nap_panel( $module['napConsistency'] ?? array() ); ?>
			<?php $this->advisor_panel( $module['advisor'] ?? array() ); ?>
			<?php $this->directory_panel( $module['directories'] ?? array() ); ?>
			<?php $this->opportunities_panel( $module['opportunities'] ?? array() ); ?>
			<?php $this->categories_panel( $module['categories'] ?? array(), $module['opportunityScore'] ?? array() ); ?>
			<?php $this->competitor_panel( $module['competitorComparison'] ?? array() ); ?>
			<?php $this->visualizations_panel( $module['visualizations'] ?? array() ); ?>
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
				'label' => __( 'Health Score', 'apex-local-seo' ),
				'value' => absint( $summary['citationHealthScore'] ?? 0 ),
				'meta'  => __( 'Citation health', 'apex-local-seo' ),
				'tone'  => 'green',
			),
			array(
				'label' => __( 'Total Citations', 'apex-local-seo' ),
				'value' => number_format_i18n( absint( $summary['totalCitations'] ?? 0 ) ),
				'meta'  => __( 'Indexed listings', 'apex-local-seo' ),
				'tone'  => 'cyan',
			),
			array(
				'label' => __( 'Consistent', 'apex-local-seo' ),
				'value' => number_format_i18n( absint( $summary['consistentCitations'] ?? 0 ) ),
				'meta'  => __( 'NAP matched', 'apex-local-seo' ),
				'tone'  => 'blue',
			),
			array(
				'label' => __( 'Inconsistent', 'apex-local-seo' ),
				'value' => number_format_i18n( absint( $summary['inconsistentCitations'] ?? 0 ) ),
				'meta'  => __( 'Needs correction', 'apex-local-seo' ),
				'tone'  => 'amber',
			),
			array(
				'label' => __( 'Missing', 'apex-local-seo' ),
				'value' => number_format_i18n( absint( $summary['missingCitations'] ?? 0 ) ),
				'meta'  => __( 'Opportunity gap', 'apex-local-seo' ),
				'tone'  => 'purple',
			),
			array(
				'label' => __( 'Duplicates', 'apex-local-seo' ),
				'value' => number_format_i18n( absint( $summary['duplicateListings'] ?? 0 ) ),
				'meta'  => __( 'Trust risk', 'apex-local-seo' ),
				'tone'  => 'amber',
			),
			array(
				'label' => __( 'Authority Score', 'apex-local-seo' ),
				'value' => absint( $summary['localAuthorityScore'] ?? 0 ),
				'meta'  => __( 'Local authority', 'apex-local-seo' ),
				'tone'  => 'green',
			),
			array(
				'label' => __( 'Visibility Impact', 'apex-local-seo' ),
				'value' => $summary['estimatedVisibilityImpact'] ?? '0%',
				'meta'  => __( 'Estimated upside', 'apex-local-seo' ),
				'tone'  => 'cyan',
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
	 * Executive summary panel.
	 *
	 * @param mixed $summary Summary.
	 */
	private function executive_summary_panel( $summary ) {
		?>
		<section class="apls-panel apls-citations-panel apls-citations-panel-wide">
			<div class="apls-panel-head">
				<div>
					<span class="apls-eyebrow"><?php esc_html_e( 'Executive Summary', 'apex-local-seo' ); ?></span>
					<h2><?php esc_html_e( 'Citation visibility briefing', 'apex-local-seo' ); ?></h2>
				</div>
				<span class="apls-status apls-status-warning"><?php echo esc_html( $summary['priority'] ?? __( 'Priority Pending', 'apex-local-seo' ) ); ?></span>
			</div>
			<div class="apls-citation-summary-copy"><?php echo esc_html( $summary['briefing'] ?? __( 'Citation intelligence will populate as provider data expands.', 'apex-local-seo' ) ); ?></div>
			<div class="apls-citation-summary-grid">
				<?php $this->mini_stat( __( 'Consistency', 'apex-local-seo' ), $summary['consistency'] ?? '0%', __( 'NAP confidence', 'apex-local-seo' ) ); ?>
				<?php $this->mini_stat( __( 'High-Authority Issues', 'apex-local-seo' ), absint( $summary['highAuthorityIssues'] ?? 0 ), __( 'Fix first', 'apex-local-seo' ) ); ?>
				<?php $this->mini_stat( __( 'Missing Directories', 'apex-local-seo' ), absint( $summary['missingImportantDirectories'] ?? 0 ), __( 'Priority gaps', 'apex-local-seo' ) ); ?>
				<?php $this->mini_stat( __( 'Estimated Lift', 'apex-local-seo' ), $summary['estimatedLift'] ?? '+0%', __( 'Local visibility', 'apex-local-seo' ) ); ?>
			</div>
		</section>
		<?php
	}

	/**
	 * Nap panel.
	 *
	 * @param mixed $nap Nap.
	 */
	private function nap_panel( $nap ) {
		?>
		<section class="apls-panel apls-citations-panel">
			<div class="apls-panel-head">
				<div>
					<span class="apls-eyebrow"><?php esc_html_e( 'NAP Consistency', 'apex-local-seo' ); ?></span>
					<h2><?php esc_html_e( 'Business data trust signals', 'apex-local-seo' ); ?></h2>
				</div>
				<span class="apls-status apls-status-success"><?php echo esc_html( absint( $nap['overall'] ?? 0 ) . '%' ); ?></span>
			</div>
			<div class="apls-citation-meter" style="<?php echo esc_attr( '--apls-meter:' . absint( $nap['overall'] ?? 0 ) . '%' ); ?>"><span></span></div>
			<?php $this->consistency_row( __( 'Business Name', 'apex-local-seo' ), $nap['businessName'] ?? array() ); ?>
			<?php $this->consistency_row( __( 'Address', 'apex-local-seo' ), $nap['address'] ?? array() ); ?>
			<?php $this->consistency_row( __( 'Phone Number', 'apex-local-seo' ), $nap['phone'] ?? array() ); ?>
			<?php $this->consistency_row( __( 'Website', 'apex-local-seo' ), $nap['website'] ?? array() ); ?>
			<?php $this->consistency_row( __( 'Categories', 'apex-local-seo' ), $nap['categories'] ?? array() ); ?>
			<?php $this->consistency_row( __( 'Hours', 'apex-local-seo' ), $nap['hours'] ?? array() ); ?>
			<?php $this->token_block( __( 'Highlighted Mismatches', 'apex-local-seo' ), $nap['mismatches'] ?? array() ); ?>
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
		<section class="apls-panel apls-citations-panel apls-citations-panel-wide">
			<div class="apls-panel-head"><div><span class="apls-eyebrow"><?php esc_html_e( 'Citation Advisor', 'apex-local-seo' ); ?></span><h2><?php esc_html_e( 'Consultant-grade issue guidance', 'apex-local-seo' ); ?></h2></div></div>
			<div class="apls-citation-advisor-list">
				<?php foreach ( (array) $advisor as $item ) : ?>
					<article class="apls-citation-advisor-row apls-priority-<?php echo esc_attr( strtolower( $item['priority'] ?? 'normal' ) ); ?>">
						<span><?php echo esc_html( ( $item['directory'] ?? __( 'Directory', 'apex-local-seo' ) ) . ' - ' . ( $item['priority'] ?? '' ) ); ?></span>
						<strong><?php echo esc_html( $item['issue'] ?? '' ); ?></strong>
						<p><b><?php esc_html_e( 'Potential Impact:', 'apex-local-seo' ); ?></b> <?php echo esc_html( $item['potentialImpact'] ?? '' ); ?></p>
						<p><b><?php esc_html_e( 'Recommended Action:', 'apex-local-seo' ); ?></b> <?php echo esc_html( $item['recommendedAction'] ?? '' ); ?></p>
						<div>
							<em><?php echo esc_html( __( 'Estimated Visibility Impact:', 'apex-local-seo' ) . ' ' . ( $item['estimatedVisibilityImpact'] ?? '' ) ); ?></em>
							<em><?php echo esc_html( __( 'Estimated Benefit:', 'apex-local-seo' ) . ' ' . ( $item['estimatedBenefit'] ?? '' ) ); ?></em>
						</div>
					</article>
				<?php endforeach; ?>
			</div>
		</section>
		<?php
	}

	/**
	 * Directory panel.
	 *
	 * @param mixed $directories Directories.
	 */
	private function directory_panel( $directories ) {
		?>
		<section class="apls-panel apls-citations-panel apls-citations-directory-panel">
			<div class="apls-panel-head">
				<div><span class="apls-eyebrow"><?php esc_html_e( 'Citation Intelligence Center', 'apex-local-seo' ); ?></span><h2><?php esc_html_e( 'Directory trust and impact analysis', 'apex-local-seo' ); ?></h2></div>
				<span class="apls-status apls-status-neutral"><?php echo esc_html( count( (array) $directories ) . ' directories' ); ?></span>
			</div>
			<div class="apls-citation-table">
				<div class="apls-citation-table-head">
					<span><?php esc_html_e( 'Directory', 'apex-local-seo' ); ?></span>
					<span><?php esc_html_e( 'Status', 'apex-local-seo' ); ?></span>
					<span><?php esc_html_e( 'Authority', 'apex-local-seo' ); ?></span>
					<span><?php esc_html_e( 'Accuracy', 'apex-local-seo' ); ?></span>
					<span><?php esc_html_e( 'Trust', 'apex-local-seo' ); ?></span>
					<span><?php esc_html_e( 'Updated', 'apex-local-seo' ); ?></span>
					<span><?php esc_html_e( 'Advisor Priority', 'apex-local-seo' ); ?></span>
					<span><?php esc_html_e( 'SEO Impact', 'apex-local-seo' ); ?></span>
				</div>
				<?php foreach ( (array) $directories as $directory ) : ?>
					<div class="apls-citation-table-row apls-citation-status-<?php echo esc_attr( sanitize_html_class( strtolower( $directory['status'] ?? 'unknown' ) ) ); ?>">
						<strong><?php echo esc_html( $directory['directory'] ?? '' ); ?></strong>
						<span><?php echo esc_html( $directory['status'] ?? '' ); ?></span>
						<span><?php echo esc_html( absint( $directory['authority'] ?? 0 ) ); ?></span>
						<span><?php echo esc_html( absint( $directory['accuracy'] ?? 0 ) . '%' ); ?></span>
						<span><?php echo esc_html( absint( $directory['trustScore'] ?? 0 ) ); ?></span>
						<span><?php echo esc_html( $directory['lastUpdated'] ?? '' ); ?></span>
						<span><?php echo esc_html( $directory['advisorPriority'] ?? $directory['advisorPriority'] ?? '' ); ?></span>
						<span><?php echo esc_html( $directory['estimatedSeoImpact'] ?? '' ); ?></span>
					</div>
				<?php endforeach; ?>
			</div>
		</section>
		<?php
	}

	/**
	 * Opportunities panel.
	 *
	 * @param mixed $opportunities Opportunities.
	 */
	private function opportunities_panel( $opportunities ) {
		?>
		<section class="apls-panel apls-citations-panel">
			<div class="apls-panel-head"><div><span class="apls-eyebrow"><?php esc_html_e( 'Citation Opportunities', 'apex-local-seo' ); ?></span><h2><?php esc_html_e( 'Missing high-value coverage', 'apex-local-seo' ); ?></h2></div></div>
			<?php $this->opportunity_group( __( 'High Authority', 'apex-local-seo' ), $opportunities['highAuthority'] ?? array() ); ?>
			<?php $this->opportunity_group( __( 'Industry Specific', 'apex-local-seo' ), $opportunities['industrySpecific'] ?? array() ); ?>
			<?php $this->opportunity_group( __( 'Location Specific', 'apex-local-seo' ), $opportunities['locationSpecific'] ?? array() ); ?>
		</section>
		<?php
	}

	/**
	 * Categories panel.
	 *
	 * @param mixed $categories Categories.

	 * @param mixed $score Score.
	 */
	private function categories_panel( $categories, $score ) {
		?>
		<section class="apls-panel apls-citations-panel">
			<div class="apls-panel-head">
				<div><span class="apls-eyebrow"><?php esc_html_e( 'Citation Categories', 'apex-local-seo' ); ?></span><h2><?php esc_html_e( 'Coverage by market type', 'apex-local-seo' ); ?></h2></div>
				<span class="apls-status apls-status-success"><?php echo esc_html( absint( $score['score'] ?? 0 ) . ' ROI' ); ?></span>
			</div>
			<div class="apls-citation-category-list">
				<?php foreach ( (array) $categories as $category ) : ?>
					<?php $this->detail_row( $category['name'] ?? '', sprintf( '%d%% coverage / %s', absint( $category['coverage'] ?? 0 ), $category['priority'] ?? '' ) ); ?>
				<?php endforeach; ?>
			</div>
			<?php $this->token_block( __( 'Highest ROI Fixes', 'apex-local-seo' ), $score['highestRoiFixes'] ?? array() ); ?>
		</section>
		<?php
	}

	/**
	 * Competitor panel.
	 *
	 * @param mixed $comparison Comparison.
	 */
	private function competitor_panel( $comparison ) {
		?>
		<section class="apls-panel apls-citations-panel">
			<div class="apls-panel-head"><div><span class="apls-eyebrow"><?php esc_html_e( 'Competitor Citation Comparison', 'apex-local-seo' ); ?></span><h2><?php esc_html_e( 'Coverage gap analysis', 'apex-local-seo' ); ?></h2></div></div>
			<div class="apls-citation-competitor-grid">
				<?php $this->mini_stat( __( 'Your Citations', 'apex-local-seo' ), absint( $comparison['yourCitations'] ?? 0 ), __( 'Current index', 'apex-local-seo' ) ); ?>
				<?php $this->mini_stat( __( 'Competitor Avg', 'apex-local-seo' ), absint( $comparison['competitorCitations'] ?? 0 ), __( 'Tracked rivals', 'apex-local-seo' ) ); ?>
				<?php $this->mini_stat( __( 'Authority Gap', 'apex-local-seo' ), $comparison['authorityGap'] ?? '0', __( 'Relative score', 'apex-local-seo' ) ); ?>
				<?php $this->mini_stat( __( 'Coverage Gap', 'apex-local-seo' ), $comparison['coverageGap'] ?? '0', __( 'Missing listings', 'apex-local-seo' ) ); ?>
			</div>
			<?php $this->token_block( __( 'Missing Opportunities', 'apex-local-seo' ), $comparison['missingOpportunities'] ?? array() ); ?>
		</section>
		<?php
	}

	/**
	 * Visualizations panel.
	 *
	 * @param mixed $charts Charts.
	 */
	private function visualizations_panel( $charts ) {
		?>
		<section class="apls-panel apls-citations-panel apls-citations-panel-wide">
			<div class="apls-panel-head"><div><span class="apls-eyebrow"><?php esc_html_e( 'Visualizations', 'apex-local-seo' ); ?></span><h2><?php esc_html_e( 'Citation growth, consistency, authority, and coverage', 'apex-local-seo' ); ?></h2></div></div>
			<div class="apls-citation-chart-grid">
				<?php $this->chart( __( 'Citation Growth', 'apex-local-seo' ), $charts['citationGrowth'] ?? array() ); ?>
				<?php $this->chart( __( 'Consistency Trend', 'apex-local-seo' ), $charts['consistencyTrend'] ?? array() ); ?>
				<?php $this->chart( __( 'Authority Trend', 'apex-local-seo' ), $charts['authorityTrend'] ?? array() ); ?>
				<?php $this->chart( __( 'Directory Distribution', 'apex-local-seo' ), $charts['directoryDistribution'] ?? array() ); ?>
				<?php $this->chart( __( 'Industry Coverage', 'apex-local-seo' ), $charts['industryCoverage'] ?? array() ); ?>
			</div>
		</section>
		<?php
	}

	/**
	 * Consistency row.
	 *
	 * @param mixed $label Label.

	 * @param mixed $item Item.
	 */
	private function consistency_row( $label, $item ) {
		$score = absint( $item['score'] ?? 0 );
		?>
		<div class="apls-citation-consistency-row">
			<div><span><?php echo esc_html( $label ); ?></span><strong><?php echo esc_html( $score . '%' ); ?></strong></div>
			<p><?php echo esc_html( $item['note'] ?? '' ); ?></p>
		</div>
		<?php
	}

	/**
	 * Opportunity group.
	 *
	 * @param mixed $label Label.

	 * @param mixed $items Items.
	 */
	private function opportunity_group( $label, $items ) {
		?>
		<div class="apls-citation-opportunity-group">
			<span><?php echo esc_html( $label ); ?></span>
			<?php foreach ( (array) $items as $item ) : ?>
				<div>
					<strong><?php echo esc_html( $item['directory'] ?? '' ); ?></strong>
					<em><?php echo esc_html( $item['estimatedBenefit'] ?? '' ); ?></em>
				</div>
			<?php endforeach; ?>
		</div>
		<?php
	}

	/**
	 * Chart.
	 *
	 * @param mixed $label Label.

	 * @param mixed $values Values.
	 */
	private function chart( $label, $values ) {
		$values = (array) $values;
		$max    = max( 1, max( array_map( 'absint', $values ? $values : array( 1 ) ) ) );
		?>
		<div class="apls-citation-chart">
			<span><?php echo esc_html( $label ); ?></span>
			<div>
				<?php foreach ( $values as $value ) : ?>
					<i style="<?php echo esc_attr( '--apls-bar:' . max( 10, min( 100, ( absint( $value ) / $max ) * 100 ) ) . '%' ); ?>"></i>
				<?php endforeach; ?>
			</div>
		</div>
		<?php
	}

	/**
	 * Mini stat.
	 *
	 * @param mixed $label Label.

	 * @param mixed $value Value.

	 * @param mixed $meta Meta.
	 */
	private function mini_stat( $label, $value, $meta ) {
		?>
		<div class="apls-mini-stat">
			<span><?php echo esc_html( $label ); ?></span>
			<strong><?php echo esc_html( $value ); ?></strong>
			<em><?php echo esc_html( $meta ); ?></em>
		</div>
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
		<div class="apls-citation-token-block">
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
	 * Fallback module.
	 *
	 * @param mixed $data Data.
	 */
	private function fallback_module( $data ) {
		$summary   = $data['summary'] ?? array();
		$citations = $data['citations'] ?? array();

		return array(
			'summary'              => array(
				'citationHealthScore'       => absint( $citations['score'] ?? $summary['citationScore'] ?? 0 ),
				'totalCitations'            => absint( $citations['consistent'] ?? 0 ) + absint( $citations['missing'] ?? 0 ) + absint( $citations['inconsistent'] ?? 0 ),
				'consistentCitations'       => absint( $citations['consistent'] ?? 0 ),
				'inconsistentCitations'     => absint( $citations['inconsistent'] ?? 0 ),
				'missingCitations'          => absint( $citations['missing'] ?? 0 ),
				'duplicateListings'         => 0,
				'localAuthorityScore'       => absint( $summary['visibilityScore'] ?? 0 ),
				'estimatedVisibilityImpact' => '+0%',
			),
			'executiveSummary'     => array(
				'briefing'                    => __( 'Citation intelligence will populate as provider data expands.', 'apex-local-seo' ),
				'priority'                    => __( 'Pending', 'apex-local-seo' ),
				'consistency'                 => absint( $citations['score'] ?? 0 ) . '%',
				'highAuthorityIssues'         => 0,
				'missingImportantDirectories' => absint( $citations['missing'] ?? 0 ),
				'estimatedLift'               => '+0%',
			),
			'napConsistency'       => array(
				'overall'      => absint( $citations['score'] ?? 0 ),
				'businessName' => array(),
				'address'      => array(),
				'phone'        => array(),
				'website'      => array(),
				'categories'   => array(),
				'hours'        => array(),
				'mismatches'   => array(),
			),
			'advisor'              => array(),
			'directories'          => array(),
			'opportunities'        => array(),
			'categories'           => array(),
			'opportunityScore'     => array(
				'score'           => 0,
				'highestRoiFixes' => array(),
			),
			'competitorComparison' => array(),
			'visualizations'       => array(),
		);
	}
}
