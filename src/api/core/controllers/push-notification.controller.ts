import {PushNotifyService} from "@services/push-notify.service";
import {IResponse, IUserRequest} from "@interfaces";
import {PushToken} from "@models/push-token.model";
import {getRepository} from "typeorm";
import {ProgramDetailsVO} from "../types/uiVOs/program-detailsVO";
import {Request} from "express";
import {Clients} from "@models/clients.model";
import {success} from "@utils/common.util";

/**
 *
 */
class PushNotificationController {
    private static instance: PushNotificationController;

    private constructor() {
    }

    static get(): PushNotificationController {
        if (!PushNotificationController.instance) {
            PushNotificationController.instance = new PushNotificationController();
        }
        return PushNotificationController.instance;
    }

    async addNotification(req: IUserRequest, res: IResponse): Promise<void> {
        let payload = {title: 'This is test push notification', desc: 'This seems to be working'};
        await PushNotifyService.addNotification(JSON.stringify(payload));
        res.status(200).json(success('', {}, res.statusCode));
        res.end();
    }

    async saveSubscription(req: Omit<Request, 'body'> & { body: { data: string } }, res: IResponse): Promise<void> {
        type token = {
            endPoint: string;
            expirationTime: string;
            keys: {
                p256dh: string;
                auth: string;
            }
        }
        let tokenRepo = getRepository(PushToken);
        const tokenJson: token = JSON.parse(req.body.data);
        console.log(req.body);
        let pToken = await tokenRepo.findOne({
            where: {
                publicKey: tokenJson.keys.p256dh
            }
        });
        if (pToken) {
            pToken.data = req.body.data;
            pToken.publicKey = tokenJson.keys.p256dh;
        } else {
            pToken = new PushToken();
            pToken.data = req.body.data;
            pToken.publicKey = tokenJson.keys.p256dh;
        }
        await tokenRepo.save(pToken);
        res.status(200).json(success('', {token: pToken}, res.statusCode));
        res.end();
    }
}

const pushController = PushNotificationController.get();

export {pushController as PushNotificationController}
