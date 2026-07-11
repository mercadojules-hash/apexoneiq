<?php
/**
 * Owner administration console for ApexOneIQ.
 *
 * @package ApexOneIQ
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

add_action( 'admin_menu', 'apexoneiq_register_owner_admin' );

/**
 * Register owner admin page.
 */
function apexoneiq_register_owner_admin() {
	add_menu_page(
		__( 'ApexOneIQ Owner', 'apexoneiq' ),
		__( 'ApexOneIQ Owner', 'apexoneiq' ),
		'manage_options',
		'apexoneiq-owner',
		'apexoneiq_render_owner_admin',
		'dashicons-chart-area',
		58
	);
}

/**
 * Render owner admin dashboard.
 */
function apexoneiq_render_owner_admin() {
	if ( ! current_user_can( 'manage_options' ) ) {
		return;
	}

	global $wpdb;
	$subscriptions = apexoneiq_subscriptions_table();
	$events = apexoneiq_webhook_events_table();
	$active = (int) $wpdb->get_var( "SELECT COUNT(*) FROM {$subscriptions} WHERE subscription_status IN ('active','trialing')" ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
	$trials = (int) $wpdb->get_var( "SELECT COUNT(*) FROM {$subscriptions} WHERE subscription_status = 'trialing'" ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
	$failed = (int) $wpdb->get_var( "SELECT COUNT(*) FROM {$subscriptions} WHERE subscription_status IN ('past_due','unpaid')" ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
	$recent = $wpdb->get_results( "SELECT * FROM {$subscriptions} ORDER BY updated_date DESC LIMIT 10", ARRAY_A ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
	$webhooks = $wpdb->get_results( "SELECT * FROM {$events} ORDER BY created_at DESC LIMIT 10", ARRAY_A ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
	$mrr = apexoneiq_estimated_mrr();
	?>
	<div class="wrap">
		<h1><?php esc_html_e( 'ApexOneIQ Owner Console', 'apexoneiq' ); ?></h1>
		<p><?php esc_html_e( 'Internal subscription, revenue, webhook, and synchronization health for the ApexOneIQ Sandbox environment.', 'apexoneiq' ); ?></p>
		<div style="display:grid;grid-template-columns:repeat(5,minmax(140px,1fr));gap:12px;max-width:1100px;">
			<?php apexoneiq_owner_metric( 'Active Subscriptions', $active ); ?>
			<?php apexoneiq_owner_metric( 'Trial Users', $trials ); ?>
			<?php apexoneiq_owner_metric( 'Failed Payments', $failed ); ?>
			<?php apexoneiq_owner_metric( 'MRR', '$' . number_format_i18n( $mrr ) ); ?>
			<?php apexoneiq_owner_metric( 'ARR', '$' . number_format_i18n( $mrr * 12 ) ); ?>
		</div>
		<h2><?php esc_html_e( 'Recent Subscriptions', 'apexoneiq' ); ?></h2>
		<table class="widefat striped">
			<thead><tr><th>User</th><th>Plan</th><th>Status</th><th>Price</th><th>Renewal</th><th>Stripe Subscription</th><th>Updated</th></tr></thead>
			<tbody>
			<?php foreach ( $recent as $row ) : ?>
				<tr>
					<td><?php echo esc_html( $row['user_id'] ); ?></td>
					<td><?php echo esc_html( $row['current_plan'] ); ?></td>
					<td><?php echo esc_html( $row['subscription_status'] ); ?></td>
					<td><?php echo esc_html( $row['stripe_price_id'] ); ?></td>
					<td><?php echo esc_html( $row['current_period_end'] ); ?></td>
					<td><?php echo esc_html( $row['stripe_subscription_id'] ); ?></td>
					<td><?php echo esc_html( $row['updated_date'] ); ?></td>
				</tr>
			<?php endforeach; ?>
			</tbody>
		</table>
		<h2><?php esc_html_e( 'Stripe Webhook Health', 'apexoneiq' ); ?></h2>
		<table class="widefat striped">
			<thead><tr><th>Event</th><th>Type</th><th>Status</th><th>Message</th><th>Processed</th></tr></thead>
			<tbody>
			<?php foreach ( $webhooks as $event ) : ?>
				<tr>
					<td><?php echo esc_html( $event['stripe_event_id'] ); ?></td>
					<td><?php echo esc_html( $event['event_type'] ); ?></td>
					<td><?php echo esc_html( $event['processing_status'] ); ?></td>
					<td><?php echo esc_html( $event['error_message'] ); ?></td>
					<td><?php echo esc_html( $event['processed_at'] ); ?></td>
				</tr>
			<?php endforeach; ?>
			</tbody>
		</table>
	</div>
	<?php
}

/**
 * Render a metric card.
 *
 * @param string $label Metric label.
 * @param mixed  $value Metric value.
 */
function apexoneiq_owner_metric( $label, $value ) {
	printf(
		'<div style="background:#fff;border:1px solid #dcdcde;border-radius:8px;padding:14px;"><strong style="display:block;font-size:22px;">%s</strong><span>%s</span></div>',
		esc_html( (string) $value ),
		esc_html( $label )
	);
}

/**
 * Estimate MRR from active subscriptions by plan.
 *
 * @return int
 */
function apexoneiq_estimated_mrr() {
	global $wpdb;

	$rows = $wpdb->get_results( "SELECT current_plan, COUNT(*) as total FROM " . apexoneiq_subscriptions_table() . " WHERE subscription_status IN ('active','trialing') GROUP BY current_plan", ARRAY_A ); // phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared
	$prices = array(
		'cloud'      => 79,
		'command'    => 199,
		'essentials' => 499,
		'growth'     => 999,
	);
	$mrr = 0;
	foreach ( $rows as $row ) {
		$mrr += ( $prices[ $row['current_plan'] ] ?? 0 ) * absint( $row['total'] );
	}
	return $mrr;
}
