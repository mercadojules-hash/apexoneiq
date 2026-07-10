<?php
/**
 * Apex Local SEO plugin file.
 *
 * @package Apex_Local_SEO
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; }

/**
 * APLS Services Google GoogleBusinessProfileClient.
 */
class APLS_Services_Google_GoogleBusinessProfileClient implements APLS_Contracts_ServiceInterface {
	const ACCOUNT_API       = 'https://mybusinessaccountmanagement.googleapis.com/v1';
	const BUSINESS_INFO_API = 'https://mybusinessbusinessinformation.googleapis.com/v1';
	const PERFORMANCE_API   = 'https://businessprofileperformance.googleapis.com/v1';
	const LEGACY_API        = 'https://mybusiness.googleapis.com/v4';

	/**
	 * Oauth.
	 *
	 * @var mixed
	 */
	private $oauth;
	/**
	 * Repository.
	 *
	 * @var mixed
	 */
	private $repository;
	/**
	 * Trace.
	 *
	 * @var mixed
	 */
	private $trace = array();

	/**
	 * Construct.
	 *
	 * @param APLS_Services_Google_GoogleOAuthService $oauth Oauth.

	 * @param APLS_Data_Repositories_GbpRepository    $repository Repository.
	 */
	public function __construct( APLS_Services_Google_GoogleOAuthService $oauth, APLS_Data_Repositories_GbpRepository $repository ) {
		$this->oauth      = $oauth;
		$this->repository = $repository;
	}

	/**
	 * Health.
	 */
	public function health() {
		$status               = $this->oauth->status();
		$status['summary']    = $this->repository->dashboard_summary();
		$status['syncIssue'] = $this->last_sync_issue();

		if ( ! $status['configured'] ) {
			$status['status']  = 'not_configured';
			$status['message'] = __( 'Add Google OAuth credentials to connect Business Profile.', 'apex-local-seo' );
			return $status;
		}

		if ( ! $status['connected'] ) {
			$status['status']  = 'not_connected';
			$status['message'] = __( 'Connect your Google Business Profile to enable live analytics.', 'apex-local-seo' );
			return $status;
		}

		$status['status']  = 'connected';
		$status['message'] = __( 'Google Business Profile is connected.', 'apex-local-seo' );
		return $status;
	}

	/**
	 * Sync locations.
	 */
	public function sync_locations() {
		if ( get_transient( 'apls_gbp_sync_lock' ) ) {
			return new WP_Error( 'apls_google_sync_in_progress', __( 'Google Business Profile sync is already running. Please wait a moment before trying again.', 'apex-local-seo' ) );
		}

		set_transient( 'apls_gbp_sync_lock', time(), 60 );
		$this->trace = array();
		$this->trace_event( 'sync.start', 'Google Business Profile sync started.' );

		try {
			$result = $this->sync_locations_with_token();
			$this->trace_event( 'sync.finish', is_wp_error( $result ) ? 'Google Business Profile sync failed.' : 'Google Business Profile sync completed.' );
			return $result;
		} finally {
			$this->persist_trace();
			delete_transient( 'apls_gbp_sync_lock' );
		}
	}

