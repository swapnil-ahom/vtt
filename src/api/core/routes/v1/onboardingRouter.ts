import {Router} from "@classes";
import {OnboardingController} from "@controllers/onboarding.controller";
import {AuthService} from "@services/auth.service";
import {AdminController} from "@controllers/admin.controller";

export class OnboardingRouter extends Router {

    constructor() {
        super()
    }

    /**
     * @description Plug routes definitions
     */
    define(): void {
        this.router.route('/set_user_role_wrt_class').post(AuthService.authenticateToken,
            OnboardingController.setRoleWithRTClass);
    }

}
