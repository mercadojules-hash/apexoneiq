<?php
/**
 * Apex Local SEO plugin file.
 *
 * @package Apex_Local_SEO
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; }

/**
 * APLS Services Recommendations RecommendationEngine.
 */
class APLS_Services_Recommendations_RecommendationEngine implements APLS_Contracts_ServiceInterface {
	/**
	 * Repository.
	 *
	 * @var mixed
	 */
	private $repository;

	/**
	 * Construct.
	 *
	 * @param APLS_Data_Repositories_RecommendationRepository $repository Repository.
	 */
	public function __construct( APLS_Data_Repositories_RecommendationRepository $repository ) {
		$this->repository = $repository;
	}

	/**
	 * Dashboard recommendations.
	 */
	public function dashboard_recommendations() {
		$stored = $this->repository->recent( 6 );
		if ( $stored ) {
			return $stored;
		}

		return array(
			APLS_Data_DTO_Recommendation::make( 'reviews', __( 'Reply to new reviews faster', 'apex-local-seo' ), 'high' ),
			APLS_Data_DTO_Recommendation::make( 'gbp', __( 'Complete core business profile fields', 'apex-local-seo' ), 'high' ),
			APLS_Data_DTO_Recommendation::make( 'gbp', __( 'Publish a Google Post this week', 'apex-local-seo' ), 'normal' ),
			APLS_Data_DTO_Recommendation::make( 'citations', __( 'Run the first citation consistency audit', 'apex-local-seo' ), 'normal' ),
		);
	}
}
