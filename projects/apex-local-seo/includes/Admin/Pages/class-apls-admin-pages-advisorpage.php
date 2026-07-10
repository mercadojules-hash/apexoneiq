<?php
/**
 * Apex Local SEO plugin file.
 *
 * @package Apex_Local_SEO
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; }

/**
 * APLS Admin Pages AdvisorPage.
 */
class APLS_Admin_Pages_AdvisorPage {
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
		$module   = $data['advisorModule'] ?? $this->fallback_module( $data );
		$summary  = $module['summary'] ?? array();
		$brief    = $module['dailyBrief'] ?? array();

		APLS_Admin_Components_ApexShell::start( __( 'Executive Advisor', 'apex-local-seo' ), __( 'Executive local search advisor that transforms business signals into prioritized daily decisions.', 'apex-local-seo' ), $manager );
		?>
		<section class="apls-advisor-hero">
			<div>
				<span class="apls-provider-chip"><?php /* translators: %s is the active business profile provider name. */ echo esc_html( sprintf( __( '%s Active', 'apex-local-seo' ), $provider->label() ) ); ?></span>
				<h2><?php esc_html_e( 'Executive Advisor', 'apex-local-seo' ); ?></h2>
				<p><?php esc_html_e( 'A daily executive action plan built from Google Business Profile, reviews, schema, citations, diagnostics, performance, and local authority signals.', 'apex-local-seo' ); ?></p>
			</div>
			<div class="apls-advisor-score-card" style="<?php echo esc_attr( '--apls-score-fill:' . absint( $summary['advisorHealthScore'] ?? 0 ) . '%' ); ?>">
				<strong><?php echo esc_html( absint( $summary['advisorHealthScore'] ?? 0 ) ); ?></strong>
				<span><?php esc_html_e( 'Advisor Health Score', 'apex-local-seo' ); ?></span>
			</div>
		</section>

		<section class="apls-exec-kpi-grid apls-advisor-kpi-grid" aria-label="<?php esc_attr_e( 'Executive Advisor metrics', 'apex-local-seo' ); ?>">
			<?php foreach ( $this->kpi_cards( $summary ) as $card ) : ?>
				<?php $this->render_kpi( $card ); ?>
			<?php endforeach; ?>
		</section>

