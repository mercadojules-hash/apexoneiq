<?php
/**
 * Module status DTO.
 *
 * @package Apex_Local_SEO
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * APLS Data DTO ModuleStatus.
 */
class APLS_Data_DTO_ModuleStatus {
	/**
	 * Build status payload.
	 *
	 * @param string $status Status code.
	 * @param string $label  Human-readable label.
	 * @return array
	 */
	public static function make( $status, $label ) {
		return array(
			'status' => sanitize_key( $status ),
			'label'  => sanitize_text_field( $label ),
		);
	}
}
