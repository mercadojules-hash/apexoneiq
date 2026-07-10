<?php
/**
 * Apex Local SEO plugin file.
 *
 * @package Apex_Local_SEO
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; }

/**
 * APLS Admin Pages ReviewsPage.
 */
class APLS_Admin_Pages_ReviewsPage {
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
		$module   = $data['reviewModule'] ?? $this->fallback_module( $data );
		$summary  = $module['summary'] ?? array();

		APLS_Admin_Components_ApexShell::start( __( 'Reviews Intelligence', 'apex-local-seo' ), __( 'Reputation intelligence, review inbox, sentiment analytics, and reply operations.', 'apex-local-seo' ), $manager );
		?>
		<section class="apls-reviews-hero">
			<div>
				<span class="apls-provider-chip"><?php /* translators: %s is the active business profile provider name. */ echo esc_html( sprintf( __( '%s Active', 'apex-local-seo' ), $provider->label() ) ); ?></span>
				<h2><?php esc_html_e( 'Reviews Intelligence Command Center', 'apex-local-seo' ); ?></h2>
				<p><?php esc_html_e( 'Monitor review velocity, sentiment, response operations, and reply workflows through the active Business Profile data source.', 'apex-local-seo' ); ?></p>
			</div>
			<div class="apls-reputation-gauge" style="<?php echo esc_attr( '--apls-score-fill:' . absint( $module['reputation']['currentScore'] ?? 0 ) . '%' ); ?>">
				<strong><?php echo esc_html( absint( $module['reputation']['currentScore'] ?? 0 ) ); ?></strong>
				<span><?php esc_html_e( 'Reputation Score', 'apex-local-seo' ); ?></span>
			</div>
		</section>

		<section class="apls-exec-kpi-grid apls-reviews-kpi-grid" aria-label="<?php esc_attr_e( 'Review executive metrics', 'apex-local-seo' ); ?>">
			<?php foreach ( $this->kpi_cards( $summary ) as $card ) : ?>
				<?php $this->render_kpi( $card ); ?>
			<?php endforeach; ?>
		</section>

		<section class="apls-review-filters" aria-label="<?php esc_attr_e( 'Review filters', 'apex-local-seo' ); ?>">
			<?php foreach ( (array) ( $module['filters'] ?? array() ) as $index => $filter ) : ?>
				<span class="<?php echo 0 === $index ? 'is-active' : ''; ?>"><?php echo esc_html( $filter ); ?></span>
			<?php endforeach; ?>
		</section>

