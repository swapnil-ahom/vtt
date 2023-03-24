import {TrainersController} from '../../controllers/trainerconsole.controller';

import {AuthService} from '@services/auth.service';
import {Router} from '@classes';
import { IndependentSessionnController } from '../../controllers/independentSession.controller';


export class TrainersRouter extends Router {

    constructor() {
        super();
    }

    define(): void {
        /**
         * @api {post}
         * */

        this.router.route('/participants_by_batch').get(AuthService.authenticateToken, TrainersController.getParticipantbyBatchID);

        this.router.route('/join_participant').post(AuthService.authenticateToken, TrainersController.join_participant);
        this.router.route('/session_plan_log').post(AuthService.authenticateToken, TrainersController.createSessionPlanLog);
        this.router.route('/get_session_plan_log').post(AuthService.authenticateToken, TrainersController.getSessionPlanLogBySessionMapId);
        this.router.route('/get_mapping_data').post(AuthService.authenticateToken, TrainersController.getMappingDataById);

        this.router.route('/segment_activity').post(AuthService.authenticateToken, TrainersController.SegmentActicity);
        this.router.route('/session_segment').post(AuthService.authenticateToken, TrainersController.sessionSegment);

        this.router.route('/delete_session_segment').post(AuthService.authenticateToken, TrainersController.deleteSessionSegment);

        this.router.route('/delete_library_segment').post(AuthService.authenticateToken, IndependentSessionnController.deleteLibrarySegment);


        this.router.route('/delete_segment_activity').post(AuthService.authenticateToken, TrainersController.deleteSegmentActivity);

        this.router.route('/get_segment_activity').post(AuthService.authenticateToken, TrainersController.getSegmentActivity);
        this.router.route('/get_session_segment').post(AuthService.authenticateToken, TrainersController.getSessionSegment);
        this.router.route('/get_type_data').post(AuthService.authenticateToken, TrainersController.getTypeData);

        this.router.route('/get_session_map').post(AuthService.authenticateToken, TrainersController.getSessionMap);
        this.router.route('/cancel_session').post(AuthService.authenticateToken, TrainersController.cancelSession);

        this.router.route('/create_new_query').post(AuthService.authenticateToken, TrainersController.createNewQuery);
        this.router.route('/list_queries').post(AuthService.authenticateToken, TrainersController.listQueries);
        this.router.route('/list_queries_id').post(AuthService.authenticateToken, TrainersController.listQueriesId);

        this.router.route('/list_query_trainer').post(AuthService.authenticateToken, TrainersController.listquerytrainer);
        this.router.route('/trainer_response').post(AuthService.authenticateToken, TrainersController.trainerQueryReply);

        this.router.route('/get_queries_by_other').get(AuthService.authenticateToken, TrainersController.getQueriesByOther);
        this.router.route('/reply_on_others_queries').post(AuthService.authenticateToken, TrainersController.replyOnOthersQueries);
        this.router.route('/all_details_of_queries').post(AuthService.authenticateToken, TrainersController.allDetailsOfQueries);

        this.router.route('/change_session_plan_status').post(AuthService.authenticateToken, TrainersController.changeSessionPlanStatus);
        this.router.route('/session_last_updated_at/:sessionId').get(AuthService.authenticateToken, TrainersController.getSessionUpdateTime);
        this.router.route('/pending_session_segments').get(AuthService.authenticateToken, TrainersController.pendingSessionSegments);

        this.router.route('/trainee_attendance').post(AuthService.authenticateToken, TrainersController.traineeAttendance);

        this.router.route('/quick_setup_activity').post(AuthService.authenticateToken, TrainersController.quickSetupActivity);

        this.router.route('/create_live_console_log').post(AuthService.authenticateToken, TrainersController.insertLiveConsoleLog);
        this.router.route('/read_live_console_log').post(AuthService.authenticateToken, TrainersController.getLiveConsoleLog);

        this.router.route('/session_plan_preview').post(AuthService.authenticateToken, TrainersController.getSessionPlanPreview);

        this.router.route('/comments_on_query').post(AuthService.authenticateToken, TrainersController.CommentsOnQuery);
        this.router.route('/get_trainer_queries').post(AuthService.authenticateToken, TrainersController.getTrainerQueries);

        this.router.route('/get_notification').get(AuthService.authenticateToken, TrainersController.getNotification);

        this.router.route('/copy_template').post(AuthService.authenticateToken, IndependentSessionnController.copyTemplate);

        this.router.route('/library_segment').post(AuthService.authenticateToken, IndependentSessionnController.librarySegment);

        this.router.route('/library_activity').post(AuthService.authenticateToken, IndependentSessionnController.LibraryActivity);

        this.router.route('/get_librarytype_data').post(AuthService.authenticateToken, IndependentSessionnController.getLibraryTypeData);

        this.router.route('/delete_library_activity').post(AuthService.authenticateToken, IndependentSessionnController.deleteLibraryActivity);

        // Pending tasks
        this.router.route('/get_trainer_pending_task').get(AuthService.authenticateToken, TrainersController.getTrainerPendingTask);

        this.router.route('/save_trainer_profile_data').post(AuthService.authenticateToken, TrainersController.saveTrainerProfileData);
        this.router.route('/get_trainer_profile_data').get(AuthService.authenticateToken, TrainersController.getTrainerProfileData);
        this.router.route('/get_age_group_data').get(AuthService.authenticateToken, TrainersController.getAgeGroupData);

        this.router.route('/get_profile_avatar').post(AuthService.authenticateToken, TrainersController.getTrainerProfileAvatar);

        // this.router.route('/get_completed_programmes_detail').post(AuthService.authenticateToken, TrainersController.getCompletedProgrammesDetail);


        // this.router.route('/library_segment').post(AuthService.authenticateToken, IndependentSessionnController.LibrarySegment);

        this.router.route('/get_trainee_submitted_task').get(AuthService.authenticateToken, TrainersController.getTraineeSubmittedTask);
        this.router.route('/evaluate_submitted_task').post(AuthService.authenticateToken, TrainersController.evaluateSubmittedTask);
        this.router.route('/send_reminder_to_trainee').post(AuthService.authenticateToken, TrainersController.sendReminderToTrainee);
        this.router.route('/ask_to_redo').post(AuthService.authenticateToken, TrainersController.askToRedo);

        this.router.route('/generate_link').post(AuthService.authenticateToken, TrainersController.generateLink);

        this.router.route('/get_all_library').post(AuthService.authenticateToken, IndependentSessionnController.getAllLibrary);

        this.router.route('/get_library_by_type').post(AuthService.authenticateToken, IndependentSessionnController.getLibraryByType);

        this.router.route('/get_library_by_id').post(AuthService.authenticateToken, IndependentSessionnController.getLibraryById);

        // this.router.route('/create_library').post(AuthService.authenticateToken, IndependentSessionnController.createLibrary);

        this.router.route('/share_library').post(AuthService.authenticateToken, IndependentSessionnController.shareLibrary);

        this.router.route('/delete_library').post(AuthService.authenticateToken, IndependentSessionnController.deleteLibrary);

        this.router.route('/upload_library_document').post(AuthService.authenticateToken, IndependentSessionnController.uploadLibraryDocument);

        this.router.route('/open_export_modal').post(AuthService.authenticateToken, TrainersController.openExportModal);

        this.router.route('/get_poll_status').post(AuthService.authenticateToken, TrainersController.getPollStatus);

        this.router.route('/create_library_independent_session').post(AuthService.authenticateToken, IndependentSessionnController.createLibraryIndependentSession);

        this.router.route('/create_library_activity').post(AuthService.authenticateToken, IndependentSessionnController.createLibraryActivity);

        this.router.route('/create_independent_library_activity').post(AuthService.authenticateToken, IndependentSessionnController.createIndependentLibrayActivity);
    

    }
}
