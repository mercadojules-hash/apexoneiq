<?php
/**
 * Apex Local SEO plugin file.
 *
 * @package Apex_Local_SEO
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; }

// phpcs:disable WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared, PluginCheck.Security.DirectDB.UnescapedDBParameter -- This repository syncs Google Business Profile data into plugin-owned custom tables. Table names are generated internally from $wpdb->prefix; external values are sanitized and prepared before query execution.

/**
 * APLS Data Repositories GbpRepository.
 */
class APLS_Data_Repositories_GbpRepository implements APLS_Contracts_RepositoryInterface {
	/**
	 * Accounts table.
	 */
	public function accounts_table() {
		global $wpdb;
		return $wpdb->prefix . 'apls_gbp_accounts'; }
	/**
	 * Locations table.
	 */
	public function locations_table() {
		global $wpdb;
		return $wpdb->prefix . 'apls_gbp_locations'; }
	/**
	 * App locations table.
	 */
	public function app_locations_table() {
		global $wpdb;
		return $wpdb->prefix . 'apls_locations'; }
	/**
	 * Reviews table.
	 */
	public function reviews_table() {
		global $wpdb;
		return $wpdb->prefix . 'apls_reviews'; }
	/**
	 * Assets table.
	 */
	public function assets_table() {
		global $wpdb;
		return $wpdb->prefix . 'apls_gbp_assets'; }
	/**
	 * Metrics table.
	 */
	public function metrics_table() {
		global $wpdb;
		return $wpdb->prefix . 'apls_gbp_metrics_daily'; }

