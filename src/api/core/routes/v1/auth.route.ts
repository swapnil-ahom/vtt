import {Router} from '@classes';
import {Validator} from '@middlewares/validator.middleware';
import {Guard} from '@middlewares/guard.middleware';
import {AuthController} from '@controllers/auth.controller';
import {register, login, refresh, oauthCb, confirm, requestPassword} from '@validations/auth.validation';
import {RoleIds} from '@enums';
import {AuthService} from '@services/auth.service';
import {ROLE} from "@enums/role.enum";

export class AuthRouter extends Router {

    constructor() {
        super();
    }

    /**
     * @description Plug routes definitions
     */
    define(): void {

        /**
         * @api {post} /auth/register Register
         * @apiDescription Register a new user.
         * @apiVersion 1.0.0
         * @apiName Register
         * @apiGroup Auth
         * @apiPermission public
         *
         * @apiUse BaseHeaderSimple
         *
         * @apiParam {String{..32}}      username  User username
         * @apiParam {String}            email     User email address
         * @apiParam {String{8..16}}     password  User password
         *
         * @apiParamExample {json} Payload example
         * {
         *    "username": "john-doe",
         *    "email": "contact@john-doe.com",
         *    "password": "lo1Rs9#q"
         * }
         *
         * @apiUse SuccessTokenWithUser
         *
         * @apiError (400 Bad Request)   InvalidUsername Usernamee is required as alphanumeric string of 32 characters max.
         * @apiError (400 Bad Request)   InvalidEmail Email is required as valid email address.
         * @apiError (400 Bad Request)   InvalidPassword Password is required and must have length between 8 and 16 characters.
         * @apiUse BadRequest
         *
         * @apiError (406 Not Acceptable)  Content-Type header must be "application/json".
         * @apiError (406 Not Acceptable)  Origin header must be "https://*".
         * @apiUse NotAcceptable
         *
         * @apiError (409 Conflict) MySQLError Some parameters are already presents in database (username or email)
         * @apiUse Conflict
         *
         * @apiError (422 Unprocessable Entity) CorruptedUser Given user is not an instance of user.
         * @apiError (422 Unprocessable Entity) LostAccessToken Access token cannot be retrieved.
         * @apiUse UnprocessableEntity
         *
         */
        this.router
            .route('/register')
            .post(Validator.check(register), AuthController.register);

        /**
         * @api {post} /auth/login Login
         * @apiDescription Get an accessToken.
         * @apiVersion 1.0.0
         * @apiName Login
         * @apiGroup Auth
         * @apiPermission public
         *
         * @apiUse BaseHeaderSimple
         *
         * @apiParam  (With credentials)  {String}            email     User email address
         * @apiParam  (With credentials)  {String{8..16}}     password  User password
         * @apiParam  (With API key)      {String{64..128}}   apikey    User apikey
         *
         * @apiParamExample {json} With credentials payload example
         * {
         *    "email": "john.doe@website.com",
         *    "password": "passw0rd"
         * }
         *
         * @apiParamExample {json} With API key payload example
         * {
         *    "apikey": "$2b$10$sYFWFtKOR1QKm8/z6TxhQOgXCxvpZ.L13Xv3Lx496rH.L.EhobhJS"
         * }
         *
         * @apiUse SuccessTokenWithUser
         *
         * @apiError (400 Bad Request)   InvalidEmail Email is required as valid email address.
         * @apiError (400 Bad Request)   InvalidPassword Password is required and must have length between 8 and 16 characters.
         * @apiUse BadRequest
         *
         * @apiError (401 Unauthorized)  Unauthorized Incorrect password.
         * @apiUse Unauthorized
         *
         * @apiError (404 Not Found)     UserNotfound API key or email address not found.
         * @apiUse NotFound
         *
         * @apiError (406 Not Acceptable)  Content-Type Content-Type header must be "application/json".
         * @apiError (406 Not Acceptable)  Origin Origin header must be "https://*".
         * @apiUse NotAcceptable
         *
         * @apiError (422 Unprocessable Entity) CorruptedUser Given user is not an instance of user.
         * @apiError (422 Unprocessable Entity) LostAccessToken Access token cannot be retrieved.
         * @apiUse UnprocessableEntity
         */
        this.router
            .route('/login')
            .post(Validator.check(login), AuthController.login);

        this.router
            .route('/social_media_login')
            .post(AuthController.socialMediaLogin);

        /**
         * @api {post} /auth/logout Logout
         * @apiDescription Logout current user by refresh token revoke.
         * @apiVersion 1.0.0
         * @apiName Logout
         * @apiGroup Auth
         * @apiPermission user
         *
         * @apiUse BaseHeaderSimple
         *
         * @apiSuccess (200 OK) / User disconnected
         * @apiSuccessExample {json} Success response example
         *  HTTP/1.1 200 OK
         *
         * @apiError (406 Not Acceptable)  Content-Type Content-Type header must be "application/json".
         * @apiError (406 Not Acceptable)  Origin Origin header must be "https://*".
         * @apiUse NotAcceptable
         *
         * @apiError (422 Unprocessable Entity)  User  Given user is not an instance of user.
         * @apiUse UnprocessableEntity
         */
        this.router
            .route('/logout')
            .post(Guard.authorize([RoleIds.admin, ROLE.user]), AuthController.logout);

        /**
         * @api {patch} /auth/confirm Confirm account
         * @apiDescription Confirm account by email address verifying.
         * @apiVersion 1.0.0
         * @apiName Confirm
         * @apiGroup Auth
         * @apiPermission public
         *
         * @apiUse BaseHeaderSimple
         *
         * @apiParam  {String}  token  Json Web Token
         * @apiParamExample {json} Payload example
         * {
         *    "token": "$2b$10$sYFWFtKOR1QKm8/z6TxhQOgXCxvpZ.L13Xv3Lx496rH.L.EhobhJS"
         * }
         *
         * @apiUse SuccessTokenWithUser
         *
         * @apiError (400 Bad Request)  ValidationError Token must be a valid token.
         * @apiError (400 Bad Request)  BusinessError User status cannot be set to CONFIRMED because is not set to REGISTERED.
         * @apiUse BadRequest
         *
         * @apiError (Unauthorized 401)  Unauthorized Invalid Json Web Token.
         * @apiUse Unauthorized
         *
         * @apiError (Not Found 404)  UserNotFound User cannot be retrieved from given JWT.
         * @apiUse NotFound
         *
         * @apiError (406 Not Acceptable)  Content-Type Content-Type header must be "application/json".
         * @apiError (406 Not Acceptable)  Origin Origin header must be "https://*".
         * @apiUse NotAcceptable
         */
        this.router
            .route('/confirm')
            .patch(Validator.check(confirm), AuthController.confirm);

        /**
         * @api {get} /auth/request-password?email=:email Request password
         * @apiDescription Request a lost or forgotten password.
         * @apiVersion 1.0.0
         * @apiName RequestPassword
         * @apiGroup Auth
         * @apiPermission public
         *
         * @apiUse BaseHeaderSimple
         *
         * @apiParam {String} email User email address
         * @apiParamExample {string} Param example
         *  email=john.doe@website.com
         *
         * @apiSuccess (200 OK) / Password successfuly requested.
         * @apiSuccessExample {json} Success response example
         *  HTTP/1.1 200 OK
         *
         * @apiError (400 Bad Request)  ValidationError Email must be a valid email address.
         * @apiUse BadRequest
         *
         * @apiError (406 Not Acceptable)  Content-Type Content-Type header must be "application/json".
         * @apiError (406 Not Acceptable)  Origin Origin header must be "https://*".
         * @apiUse NotAcceptable
         */
        this.router
            .route('/request-password')
            .get(Validator.check(requestPassword), AuthController.requestPassword);

        /**
         * @api {post} /auth/refresh-token Refresh token
         * @apiDescription Refresh expired accessToken.
         * @apiVersion 1.0.0
         * @apiName RefreshToken
         * @apiGroup Auth
         * @apiPermission public
         *
         * @apiUse BaseHeaderSimple
         *
         * @apiParam  {Object}  token               Main token aquired when user logged in
         * @apiParam  {string}  token.refreshToken  Refresh token
         *
         * @apiParamExample {json} Payload example
         * {
         *    "token": {
         *      "refreshToken": "1.6df01971a1ce4dbe4b8752963e50b61632db5685e9c5c9dccedd93ec04b46cf25f40799dedeb926f"
         *    }
         * }
         *
         * @apiUse SuccessToken
         *
         * @apiError (400 Bad Request)  ValidationError  Refresh token must be a valid token.
         * @apiUse BadRequest let userData = await getRepository(User)
            .createQueryBuilder('user')
            .where('id = :id', { id: req.user })
         * @apiUse BaseHeaderSimple
         *
         * @apiUse SuccessOauth
         *
         * @apiError (406 Not Acceptable)  Content-Type Content-Type header must be "application/json".
         * @apiError (406 Not Acceptable)  Origin Origin header must be "https://*".
         * @apiUse NotAcceptable
         */
        this.router
            .route('/facebook')
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            .get(Guard.oAuth('facebook'));

        /**
         * @api {get} /auth/facebook/callback?code=:code Oauth FacebookCallback
         * @apiDescription Oauth Facebook callback function after user confirmation.
         * @apiVersion 1.0.0
         * @apiName FacebookOauthCb
         * @apiGroup Auth
         * @apiPermission public
         *
         * @apiUse BaseHeaderSimple
         *
         * @apiUse SuccessTokenWithUser
         *
         * @apiError (400 Bad request) InvalidCode Code passed by supplier is not valid.
         * @apiUse BadRequest
         *
         * @apiError (403 Forbidden)  ForbiddenRole Forbidden area for current user role.
         * @apiUse Forbidden
         *
         * @apiError (404 Not Found)  UserNotFound  User not found.
         * @apiUse NotFound
         *
         * @apiError (406 Not Acceptable)  Content-Type Content-Type header must be "application/json".
         * @apiError (406 Not Acceptable)  Origin Origin header must be "https://*".
         * @apiUse NotAcceptable
         */
        this.router
            .route('/facebook/callback')
            .get(Validator.check(oauthCb), Guard.oAuthCallback('facebook'), AuthController.oAuth);

        /**
         * @api {get} /auth/google Oauth Google
         * @apiDescription Login with google.
         * @apiVersion 1.0.0
         * @apiName GoogleOauth
         * @apiGroup Auth
         * @apiPermission public
         *
         * @apiUse BaseHeaderSimple
         *
         * @apiUse SuccessOauth
         *
         * @apiError (406 Not Acceptable)  Content-Type Content-Type header must be "application/json".
         * @apiError (406 Not Acceptable)  Origin Origin header must be "https://*".
         * @apiUse NotAcceptable
         */
        this.router
            .route('/google')
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            .get(Guard.oAuth('google'), AuthController.oAuth);

        /**
         * @api {get} /auth/google/callback?code=:code Oauth GoogleCallback
         * @apiDescription Oauth Google callback function after user confirmation.
         * @apiVersion 1.0.0
         * @apiName GoogleOauthCb
         * @apiGroup Auth
         * @apiPermission public
         *
         * @apiUse BaseHeaderSimple
         *
         * @apiUse SuccessTokenWithUser
         *
         * @apiError (400 Bad request) InvalidCode Code passed by supplier is not valid.
         * @apiUse BadRequest
         *
         * @apiError (403 Forbidden)  ForbiddenRole Forbidden area for current user role.
         * @apiUse Forbidden
         *
         * @apiError (404 Not Found)  UserNotFound  User not found.
         * @apiUse NotFound
         *
         * @apiError (406 Not Acceptable)  Content-Type Content-Type header must be "application/json".
         * @apiError (406 Not Acceptable)  Origin Origin header must be "https://*".
         * @apiUse NotAcceptable
         */
        this.router
            .route('/google/callback')
            .get(Validator.check(oauthCb), Guard.oAuthCallback('google'), AuthController.oAuth);

        /**
         * @api {get} /auth/github Oauth Github
         * @apiDescription Login with Github.
         * @apiVersion 1.0.0
         * @apiName GithubOauth
         * @apiGroup Auth
         * @apiPermission public
         *
         * @apiUse BaseHeaderSimple
         *
         * @apiUse SuccessOauth
         *
         * @apiError (406 Not Acceptable)  Content-Type Content-Type header must be "application/json".
         * @apiError (406 Not Acceptable)  Origin Origin header must be "https://*".
         * @apiUse NotAcceptable
         */
        this.router
            .route('/github')
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            .get(Guard.oAuth('github'), AuthController.oAuth);

        /**
         * @api {get} /auth/github/callback?code=:code Oauth GithubCallback
         * @apiDescription Oauth github callback function after user confirmation.
         * @apiVersion 1.0.0
         * @apiName GithubOauthCb
         * @apiGroup Auth
         * @apiPermission public
         *
         * @apiUse BaseHeaderSimple
         *
         * @apiUse SuccessTokenWithUser
         *
         * @apiError (400 Bad request) InvalidCode Code passed by supplier is not valid.
         * @apiUse BadRequest
         *
         * @apiError (403 Forbidden)  ForbiddenRole Forbidden area for current user role.
         * @apiUse Forbidden
         *
         * @apiError (404 Not Found)  UserNotFound  User not found.
         * @apiUse NotFound
         *
         * @apiError (406 Not Acceptable)  Content-Type Content-Type header must be "application/json".
         * @apiError (406 Not Acceptable)  Origin Origin header must be "https://*".
         * @apiUse NotAcceptable
         */
        this.router
            .route('/github/callback')
            .get(Validator.check(oauthCb), Guard.oAuthCallback('github'), AuthController.oAuth);

        /**
         * @api {get} /auth/linkedin Oauth Linkedin
         * @apiDescription Login with Linkedin.
         * @apiVersion 1.0.0
         * @apiName LinkedinOauth
         * @apiGroup Auth
         * @apiPermission public
         *
         * @apiUse BaseHeaderSimple
         *
         * @apiUse SuccessOauth
         *
         * @apiError (406 Not Acceptable)  Content-Type Content-Type header must be "application/json".
         * @apiError (406 Not Acceptable)  Origin Origin header must be "https://*".
         * @apiUse NotAcceptable
         */
        this.router
            .route('/linkedin')
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            .get(Guard.oAuth('linkedin'), AuthController.oAuth);

        /**
         * @api {get} /auth/linkedin/callback?code=:code Oauth LinkedinCallback
         * @apiDescription Oauth Linkedin callback function after user confirmation.
         * @apiVersion 1.0.0
         * @apiName LinkedinOauthCb
         * @apiGroup Auth
         * @apiPermission public
         *
         * @apiUse BaseHeaderSimple
         *
         * @apiUse SuccessTokenWithUser
         *
         * @apiError (400 Bad request) InvalidCode Code passed by supplier is not valid.
         * @apiUse BadRequest
         *
         * @apiError (403 Forbidden)  ForbiddenRole Forbidden area for current user role.
         * @apiUse Forbidden
         *
         * @apiError (404 Not Found)  UserNotFound  User not found.
         * @apiUse NotFound
         *
         * @apiError (406 Not Acceptable)  Content-Type Content-Type header must be "application/json".
         * @apiError (406 Not Acceptable)  Origin Origin header must be "https://*".
         * @apiUse NotAcceptable
         */
        this.router
            .route('/linkedin/callback')
            .get(Validator.check(oauthCb), Guard.oAuthCallback('linkedin'), AuthController.oAuth);

        this.router
            .route('/verify_otp')
            .post(AuthService.authenticateToken, AuthController.verifyOTP);

        this.router
            .route('/resend_otp')
            .post(AuthService.authenticateToken, AuthController.resendOTP);

        this.router
            .route('/update_profile')
            .patch(AuthService.authenticateToken, AuthController.updateProfile);

        this.router
            .route('/social_media_auth')
            .post(AuthController.socialMediaRegister);

        this.router
            .route('/reset_password')
            .post(AuthService.authenticateToken,AuthController.resetPassword);

        this.router
            .route('/forgot_password')
            .post(AuthService.authenticateToken,AuthController.forgotPassword);

        this.router
            .route('/get_subscription_plan')
            .post(/*AuthService.authenticateToken,*/AuthController.getSubscriptionPlan);

        this.router
            .route('/update_subscription_plan')
            .post(/*AuthService.authenticateToken,*/AuthController.setSubscriptionPlan);

        this.router
            .route('/create_subscription_plan')
            .post(/*AuthService.authenticateToken,*/AuthController.createSubscriptionPlan);

        this.router
            .route('/subscription_details')
            .get(AuthService.authenticateToken,AuthController.getSubscriptionPlanDetails);

        this.router
            .route('/set_user_subscription')
            .post(AuthService.authenticateToken,AuthController.setSubscriptionForUser);

        this.router
            .route('/get_user_subscription')
            .get(AuthService.authenticateToken,AuthController.getSubscriptionForUser);

        this.router
            .route('/cancel_user_subscription')
            .put(AuthService.authenticateToken,AuthController.cancelSubscriptionForUser);

        this.router
            .route('/get_all_subscriptions')
            .post(/*AuthService.authenticateToken,*/AuthController.getAllSubscriptions);

        this.router
            .route('/get_currency_list')
            .get(/*AuthService.authenticateToken,*/AuthController.getCurrencyList);
    }
}