	/**
	 * Sync locations with token.
	 */
	private function sync_locations_with_token() {
		$token = $this->oauth->access_token();
		if ( is_wp_error( $token ) ) {
			return $token;
		}

		$account_row = $this->repository->connected_account();
		$accounts    = $this->accounts( $token, $account_row );
		if ( is_wp_error( $accounts ) ) {
			return $accounts;
		}

		if ( empty( $accounts['accounts'] ) ) {
			return new WP_Error( 'apls_google_no_accounts', __( 'No Google Business Profile accounts were returned for this Google user.', 'apex-local-seo' ) );
		}

		$imported      = array();
		$warnings      = array();
		$total_reviews = 0;
		$total_photos  = 0;
		$total_metrics = 0;

		foreach ( (array) $accounts['accounts'] as $account ) {
			if ( ! is_array( $account ) || empty( $account['name'] ) ) {
				continue;
			}

			$locations = $this->get(
				self::BUSINESS_INFO_API . '/' . trim( $account['name'], '/' ) . '/locations?readMask=' . rawurlencode( 'name,title,storefrontAddress,phoneNumbers,websiteUri,categories,regularHours,specialHours,serviceArea,profile,metadata,openInfo,latlng' ),
				$token,
				'GET',
				'business-information.locations.list'
			);
			if ( is_wp_error( $locations ) ) {
				$warnings[] = $locations->get_error_message();
				continue;
			}

			foreach ( (array) ( $locations['locations'] ?? array() ) as $location ) {
				if ( ! is_array( $location ) ) {
					continue;
				}

				$location_id = $this->repository->save_location( $account_row['id'] ?? 0, $location );
				$google_path = $this->location_path( $account['name'], $location['name'] ?? '' );

				$reviews = $this->get( self::LEGACY_API . '/' . $google_path . '/reviews', $token, 'GET', 'legacy.reviews.list' );
				if ( is_wp_error( $reviews ) ) {
					$warnings[] = $reviews->get_error_message();
				} else {
					$review_count   = count( (array) ( $reviews['reviews'] ?? array() ) );
					$total_reviews += $review_count;
					$this->repository->save_reviews( $location_id, $reviews['reviews'] ?? array() );
				}

				$media = $this->get( self::LEGACY_API . '/' . $google_path . '/media', $token, 'GET', 'legacy.media.list' );
				if ( is_wp_error( $media ) ) {
					$warnings[] = $media->get_error_message();
				} else {
					$photo_count   = count( (array) ( $media['mediaItems'] ?? array() ) );
					$total_photos += $photo_count;
					$this->repository->save_media( $location_id, $media['mediaItems'] ?? array() );
				}

				$metrics = $this->sync_performance_metrics( $location_id, $location['name'] ?? '', $token );
				if ( is_wp_error( $metrics ) ) {
					$warnings[] = $metrics->get_error_message();
				} else {
					$total_metrics += absint( $metrics );
				}

				$imported[] = array(
					'locationId' => $location_id,
					'business'   => sanitize_text_field( $location['title'] ?? '' ),
				);
			}
		}

		if ( empty( $imported ) ) {
			return new WP_Error( 'apls_google_no_locations', __( 'No Business Profile locations were returned for this Google user.', 'apex-local-seo' ) );
		}

		return array(
			'locations' => $imported,
			'count'     => count( $imported ),
			'reviews'   => $total_reviews,
			'photos'    => $total_photos,
			'metrics'   => $total_metrics,
			'warnings'  => array_values( array_unique( $warnings ) ),
		);
	}

	/**
	 * Accounts.
	 *
	 * @param mixed $token Token.

	 * @param mixed $account_row Account row.
	 */
	private function accounts( $token, $account_row ) {
		$cache_key    = 'apls_gbp_accounts_list_' . md5( (string) ( $account_row['email'] ?? 'connected' ) );
		$cooldown_key = 'apls_gbp_accounts_quota_cooldown_' . md5( (string) ( $account_row['email'] ?? 'connected' ) );

		if ( get_transient( $cooldown_key ) ) {
			$this->trace_event( 'request.skip', 'Account Management API skipped because a quota cooldown is active.' );
			return new WP_Error( 'apls_google_quota_exceeded', __( 'Google Account Management quota is temporarily exhausted. Please wait at least one minute before syncing again.', 'apex-local-seo' ) );
		}

		$cached = get_transient( $cache_key );
		if ( is_array( $cached ) ) {
			$this->trace_event( 'cache.hit', 'Using cached Account Management accounts.list response.' );
			return $cached;
		}

		$accounts   = array();
		$page_token = '';
		$page       = 0;

		do {
			++$page;
			$url = add_query_arg(
				array_filter(
					array(
						'pageSize'  => 20,
						'pageToken' => $page_token,
					)
				),
				self::ACCOUNT_API . '/accounts'
			);

			$response = $this->get( $url, $token, 'GET', 'account-management.accounts.list' );
			if ( is_wp_error( $response ) ) {
				if ( 429 === absint( $response->get_error_data()['status'] ?? 0 ) ) {
					set_transient( $cooldown_key, time(), 60 );
				}
				return $response;
			}

			$accounts   = array_merge( $accounts, (array) ( $response['accounts'] ?? array() ) );
			$page_token = sanitize_text_field( $response['nextPageToken'] ?? '' );
		} while ( '' !== $page_token && $page < 5 );

		$data = array( 'accounts' => $accounts );
		set_transient( $cache_key, $data, 5 * MINUTE_IN_SECONDS );
		$this->trace_event( 'cache.store', 'Stored Account Management accounts.list response for five minutes.' );

		return $data;
	}

