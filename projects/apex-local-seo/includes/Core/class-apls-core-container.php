<?php
/**
 * Minimal service container.
 *
 * @package Apex_Local_SEO
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * APLS Core Container.
 */
class APLS_Core_Container {
	/**
	 * Service factories.
	 *
	 * @var array
	 */
	private $factories = array();

	/**
	 * Shared service instances.
	 *
	 * @var array
	 */
	private $instances = array();

	/**
	 * Register a service factory.
	 *
	 * @param string   $id      Service ID.
	 * @param callable $factory Factory callback.
	 * @return void
	 */
	public function set( $id, $factory ) {
		$this->factories[ sanitize_key( $id ) ] = $factory;
	}

	/**
	 * Resolve a service.
	 *
	 * @param string $id Service ID.
	 * @return mixed|null
	 */
	public function get( $id ) {
		$id = sanitize_key( $id );

		if ( isset( $this->instances[ $id ] ) ) {
			return $this->instances[ $id ];
		}

		if ( ! isset( $this->factories[ $id ] ) ) {
			return null;
		}

		$this->instances[ $id ] = call_user_func( $this->factories[ $id ], $this );
		return $this->instances[ $id ];
	}

	/**
	 * Check whether a service is registered.
	 *
	 * @param string $id Service ID.
	 * @return bool
	 */
	public function has( $id ) {
		return isset( $this->factories[ sanitize_key( $id ) ] );
	}
}
