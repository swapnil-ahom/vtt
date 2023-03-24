import {Router} from '@classes';
import {AuthService} from '@services/auth.service';
import {SessionController} from '@controllers/session.controller';
import {Validator} from '@middlewares/validator.middleware';
import {sessionValidations} from '@validations/session.validations';
import { IndependentSessionnController } from '@controllers/independentSession.controller';
import {TrainersController} from "@controllers/trainerconsole.controller";

export class SessionRouter extends Router {

    constructor() {
        super();
    }

    /**
     * @description Plug routes definitions
     */
    define(): void {
        /**
         * @api {post}
         * */
        // depreciated
        this.router.route('/create_segment').post(Validator.check(sessionValidations), AuthService.authenticateToken,
            SessionController.saveSegmentDetails);

        this.router.route('/segment').post(AuthService.authenticateToken, SessionController.getSegmentDetails);

        this.router.route('/segment_list').get(AuthService.authenticateToken, SessionController.getSegmentDetails);

        this.router.route('/activity_type_list').get(AuthService.authenticateToken, SessionController.getActivityTypeList);

        this.router.route('/get_participant_by_batch').post(AuthService.authenticateToken, SessionController.getParticipantListByBatchId);

        this.router.route('/update_session_name').post(AuthService.authenticateToken, SessionController.updateSession);

        this.router.route('/segment_list_by_session').post(AuthService.authenticateToken, SessionController.getSegmentListBySessionID);

        this.router.route('/segment_list_by_library').post(AuthService.authenticateToken, IndependentSessionnController.getSegmentListByLibraryID);

        this.router.route('/cancel_session').post( AuthService.authenticateToken, SessionController.cancelSession);

        this.router.route('/remove_participants').post(AuthService.authenticateToken, SessionController.removeParticipants);

        this.router.route('/session_details').post(AuthService.authenticateToken, SessionController.SessionDetails);

        this.router.route('/start_recording').post(AuthService.authenticateToken, SessionController.startRecording);

        this.router.route('/create_session_reactions').post(AuthService.authenticateToken, SessionController.createSessionReactions);

        this.router.route('/get_session_reactions').get(AuthService.authenticateToken, SessionController.getSessionReactions);

        this.router.route('/create_chat').post(AuthService.authenticateToken, SessionController.createChat);
        this.router.route('/read_chat').post(AuthService.authenticateToken, SessionController.readChat);

        this.router.route('/add_session_progress').post(AuthService.authenticateToken, SessionController.addSessionProgress);

        this.router.route('/get_session_progress').post(AuthService.authenticateToken, SessionController.getSessionProgress);

        this.router.route('/add_library').post(AuthService.authenticateToken, SessionController.addLibrary);

        this.router.route('/get_library_bysub').post(AuthService.authenticateToken, SessionController.getLibraryBySub);


        this.router.route('/get_chat_user_trainer').post(AuthService.authenticateToken, SessionController.getChatUserTrainer);
        this.router.route('/get_chat_user_trainee').post(AuthService.authenticateToken, SessionController.getChatUserTrainee);


        this.router.route('/testing_forcopy_segment').post(AuthService.authenticateToken, SessionController.testingforcopySegment);


        this.router.route('/create_session_raised_hand').post(AuthService.authenticateToken, SessionController.saveSessionRaisedHand);

        this.router.route('/get_session_raised_hand').post(AuthService.authenticateToken, SessionController.getSessionRaisedHand);

        this.router.route('/pre_work_cron').post(SessionController.preWorkCron);
        this.router.route('/post_work_cron').post(SessionController.postWorkCron);

        this.router.route('/run_cron').post(SessionController.runCron);

    }

}
