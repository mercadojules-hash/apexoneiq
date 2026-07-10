<?php
/**
 * Apex Local SEO plugin file.
 *
 * @package Apex_Local_SEO
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; }

/**
 * APLS Services BusinessProfile BusinessProfileProviderManager.
 */
class APLS_Services_BusinessProfile_BusinessProfileProviderManager implements APLS_Contracts_ServiceInterface {
	/**
	 * Google.
	 *
	 * @var mixed
	 */
	private $google;
	/**
	 * Mock.
	 *
	 * @var mixed
	 */
	private $mock;

	/**
	 * Construct.
	 *
	 * @param APLS_Contracts_BusinessProfileProviderInterface $google Google.

	 * @param APLS_Contracts_BusinessProfileProviderInterface $mock Mock.
	 */
	public function __construct( APLS_Contracts_BusinessProfileProviderInterface $google, APLS_Contracts_BusinessProfileProviderInterface $mock ) {
		$this->google = $google;
		$this->mock   = $mock;
	}

	/**
	 * Active provider.
	 */
	public function active_provider() {
		$status = $this->google->status();
		if ( ! empty( $status['connected'] ) ) {
			return $this->google;
		}

		return $this->mock;
	}

	/**
	 * Google provider.
	 */
	public function google_provider() {
		return $this->google;
	}

	/**
	 * Mock provider.
	 */
	public function mock_provider() {
		return $this->mock;
	}

	/**
	 * Mode.
	 */
	public function mode() {
		$provider = $this->active_provider();
		return array(
			'activeProvider' => $provider->id(),
			'label'          => $provider->label(),
			'googleStatus'   => $this->google->status(),
		);
	}

	/**
	 * Diagnostics.
	 */
	public function diagnostics() {
		return array(
			'activeProvider' => $this->active_provider()->id(),
			'google'         => $this->google->diagnostics(),
			'mock'           => $this->mock->diagnostics(),
		);
	}
}