		<div class="apls-advisor-grid">
			<?php $this->daily_brief_panel( $brief ); ?>
			<?php $this->score_panel( $module['executiveScore'] ?? array() ); ?>
			<?php $this->priority_center_panel( $module['priorityCenter'] ?? array() ); ?>
			<?php $this->opportunity_engine_panel( $module['opportunityEngine'] ?? array() ); ?>
			<?php $this->cross_module_panel( $module['crossModuleIntelligence'] ?? array() ); ?>
			<?php $this->timeline_panel( $module['timeline'] ?? array() ); ?>
			<?php $this->competitor_panel( $module['competitorSummary'] ?? array() ); ?>
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
				'label' => __( 'Advisor Health Score', 'apex-local-seo' ),
				'value' => absint( $summary['advisorHealthScore'] ?? $summary['advisorHealthScore'] ?? 0 ),
				'meta'  => __( 'Composite intelligence', 'apex-local-seo' ),
				'tone'  => 'green',
			),
			array(
				'label' => __( 'Critical Issues', 'apex-local-seo' ),
				'value' => absint( $summary['criticalIssues'] ?? 0 ),
				'meta'  => __( 'Needs attention', 'apex-local-seo' ),
				'tone'  => 'amber',
			),
			array(
				'label' => __( 'Today Opportunities', 'apex-local-seo' ),
				'value' => absint( $summary['todaysOpportunities'] ?? 0 ),
				'meta'  => __( 'Actionable today', 'apex-local-seo' ),
				'tone'  => 'cyan',
			),
			array(
				'label' => __( 'Visibility Gain', 'apex-local-seo' ),
				'value' => $summary['estimatedVisibilityGain'] ?? '+0',
				'meta'  => __( 'Estimated upside', 'apex-local-seo' ),
				'tone'  => 'purple',
			),
			array(
				'label' => __( 'Completed', 'apex-local-seo' ),
				'value' => absint( $summary['completedRecommendations'] ?? 0 ),
				'meta'  => __( 'Recommendations', 'apex-local-seo' ),
				'tone'  => 'blue',
			),
			array(
				'label' => __( 'Weekly Improve', 'apex-local-seo' ),
				'value' => $summary['averageWeeklyImprovement'] ?? '+0%',
				'meta'  => __( 'Avg movement', 'apex-local-seo' ),
				'tone'  => 'green',
			),
			array(
				'label' => __( 'Authority Trend', 'apex-local-seo' ),
				'value' => $summary['overallLocalAuthorityTrend'] ?? '+0',
				'meta'  => __( 'Local authority', 'apex-local-seo' ),
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
	 * Daily brief panel.
	 *
	 * @param mixed $brief Brief.
	 */
	private function daily_brief_panel( $brief ) {
		?>
		<section class="apls-panel apls-advisor-panel apls-advisor-panel-wide">
			<div class="apls-panel-head">
				<div>
					<span class="apls-eyebrow"><?php esc_html_e( 'Executive Daily Brief', 'apex-local-seo' ); ?></span>
					<h2><?php echo esc_html( $brief['greeting'] ?? __( 'Good Morning,', 'apex-local-seo' ) ); ?> <strong><?php echo esc_html( $brief['businessName'] ?? '' ); ?></strong></h2>
				</div>
				<span class="apls-status apls-status-success"><?php echo esc_html( $brief['estimatedOpportunity'] ?? '+0' ); ?></span>
			</div>
			<div class="apls-advisor-brief-copy"><?php echo esc_html( $brief['summary'] ?? '' ); ?></div>
			<div class="apls-advisor-brief-grid">
				<?php $this->signal_list( __( 'Since Yesterday', 'apex-local-seo' ), $brief['sinceYesterday'] ?? array(), 'win' ); ?>
				<?php $this->signal_list( __( 'Needs Attention', 'apex-local-seo' ), $brief['attention'] ?? array(), 'warning' ); ?>
				<div class="apls-advisor-work-card">
					<span><?php esc_html_e( 'Today Estimated Opportunity', 'apex-local-seo' ); ?></span>
					<strong><?php echo esc_html( $brief['estimatedOpportunity'] ?? '+0 Local Visibility Points' ); ?></strong>
					<em><?php echo esc_html( __( 'Estimated work:', 'apex-local-seo' ) . ' ' . ( $brief['estimatedWork'] ?? __( 'Pending', 'apex-local-seo' ) ) ); ?></em>
				</div>
			</div>
		</section>
		<?php
	}

	/**
	 * Score panel.
	 *
	 * @param mixed $score Score.
	 */
	private function score_panel( $score ) {
		?>
		<section class="apls-panel apls-advisor-panel">
			<div class="apls-panel-head">
				<div>
					<span class="apls-eyebrow"><?php esc_html_e( 'Executive Score', 'apex-local-seo' ); ?></span>
					<h2><?php esc_html_e( 'Composite local authority model', 'apex-local-seo' ); ?></h2>
				</div>
			</div>
			<div class="apls-advisor-score-ring" style="<?php echo esc_attr( '--apls-score-fill:' . absint( $score['current'] ?? 0 ) . '%' ); ?>">
				<strong><?php echo esc_html( absint( $score['current'] ?? 0 ) ); ?></strong>
				<span><?php esc_html_e( 'Today', 'apex-local-seo' ); ?></span>
			</div>
			<div class="apls-advisor-mini-grid">
				<?php $this->mini_stat( __( '30 Days', 'apex-local-seo' ), absint( $score['trend30'] ?? 0 ), __( 'Score trend', 'apex-local-seo' ) ); ?>
				<?php $this->mini_stat( __( '90 Days', 'apex-local-seo' ), absint( $score['trend90'] ?? 0 ), __( 'Score trend', 'apex-local-seo' ) ); ?>
			</div>
			<div class="apls-advisor-score-list">
				<?php foreach ( (array) ( $score['components'] ?? array() ) as $component ) : ?>
					<?php $this->score_component( $component['label'] ?? '', absint( $component['score'] ?? 0 ) ); ?>
				<?php endforeach; ?>
			</div>
		</section>
		<?php
	}

	/**
	 * Priority center panel.
	 *
	 * @param mixed $groups Groups.
	 */
	private function priority_center_panel( $groups ) {
		?>
		<section class="apls-panel apls-advisor-panel apls-advisor-panel-full">
			<div class="apls-panel-head"><div><span class="apls-eyebrow"><?php esc_html_e( 'Priority Center', 'apex-local-seo' ); ?></span><h2><?php esc_html_e( 'Prioritized action plan', 'apex-local-seo' ); ?></h2></div></div>
			<div class="apls-advisor-priority-grid">
				<?php foreach ( array( 'critical', 'high', 'medium', 'low' ) as $priority ) : ?>
					<div class="apls-advisor-priority-column apls-priority-<?php echo esc_attr( $priority ); ?>">
						<span><?php echo esc_html( ucfirst( $priority ) ); ?></span>
						<?php foreach ( (array) ( $groups[ $priority ] ?? array() ) as $recommendation ) : ?>
							<?php $this->recommendation_card( $recommendation ); ?>
						<?php endforeach; ?>
					</div>
				<?php endforeach; ?>
			</div>
		</section>
		<?php
	}

	/**
	 * Opportunity engine panel.
	 *
	 * @param mixed $opportunities Opportunities.
	 */
	private function opportunity_engine_panel( $opportunities ) {
		?>
		<section class="apls-panel apls-advisor-panel apls-advisor-panel-wide">
			<div class="apls-panel-head"><div><span class="apls-eyebrow"><?php esc_html_e( 'Opportunity Engine', 'apex-local-seo' ); ?></span><h2><?php esc_html_e( 'Highest-impact local search work', 'apex-local-seo' ); ?></h2></div></div>
			<div class="apls-advisor-opportunity-list">
				<?php foreach ( (array) $opportunities as $item ) : ?>
					<article class="apls-advisor-opportunity-row">
						<div>
							<span><?php echo esc_html( ( $item['priority'] ?? '' ) . ' / ' . ( $item['difficulty'] ?? '' ) ); ?></span>
							<strong><?php echo esc_html( $item['title'] ?? '' ); ?></strong>
						</div>
						<em><?php echo esc_html( $item['rankingImprovement'] ?? '' ); ?></em>
						<em><?php echo esc_html( $item['visibilityImprovement'] ?? '' ); ?></em>
						<em><?php echo esc_html( $item['estimatedTime'] ?? '' ); ?></em>
					</article>
				<?php endforeach; ?>
			</div>
		</section>
		<?php
	}

	/**
	 * Cross module panel.
	 *
	 * @param mixed $modules Modules.
	 */
	private function cross_module_panel( $modules ) {
		?>
		<section class="apls-panel apls-advisor-panel">
			<div class="apls-panel-head"><div><span class="apls-eyebrow"><?php esc_html_e( 'Cross-Module Intelligence', 'apex-local-seo' ); ?></span><h2><?php esc_html_e( 'Signals feeding the advisor', 'apex-local-seo' ); ?></h2></div></div>
			<div class="apls-advisor-source-list">
				<?php foreach ( (array) $modules as $module ) : ?>
					<?php $this->detail_row( $module['module'] ?? '', sprintf( '%s / %s', $module['score'] ?? '', $module['signal'] ?? '' ) ); ?>
				<?php endforeach; ?>
			</div>
		</section>
		<?php
	}

	/**
	 * Timeline panel.
	 *
	 * @param mixed $timeline Timeline.
	 */
	private function timeline_panel( $timeline ) {
		?>
		<section class="apls-panel apls-advisor-panel apls-advisor-panel-wide">
			<div class="apls-panel-head"><div><span class="apls-eyebrow"><?php esc_html_e( 'Executive Timeline', 'apex-local-seo' ); ?></span><h2><?php esc_html_e( 'Today, this week, this month, and what changed', 'apex-local-seo' ); ?></h2></div></div>
			<div class="apls-advisor-timeline-grid">
				<?php
				foreach ( array(
					'today'     => __( 'Today', 'apex-local-seo' ),
					'week'      => __( 'This Week', 'apex-local-seo' ),
					'month'     => __( 'This Month', 'apex-local-seo' ),
					'completed' => __( 'Completed', 'apex-local-seo' ),
					'upcoming'  => __( 'Upcoming', 'apex-local-seo' ),
					'missed'    => __( 'Missed Opportunities', 'apex-local-seo' ),
					'wins'      => __( 'Recent Wins', 'apex-local-seo' ),
				) as $key => $label ) :
					?>
																			<?php $this->token_block( $label, $timeline[ $key ] ?? array() ); ?>
				<?php endforeach; ?>
			</div>
		</section>
		<?php
	}

	/**
	 * Competitor panel.
	 *
	 * @param mixed $summary Summary.
	 */
	private function competitor_panel( $summary ) {
		?>
		<section class="apls-panel apls-advisor-panel">
			<div class="apls-panel-head"><div><span class="apls-eyebrow"><?php esc_html_e( 'Competitor Intelligence Summary', 'apex-local-seo' ); ?></span><h2><?php esc_html_e( 'Competitive movement to watch', 'apex-local-seo' ); ?></h2></div></div>
			<div class="apls-advisor-competitor-list">
				<?php foreach ( (array) $summary as $competitor ) : ?>
					<article>
						<span><?php echo esc_html( $competitor['name'] ?? '' ); ?></span>
						<strong><?php echo esc_html( $competitor['movement'] ?? '' ); ?></strong>
						<p><?php echo esc_html( $competitor['impact'] ?? '' ); ?></p>
					</article>
				<?php endforeach; ?>
			</div>
		</section>
		<?php
	}

	/**
	 * Recommendation card.
	 *
	 * @param mixed $recommendation Recommendation.
	 */
	private function recommendation_card( $recommendation ) {
		?>
		<article class="apls-advisor-recommendation-card">
			<strong><?php echo esc_html( $recommendation['title'] ?? '' ); ?></strong>
			<?php
			foreach ( array(
				'problem'           => __( 'Problem', 'apex-local-seo' ),
				'reason'            => __( 'Reason', 'apex-local-seo' ),
				'businessImpact'    => __( 'Business Impact', 'apex-local-seo' ),
				'seoImpact'         => __( 'SEO Impact', 'apex-local-seo' ),
				'recommendedAction' => __( 'Recommended Action', 'apex-local-seo' ),
			) as $key => $label ) :
				?>
				<p><b><?php echo esc_html( $label ); ?>:</b> <?php echo esc_html( $recommendation[ $key ] ?? '' ); ?></p>
			<?php endforeach; ?>
			<div>
				<em><?php echo esc_html( __( 'Gain:', 'apex-local-seo' ) . ' ' . ( $recommendation['estimatedVisibilityGain'] ?? '' ) ); ?></em>
				<em><?php echo esc_html( __( 'Time:', 'apex-local-seo' ) . ' ' . ( $recommendation['estimatedTime'] ?? '' ) ); ?></em>
			</div>
			<button type="button"><?php echo esc_html( $recommendation['actionButton'] ?? __( 'Review Action', 'apex-local-seo' ) ); ?></button>
		</article>
		<?php
	}

	/**
	 * Score component.
	 *
	 * @param mixed $label Label.

	 * @param mixed $score Score.
	 */
	private function score_component( $label, $score ) {
		?>
		<div class="apls-advisor-score-component" style="<?php echo esc_attr( '--apls-meter:' . $score . '%' ); ?>">
			<div><span><?php echo esc_html( $label ); ?></span><strong><?php echo esc_html( $score ); ?></strong></div>
			<i></i>
		</div>
		<?php
	}

	/**
	 * Signal list.
	 *
	 * @param mixed $label Label.

	 * @param mixed $items Items.

	 * @param mixed $tone Tone.
	 */
	private function signal_list( $label, $items, $tone ) {
		?>
		<div class="apls-advisor-signal-list apls-advisor-signal-<?php echo esc_attr( $tone ); ?>">
			<span><?php echo esc_html( $label ); ?></span>
			<?php foreach ( (array) $items as $item ) : ?>
				<strong><?php echo esc_html( (string) $item ); ?></strong>
			<?php endforeach; ?>
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
		<div class="apls-advisor-token-block">
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
		$summary         = $data['summary'] ?? array();
		$recommendations = array();
		foreach ( (array) ( $data['recommendations'] ?? array() ) as $item ) {
			$recommendations[] = array(
				'title'                   => $item['title'] ?? __( 'Review local SEO recommendation', 'apex-local-seo' ),
				'problem'                 => $item['reason'] ?? __( 'Provider recommendation needs review.', 'apex-local-seo' ),
				'reason'                  => $item['reason'] ?? '',
				'businessImpact'          => __( 'Improves local visibility confidence.', 'apex-local-seo' ),
				'seoImpact'               => $item['impact'] ?? '+0',
				'estimatedVisibilityGain' => $item['impact'] ?? '+0',
				'estimatedTime'           => __( '10 minutes', 'apex-local-seo' ),
				'recommendedAction'       => $item['title'] ?? '',
				'actionButton'            => __( 'Plan Action', 'apex-local-seo' ),
			);
		}

		return array(
			'summary'                 => array(
				'advisorHealthScore'         => absint( $summary['advisorHealthScore'] ?? 0 ),
				'criticalIssues'             => 0,
				'todaysOpportunities'        => count( $recommendations ),
				'estimatedVisibilityGain'    => '+0',
				'completedRecommendations'   => 0,
				'averageWeeklyImprovement'   => '+0%',
				'overallLocalAuthorityTrend' => '+0',
			),
			'dailyBrief'              => array(
				'greeting'             => __( 'Good Morning,', 'apex-local-seo' ),
				'businessName'         => $summary['businessName'] ?? '',
				'summary'              => __( 'Executive Advisor will populate as business intelligence expands.', 'apex-local-seo' ),
				'sinceYesterday'       => array(),
				'attention'            => array(),
				'estimatedOpportunity' => '+0',
				'estimatedWork'        => __( 'Pending', 'apex-local-seo' ),
			),
			'priorityCenter'          => array(
				'critical' => array(),
				'high'     => $recommendations,
				'medium'   => array(),
				'low'      => array(),
			),
			'opportunityEngine'       => array(),
			'crossModuleIntelligence' => array(),
			'timeline'                => array(),
			'competitorSummary'       => array(),
			'executiveScore'          => array(
				'current'    => absint( $summary['advisorHealthScore'] ?? 0 ),
				'trend30'    => 0,
				'trend90'    => 0,
				'components' => array(),
			),
		);
	}
}