	/**
	 * Sync performance metrics.
	 *
	 * @param mixed $location_id Location id.

	 * @param mixed $location_name Location name.

	 * @param mixed $token Token.
	 */
	private function sync_performance_metrics( $location_id, $location_name, $token ) {
		$location_name = trim( (string) $location_name, '/' );
		if ( '' === $location_name ) {
			return 0;
		}

		$start = gmdate( 'Y-m-d', strtotime( '-90 days' ) );
		$end   = gmdate( 'Y-m-d', strtotime( '-1 day' ) );
		$query = array(
			'dailyMetrics'               => array(
				'CALL_CLICKS',
				'WEBSITE_CLICKS',
				'BUSINESS_DIRECTION_REQUESTS',
				'BUSINESS_IMPRESSIONS_DESKTOP_SEARCH',
				'BUSINESS_IMPRESSIONS_MOBILE_SEARCH',
				'BUSINESS_IMPRESSIONS_DESKTOP_MAPS',
				'BUSINESS_IMPRESSIONS_MOBILE_MAPS',
				'BUSINESS_PHOTO_VIEWS',
			),
			'dailyRange.startDate.year'  => gmdate( 'Y', strtotime( $start ) ),
			'dailyRange.startDate.month' => gmdate( 'n', strtotime( $start ) ),
			'dailyRange.startDate.day'   => gmdate( 'j', strtotime( $start ) ),
			'dailyRange.endDate.year'    => gmdate( 'Y', strtotime( $end ) ),
			'dailyRange.endDate.month'   => gmdate( 'n', strtotime( $end ) ),
			'dailyRange.endDate.day'     => gmdate( 'j', strtotime( $end ) ),
		);

		$url  = self::PERFORMANCE_API . '/' . $location_name . ':fetchMultiDailyMetricsTimeSeries?' . http_build_query( $query, '', '&', PHP_QUERY_RFC3986 );
		$data = $this->get( $url, $token, 'GET', 'performance.fetchMultiDailyMetricsTimeSeries' );
		if ( is_wp_error( $data ) ) {
			return $data;
		}

		$rows = $this->normalize_metrics( $data );
		$this->repository->save_metrics( $location_id, $rows );

		return count( $rows );
	}

	/**
	 * Normalize metrics.
	 *
	 * @param mixed $data Data.
	 */
	private function normalize_metrics( $data ) {
		$rows   = array();
		$series = $data['multiDailyMetricTimeSeries'] ?? array();
		foreach ( (array) $series as $multi ) {
			foreach ( (array) ( $multi['dailyMetricTimeSeries'] ?? array() ) as $metric_series ) {
				$metric = $metric_series['dailyMetric'] ?? '';
				$values = $metric_series['timeSeries']['datedValues'] ?? array();
				foreach ( (array) $values as $value ) {
					$date = $this->metric_date( $value['date'] ?? array() );
					if ( '' === $date ) {
						continue;
					}
					if ( ! isset( $rows[ $date ] ) ) {
						$rows[ $date ] = array( 'date' => $date );
					}
					$key                   = $this->metric_key( $metric );
					$rows[ $date ][ $key ] = absint( $rows[ $date ][ $key ] ?? 0 ) + absint( $value['value'] ?? 0 );
				}
			}
		}

		return array_values( $rows );
	}

