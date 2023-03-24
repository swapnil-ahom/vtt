import {ActivityTypes} from './../models/activity_types.model';
import {SegmentActivity} from './../models/segment_activity.model';
import {getRepository} from 'typeorm';
import {success} from '@utils/common.util';
import {IResponse} from '@interfaces';
import {InputDetailsVO} from '../types/uiVOs/details-inputVO';
import {SessionSegment} from '@models/session_segment.model';


class SegmentActivityController {

    private static instance: SegmentActivityController;


    static get(): SegmentActivityController {
        if (!SegmentActivityController.instance) {
            SegmentActivityController.instance = new SegmentActivityController();
        }
        return SegmentActivityController.instance;
    }

    public async SegmentActicity(req: Omit<Request, 'body'> & { body: SegmentActivity }, res: IResponse): Promise<void> {

        const segmentactivityRepo = getRepository(SegmentActivity);
        const inputsegmentactivity = req.body;

        // inputsegmentactivity.activityType = await getRepository(ActivityTypes).findOne({where: {name: req.body.type}});
        const segmentactivitymodel: SegmentActivity = await segmentactivityRepo.save(inputsegmentactivity);
        res.status(200).json(success('', {segmentactivitymodel}, res.statusCode));
        res.end()
    }

    public async ssessionSegment(req: Omit<Request, 'body'> & { body: SessionSegment }, res: IResponse): Promise<void> {
        const segmentRepo = getRepository(SessionSegment);
        const sessionId = req.body.session;
        const inputSegment = req.body;


    }


}


const segmentActivitiesController = SegmentActivityController.get();

export {segmentActivitiesController as SegmentActivityController}

