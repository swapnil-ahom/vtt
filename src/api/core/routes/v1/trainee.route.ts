import { Router } from '@classes';
import { AuthTraineeService } from '@services/auth-trainee.service';
import { TraineeController } from '@controllers/trainee.controller';

export class TraineeRoute extends Router {
  constructor() {
    super();
  }

  define(): void {
    this.router
      .route('/sign_up_with_email')
      .post(TraineeController.signUpWithEmail);

    this.router.route('/login').post(TraineeController.login);

    this.router
      .route('/verify_email')
      .post(
        AuthTraineeService.authenticateToken,
        TraineeController.verifyEmailOTP
      );

    this.router
      .route('/resend_otp')
      .post(AuthTraineeService.authenticateToken, TraineeController.resendOTP);

    this.router
      .route('/login_or_signUpWith_SocialMedia')
      .post(TraineeController.loginOrSignUpWithSocialMedia);

    this.router
      .route('/add_poll')
      .post(AuthTraineeService.authenticateToken, TraineeController.addPoll);

    this.router
      .route('/search_poll')
      .post(AuthTraineeService.authenticateToken, TraineeController.searchPoll);

    this.router
      .route('/program_list')
      .get(AuthTraineeService.authenticateToken, TraineeController.ProgramList);

    this.router
      .route('/program_history')
      .get(
        AuthTraineeService.authenticateToken,
        TraineeController.ProgramsHistory
      );

    this.router
      .route('/search_by_id')
      .get(AuthTraineeService.authenticateToken, TraineeController.searchbyId);

    this.router
      .route('/all_programs')
      .get(AuthTraineeService.authenticateToken, TraineeController.AllPrograms);

    this.router
      .route('/program_details')
      .post(
        AuthTraineeService.authenticateToken,
        TraineeController.ProgramsDetails
      );

    this.router
      .route('/search_by_id')
      .get(AuthTraineeService.authenticateToken, TraineeController.searchbyId);

    this.router
      .route('/search_by_date')
      .post(
        AuthTraineeService.authenticateToken,
        TraineeController.searchByDate
      );

    this.router
      .route('/upcoming_event')
      .post(
        AuthTraineeService.authenticateToken,
        TraineeController.upcomingEvent
      );

    this.router
      .route('/dashboard_overview')
      .get(
        AuthTraineeService.authenticateToken,
        TraineeController.dashboardOverview
      );

    this.router
      .route('/pending_tasks')
      .get(
        AuthTraineeService.authenticateToken,
        TraineeController.pendingTasks
      );

    this.router
      .route('/all_tasks')
      .get(AuthTraineeService.authenticateToken, TraineeController.allTasks);

    this.router
      .route('/get_pre_post_activity')
      .post(
        AuthTraineeService.authenticateToken,
        TraineeController.gatPrePostActivity
      );

    this.router
      .route('/trainee_completed_tasks')
      .post(
        AuthTraineeService.authenticateToken,
        TraineeController.traineeCompletedTask
      );

    this.router
      .route('/get_program_by_id')
      .post(
        AuthTraineeService.authenticateToken,
        TraineeController.getProgramById
      );

    this.router
      .route('/session_deatils')
      .get(
        AuthTraineeService.authenticateToken,
        TraineeController.sessionDeatils
      );

      this.router.route('/segment_list_by_session')
      .post(
        AuthTraineeService.authenticateToken,
        TraineeController.getSegmentListBySessionID
      );

    this.router
      .route('/create_trainee_notes')
      .post(
        AuthTraineeService.authenticateToken,
        TraineeController.createTraineeNotes
      );

      this.router
      .route('/delete_trainee_notes')
      .post(
        AuthTraineeService.authenticateToken,
        TraineeController.deleteTraineeNotes
        );

      this.router
      .route('/get_trainee_notes')
      .get(
        AuthTraineeService.authenticateToken,
        TraineeController.getTraineeNotes
        );

      this.router
      .route('/get_segment_activity_for_trainee')
      .post(
        AuthTraineeService.authenticateToken,
        TraineeController.getTraineeSegmentActivity
        );

        this.router.route('/get_notification').post(AuthTraineeService.authenticateToken,TraineeController.getNotification);

        this.router.route('/save_trainee_profile_data').post(AuthTraineeService.authenticateToken,TraineeController.saveTraineeProfileData);

        this.router.route('/save_age_group').post(AuthTraineeService.authenticateToken,TraineeController.saveAgeGroup);

        this.router.route('/get_visiting_card_List').post(AuthTraineeService.authenticateToken, TraineeController.getVisitingCardList );

        this.router.route('/create_visiting_card').post(AuthTraineeService.authenticateToken, TraineeController.createVisitingCard );

        this.router.route('/update_visiting_card').post(AuthTraineeService.authenticateToken, TraineeController.updateVisitingCard );

        this.router.route('/get_visiting_card_detail').post(AuthTraineeService.authenticateToken, TraineeController.getVisitingCardDetail );

        this.router.route('/get_age_group_data').get(AuthTraineeService.authenticateToken, TraineeController.getAgeGroupData );

        this.router.route('/reset_trainee_password').post(AuthTraineeService.authenticateToken, TraineeController.resetTraineePassword );

        this.router.route('/add_session_info_to_trainee').post(AuthTraineeService.authenticateToken, TraineeController.addSessionInfoToTrainee );

        this.router.route('/get_trainee_profile_data').get(AuthTraineeService.authenticateToken, TraineeController.getTraineeProfileData);

        this.router.route('/create_collected_visiting_card').post(AuthTraineeService.authenticateToken, TraineeController.createCollectedVisitingCard );

        this.router.route('/get_collected_visiting_card_list').get(AuthTraineeService.authenticateToken, TraineeController.getCollectedVisitingCardList );

        this.router.route('/delete_collected_visiting_card').post(AuthTraineeService.authenticateToken, TraineeController.deleteCollectedVisitingCard );
  }
}
