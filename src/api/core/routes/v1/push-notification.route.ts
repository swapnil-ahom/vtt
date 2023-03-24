import {Router} from '@classes';
import {PushNotificationController} from "@controllers/push-notification.controller";

export class PushRouter extends Router {

    constructor() {
        super();
    }

    define(): void {
        this.router.route('/send_notification').post(PushNotificationController.addNotification);
        this.router.route('/save-push-subscription').post(PushNotificationController.saveSubscription);
    }

}