	/**
	 * Connected account.
	 */
	public function connected_account() {
		global $wpdb;
		$row = $wpdb->get_row( "SELECT * FROM {$this->accounts_table()} WHERE status = 'connected' ORDER BY id DESC LIMIT 1", ARRAY_A ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.DirectDatabaseQuery.DirectQuery
		return is_array( $row ) ? $row : null;
	}

	/**
	 * Is connected.
	 */
	public function is_connected() {
		return null !== $this->connected_account();
	}

	/**
	 * Save connected account.
	 *
	 * @param mixed $email Email.

	 * @param mixed $access_token Access token.

	 * @param mixed $refresh_token Refresh token.

	 * @param mixed $expires_at Expires at.

	 * @param mixed $scopes Scopes.
	 */
	public function save_connected_account( $email, $access_token, $refresh_token, $expires_at, $scopes ) {
		global $wpdb;

		$now = current_time( 'mysql' );
		$wpdb->query(
			$wpdb->prepare(
				"INSERT INTO {$this->accounts_table()} (google_account_id, email, access_token_encrypted, refresh_token_encrypted, access_token_expires_at, scopes, status, connected_at, updated_at)
				VALUES (%s, %s, %s, %s, %s, %s, 'connected', %s, %s)
				ON DUPLICATE KEY UPDATE email = VALUES(email), access_token_encrypted = VALUES(access_token_encrypted), refresh_token_encrypted = IF(VALUES(refresh_token_encrypted) <> '', VALUES(refresh_token_encrypted), refresh_token_encrypted), access_token_expires_at = VALUES(access_token_expires_at), scopes = VALUES(scopes), status = 'connected', error_message = NULL, updated_at = VALUES(updated_at)",
				sanitize_email( $email ),
				sanitize_email( $email ),
				$access_token,
				$refresh_token,
				$expires_at,
				sanitize_text_field( $scopes ),
				$now,
				$now
			)
		); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.DirectDatabaseQuery.DirectQuery

		$account_id = absint( $wpdb->insert_id );
		if ( ! $account_id ) {
			$account_id = absint( $wpdb->get_var( $wpdb->prepare( "SELECT id FROM {$this->accounts_table()} WHERE google_account_id = %s LIMIT 1", sanitize_email( $email ) ) ) ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.DirectDatabaseQuery.DirectQuery
		}

		return $account_id;
	}

	/**
	 * Update access token.
	 *
	 * @param mixed $account_id Account id.

	 * @param mixed $access_token Access token.

	 * @param mixed $expires_at Expires at.
	 */
	public function update_access_token( $account_id, $access_token, $expires_at ) {
		global $wpdb;
		return false !== $wpdb->update(
			$this->accounts_table(),
			array(
				'access_token_encrypted'  => $access_token,
				'access_token_expires_at' => $expires_at,
				'updated_at'              => current_time( 'mysql' ),
			),
			array( 'id' => absint( $account_id ) ),
			array( '%s', '%s', '%s' ),
			array( '%d' )
		); // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
	}

	/**
	 * Disconnect.
	 */
	public function disconnect() {
		global $wpdb;
		update_option( 'apls_google_connected_email', '', false );
		return false !== $wpdb->update(
			$this->accounts_table(),
			array(
				'status'     => 'disconnected',
				'updated_at' => current_time( 'mysql' ),
			),
			array( 'status' => 'connected' ),
			array( '%s', '%s' ),
			array( '%s' )
		); // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
	}

	/**
	 * Save location.
	 *
	 * @param mixed $account_id Account id.

	 * @param mixed $location Location.
	 */
	public function save_location( $account_id, $location ) {
		global $wpdb;

		$storefront           = isset( $location['storefrontAddress'] ) ? (array) $location['storefrontAddress'] : array();
		$postal               = isset( $storefront['postalCode'] ) ? $storefront['postalCode'] : '';
		$city                 = isset( $storefront['locality'] ) ? $storefront['locality'] : '';
		$region               = isset( $storefront['administrativeArea'] ) ? $storefront['administrativeArea'] : '';
		$country              = isset( $storefront['regionCode'] ) ? $storefront['regionCode'] : '';
		$lines                = isset( $storefront['addressLines'] ) && is_array( $storefront['addressLines'] ) ? $storefront['addressLines'] : array();
		$phone                = $location['phoneNumbers']['primaryPhone'] ?? '';
		$title                = $location['title'] ?? __( 'Google Business Profile Location', 'apex-local-seo' );
		$website              = $location['websiteUri'] ?? '';
		$now                  = current_time( 'mysql' );
		$gbp_name             = $location['name'] ?? '';
		$existing_location_id = '' !== $gbp_name ? absint( $wpdb->get_var( $wpdb->prepare( "SELECT location_id FROM {$this->locations_table()} WHERE gbp_location_name = %s LIMIT 1", sanitize_text_field( $gbp_name ) ) ) ) : 0; // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.DirectDatabaseQuery.DirectQuery

		$location_data = array(
			'name'           => sanitize_text_field( $title ),
			'slug'           => sanitize_title( $title ),
			'business_name'  => sanitize_text_field( $title ),
			'address_line_1' => sanitize_text_field( $lines[0] ?? '' ),
			'address_line_2' => sanitize_text_field( $lines[1] ?? '' ),
			'city'           => sanitize_text_field( $city ),
			'region'         => sanitize_text_field( $region ),
			'postal_code'    => sanitize_text_field( $postal ),
			'country_code'   => sanitize_text_field( $country ),
			'phone'          => sanitize_text_field( $phone ),
			'website_url'    => esc_url_raw( $website ),
			'status'         => 'active',
			'updated_at'     => $now,
		);

		if ( $existing_location_id ) {
			$wpdb->update( $this->app_locations_table(), $location_data, array( 'id' => $existing_location_id ) ); // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
			$app_location_id = $existing_location_id;
		} else {
			$location_data['wp_site_id'] = 0;
			$location_data['created_at'] = $now;
			$wpdb->insert( $this->app_locations_table(), $location_data ); // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
			$app_location_id = absint( $wpdb->insert_id );
		}

		$primary_category = $location['categories']['primaryCategory']['displayName'] ?? '';
		$place_id         = $location['metadata']['placeId'] ?? '';

		$wpdb->query(
			$wpdb->prepare(
				"INSERT INTO {$this->locations_table()} (location_id, gbp_account_id, gbp_location_name, gbp_place_id, primary_category, additional_categories, profile_state, verified, completeness_score, raw_payload, last_synced_at)
				VALUES (%d, %d, %s, %s, %s, %s, %s, %d, %f, %s, %s)
				ON DUPLICATE KEY UPDATE gbp_location_name = VALUES(gbp_location_name), gbp_place_id = VALUES(gbp_place_id), primary_category = VALUES(primary_category), additional_categories = VALUES(additional_categories), profile_state = VALUES(profile_state), verified = VALUES(verified), completeness_score = VALUES(completeness_score), raw_payload = VALUES(raw_payload), last_synced_at = VALUES(last_synced_at)",
				$app_location_id,
				absint( $account_id ),
				sanitize_text_field( $gbp_name ),
				sanitize_text_field( $place_id ),
				sanitize_text_field( $primary_category ),
				wp_json_encode( $location['categories']['additionalCategories'] ?? array() ),
				sanitize_text_field( $location['openInfo']['status'] ?? '' ),
				! empty( $location['metadata']['hasGoogleUpdated'] ) ? 0 : 1,
				$this->calculate_completeness( $location ),
				wp_json_encode( $location ),
				$now
			)
		); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.DirectDatabaseQuery.DirectQuery

		update_option( 'apls_default_location_id', $app_location_id, false );
		return $app_location_id;
	}

	/**
	 * Save reviews.
	 *
	 * @param mixed $location_id Location id.

	 * @param mixed $reviews Reviews.
	 */
	public function save_reviews( $location_id, $reviews ) {
		global $wpdb;
		foreach ( (array) $reviews as $review ) {
			$wpdb->query(
				$wpdb->prepare(
					"INSERT INTO {$this->reviews_table()} (location_id, provider, provider_review_id, reviewer_name, reviewer_avatar_url, rating, review_text, sentiment, response_text, response_status, reviewed_at, updated_at, raw_payload)
					VALUES (%d, 'google', %s, %s, %s, %f, %s, '', %s, %s, %s, %s, %s)
					ON DUPLICATE KEY UPDATE reviewer_name = VALUES(reviewer_name), rating = VALUES(rating), review_text = VALUES(review_text), response_text = VALUES(response_text), response_status = VALUES(response_status), updated_at = VALUES(updated_at), raw_payload = VALUES(raw_payload)",
					absint( $location_id ),
					sanitize_text_field( $review['reviewId'] ?? $review['name'] ?? '' ),
					sanitize_text_field( $review['reviewer']['displayName'] ?? '' ),
					esc_url_raw( $review['reviewer']['profilePhotoUrl'] ?? '' ),
					$this->rating_to_number( $review['starRating'] ?? '' ),
					sanitize_textarea_field( $review['comment'] ?? '' ),
					sanitize_textarea_field( $review['reviewReply']['comment'] ?? '' ),
					empty( $review['reviewReply']['comment'] ) ? 'waiting' : 'responded',
					sanitize_text_field( $review['createTime'] ?? current_time( 'mysql' ) ),
					current_time( 'mysql' ),
					wp_json_encode( $review )
				)
			); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.DirectDatabaseQuery.DirectQuery
		}
	}

	/**
	 * Save media.
	 *
	 * @param mixed $location_id Location id.

	 * @param mixed $media_items Media items.
	 */
	public function save_media( $location_id, $media_items ) {
		global $wpdb;
		foreach ( (array) $media_items as $item ) {
			$provider_id = $item['name'] ?? '';
			if ( '' === $provider_id ) {
				$provider_id = md5( wp_json_encode( $item ) );
			}

			$wpdb->query(
				$wpdb->prepare(
					"INSERT INTO {$this->assets_table()} (location_id, asset_type, provider_asset_id, title, url, thumbnail_url, status, metadata, published_at, created_at)
					VALUES (%d, %s, %s, %s, %s, %s, 'active', %s, %s, %s)
					ON DUPLICATE KEY UPDATE url = VALUES(url), thumbnail_url = VALUES(thumbnail_url), metadata = VALUES(metadata)",
					absint( $location_id ),
					$this->media_type( $item ),
					sanitize_text_field( $provider_id ),
					sanitize_text_field( $item['description'] ?? '' ),
					esc_url_raw( $item['googleUrl'] ?? $item['sourceUrl'] ?? '' ),
					esc_url_raw( $item['thumbnailUrl'] ?? '' ),
					wp_json_encode( $item ),
					sanitize_text_field( $item['createTime'] ?? current_time( 'mysql' ) ),
					current_time( 'mysql' )
				)
			); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.DirectDatabaseQuery.DirectQuery
		}
	}

	/**
	 * Save metrics.
	 *
	 * @param mixed $location_id Location id.

	 * @param mixed $rows Rows.
	 */
	public function save_metrics( $location_id, $rows ) {
		global $wpdb;
		foreach ( (array) $rows as $row ) {
			$wpdb->query(
				$wpdb->prepare(
					"INSERT INTO {$this->metrics_table()} (location_id, metric_date, calls, website_clicks, direction_requests, search_views, maps_views, photo_views, raw_payload, created_at, updated_at)
					VALUES (%d, %s, %d, %d, %d, %d, %d, %d, %s, %s, %s)
					ON DUPLICATE KEY UPDATE calls = VALUES(calls), website_clicks = VALUES(website_clicks), direction_requests = VALUES(direction_requests), search_views = VALUES(search_views), maps_views = VALUES(maps_views), photo_views = VALUES(photo_views), raw_payload = VALUES(raw_payload), updated_at = VALUES(updated_at)",
					absint( $location_id ),
					sanitize_text_field( $row['date'] ?? current_time( 'Y-m-d' ) ),
					absint( $row['calls'] ?? 0 ),
					absint( $row['website_clicks'] ?? 0 ),
					absint( $row['direction_requests'] ?? 0 ),
					absint( $row['search_views'] ?? 0 ),
					absint( $row['maps_views'] ?? 0 ),
					absint( $row['photo_views'] ?? 0 ),
					wp_json_encode( $row ),
					current_time( 'mysql' ),
					current_time( 'mysql' )
				)
			); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.DirectDatabaseQuery.DirectQuery
		}
	}

	/**
	 * Dashboard summary.
	 */
	public function dashboard_summary() {
		global $wpdb;
		$location_id = absint( get_option( 'apls_default_location_id', 0 ) );
		if ( ! $location_id || ! $this->is_connected() ) {
			return array( 'connected' => false );
		}

		$reviews = $wpdb->get_row( $wpdb->prepare( "SELECT COUNT(*) AS total, AVG(rating) AS average_rating, SUM(CASE WHEN response_status = 'waiting' THEN 1 ELSE 0 END) AS waiting FROM {$this->reviews_table()} WHERE location_id = %d", $location_id ), ARRAY_A ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.DirectDatabaseQuery.DirectQuery
		$gbp     = $wpdb->get_row( $wpdb->prepare( "SELECT * FROM {$this->locations_table()} WHERE location_id = %d ORDER BY id DESC LIMIT 1", $location_id ), ARRAY_A ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.DirectDatabaseQuery.DirectQuery
		$photos  = absint( $wpdb->get_var( $wpdb->prepare( "SELECT COUNT(*) FROM {$this->assets_table()} WHERE location_id = %d", $location_id ) ) ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.DirectDatabaseQuery.DirectQuery
		$metrics = $wpdb->get_row( $wpdb->prepare( "SELECT SUM(calls) AS calls, SUM(website_clicks) AS website_clicks, SUM(direction_requests) AS directions, SUM(search_views) AS search_views, SUM(maps_views) AS maps_views, SUM(photo_views) AS photo_views FROM {$this->metrics_table()} WHERE location_id = %d AND metric_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)", $location_id ), ARRAY_A ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.DirectDatabaseQuery.DirectQuery

		$health = $this->health_score( $gbp, $reviews, $photos );
		return array(
			'connected'           => true,
			'locationId'          => $location_id,
			'businessName'        => $this->business_name( $location_id ),
			'averageRating'       => round( (float) ( $reviews['average_rating'] ?? 0 ), 1 ),
			'totalReviews'        => absint( $reviews['total'] ?? 0 ),
			'reviewsWaiting'      => absint( $reviews['waiting'] ?? 0 ),
			'photos'              => $photos,
			'profileCompleteness' => round( (float) ( $gbp['completeness_score'] ?? 0 ) ),
			'healthScore'         => $health,
			'healthLabel'         => $this->health_label( $health ),
			'primaryCategory'     => sanitize_text_field( $gbp['primary_category'] ?? '' ),
			'metrics30'           => array(
				'calls'             => absint( $metrics['calls'] ?? 0 ),
				'websiteClicks'     => absint( $metrics['website_clicks'] ?? 0 ),
				'directionRequests' => absint( $metrics['directions'] ?? 0 ),
				'searchViews'       => absint( $metrics['search_views'] ?? 0 ),
				'mapsViews'         => absint( $metrics['maps_views'] ?? 0 ),
				'photoViews'        => absint( $metrics['photo_views'] ?? 0 ),
			),
		);
	}

	/**
	 * Location profile.
	 */
	public function location_profile() {
		global $wpdb;
		$location_id = absint( get_option( 'apls_default_location_id', 0 ) );
		if ( ! $location_id ) {
			return null; }

		$location = $wpdb->get_row( $wpdb->prepare( "SELECT * FROM {$this->app_locations_table()} WHERE id = %d LIMIT 1", $location_id ), ARRAY_A ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.DirectDatabaseQuery.DirectQuery
		$gbp      = $wpdb->get_row( $wpdb->prepare( "SELECT * FROM {$this->locations_table()} WHERE location_id = %d ORDER BY id DESC LIMIT 1", $location_id ), ARRAY_A ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.DirectDatabaseQuery.DirectQuery

		return array(
			'location' => $location,
			'gbp'      => $gbp,
			'profile'  => $this->normalized_profile( $location, $gbp ),
			'media'    => $this->media_summary( $location_id ),
		);
	}

	/**
	 * Normalized profile.
	 *
	 * @param mixed $location Location.

	 * @param mixed $gbp Gbp.
	 */
	public function normalized_profile( $location, $gbp ) {
		$raw = array();
		if ( ! empty( $gbp['raw_payload'] ) ) {
			$decoded = json_decode( $gbp['raw_payload'], true );
			$raw     = is_array( $decoded ) ? $decoded : array();
		}

		$categories = array();
		if ( ! empty( $gbp['primary_category'] ) ) {
			$categories[] = sanitize_text_field( $gbp['primary_category'] );
		}
		$additional = json_decode( $gbp['additional_categories'] ?? '[]', true );
		foreach ( (array) $additional as $category ) {
			if ( ! empty( $category['displayName'] ) ) {
				$categories[] = sanitize_text_field( $category['displayName'] );
			}
		}

		return array(
			'businessName' => sanitize_text_field( $location['business_name'] ?? '' ),
			'address'      => trim( implode( ', ', array_filter( array( $location['address_line_1'] ?? '', $location['address_line_2'] ?? '', $location['city'] ?? '', $location['region'] ?? '', $location['postal_code'] ?? '', $location['country_code'] ?? '' ) ) ) ),
			'phone'        => sanitize_text_field( $location['phone'] ?? '' ),
			'website'      => esc_url_raw( $location['website_url'] ?? '' ),
			'categories'   => array_values( array_unique( $categories ) ),
			'description'  => sanitize_textarea_field( $raw['profile']['description'] ?? '' ),
			'hours'        => $raw['regularHours'] ?? array(),
			'specialHours' => $raw['specialHours'] ?? array(),
			'serviceArea'  => $raw['serviceArea'] ?? array(),
			'latlng'       => $raw['latlng'] ?? array(),
			'verified'     => ! empty( $gbp['verified'] ),
			'lastSyncedAt' => sanitize_text_field( $gbp['last_synced_at'] ?? '' ),
		);
	}

	/**
	 * Media summary.
	 *
	 * @param mixed $location_id Location id.
	 */
	public function media_summary( $location_id = 0 ) {
		global $wpdb;
		$location_id = $location_id ? absint( $location_id ) : absint( get_option( 'apls_default_location_id', 0 ) );
		if ( ! $location_id ) {
			return array(
				'logo'   => null,
				'cover'  => null,
				'photos' => 0,
				'items'  => array(),
			); }

		$items = (array) $wpdb->get_results( $wpdb->prepare( "SELECT * FROM {$this->assets_table()} WHERE location_id = %d ORDER BY published_at DESC LIMIT 12", $location_id ), ARRAY_A ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.DirectDatabaseQuery.DirectQuery
		$logo  = null;
		$cover = null;
		foreach ( $items as $item ) {
			if ( 'logo' === $item['asset_type'] && ! $logo ) {
				$logo = $item;
			}
			if ( 'cover' === $item['asset_type'] && ! $cover ) {
				$cover = $item;
			}
		}

		return array(
			'logo'   => $logo,
			'cover'  => $cover,
			'photos' => absint( $wpdb->get_var( $wpdb->prepare( "SELECT COUNT(*) FROM {$this->assets_table()} WHERE location_id = %d AND asset_type IN ('photo','interior','exterior','product','team','additional')", $location_id ) ) ), // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.DirectDatabaseQuery.DirectQuery
			'items'  => $items,
		);
	}

	/**
	 * Metrics.
	 *
	 * @param mixed $days Days.
	 */
	public function metrics( $days = 30 ) {
		global $wpdb;
		$location_id = absint( get_option( 'apls_default_location_id', 0 ) );
		if ( ! $location_id ) {
			return array(); }

		return (array) $wpdb->get_results( $wpdb->prepare( "SELECT * FROM {$this->metrics_table()} WHERE location_id = %d AND metric_date >= DATE_SUB(CURDATE(), INTERVAL %d DAY) ORDER BY metric_date ASC", $location_id, absint( $days ) ), ARRAY_A ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.DirectDatabaseQuery.DirectQuery
	}

	/**
	 * Recommendations.
	 */
	public function recommendations() {
		$summary = $this->dashboard_summary();
		if ( empty( $summary['connected'] ) ) {
			return array(
				array(
					'priority' => 'high',
					'title'    => __( 'Connect your Google Business Profile to enable live analytics.', 'apex-local-seo' ),
				),
			);
		}

		$items = array();
		if ( $summary['reviewsWaiting'] > 0 ) {
			$items[] = array(
				'priority' => 'high',
				'title'    => sprintf( /* translators: %d is the number of Google reviews awaiting owner replies. */ __( 'Respond to %d Google reviews waiting for owner replies.', 'apex-local-seo' ), $summary['reviewsWaiting'] ),
			);
		}
		if ( $summary['photos'] < 10 ) {
			$items[] = array(
				'priority' => 'medium',
				'title'    => __( 'Upload fresh business photos to improve profile activity.', 'apex-local-seo' ),
			);
		}
		if ( $summary['profileCompleteness'] < 85 ) {
			$items[] = array(
				'priority' => 'medium',
				'title'    => __( 'Complete missing profile fields such as hours, categories, description, or website.', 'apex-local-seo' ),
			);
		}
		if ( (float) $summary['averageRating'] < 4.3 && $summary['totalReviews'] > 0 ) {
			$items[] = array(
				'priority' => 'high',
				'title'    => __( 'Review rating needs attention. Prioritize customer follow-up and review quality.', 'apex-local-seo' ),
			);
		}

		if ( empty( $items ) ) {
			$items[] = array(
				'priority' => 'normal',
				'title'    => __( 'Profile health is strong. Keep publishing photos and responding to reviews.', 'apex-local-seo' ),
			);
		}

		return $items;
	}

	/**
	 * Recent reviews.
	 *
	 * @param mixed $limit Limit.
	 */
	public function recent_reviews( $limit = 5 ) {
		global $wpdb;
		$location_id = absint( get_option( 'apls_default_location_id', 0 ) );
		if ( ! $location_id ) {
			return array(); }
		return (array) $wpdb->get_results( $wpdb->prepare( "SELECT * FROM {$this->reviews_table()} WHERE location_id = %d ORDER BY reviewed_at DESC LIMIT %d", $location_id, absint( $limit ) ), ARRAY_A ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.DirectDatabaseQuery.DirectQuery
	}

	/**
	 * Calculate completeness.
	 *
	 * @param mixed $location Location.
	 */
	private function calculate_completeness( $location ) {
		$checks = array( 'title', 'phoneNumbers', 'websiteUri', 'categories', 'regularHours', 'profile' );
		$hit    = 0;
		foreach ( $checks as $key ) {
			if ( ! empty( $location[ $key ] ) ) {
				++$hit; }
		}
		if ( ! empty( $location['storefrontAddress'] ) || ! empty( $location['serviceArea'] ) ) {
			++$hit; }
		return round( ( $hit / ( count( $checks ) + 1 ) ) * 100, 2 );
	}

	/**
	 * Rating to number.
	 *
	 * @param mixed $rating Rating.
	 */
	private function rating_to_number( $rating ) {
		$map = array(
			'ONE'   => 1,
			'TWO'   => 2,
			'THREE' => 3,
			'FOUR'  => 4,
			'FIVE'  => 5,
		);
		return isset( $map[ $rating ] ) ? $map[ $rating ] : floatval( $rating );
	}

	/**
	 * Business name.
	 *
	 * @param mixed $location_id Location id.
	 */
	private function business_name( $location_id ) {
		global $wpdb;
		return sanitize_text_field( $wpdb->get_var( $wpdb->prepare( "SELECT business_name FROM {$this->app_locations_table()} WHERE id = %d", absint( $location_id ) ) ) ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.DirectDatabaseQuery.DirectQuery
	}

	/**
	 * Health score.
	 *
	 * @param mixed $gbp Gbp.

	 * @param mixed $reviews Reviews.

	 * @param mixed $photos Photos.
	 */
	private function health_score( $gbp, $reviews, $photos ) {
		$score  = 0;
		$score += min( 40, (float) ( $gbp['completeness_score'] ?? 0 ) * 0.4 );
		$score += min( 25, (float) ( $reviews['average_rating'] ?? 0 ) * 5 );
		$score += min( 15, absint( $reviews['total'] ?? 0 ) / 2 );
		$score += min( 10, $photos / 3 );
		$score += empty( $reviews['waiting'] ) ? 10 : max( 0, 10 - absint( $reviews['waiting'] ) );
		return max( 0, min( 100, round( $score ) ) );
	}

	/**
	 * Health label.
	 *
	 * @param mixed $score Score.
	 */
	private function health_label( $score ) {
		if ( $score >= 85 ) {
			return __( 'Excellent', 'apex-local-seo' ); }
		if ( $score >= 70 ) {
			return __( 'Good', 'apex-local-seo' ); }
		if ( $score >= 45 ) {
			return __( 'Needs Attention', 'apex-local-seo' ); }
		return __( 'Critical', 'apex-local-seo' );
	}

	/**
	 * Media type.
	 *
	 * @param mixed $item Item.
	 */
	private function media_type( $item ) {
		$category = strtolower( (string) ( $item['locationAssociation']['category'] ?? '' ) );
		$map      = array(
			'profile'    => 'logo',
			'cover'      => 'cover',
			'logo'       => 'logo',
			'interior'   => 'interior',
			'exterior'   => 'exterior',
			'product'    => 'product',
			'team'       => 'team',
			'additional' => 'additional',
		);

		if ( isset( $map[ $category ] ) ) {
			return $map[ $category ];
		}

		return 'photo';
	}
}
