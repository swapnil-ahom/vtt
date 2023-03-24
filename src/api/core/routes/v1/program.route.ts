import {Router} from '@classes';
import {ProgramController} from '@controllers/program.controller';
import {AuthService} from '@services/auth.service';

export class ProgramRouter extends Router {

    constructor() {
        super()
    }

    /**
     * @description Plug routes definitions
     */
    define(): void {
        /**
         * @api {post} /clients Create clients
         * @apiDescription Create a new clients.
         * @apiVersion 1.0.0
         * @apiName CreateClients
         * @apiGroup Client
         * @apiPermission admin
         *
         * @apiUse BaseHeader
         *
         * @apiParam  {String}          email         Client email
         * @apiParam  {String}          address       Client address
         * @apiParam  {String}          name          Client name
         * @apiParam  {String="REGISTERED", "REVIEWED", "CONFIRMED", "BANNED"} status Client status
         *
         * @apiSuccess (201 Created) {Client}      client                Created client
         * @apiSuccess (201 Created) {String}      client.id             Client id
         * @apiSuccess (201 Created) {String}      client.name           Clientname
         * @apiSuccess (201 Created) {String}      client.email          Email address
         * @apiSuccess (201 Created) {String}      client.status         Account status
         * @apiSuccess (201 Created) {Date}        client.createdAt      Client creation date
         * @apiSuccess (201 Created) {Date}        client.updatedAt      Client updating date
         *
         * @apiSuccessExample {json} Success response example
         * {
         *    "id": 1,
         *    "name": "haris",
         *    "email": "contact@ahom.tech",
         *    "status": "CONFIRMED",
         *    "address": "Gurugram",
         *    "createdAt": "2019-08-10T08:22:00.000Z",
         *    "updatedAt": "2019-08-10T08:22:03.000Z"
         * }
         *
         * @apiError (400 Bad Request)   ValidationError  Some parameters may contain invalid values
         * @apiUse BadRequest
         *
         * @apiError (401 Unauthorized)  Unauthorized     Only authenticated users can create the data
         * @apiUse Unauthorized
         *
         * @apiError (403 Forbidden)     Forbidden        Only admins can create the data
         * @apiUse Forbidden
         *
         * @apiError (406 Not Acceptable)   header must be "application/json".
         * @apiError (406 Not Acceptable)  Origin header must be "https://*".
         * @apiUse NotAcceptable
         *
         * @apiError (409 Conflict) MySQLError Some parameters are already presents in database (username or email)
         * @apiUse Conflict
         */
        this.router.route('/clients').post(AuthService.authenticateToken, ProgramController.createClient);

        /**
         * @api {get} /clients API
         * @apiDescription Get the list of client from the database using api.
         * @apiVersion 1.0.0
         * @apiName Client List
         * @apiGroup Program
         * @apiPermission public
         *
         * @apiUse BaseHeaderSimple
         *
         * @apiSuccess (200 OK) {String} / Success message as "OK".
         * @apiSuccessExample Success
         *    HTTP/1.1 200
         *    OK
         *
         * @apiError (406 Not Acceptable) NotAcceptable An expected header value was not passed correctly.
         * @apiUse NotAcceptable
         *
         * @apiError (500 Internal Server Error) InternalServerError An unexpected error was occurred.
         * @apiUse InternalServerError
         */
        this.router.route('/clients').get(AuthService.authenticateToken, ProgramController.clientList);

        /**
         * @api {patch} /clients API
         * @apiDescription  Update some fields of an client document.
         * @apiVersion 1.0.0
         * @apiName Client List
         * @apiGroup Program
         * @apiPermission public
         *
         * @apiUse BaseHeaderSimple
         *
         * @apiSuccess (200 OK) {String} / Success message as "OK".
         * @apiSuccessExample Success
         *    HTTP/1.1 200
         *    OK
         *
         * @apiError (406 Not Acceptable) NotAcceptable An expected header value was not passed correctly.
         * @apiUse NotAcceptable
         *
         * @apiError (500 Internal Server Error) InternalServerError An unexpected error was occurred.
         * @apiUse InternalServerError
         */
        this.router
            .route('/clients')
            .post(AuthService.authenticateToken, ProgramController.clientUpdate);


        /**
         * @api {post} /trainers Create trainers
         * @apiDescription Create a new trainers.
         * @apiVersion 1.0.0
         * @apiName Create Trainers
         * @apiGroup Trainers
         * @apiPermission admin
         *
         * @apiUse BaseHeader
         *
         * @apiParam  {String}          email         Trainer email
         * @apiParam  {String}          address       Trainer address
         * @apiParam  {String}          name          Trainer name
         * @apiParam  {String="REGISTERED", "REVIEWED", "CONFIRMED", "BANNED"} status Trainer status
         *
         * @apiSuccess (201 Created) {Trainer}     trainer                Created Trainer
         * @apiSuccess (201 Created) {String}      trainer.id             Trainer id
         * @apiSuccess (201 Created) {String}      trainer.name           Trainer
         * @apiSuccess (201 Created) {String}      trainer. Email address
         * @apiSuccess (201 Created) {String}      trainer. Status         Account status
         * @apiSuccess (201 Created) {Date}        trainer.createdAt      Trainer creation date
         * @apiSuccess (201 Created) {Date}        trainer.updatedAt      Trainer updating date
         *
         * @apiSuccessExample {json} Success response example
         * {
         *    "id": 1,
         *    "name": "haris",
         *    "email": "contact@ahom.tech",
         *    "status": "CONFIRMED",
         *    "address": "Guru gram",
         *    "createdAt": "2019-08-10T08:22:00.000Z",
         *    "updatedAt": "2019-08-10T08:22:03.000Z"
         * }
         *
         * @apiError (400 Bad Request)   ValidationError  Some parameters may contain invalid values
         * @apiUse BadRequest
         *
         * @apiError (401 Unauthorized)  Unauthorized     Only authenticated users can create the data
         * @apiUse Unauthorized
         *
         * @apiError (403 Forbidden)     Forbidden        Only admins can create the data
         * @apiUse Forbidden
         *
         * @apiError (406 Not Acceptable)  Content-Type Content-Type header must be "application/json".
         * @apiError (406 Not Acceptable)  Origin Origin header must be "https://*".
         * @apiUse NotAcceptable
         *
         * @apiError (409 Conflict) MySQLError Some parameters are already presents in database (username or email)
         * @apiUse Conflict
         */
        this.router.route('/trainers').post(AuthService.authenticateToken, ProgramController.createTrainer);

        /**
         * @api {get} /trainers API
         * @apiDescription Get the list of trainer from the database using api.
         * @apiVersion 1.0.0
         * @apiName Trainer List
         * @apiGroup Program
         * @apiPermission public
         *
         * @apiUse BaseHeaderSimple
         *
         * @apiSuccess (200 OK) {String} / Success message as "OK".
         * @apiSuccessExample Success
         *    HTTP/1.1 200
         *    OK
         *
         * @apiError (406 Not Acceptable) NotAcceptable An expected header value was not passed correctly.
         * @apiUse NotAcceptable
         *
         * @apiError (500 Internal Server Error) InternalServerError An unexpected error was occurred.
         * @apiUse InternalServerError
         */
        this.router
            .route('/trainers')
            .get(AuthService.authenticateToken, ProgramController.trainerList);

        /**
         * @api {patch} /trainers API
         * @apiDescription  Update some fields of an trainer document.
         * @apiVersion 1.0.0
         * @apiName Trainer List
         * @apiGroup Program
         * @apiPermission public
         *
         * @apiUse BaseHeaderSimple
         *
         * @apiSuccess (200 OK) {String} / Success message as "OK".
         * @apiSuccessExample Success
         *    HTTP/1.1 200
         *    OK
         *
         * @apiError (406 Not Acceptable) NotAcceptable An expected header value was not passed correctly.
         * @apiUse NotAcceptable
         *
         * @apiError (500 Internal Server Error) InternalServerError An unexpected error was occurred.
         * @apiUse InternalServerError
         */
        this.router
            .route('/trainers')
            .patch(AuthService.authenticateToken, ProgramController.trainerUpdate);

        /**
         * @api {post} /quick_setup Create program
         * @apiDescription Create a new program.
         * @apiVersion 1.0.0
         * @apiName Create Program
         * @apiGroup Program
         * @apiPermission admin
         *
         * @apiUse BaseHeader
         *
         * @apiParam  {String}          email         Client email
         * @apiSuccess (201 Created) {Date}        client.createdAt      Client creation date
         * @apiSuccess (201 Created) {Date}        client.updatedAt      Client updating date
         *
         * @apiSuccessExample {json} Success response example
         * {
         *    "id": 1,
         *    "createdAt": "2019-08-10T08:22:00.000Z",
         *    "updatedAt": "2019-08-10T08:22:03.000Z"
         * }
         *
         * @apiError (400 Bad Request)   ValidationError  Some parameters may contain invalid values
         * @apiUse BadRequest
         *
         * @apiError (401 Unauthorized)  Unauthorized     Only authenticated users can create the data
         * @apiUse Unauthorized
         *
         * @apiError (403 Forbidden)     Forbidden        Only admins can create the data
         * @apiUse Forbidden
         *
         * @apiError (406 Not Acceptable)  Content-Type Content-Type header must be "application/json".
         * @apiError (406 Not Acceptable)  Origin Origin header must be "https://*".
         * @apiUse NotAcceptable
         *
         * @apiError (409 Conflict) MySQLError Some parameters are already presents in database (username or email)
         * @apiUse Conflict
         */
        this.router.route('/quick_setup').post(AuthService.authenticateToken, ProgramController.createProgram);

        /**
         * @api {post} /quick_setup Create program details
         * @apiDescription Create a new program details.
         * @apiVersion 1.0.0
         * @apiName Create program details
         * @apiGroup programe details
         * @apiPermission admin
         *
         * @apiUse BaseHeader
         *
         * @apiParam  {String}          email         Client email
         * @apiSuccess (201 Created) {Date}        client.createdAt      Client creation date
         * @apiSuccess (201 Created) {Date}        client.updatedAt      Client updating date
         *
         * @apiSuccessExample {json} Success response example
         * {
         *    "id": 1,
         *    "createdAt": "2019-08-10T08:22:00.000Z",
         *    "updatedAt": "2019-08-10T08:22:03.000Z"
         * }
         *
         * @apiError (400 Bad Request)   ValidationError  Some parameters may contain invalid values
         * @apiUse BadRequest
         *
         * @apiError (401 Unauthorized)  Unauthorized     Only authenticated users can create the data
         * @apiUse Unauthorized
         *
         * @apiError (403 Forbidden)     Forbidden        Only admins can create the data
         * @apiUse Forbidden
         *
         * @apiError (406 Not Acceptable)  Content-Type header must be "application/json".
         * @apiError (406 Not Acceptable)  Origin header must be "https://*".
         * @apiUse NotAcceptable
         *
         * @apiError (409 Conflict) MySQLError Some parameters are already presents in database (username or email)
         * @apiUse Conflict
         */
        this.router.route('/programme_details').get(AuthService.authenticateToken, ProgramController.getProgramDetails);

        /**
         * Create detailed program details
         */
        this.router.route('/create_programme').post(AuthService.authenticateToken, ProgramController.createProgramDetailed);

        /**
         * @below method return the list of all the programs created
         * by an user where user is denoted by subscriber_id
         */
        this.router.route('/programme_list').get(AuthService.authenticateToken, ProgramController.getProgramList);

        this.router.route('/batch_list').post(AuthService.authenticateToken, ProgramController.getBatchList);

        this.router.route('/session_list').post(AuthService.authenticateToken, ProgramController.getSessionList);

        this.router.route('/participant_special_invitee_list_program_id').post(AuthService.authenticateToken, ProgramController.getParticipantSpecialInviteeFromProgramId);

        this.router.route('/session_details').post(AuthService.authenticateToken, ProgramController.getSessionDetails);

        this.router.route('/get_programmes_by_subscriber').post(AuthService.authenticateToken, ProgramController.getProgrammeListBySubscriber);

        this.router.route('/program_schema').post(AuthService.authenticateToken, ProgramController.getDetailedProgramSchemaWithSession);

        this.router.route('/get_participants_batch_wise_by_id').post(AuthService.authenticateToken, ProgramController.getParticipantListByProgramId);

        this.router.route('/check_trainer_availability').post(AuthService.authenticateToken, ProgramController.checkTrainerAvailability)

        this.router.route('/get_first_session').post(AuthService.authenticateToken, ProgramController.getFirstSession)

        this.router.route('/get_program_by_clientId').post(AuthService.authenticateToken, ProgramController.getProgramsByClientId)

        this.router.route('/get-all-task-by-programId').post(AuthService.authenticateToken, ProgramController.getAllTasksByProgramId)

        this.router.route('/get_all_pre_post_work').get(AuthService.authenticateToken, ProgramController.getAllPrePostWork);

        this.router.route('/view_activity_status').post(AuthService.authenticateToken, ProgramController.viewActivityStatus);

        this.router.route('/delete_client').post(AuthService.authenticateToken, ProgramController.deleteClient);

        this.router.route('/mark_notification_as_read').post(AuthService.authenticateToken, ProgramController.markNotificationAsRead);

        this.router.route('/mark_notification_as_delete').post(AuthService.authenticateToken, ProgramController.markNotificationAsDelete);
        
        // rating APIs

        this.router.route('/get_average_program_rating').get(AuthService.authenticateToken,ProgramController.averageProgramRating);

        this.router.route('/get_average_session_rating').get(AuthService.authenticateToken, ProgramController.averageSessionRating);

        this.router.route('/set_rating').post(AuthService.authenticateToken, ProgramController.setRating);
        
        // reports and analytics

        this.router.route('/programme_summary_report').get(AuthService.authenticateToken, ProgramController.programmeSummaryReport);

        this.router.route('/client_summary_report').get(AuthService.authenticateToken, ProgramController.clientSummaryReport);

        this.router.route('/participation_summary_report').get(AuthService.authenticateToken, ProgramController.participationSummaryReport);

        this.router.route('/engagement_report').get(AuthService.authenticateToken, ProgramController.engagementReport);

        this.router.route('/feedback_report').get(AuthService.authenticateToken, ProgramController.feedbackReport);

        this.router.route('/billing_report').get(AuthService.authenticateToken, ProgramController.billingReport);


    }
}
