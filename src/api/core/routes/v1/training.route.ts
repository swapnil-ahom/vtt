import {Router} from '@classes';
import {AuthService} from '@services/auth.service';
import {TrainingRoomController} from '@controllers/training.controller';
import {TrainersController} from '@controllers/trainerconsole.controller';

export class TrainingRoute extends Router {

    constructor() {
        super();
    }

    define(): void {
        this.router.route('/create_training_room').post(AuthService.authenticateToken, TrainingRoomController.createTrainingRoom);

        this.router.route('/validate_join_room').post(AuthService.authenticateToken, TrainingRoomController.validateJoinTrainingRoom);

        this.router.route('/create_sub_rooms').post(AuthService.authenticateToken, TrainingRoomController.createSubRooms);

        this.router.route('/console_details').post(TrainingRoomController.ConsoleDetails);

        this.router.route('/update_pending_task_status').post(AuthService.authenticateToken, TrainingRoomController.updatePendingTaskStatus);
    }
}
