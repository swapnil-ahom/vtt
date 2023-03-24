import {Router} from '@classes';
import {SupportController} from '@controllers/support.controller';



export class SupportRouter extends Router {
    constructor() {
        super();
    }


    define(): void {
        
        // HELP SECTION APIS FOR TRAINER

        // 1. viliyo tutorials
        this.router.route('/get_viliyo_tutorials').get( SupportController.getViliyoTutorials);

        // 2. FAQs
        this.router.route('/create_update_faq').post( SupportController.createUpdateFAQ);
        this.router.route('/get_all_faq').get( SupportController.readFAQ);
        this.router.route('/delete_faq').post( SupportController.deleteFAQ);

        // 3. Queries
        this.router.route('/raise_support_query').post( SupportController.raiseSupportQuery);
        this.router.route('/get_support_query').get( SupportController.getSupportQueries);

        // 4. Feedback
        this.router.route('/send_feedback').post( SupportController.sendFeedback);
        this.router.route('/get_feedback').get( SupportController.getFeedback);

        // 4). New Releases  
        this.router.route('/create_new_releases').post( SupportController.addNewRelease);
        this.router.route('/get_new_releases').get( SupportController.getNewRelease);

        // 5). Feature Request
        this.router.route('/create_feature_request').post( SupportController.addFeatureRequest);
        this.router.route('/get_feature_request').get( SupportController.getFeatureRequest);

        // 6). Contact Support
        this.router.route('/create_contact_support').post( SupportController.addContactSupport);
        this.router.route('/get_contact_support').get( SupportController.getContactSupport);

        
    }

}