<?php
/**
 * Recommendation DTO.
 *
 * @package Apex_Local_SEO
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * APLS Data DTO Recommendation.
 */
class APLS_Data_DTO_Recommendation {
	/**
	 * Create a recommendation payload.
	 *
	 * @param string $module_id Module ID.
	 * @param string $title     Title.
	 * @param string $priority  Priority.
	 * @return array
	 */
	public static function make( $module_id, $title, $priority = 'normal' ) {
		return array(
			'moduleId'                => sanitize_key( $module_id ),
			'title'                   => sanitize_text_field( $title ),
			'priority'                => sanitize_key( $priority ),
			'confidence'              => 0,
			'estimatedVisibilityLift' => null,
			'status'                  => 'advisor_ready',
		);
	}
}
