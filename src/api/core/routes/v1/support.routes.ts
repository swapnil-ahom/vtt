import {Router} from '@classes';
import {AuthService} from "@services/auth.service";
import {SupportController} from "@controllers/support.controller";

export class SupportRoutes extends Router {

    constructor() {
        super();
    }

    define(): void {
        // this.router.route('/get_tutorial_list').post(AuthService.authenticateToken, SupportController.getTutorialList);
    }
}
