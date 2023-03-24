import {AdminController} from "@controllers/admin.controller";
import {AuthService} from "@services/auth.service";
import {Router} from "@classes";

export class AdminRoute extends Router {

    constructor() {
        super();
    }
    define(): void {
        this.router.route('/get_all_user').post(AuthService.authenticateToken, AdminController.getAllSubUserListForAdmin);

        this.router.route('/add_user/').post(AuthService.authenticateToken, AdminController.createSubUser);

        this.router.route('/get_role_for_assigning/').get(AuthService.authenticateToken, AdminController.getRoleListForAssign);

        this.router.route('/assign_role/').post(AuthService.authenticateToken, AdminController.assignRolesToSubUser);

        this.router.route('/delete_user').post(AuthService.authenticateToken, AdminController.deleteUser);

        this.router.route('/admin_dashboard').get(AuthService.authenticateToken, AdminController.getAdminDashboardData);

        this.router.route('/update_user').post(AuthService.authenticateToken, AdminController.updateUser);

        this.router.route('/get_pending_task').get(AuthService.authenticateToken, AdminController.getPendingTask);
    }

}
