import * as webPush from 'web-push';
/**
 * @description
 */
class PushNotifyService {
    /**
     * @description
     */
    private static instance: PushNotifyService;
    private static webPush = webPush;

    private readonly validSubscription = {
        "endpoint": "https://fcm.googleapis.com/fcm/send/d1kjxQSLOGI:APA91bG-WfljOeJwgVRwy2_-uHpSL8OwnralLGEnJ_Guf6te1-QPnFp0LIJYNi7DQqm6SYbmlqNflgxTJaGJOThulnwdkxIqha9XQaesOFgxh3or8lQ_cyjkKtToE812zH1igMt7TLCP",
        "keys": {
            "p256dh": "BNOnr15NF0hT-YiAhkKRNTGlpMwULJrsrGmsu3hDCBBMJiLr7Ku_V9-nUDLP2RQrN80dl1Jc-lTtF82brF4KJRM",
            "auth": "U5peRf1neUd5SOxExrx82g"
        }
    };
    private constructor() {
        webPush.setVapidDetails(
            'mailto:akash6586@yahoo.com',
            process.env.PUBLIC_VAPID_KEY,
            process.env.PRIVATE_VAPID_KEY);

        // webPush.setGCMAPIKey()
    }
    /**
     * @description
     */
    static get(): PushNotifyService {
        if (!PushNotifyService.instance) {
            PushNotifyService.instance = new PushNotifyService();
        }
        return PushNotifyService.instance;
    }

    async addNotification (payload: string) {
        await webPush.sendNotification(this.validSubscription, payload)
            .then(result => console.log(result))
            .catch(e => console.log(e.stack))
    }
}


const pushNotifyService = PushNotifyService.get();

export { pushNotifyService as PushNotifyService };
