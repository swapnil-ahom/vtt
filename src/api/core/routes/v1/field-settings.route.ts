import {Router} from '@classes';
import { FieldSettingsController } from '@controllers/field-settings.controller';

export class FieldSettingsRouter extends Router {

    constructor() {
        super();
    }

    define(): void {

        this.router
            .route('/create-fields')
            .post(/*AuthService.authenticateToken,*/FieldSettingsController.createFields);

        this.router
            .route('/get-all-fields')
            .get(/*AuthService.authenticateToken,*/FieldSettingsController.getAllFields);

        this.router
            .route('/select-fields')
            .post(/*AuthService.authenticateToken,*/FieldSettingsController.selectFields);

        this.router
            .route('/get-selected-fields')
            .get(/*AuthService.authenticateToken,*/FieldSettingsController.getSelectedFields);

        this.router
            .route('/delete-field')
            .post(/*AuthService.authenticateToken,*/FieldSettingsController.deleteField);
    }
}
