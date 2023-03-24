import {Router} from '@classes';
import {MasterController} from '@controllers/master.controller';
import {AuthController} from '@controllers/auth.controller';
import {AuthService} from '@services/auth.service';

export class MasterRouter extends Router {

    constructor() {
        super()
    }

    /**
     * @description Plug routes definitions
     */
    define(): void {

        /**
         * @api {get} /expertise-list API
         * @apiDescription Get the list of expertise from the database using api.
         * @apiVersion 1.0.0
         * @apiName Expertise List
         * @apiGroup Master
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
        this.router.route('/get_expertise_list').get(MasterController.expertiselist);

        /**
         * @api {get} /sectors-list API
         * @apiDescription Get the list of sector from the database using api.
         * @apiVersion 1.0.0
         * @apiName Sectors List
         * @apiGroup Master
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
        this.router.route('/sectors-list').get(MasterController.sectorslist);

        /**
         * @api {get} /Subscription plans API
         * @apiDescription Get the list of Subscription plans from the database using api.
         * @apiVersion 1.0.0
         * @apiName Subscription plans
         * @apiGroup Master
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

        this.router.route('/subscription-plans').get(MasterController.subscriptionPlans);

        this.router.route('/add_role_list').post(AuthController.addUserRole);

        this.router.route('/add_usertype_list').post(AuthController.addUserTypeList);

        this.router.route('/get_role_list').get(AuthService.authenticateToken, AuthController.getRoleList);

        this.router.route('/get_usertype_list').get(AuthService.authenticateToken, AuthController.getUserTypeList);

        this.router.route('/get_expertise_list').get(AuthService.authenticateToken, MasterController.expertiselist);

        this.router.route('/get_sectors_list').get(AuthService.authenticateToken, MasterController.sectorslist);

        this.router.route('/add_audience_type').post(AuthService.authenticateToken, MasterController.addAudienceType);

        this.router.route('/audience_list').get(AuthService.authenticateToken, MasterController.getAudienceList);

        this.router.route('/get_state_list').post(MasterController.getStateList);

        this.router.route('/get_country_list').get(MasterController.getCountryList);

        this.router.route('/get_industry_list').get(MasterController.getBusinessIndustryList);
    }
}