	/**
	 * Metric date.
	 *
	 * @param mixed $date Date.
	 */
	private function metric_date( $date ) {
		if ( empty( $date['year'] ) || empty( $date['month'] ) || empty( $date['day'] ) ) {
			return '';
		}

		return sprintf( '%04d-%02d-%02d', absint( $date['year'] ), absint( $date['month'] ), absint( $date['day'] ) );
	}

	/**
	 * Metric key.
	 *
	 * @param mixed $metric Metric.
	 */
	private function metric_key( $metric ) {
		$map = array(
			'CALL_CLICKS'                         => 'calls',
			'WEBSITE_CLICKS'                      => 'website_clicks',
			'BUSINESS_DIRECTION_REQUESTS'         => 'direction_requests',
			'BUSINESS_IMPRESSIONS_DESKTOP_SEARCH' => 'search_views',
			'BUSINESS_IMPRESSIONS_MOBILE_SEARCH'  => 'search_views',
			'BUSINESS_IMPRESSIONS_DESKTOP_MAPS'   => 'maps_views',
			'BUSINESS_IMPRESSIONS_MOBILE_MAPS'    => 'maps_views',
			'BUSINESS_PHOTO_VIEWS'                => 'photo_views',
		);

		return $map[ $metric ] ?? sanitize_key( strtolower( $metric ) );
	}

	/**
	 * Location path.
	 *
	 * @param mixed $account_name Account name.

	 * @param mixed $location_name Location name.
	 */
	private function location_path( $account_name, $location_name ) {
		$account_name  = trim( (string) $account_name, '/' );
		$location_name = trim( (string) $location_name, '/' );

		if ( 0 === strpos( $location_name, 'accounts/' ) ) {
			return $location_name;
		}

		return $account_name . '/' . $location_name;
	}

	/**
	 * Get.
	 *
	 * @param mixed $url Url.

	 * @param mixed $token Token.

	 * @param mixed $method Method.

	 * @param mixed $label Label.
	 */
	private function get( $url, $token, $method = 'GET', $label = '' ) {
		$this->trace_request( $method, $url, $label, 'start', 0 );
		$response = wp_remote_get(
			$url,
			array(
				'timeout' => 25,
				'headers' => array(
					'Authorization' => 'Bearer ' . $token,
					'Accept'        => 'application/json',
				),
			)
		);

		if ( is_wp_error( $response ) ) {
			$this->trace_request( $method, $url, $label, 'transport_error', 0, $response->get_error_message() );
			return $response;
		}

		$status   = wp_remote_retrieve_response_code( $response );
		$body     = json_decode( wp_remote_retrieve_body( $response ), true );
		$raw_body = wp_remote_retrieve_body( $response );
		$this->trace_request( $method, $url, $label, 'response', $status );

		if ( $status < 200 || $status >= 300 ) {
			$message = is_array( $body ) ? ( $body['error']['message'] ?? $body['error'] ?? __( 'Google Business Profile API request failed.', 'apex-local-seo' ) ) : __( 'Google Business Profile API request failed.', 'apex-local-seo' );
			$code    = 'apls_google_api_error';
			if ( 429 === absint( $status ) ) {
				$message = __( 'Google Business Profile quota is temporarily exhausted. Please wait at least one minute before syncing again.', 'apex-local-seo' );
				$code    = 'apls_google_quota_exceeded';
				if ( $this->is_zero_quota_response( $body ) ) {
					$message = __( 'Your Google Cloud project has not yet been granted Business Profile API request quota. The plugin is configured correctly, but Google is currently returning a project request limit of zero. Submit Google\'s Application for Basic API Access, then retry after approval.', 'apex-local-seo' );
					$code    = 'apls_google_business_profile_access_required';
				}
			}
			$this->trace_request( $method, $url, $label, 'error', $status, is_string( $message ) ? $message : wp_json_encode( $message ), $raw_body );
			return new WP_Error(
				$code,
				is_string( $message ) ? $message : wp_json_encode( $message ),
				array(
					'status' => $status,
					'body'   => $body,
					'url'    => $url,
				)
			);
		}

		return is_array( $body ) ? $body : array();
	}

