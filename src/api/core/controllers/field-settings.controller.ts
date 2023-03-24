import {Request} from 'express';
import { getRepository } from 'typeorm';
import { IResponse } from '@interfaces';
import { success } from '@utils/common.util';
import { FieldSettings } from '@models/field-settings.model';
class FieldSettingsController {

    private static instance: FieldSettingsController;

    private constructor() {
    }

    static get(): FieldSettingsController {
        if (!FieldSettingsController.instance) {
            FieldSettingsController.instance = new FieldSettingsController();
        }
        return FieldSettingsController.instance;
    }
   
    async createFields(req: Request, res: IResponse): Promise<void> {
        try {
            const fields = new FieldSettings({
                name : req.body.name
            })

            await getRepository(FieldSettings).save(fields);

            res.status(200).json(success('', {}, res.statusCode));
        } catch (err) {
            console.log('err', err);
            res.status(400).json(success('', {}, res.statusCode));
        }
    }

    async getAllFields(req: Request, res: IResponse): Promise<void> {
        try {
            const fields = await getRepository(FieldSettings).find();

            res.status(200).json(success('', {fields}, res.statusCode));
        } catch (err) {
            console.log('err', err);
            res.status(400).json(success('', {}, res.statusCode));
        }
    }

    async selectFields(req: Request, res: IResponse): Promise<void> {
        try {
            const fields = await getRepository(FieldSettings).findOne({
                where: {
                    id: req.body.id
                }
            })

            await getRepository(FieldSettings).createQueryBuilder()
            .update({
                is_selected: true
            })
            .where({
                id: fields.id
            })
            .execute()

            res.status(200).json(success('', {}, res.statusCode));
        } catch (err) {
            console.log('err', err);
            res.status(400).json(success('', {}, res.statusCode));
        }
    }

    async getSelectedFields(req: Request, res: IResponse): Promise<void> {
        try {
            const fields = await getRepository(FieldSettings).find({
                where: {
                    is_selected: true
                }
            });

            res.status(200).json(success('', {fields}, res.statusCode));
        } catch (err) {
            console.log('err', err);
            res.status(400).json(success('', {}, res.statusCode));
        }
    }

    async deleteField(req: Request, res: IResponse): Promise<void> {
        try {
            const fields = await getRepository(FieldSettings).findOne({
                where: {
                    id: req.body.id
                }
            })

            await getRepository(FieldSettings).delete(fields);

            res.status(200).json(success('', {}, res.statusCode));
        } catch (err) {
            console.log('err', err);
            res.status(400).json(success('', {}, res.statusCode));
        }
    }

}

const fieldSettingsController = FieldSettingsController.get();

export {fieldSettingsController as FieldSettingsController}