		<div class="apls-reviews-grid">
			<?php $this->intelligence_panel( $module['intelligence'] ?? array() ); ?>
			<?php $this->reputation_panel( $module['reputation'] ?? array() ); ?>
			<?php $this->sentiment_panel( $module['sentiment'] ?? array() ); ?>
			<?php $this->analytics_panel( $module['analytics'] ?? array() ); ?>
			<?php $this->review_feed_panel( $module['feed'] ?? array(), $module['replyAssistant'] ?? array() ); ?>
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
				'label' => __( 'Overall Rating', 'apex-local-seo' ),
				'value' => number_format_i18n( (float) ( $summary['overallRating'] ?? 0 ), 1 ),
				'meta'  => __( 'Google average', 'apex-local-seo' ),
				'tone'  => 'green',
			),
			array(
				'label' => __( 'Total Reviews', 'apex-local-seo' ),
				'value' => number_format_i18n( absint( $summary['totalReviews'] ?? 0 ) ),
				'meta'  => __( 'Lifetime volume', 'apex-local-seo' ),
				'tone'  => 'cyan',
			),
			array(
				'label' => __( 'New Reviews', 'apex-local-seo' ),
				'value' => number_format_i18n( absint( $summary['newReviews30'] ?? 0 ) ),
				'meta'  => __( 'Last 30 days', 'apex-local-seo' ),
				'tone'  => 'purple',
			),
			array(
				'label' => __( 'Rating Trend', 'apex-local-seo' ),
				'value' => $summary['averageRatingTrend'] ?? '0',
				'meta'  => __( 'Average movement', 'apex-local-seo' ),
				'tone'  => 'amber',
			),
			array(
				'label' => __( 'Response Rate', 'apex-local-seo' ),
				'value' => absint( $summary['responseRate'] ?? 0 ) . '%',
				'meta'  => __( 'Owner replies', 'apex-local-seo' ),
				'tone'  => 'blue',
			),
			array(
				'label' => __( 'Avg Response Time', 'apex-local-seo' ),
				'value' => $summary['averageResponseTime'] ?? __( 'Pending', 'apex-local-seo' ),
				'meta'  => __( 'Reply speed', 'apex-local-seo' ),
				'tone'  => 'green',
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
	 * Intelligence panel.
	 *
	 * @param mixed $intelligence Intelligence.
	 */
	private function intelligence_panel( $intelligence ) {
		?>
		<section class="apls-panel apls-reviews-panel apls-reviews-panel-wide">
			<div class="apls-panel-head">
				<div>
					<span class="apls-eyebrow"><?php esc_html_e( 'Review Intelligence', 'apex-local-seo' ); ?></span>
					<h2><?php esc_html_e( 'Executive reputation summary', 'apex-local-seo' ); ?></h2>
				</div>
				<span class="apls-status apls-status-success"><?php echo esc_html( absint( $intelligence['reputationScore'] ?? 0 ) . '%' ); ?></span>
			</div>
			<div class="apls-review-summary-copy"><?php echo esc_html( $intelligence['executiveSummary'] ?? '' ); ?></div>
			<div class="apls-review-intelligence-grid">
				<?php $this->token_block( __( 'Positive Review Trends', 'apex-local-seo' ), $intelligence['positiveTrends'] ?? array() ); ?>
				<?php $this->token_block( __( 'Negative Review Alerts', 'apex-local-seo' ), $intelligence['negativeAlerts'] ?? array() ); ?>
				<?php $this->token_block( __( 'Recommended Actions', 'apex-local-seo' ), $intelligence['recommendedActions'] ?? array() ); ?>
			</div>
		</section>
		<?php
	}

	/**
	 * Reputation panel.
	 *
	 * @param mixed $reputation Reputation.
	 */
	private function reputation_panel( $reputation ) {
		?>
		<section class="apls-panel apls-reviews-panel">
			<div class="apls-panel-head">
				<div>
					<span class="apls-eyebrow"><?php esc_html_e( 'Reputation Score', 'apex-local-seo' ); ?></span>
					<h2><?php esc_html_e( 'Benchmark and opportunity', 'apex-local-seo' ); ?></h2>
				</div>
			</div>
			<div class="apls-reputation-ring" style="<?php echo esc_attr( '--apls-score-fill:' . absint( $reputation['currentScore'] ?? 0 ) . '%' ); ?>">
				<strong><?php echo esc_html( absint( $reputation['currentScore'] ?? 0 ) ); ?></strong>
				<span><?php esc_html_e( 'Current', 'apex-local-seo' ); ?></span>
			</div>
			<div class="apls-gbp-metric-grid">
				<?php $this->mini_stat( __( 'Previous', 'apex-local-seo' ), absint( $reputation['previousScore'] ?? 0 ), __( 'Last period', 'apex-local-seo' ) ); ?>
				<?php $this->mini_stat( __( 'Trend', 'apex-local-seo' ), $reputation['trend'] ?? '0', __( 'Movement', 'apex-local-seo' ) ); ?>
				<?php $this->mini_stat( __( 'Benchmark', 'apex-local-seo' ), absint( $reputation['industryBenchmark'] ?? 0 ), __( 'Industry', 'apex-local-seo' ) ); ?>
			</div>
			<?php $this->token_block( __( 'Improvement Opportunities', 'apex-local-seo' ), $reputation['opportunities'] ?? array() ); ?>
		</section>
		<?php
	}

	/**
	 * Sentiment panel.
	 *
	 * @param mixed $sentiment Sentiment.
	 */
	private function sentiment_panel( $sentiment ) {
		$trend = (array) ( $sentiment['trend'] ?? array() );
		?>
		<section class="apls-panel apls-reviews-panel">
			<div class="apls-panel-head">
				<div>
					<span class="apls-eyebrow"><?php esc_html_e( 'Sentiment Analysis', 'apex-local-seo' ); ?></span>
					<h2><?php esc_html_e( 'Positive, neutral, negative', 'apex-local-seo' ); ?></h2>
				</div>
			</div>
			<div class="apls-gbp-metric-grid">
				<?php $this->mini_stat( __( 'Positive', 'apex-local-seo' ), absint( $sentiment['positive'] ?? 0 ), __( 'Reviews', 'apex-local-seo' ) ); ?>
				<?php $this->mini_stat( __( 'Neutral', 'apex-local-seo' ), absint( $sentiment['neutral'] ?? 0 ), __( 'Reviews', 'apex-local-seo' ) ); ?>
				<?php $this->mini_stat( __( 'Negative', 'apex-local-seo' ), absint( $sentiment['negative'] ?? 0 ), __( 'Reviews', 'apex-local-seo' ) ); ?>
			</div>
			<div class="apls-review-trend">
				<?php foreach ( $trend as $value ) : ?>
					<span style="<?php echo esc_attr( '--apls-bar:' . max( 12, min( 100, absint( $value ) ) ) . '%' ); ?>"></span>
				<?php endforeach; ?>
			</div>
			<?php $this->detail_row( __( 'Weekly Comparison', 'apex-local-seo' ), $sentiment['weeklyComparison'] ?? '' ); ?>
			<?php $this->detail_row( __( 'Monthly Comparison', 'apex-local-seo' ), $sentiment['monthlyComparison'] ?? '' ); ?>
		</section>
		<?php
	}

	/**
	 * Analytics panel.
	 *
	 * @param mixed $analytics Analytics.
	 */
	private function analytics_panel( $analytics ) {
		?>
		<section class="apls-panel apls-reviews-panel">
			<div class="apls-panel-head">
				<div>
					<span class="apls-eyebrow"><?php esc_html_e( 'Review Analytics', 'apex-local-seo' ); ?></span>
					<h2><?php esc_html_e( 'Volume, rating, response operations', 'apex-local-seo' ); ?></h2>
				</div>
			</div>
			<?php $this->sparkline( __( 'Reviews per month', 'apex-local-seo' ), $analytics['reviewsPerMonth'] ?? array() ); ?>
			<?php $this->sparkline( __( 'Average rating', 'apex-local-seo' ), $analytics['averageRating'] ?? array(), 5 ); ?>
			<?php $this->sparkline( __( 'Response rate', 'apex-local-seo' ), $analytics['responseRate'] ?? array() ); ?>
			<?php $this->sparkline( __( 'Response time', 'apex-local-seo' ), $analytics['responseTime'] ?? array(), 24, true ); ?>
			<div class="apls-rating-distribution">
				<?php foreach ( array( 5, 4, 3, 2, 1 ) as $rating ) : ?>
					<?php $count = absint( $analytics['ratingDistribution'][ $rating ] ?? 0 ); ?>
					<div><span><?php echo esc_html( $rating . ' star' ); ?></span><strong><?php echo esc_html( number_format_i18n( $count ) ); ?></strong></div>
				<?php endforeach; ?>
			</div>
		</section>
		<?php
	}

	/**
	 * Review feed panel.
	 *
	 * @param mixed $feed Feed.

	 * @param mixed $actions Actions.
	 */
	private function review_feed_panel( $feed, $actions ) {
		?>
		<section class="apls-panel apls-reviews-panel apls-reviews-feed-panel">
			<div class="apls-panel-head">
				<div>
					<span class="apls-eyebrow"><?php esc_html_e( 'Review Feed', 'apex-local-seo' ); ?></span>
					<h2><?php esc_html_e( 'Professional review inbox', 'apex-local-seo' ); ?></h2>
				</div>
				<span class="apls-status apls-status-neutral"><?php echo esc_html( count( (array) $feed ) . ' reviews' ); ?></span>
			</div>
			<div class="apls-review-inbox">
				<?php foreach ( (array) $feed as $review ) : ?>
					<article class="apls-review-inbox-row apls-sentiment-<?php echo esc_attr( strtolower( $review['sentiment'] ?? 'neutral' ) ); ?>">
						<div class="apls-review-inbox-head">
							<div>
								<strong><?php echo esc_html( $review['customerName'] ?? __( 'Customer', 'apex-local-seo' ) ); ?></strong>
								<span><?php echo esc_html( number_format_i18n( (float) ( $review['rating'] ?? 0 ), 1 ) . ' stars - ' . ( $review['source'] ?? '' ) . ' - ' . ( $review['reviewDate'] ?? '' ) ); ?></span>
							</div>
							<em><?php echo esc_html( ( $review['sentiment'] ?? '' ) . ' / ' . ( $review['advisorPriority'] ?? $review['advisorPriority'] ?? '' ) ); ?></em>
						</div>
						<p><?php echo esc_html( $review['reviewText'] ?? '' ); ?></p>
						<div class="apls-review-meta">
							<span><?php echo esc_html( $review['responseStatus'] ?? '' ); ?></span>
							<strong><?php echo esc_html( $review['suggestedReply'] ?? '' ); ?></strong>
						</div>
						<div class="apls-reply-actions">
							<?php foreach ( (array) $actions as $action ) : ?>
								<button type="button"><?php echo esc_html( $action ); ?></button>
							<?php endforeach; ?>
						</div>
					</article>
				<?php endforeach; ?>
			</div>
		</section>
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
		<div class="apls-reviews-token-block">
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
	 * Sparkline.
	 *
	 * @param mixed $label Label.

	 * @param mixed $values Values.

	 * @param mixed $max Max.

	 * @param mixed $inverse Inverse.
	 */
	private function sparkline( $label, $values, $max = 100, $inverse = false ) {
		$values = (array) $values;
		$max    = max( 1, (float) $max );
		?>
		<div class="apls-review-sparkline">
			<span><?php echo esc_html( $label ); ?></span>
			<div>
				<?php foreach ( $values as $value ) : ?>
					<?php
					$height = min( 100, max( 10, ( (float) $value / $max ) * 100 ) );
					if ( $inverse ) {
						$height = max( 10, 100 - $height );
					}
					?>
					<i style="<?php echo esc_attr( '--apls-bar:' . $height . '%' ); ?>"></i>
				<?php endforeach; ?>
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
		$summary = $data['summary'] ?? array();
		$reviews = array();
		foreach ( (array) ( $data['reviews'] ?? array() ) as $review ) {
			$reviews[] = array(
				'customerName'    => $review['reviewer_name'] ?? __( 'Google reviewer', 'apex-local-seo' ),
				'rating'          => $review['rating'] ?? 0,
				'reviewDate'      => $review['reviewed_at'] ?? '',
				'reviewText'      => $review['review_text'] ?? '',
				'source'          => 'Google',
				'responseStatus'  => $review['response_status'] ?? '',
				'sentiment'       => (float) ( $review['rating'] ?? 0 ) >= 4 ? 'Positive' : 'Neutral',
				'advisorPriority' => 'Normal',
				'suggestedReply'  => __( 'Suggested reply prompts will appear here.', 'apex-local-seo' ),
			);
		}
		return array(
			'summary'        => array(
				'overallRating'       => $summary['averageRating'] ?? 0,
				'totalReviews'        => $summary['totalReviews'] ?? 0,
				'newReviews30'        => 0,
				'averageRatingTrend'  => '0',
				'responseRate'        => 0,
				'averageResponseTime' => __( 'Pending', 'apex-local-seo' ),
			),
			'feed'           => $reviews,
			'intelligence'   => array(
				'positiveTrends'     => array(),
				'negativeAlerts'     => array(),
				'reputationScore'    => absint( $summary['healthScore'] ?? 0 ),
				'recommendedActions' => array(),
				'executiveSummary'   => __( 'Review intelligence will populate as provider data expands.', 'apex-local-seo' ),
			),
			'sentiment'      => array(
				'positive'          => 0,
				'neutral'           => 0,
				'negative'          => 0,
				'weeklyComparison'  => '',
				'monthlyComparison' => '',
				'trend'             => array(),
			),
			'reputation'     => array(
				'currentScore'      => absint( $summary['healthScore'] ?? 0 ),
				'previousScore'     => 0,
				'trend'             => '0',
				'industryBenchmark' => 0,
				'opportunities'     => array(),
			),
			'analytics'      => array(
				'reviewsPerMonth'    => array(),
				'averageRating'      => array(),
				'responseRate'       => array(),
				'responseTime'       => array(),
				'ratingDistribution' => array(
					5 => 0,
					4 => 0,
					3 => 0,
					2 => 0,
					1 => 0,
				),
			),
			'filters'        => array( 'All', 'Answered', 'Unanswered', 'Positive', 'Neutral', 'Negative', 'Newest', 'Oldest', 'Highest Rating', 'Lowest Rating' ),
			'replyAssistant' => array( 'Draft Reply', 'Rewrite Reply', 'Friendly', 'Professional', 'Empathetic', 'Escalate' ),
		);
	}
}
