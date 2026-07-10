<?php
/**
 * Settings repository.
 *
 * @package Apex_Local_SEO
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * APLS Data Repositories SettingsRepository.
 */
class APLS_Data_Repositories_SettingsRepository implements APLS_Contracts_RepositoryInterface {
	/**
	 * Get.
	 *
	 * @param mixed $key Key.

	 * @param mixed $fallback Fallback.
	 */
	public function get( $key, $fallback = '' ) {
		return get_option( 'apls_' . sanitize_key( $key ), $fallback );
	}

	/**
	 * Set.
	 *
	 * @param mixed $key Key.

	 * @param mixed $value Value.
	 */
	public function set( $key, $value ) {
		return update_option( 'apls_' . sanitize_key( $key ), $value, false );
	}

	/**
	 * All.
	 */
	public function all() {
		return array(
			'enabledModules'    => (array) $this->get( 'enabled_modules', array() ),
			'dashboardRange'    => $this->get( 'dashboard_range', '30' ),
			'syncFrequency'     => $this->get( 'sync_frequency', 'daily' ),
			'dataRetentionDays' => absint( $this->get( 'data_retention_days', 730 ) ),
			'advisorMode'       => $this->get( 'advisor_mode', 'rule_based' ),
		);
	}
}