	/**
	 * Trace request.
	 *
	 * @param mixed $method Method.

	 * @param mixed $url Url.

	 * @param mixed $label Label.

	 * @param mixed $event Event.

	 * @param mixed $status Status.

	 * @param mixed $message Message.
	 *
	 * @param mixed $response_body Response body.
	 */
	private function trace_request( $method, $url, $label, $event, $status = 0, $message = '', $response_body = '' ) {
		$host  = wp_parse_url( $url, PHP_URL_HOST );
		$path  = wp_parse_url( $url, PHP_URL_PATH );
		$query = wp_parse_url( $url, PHP_URL_QUERY );
		$entry = array(
			'time'    => gmdate( 'c' ),
			'event'   => $event,
			'label'   => sanitize_text_field( $label ),
			'method'  => sanitize_text_field( $method ),
			'host'    => sanitize_text_field( (string) $host ),
			'path'    => sanitize_text_field( (string) $path ),
			'query'   => $this->redact_query( (string) $query ),
			'status'  => absint( $status ),
			'message' => sanitize_text_field( $message ),
		);

		if ( '' !== (string) $response_body ) {
			$entry['responseBody'] = sanitize_textarea_field( substr( (string) $response_body, 0, 4000 ) );
		}

		$this->trace[] = $entry;
	}

	/**
	 * Trace event.
	 *
	 * @param mixed $event Event.

	 * @param mixed $message Message.
	 */
	private function trace_event( $event, $message ) {
		$entry         = array(
			'time'    => gmdate( 'c' ),
			'event'   => sanitize_text_field( $event ),
			'message' => sanitize_text_field( $message ),
		);
		$this->trace[] = $entry;
	}

	/**
	 * Persist trace.
	 */
	private function persist_trace() {
		$account_management_requests = 0;
		foreach ( $this->trace as $entry ) {
			if ( 'response' === ( $entry['event'] ?? '' ) && 'mybusinessaccountmanagement.googleapis.com' === ( $entry['host'] ?? '' ) ) {
				++$account_management_requests;
			}
		}
		$this->trace[] = array(
			'time'                      => gmdate( 'c' ),
			'event'                     => 'sync.summary',
			'accountManagementRequests' => $account_management_requests,
		);
		set_transient( 'apls_gbp_last_request_trace', $this->trace, HOUR_IN_SECONDS );
	}

	/**
	 * Last sync issue.
	 */
	private function last_sync_issue() {
		$trace = get_transient( 'apls_gbp_last_request_trace' );
		if ( ! is_array( $trace ) ) {
			return array();
		}

		foreach ( array_reverse( $trace ) as $entry ) {
			if ( 'error' !== ( $entry['event'] ?? '' ) ) {
				continue;
			}

			return array(
				'label'        => sanitize_text_field( $entry['label'] ?? '' ),
				'status'       => absint( $entry['status'] ?? 0 ),
				'message'      => sanitize_text_field( $entry['message'] ?? '' ),
				'responseBody' => sanitize_textarea_field( $entry['responseBody'] ?? '' ),
			);
		}

		return array();
	}

	/**
	 * Redact query.
	 *
	 * @param mixed $query Query.
	 */
	private function redact_query( $query ) {
		if ( '' === $query ) {
			return '';
		}
		parse_str( $query, $params );
		unset( $params['access_token'], $params['key'] );
		return http_build_query( $params, '', '&', PHP_QUERY_RFC3986 );
	}

	/**
	 * Is zero quota response.
	 *
	 * @param mixed $body Body.
	 */
	private function is_zero_quota_response( $body ) {
		$details = $body['error']['details'] ?? array();
		foreach ( (array) $details as $detail ) {
			$metadata = $detail['metadata'] ?? array();
			if ( isset( $metadata['quota_limit_value'] ) && '0' === (string) $metadata['quota_limit_value'] ) {
				return true;
			}
		}

		return false;
	}
}
