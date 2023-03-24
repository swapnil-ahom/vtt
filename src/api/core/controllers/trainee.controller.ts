/* eslint-disable @typescript-eslint/member-ordering */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
import {Participants} from './../models/participants.model';
import {Trainee} from './../models/trainee.model';
import SessionMapping from '@models/session-mapping.model';
import Sessions from '@models/sessions.model';
import {TraineeCompletedTask} from './../models/trainee_completed_tasks.model';
import {SessionSegment} from './../models/session_segment.model';
import {Programs} from '@models/programs.model';
import {SESSION_TYPE_ENUMS} from '@enums/session-type.enum';
import {getRepository, Repository, getConnection, In} from 'typeorm';
import {Request, Response} from 'express';
import {Safe} from '@decorators/safe.decorator';
import {IResponse} from '@interfaces';
import {TraineeService} from '@services/trainee.service';
import {success,error} from '@utils/common.util';
import {InputDetailsVO} from '../types/uiVOs/details-inputVO';
import {SeatingStyle} from '@models/seating-style.model';
import {SegmentListVO} from '../types/uiVOs/segment-listVO';
import {SEGMENT_TYPE_ENUMS} from '@enums';
import {Trainee_notes} from '@models/trainee_notes.model';
import {TraineeSegmentActivityVO} from '../types/uiVOs/traineeSegmentActivityVO';
import {SegmentActivity} from '@models/segment_activity.model';
import {Notification} from '../models/Notification.model';
import {addNotification, addPendingTask, findActivitySubmissionDate} from '../utils/common.util';
import {VTTRequestVO} from '../types/uiVOs/VTTRequestVO';
import {AgeGroup} from '../models/age-group.model';
import {VisitingCardModel} from '@models/visiting-card.model';
import { CollectedVisitingCardVO, DeleteCollectedVisitingCardVO } from '../types/uiVOs/collectedVisitingCardVO';
import { CollectedVisitingCardModel } from '@models/collected-visiting-card.model';
class TraineeController {

    private static instance: TraineeController;
    visitingCardRepo: Repository<VisitingCardModel>;

    static get(): TraineeController {
        if (!TraineeController.instance) {
            TraineeController.instance = new TraineeController();
        }
        return TraineeController.instance;
    }


    getVisitingRepo(){
        if(!this.visitingCardRepo){
            this.visitingCardRepo = getRepository(VisitingCardModel);
        }
        return this.visitingCardRepo;
    }

    async signUpWithEmail(req: VTTRequestVO, res: IResponse): Promise<void> {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        await TraineeService.signUpUser(req.body, res)
    }

    async verifyEmailOTP(req: VTTRequestVO, res: IResponse): Promise<void> {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        return await TraineeService.verifyEmailOTP(req.body, res, req.user)
    }

    @Safe()
    async resendOTP(req: VTTRequestVO, res: IResponse): Promise<void> {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        const user = await TraineeService.resendOTP(req.body, res, req.user)
        res.locals.data = { ...user };
    }

    @Safe()
    async login(req: Request, res: IResponse): Promise<void> {
        console.log(req.body)
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const user = await TraineeService.loginUser(req, res)
        res.locals.data = { ...user };
    }
    @Safe()
    async loginOrSignUpWithSocialMedia(req: Request, res: IResponse): Promise<void> {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        const user = await TraineeService.loginOrSignUp(req.body, res)
        res.locals.data = { ...user };
    }

    @Safe()
    async addPoll(req: Request, res: IResponse): Promise<void> {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        const user = await TraineeService.addPollDetail(req.body)
        res.locals.data = { ...user };
    }

    @Safe()
    async searchPoll(req: Request, res: IResponse): Promise<void> {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        const user = await TraineeService.searchPollDetail(req.body)
        res.locals.data = { ...user };
    }

    // @Safe()
    public async ProgramList(req: Request, res: IResponse): Promise<void> {
        try {
            const trainee_id = req.user;

            const trainee = await getRepository(Trainee).createQueryBuilder('trainee')
                .where('trainee.id = :id', { id: trainee_id })
                .getOne();

            const programList = await getRepository(Participants)
                .createQueryBuilder('participant')
                .where({ email: trainee.trainee_email })
                .leftJoinAndSelect('participant.program', 'program')
                .leftJoinAndSelect('program.programBatch', 'batch')
                .leftJoinAndSelect('batch.sessionMappings', 'session_mapping')
                .leftJoinAndSelect('session_mapping.trainer', 'trainer')
                .leftJoinAndSelect('program.sessionList', 'session')
                .leftJoinAndSelect('program.programMeta', 'programMeta')
                .getMany();

            if (programList && programList[0] && programList[0].program) {
                if (!programList[0].program.total_batches)
                    programList[0].program.total_batches = 0;
                if (!programList[0].program.total_sessions)
                    programList[0].program.total_sessions = 0;
            }

            res.status(200).json(success('', programList, res.statusCode));
        } catch (err) {
            console.log('err', err)
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            res.status(400).json(success(err.message, {}, res.statusCode));
        }
        res.end();
    }

    public async ProgramsHistory(req: Request, res: IResponse): Promise<void> {
        try {
            const trainee_id = req.user;

            const trainee = await getRepository(Trainee).createQueryBuilder('trainee')
                .where('trainee.id = :id', { id: trainee_id })
                .getOne();

            const programList = await getRepository(Participants)
                .createQueryBuilder('participant')
                .where({ email: trainee.trainee_email })
                .leftJoinAndSelect('participant.program', 'program')
                .leftJoinAndSelect('program.programBatch', 'batch')
                .leftJoinAndSelect('batch.sessionMappings', 'session_mapping')
                .andWhere('session_mapping.status = :status', { status: SESSION_TYPE_ENUMS.COMPLETED })
                .leftJoinAndSelect('session_mapping.trainer', 'trainer')
                .leftJoinAndSelect('program.sessionList', 'session')
                .getMany();

            res.status(200).json(success('', programList, res.statusCode));
        } catch (err) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            res.status(400).json(success(err.message, {}, res.statusCode));
        }
        res.end();
    }

    public async ProgramsDetails(req: Request, res: IResponse): Promise<void> {
        try {
            let PostSegment;
            let PreSegment;
            let LiveSegment;
            const program_id = req.body.id;
            const programDetails = await getRepository(Programs)
                .createQueryBuilder('program')
                .where({ id: program_id })
                .leftJoinAndSelect('program.client', 'client')
                .leftJoinAndSelect('program.participantsList', 'participants')
                .leftJoinAndSelect('program.programBatch', 'batch')
                .leftJoinAndSelect('program.sessionList', 'session')
                .leftJoinAndSelect('program.programMeta', 'program_meta')
                .leftJoinAndSelect('session.sessionMappings', 'session_mappings')
                .leftJoinAndSelect('session_mappings.trainer', 'trainer')
                .getOne();
            let sessionid
            const a = []
            if (programDetails && programDetails.sessionList.length != 0) {
                sessionid = programDetails.sessionList.map(v => v.id)
                for (let q = 0; q < sessionid.length; q++) {
                    PreSegment = await getRepository(SessionSegment).createQueryBuilder('segment')
                        .where('segment.sessionId = :sessionId', { sessionId: sessionid[q] })
                        .andWhere('segment.type=:type', { type: 'Pre' })
                        .getMany();

                    PostSegment = await getRepository(SessionSegment).createQueryBuilder('_segment')
                        .where('_segment.sessionId = :sessionId', { sessionId: sessionid[q] })
                        .andWhere('_segment.type=:type', { type: 'Post' })
                        .getMany();

                    LiveSegment = await getRepository(SessionSegment).createQueryBuilder('live')
                        .where('live.sessionId = :sessionId', { sessionId: sessionid[q] })
                        .andWhere('live.type=:type', { type: 'Live' })
                        .getMany();

                    a.push({ pre: PreSegment, post: PostSegment, live: LiveSegment })
                }

                for (let i = 0; i < programDetails.sessionList.length; i++) {
                    programDetails.sessionList[i].sessionSegment = a[i]
                }
            }

            res.status(200).json(success('',  programDetails , res.statusCode));
        } catch (err) {
            res.status(400).json(success(err.message, {}, res.statusCode));
        }
        res.end();
    }


    @Safe()
    async searchbyId(req: Request, res: IResponse): Promise<void> {
        const user = await TraineeService.searchDetailsbyId(req.user)
        res.locals.data = { ...user };
    }


    public async AllPrograms(req: Request, res: IResponse): Promise<void> {
        try {
            const trainee_id = req.user;
            const trainee = await getRepository(Trainee).createQueryBuilder('trainee')
                .where('trainee.id = :id', { id: trainee_id })
                .getOne();

            const programList = await getRepository(Participants)
                .createQueryBuilder('participant')
                .where({ email: trainee.trainee_email })
                .leftJoinAndSelect('participant.program', 'program')
                .leftJoinAndSelect('program.programMeta', 'program_meta')
                .leftJoinAndSelect('program.sessionList', 'sessions')
                .leftJoinAndSelect('sessions.sessionMappings', 'session_mappings')
                .getOne();

            let schedule = 0; let conducted = 0; let total = 0;
            for (let i = 0; i < programList.program.sessionList.length; i++) {
                const n = programList.program.sessionList[i].sessionMappings.length;
                total += n;
                for (let j = 0; j < n; j++) {
                    switch (programList.program.sessionList[i].sessionMappings[j].status) {
                        case SESSION_TYPE_ENUMS.SCHEDULED:
                            schedule++;
                            break;
                        case SESSION_TYPE_ENUMS.COMPLETED:
                            conducted++;
                            break;
                    }
                }
            }
            const list = {
                ...programList,
                engagement: 0,
                status: '',
            };
            if (total == schedule) {
                list.status = 'Scheduled';
            } else if (total == conducted) {
                list.status = 'Completed';
            } else if (conducted > 0) {
                list.status = 'Ongoing';
            }
            res.status(200).json(success('', list, res.statusCode));
        } catch (err) {
            res.status(400).json(success(err.message, {}, res.statusCode));
        }
        res.end();
    }

    @Safe()
    async searchByDate(req: Request, res: IResponse): Promise<void> {
        const user = await TraineeService.searchDetailsDate(req)
        res.locals.data = { ...user };
    }

    @Safe()
    async upcomingEvent(req: VTTRequestVO, res: IResponse): Promise<void> {
        const user = await TraineeService.upcomingEventDetail(req)
        res.locals.data = { ...user };
    }

    async gatPrePostActivity(req: Request, res: IResponse): Promise<void> {
        try {
            const sessionSegment = await getRepository(SessionSegment).createQueryBuilder('sessionsegment')
                .where('sessionsegment.id = :id', { id: req.body.id })
                .getOne();

            res.status(200).json(success('', sessionSegment, res.statusCode))

        } catch (err) {
            res.status(400).json(success(err.message, {}, res.statusCode));
        }
        res.end();

    }

    @Safe()
    async dashboardOverview(req: Request, res: IResponse): Promise<void> {
        const dashboardData = await TraineeService.dashboardDetailsOverview(req)
        res.locals.data = { ...dashboardData };
    }

    @Safe()
    async pendingTasks(req: Request, res: IResponse): Promise<void> {
        const pendingTasks = await TraineeService.pendingTaskList(req)
        res.locals.data = { ...pendingTasks };
    }

    @Safe()
    async allTasks(req: Request, res: IResponse): Promise<void> {
        const user = await TraineeService.allTasksList(req)
        res.locals.data = { ...user };
    }


    async traineeCompletedTask(req: Request, res: IResponse): Promise<void> {
        try{

            const Id = req.user;
            // console.log('Id', Id)
            const traineeCompletedTasks: TraineeCompletedTask = new TraineeCompletedTask({
                trainee_id: Id,
                answers: req.body.answers,
                status: req.body.status,
                session_segment_id: req.body.session_segment_id
            });
            await getRepository(TraineeCompletedTask).save(traineeCompletedTasks)
            console.log('Id', Id)
            console.log('req.body.session_segment_id', req.body.session_segment_id)
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            const traineeActivityInfo = await findActivitySubmissionDate(Id as number,req.body.session_segment_id)
            console.log('traineeActivityInfo', traineeActivityInfo)
            const notificationContent = JSON.stringify({
                type:'pre/post work submitted by participant',
                sent_by_id:Id
            })
            const pendingtaskContent = JSON.stringify({
                pendindTaskType:'pre/post work submitted by participant',
                taskTitle : traineeActivityInfo.activityData.title as string,
                taskType : traineeActivityInfo.allActivityData.title,
                sessionName : traineeActivityInfo.allActivityData.session.session_name,
                batchName : traineeActivityInfo.sessionMappingInfo.batch.batch_name as string,
                programmeName : traineeActivityInfo.allActivityData.session.program.program_name,
                metaData : [{
                    taskType : traineeActivityInfo.allActivityData.type,
                    taskName : traineeActivityInfo.allActivityData.title,
                    taskTitle : traineeActivityInfo.activityData.title as string,
                    sessionName : traineeActivityInfo.allActivityData.session.session_name,
                    activity_submission_date : traineeActivityInfo.activity_submission_date as Date,
                    programId : traineeActivityInfo.allActivityData.session.program.id,
                    sessionSegmentId : req.body.session_segment_id as number,
                    programBatch : traineeActivityInfo.allActivityData.session.program.programBatch
                }]
            })
            const trainerId = traineeActivityInfo.allActivityData.session.subscriber_id
            if(trainerId){
                await addNotification(trainerId, 4, notificationContent);
                await addPendingTask(trainerId, 4, pendingtaskContent, 20);
            }

            res.status(200).json(success('', {traineeCompletedTasks, trainerId }, res.statusCode));

        }catch(error){
            console.log('error', error)
            res.status(400).json(success(error.message, {}, res.statusCode));
        }
        res.end();


    }

    async getProgramById(req: Request, res: IResponse): Promise<void> {
        try {

            const programs = await getRepository(Programs).createQueryBuilder('program')
                .where('program.id =:id', { id: req.body.id })
                .leftJoinAndSelect('program.sessionList', 'sessionList')
                .leftJoinAndSelect('sessionList.sessionSegment', 'sessionSegment')
                .getMany();

            res.status(200).json(success('', programs, res.statusCode))

        } catch (err) {
            res.status(400).json(success(err.message, {}, res.statusCode));
        }
        res.end();
    }


    async sessionDeatils(req: Request, res: IResponse): Promise<void> {
        try {

            const trainee = await getRepository(Trainee).createQueryBuilder('trainee')
                .where('trainee.id=:id', { id: req.user })
                .getOne();


            const Participant = await getRepository(Participants).createQueryBuilder('participant')
                .where('participant.email=:email', { email: trainee.trainee_email })
                .andWhere('participant.programId=:programId', { programId: req.body.id })
                .leftJoinAndSelect('participant.batch', 'batch')
                .getMany();

            if (Participant.length == 0) {
                res.status(400).json(success('Program Id not match', {}, res.statusCode));
                res.end();
            }
            const sessionsmapping = await getRepository(SessionMapping).createQueryBuilder('mapping')
                .where('mapping.batchId =:batchId', { batchId: Participant.map(v => v.batch.id) })
                .leftJoinAndSelect('mapping.batch', 'batch')
                .leftJoinAndSelect('mapping.session', 'session')
                .getMany();
            res.status(200).json(success('', { sessionsmapping }, res.statusCode))

        } catch (err) {
            res.status(400).json(success(err.message, {}, res.statusCode));
        }
        res.end();
    }

    public async getSegmentListBySessionID(req: Omit<Request, 'body'> & { body: InputDetailsVO }, res: IResponse): Promise<void> {
        const segmentRepo = getRepository(SessionSegment);
        const sessionRepo = getRepository(Sessions);
        const sessionmappingRepo = getRepository(SessionMapping);
        const _seatingStyle = await getRepository(SeatingStyle);
        const sortedSegmentDetails: SegmentListVO = { Pre: [], Post: [], Live: [] } as SegmentListVO;
        const session = await sessionRepo.createQueryBuilder('session')
            .where('id = :sessionId', { sessionId: req.body.id })
            .getOne();
        const segmentList: any[] = await segmentRepo
            .createQueryBuilder('segment')
            .where('segment.sessionId = :sessionId', { sessionId: req.body.id })
            .leftJoinAndSelect('segment.segmentActivities', 'segmentActivities')
            .getMany();
        segmentList.forEach(segment => {
            if (segment.type === SEGMENT_TYPE_ENUMS.PRE) {
                sortedSegmentDetails.Pre.push(segment);
            } else if (segment.type === SEGMENT_TYPE_ENUMS.POST) {
                sortedSegmentDetails.Post.push(segment);
            } else if (segment.type === SEGMENT_TYPE_ENUMS.LIVE) {
                sortedSegmentDetails.Live.push(segment);
            } else {
                console.log('Found invalid session type')
            }
        });
        // Session Mapping
        const _batches = await sessionmappingRepo.createQueryBuilder('mapping')
            .where('mapping.sessionId = :sessionId', { sessionId: req.body.id })
            .leftJoinAndSelect('mapping.trainer', 'trainer')
            .getMany();
        const Seating = {};
        let seatingStyle;
        const batches = []
        for (let i = 0; i < _batches.length; i++) {
            if (_batches[i].batchId != null) {
                seatingStyle = await _seatingStyle.createQueryBuilder('seating')
                    .where('seating.batchId = :batchId', { batchId: _batches[i].batchId })
                    .getOne();
                batches.push(Object.assign({ seatingStyle }, _batches[i]))

            }
        }
        for (let a = 0; a < batches.length; a++) {
            if (!batches[a].seatingStyle) {
                batches[a].seatingStyle = null;
            }
        }
        sortedSegmentDetails.session = session;
        // sortedSegmentDetails.batches = batches ? batches : null;
        sortedSegmentDetails.batches = batches ? batches : null;

        res.status(200).json(success('', { sortedSegmentDetails }, res.statusCode));
        res.end()
    }

    async createTraineeNotes(req: Request, res: IResponse): Promise<void>{
        const user = await TraineeService.createTraineeNotesDetail(req.body,res, req.user)
        res.locals.data = {...user};

        res.status(200).json(success('', { user }, res.statusCode));
        res.end()
    }

    async deleteTraineeNotes(req: Request, res: IResponse): Promise<void>{
        const user = await TraineeService.deleteTraineeNotesDetail(req.body,res)
        res.locals.data = {...user};

        res.status(200).json(success('', { user }, res.statusCode));
        res.end()
    }

    async getTraineeNotes(req: Request, res: IResponse): Promise<void>{
        try {
            const trainee_id = req.user;
            console.log(req.body.id);

            const traineeNotes = await getRepository(Trainee_notes).createQueryBuilder('traineeNotes')
                .where('traineeNotes.trainee_id = :id', {id: trainee_id})
                .getMany();

            res.status(200).json(success('', traineeNotes, res.statusCode));
        } catch (err) {
            res.status(400).json(success(err.message, {}, res.statusCode));
        }
        res.end();
    }


    async getNotification(req: VTTRequestVO, res: IResponse): Promise<void>{
        const userType = req.body.user_type as number;
        console.log(userType)
        try {
            const notification = await getRepository(Notification).createQueryBuilder('notification')
                .where('notification.user_type = :user_type', {user_type: userType as number})
                .andWhere('notification.pertain_to = :userId', { userId: req.user})
                .andWhere('notification.delete_status = \'0\'')
                .getMany();
            res.status(200).json(success('', notification, res.statusCode));
        } catch (err) {
            res.status(400).json(success(err.message, {}, res.statusCode));
        }
        res.end();
    }

    public async getTraineeSegmentActivity(req: Omit<Request, 'body'> & { body: TraineeSegmentActivityVO }, res: IResponse): Promise<void> {
        try {
            // let responseData
            const user = req.body;

            const traineeData = await getRepository(SegmentActivity).findOne({
                where: { id : user.id },
              });


            res.status(200).json(success('', { traineeData }, res.statusCode));
        } catch (err) {
            res.status(400).json(success(err.message, {}, res.statusCode));
        }
    }

    public async getVisitingCardList(req: Omit<VTTRequestVO, 'body'> & { body: InputDetailsVO }, res: IResponse): Promise<void> {
        try {
            const traineeId = req.user;
            const visitingCardList = await TraineeController.instance.getVisitingRepo().find({
                where: {
                    traineeId
                }
            });
            res.status(200).json(success('', { visitingCardList }, res.statusCode));
        } catch (err) {
            res.status(400).json(success(err.message, {}, res.statusCode));
        }
    }

    public async createVisitingCard(req: Omit<VTTRequestVO, 'body'> & { body: InputDetailsVO }, res: IResponse): Promise<void> {
        try {
            // create new visiting card
            const visitingCardInfo = new VisitingCardModel();
            visitingCardInfo.name = req.body.name
            visitingCardInfo.phone = req.body.phone
            visitingCardInfo.email = req.body.email
            visitingCardInfo.linkedIn = req.body.linkedIn
            visitingCardInfo.about = req.body.about
            visitingCardInfo.interest = req.body.interest
            visitingCardInfo.shareWithoutApproval = req.body.shareWithoutApproval
            visitingCardInfo.traineeId = req.user
            visitingCardInfo.website = req.body.website
            visitingCardInfo.designation = req.body.designation
            await getRepository(VisitingCardModel).save(visitingCardInfo);

            res.status(200).json(success('visiting card created successfully',  visitingCardInfo , res.statusCode));
        } catch (err) {
            res.status(400).json(success(err.message, {}, res.statusCode));
        }
    }

    public async updateVisitingCard(req: Omit<Request, 'body'> & { body: InputDetailsVO }, res: IResponse): Promise<void> {
        try {
            // update a visiting card
            const traineeId = req.user;
            const visitingCardInfo  = await getRepository(VisitingCardModel).findOne({
                where: {
                    id: req.body.id
                }
            });

            if(visitingCardInfo){
                visitingCardInfo.name = req.body.name
                visitingCardInfo.phone = req.body.phone
                visitingCardInfo.email = req.body.email
                visitingCardInfo.linkedIn = req.body.linkedIn
                visitingCardInfo.about = req.body.about
                visitingCardInfo.interest = req.body.interest
                visitingCardInfo.shareWithoutApproval = req.body.shareWithoutApproval
                visitingCardInfo.traineeId = req.user as any
                visitingCardInfo.website = req.body.website
                visitingCardInfo.designation = req.body.designation

                await getRepository(VisitingCardModel).save(visitingCardInfo);
            } else {
                console.log('error occured')
                // throw an exception that user not found
            }
            res.status(200).json(success('visiting card updated successfully',  visitingCardInfo , res.statusCode));
        } catch (err) {
            res.status(400).json(success(err.message, {}, res.statusCode));
        }
    }

    public async getVisitingCardDetail(req: Omit<Request, 'body'> & { body: InputDetailsVO }, res: IResponse): Promise<void> {
        try {
            const visitingCard = await TraineeController.instance.getVisitingRepo().find({
                where: {
                    id: req.body.id
                }
            });
            res.status(200).json(success('', { visitingCard }, res.statusCode));
            res.end();
        } catch (err) {
            res.status(400).json(success(err.message, {}, res.statusCode));
        }
    }
    
    public async saveAgeGroup(req: Request, res: IResponse): Promise<void> {
        try {
            const ageGroupRepo = getRepository(AgeGroup)
            if (req.body.id) {
                const ageGroup = ageGroupRepo.find({ where: { id: req.body.id } })
                if (ageGroup) {
                    await ageGroupRepo.createQueryBuilder('ageGroup')
                        .update(AgeGroup)
                        .set({
                            age_group: req.body.ageGroup
                        })
                        .where('id = :id', { id: req.body.id })
                        .execute();
                        res.status(200).json(success('data update successfully', {}, res.statusCode));
                }else{
                    res.status(201).json(success('id not exciting in table', {}, res.statusCode));
                }

            } else {
                const saveObj: AgeGroup = new AgeGroup({
                    age_group: req.body.ageGroup
                });
                const _ageGroup: AgeGroup = await ageGroupRepo.save(saveObj);
                res.status(200).json(success('data save successfully', {}, res.statusCode));
            }
        } catch (err) {
            res.status(400).json(success(err.message, {}, res.statusCode));
        }
    }


    public async saveTraineeProfileData(req: VTTRequestVO, res: IResponse): Promise<void> {
        try {
            const user: Trainee = await getRepository(Trainee).findOne({
                where: {
                    id: req.user
                }
            });
            let trainee = {};
            if(user && req.body.age_group  ){
                const Age_Group = await getRepository(AgeGroup).createQueryBuilder('ageGroup')
                .where('ageGroup.id = :id',{id:req.body.age_group as number})
                .getOne();
                if (user) {
                    user.first_name = req.body.first_name as string;
                    user.last_name = req.body.last_name as string;
                    user.age_group = Age_Group.id.toString();
                    user.industry = req.body.industry as string;
                    user.organization = req.body.organization as string;
                    user.role = req.body.role as string;
                    user.town_city = req.body.town_city as string;
                    user.country = req.body.country as string;
                    user.website = req.body.website as string;
                    user.hobbies = req.body.hobbies as string;
                    user.trainer = req.body.trainer as string;
                    user.short_bio = req.body.short_bio as string;
                    user.educational_qualification = req.body.educational_qualification as string;
                    user.trainer_experience = req.body.trainer_experience as number;
                    user.areas_of_expertise = req.body.areas_of_expertise as string;
                    user.sectors_of_cater = req.body.sectors_of_cater as string;
                    user.profile_photo = req.body.profile_photo as string;
                    user.profile_video = req.body.profile_video as string;
                    user.pdf_profile = req.body.pdf_profile as string;
                    trainee = await getRepository(Trainee).save(user);
                } else {
                    console.log('error occurred')
                    // throw an exception that user not found
                    res.status(400).json(error('Error while saving user profile', {trainee}));
                }
            }
            res.status(200).json(success('true', {trainee}, res.statusCode));
        } catch (err) {
            console.log('err', err);
            res.status(400).json(success('', {}, res.statusCode));
        }
    }


    public async getAgeGroupData(req: Request, res: IResponse): Promise<void> {
        try{
            const ageGroup = await getRepository(AgeGroup).createQueryBuilder('agegroup')
            .getMany();

            res.status(200).json(success('true', ageGroup, res.statusCode));
        }catch(err){
            res.status(400).json(success('', err.message, res.statusCode));

        }
    }


    async resetTraineePassword(req: Request, res: IResponse): Promise<void> {
        try {
            const trainee: Trainee = await getRepository(Trainee).findOne({
                where: {
                    id: req.user
                }
            });
            const isPasswordMatched = await trainee.passwordMatches(req.body.currentPassword as string);
            if (isPasswordMatched) {
                trainee.trainee_password = req.body.newPassword as string;
                await getRepository(Trainee).save(trainee);
                res.status(200).json(success('', {
                    message: 'Password changed successfully',
                    status: true
                }, res.statusCode));
            } else {
                res.status(400).json(error('Incorrect password', res.statusCode));
            }

        } catch (err) {
            console.log('err', err);
            res.status(400).json(success('', err.message, res.statusCode));
        }
    }

    async addSessionInfoToTrainee(req: VTTRequestVO, res: IResponse): Promise<void> {
        try {
            const program = await getRepository(Sessions).findOne({
                relations: ['program'],
                where: {
                    id: req.body.sessionId
                }
            })

            const pendingTask = await getRepository(Trainee).createQueryBuilder('trainee')
            .where(`trainee.id='${req.user}'`)
            .andWhere('SessionSegment.is_deleted=0')
            .andWhere('SessionSegment.type IN(\'Pre\',\'Post\')')
            .andWhere('SessionSegment.session_plan_status = \'Pending\'')
            .andWhere('(TraineeCompletedTask.trainee_id != :userId OR TraineeCompletedTask.trainee_id IS NULL) ', {userId: req.user})
            // redo true
            .orWhere('TraineeCompletedTask.trainee_id = :userId AND TraineeCompletedTask.redo = \'true\'', { userId: req.user })
            // .andWhere(`(TraineeCompletedTask.trainee_id = :userId AND TraineeCompletedTask.redo = 'true') `, {userId: req.user})
            .select('SessionSegment.id','id')
            .addSelect('SessionSegment.title','title')
            .addSelect('CAST(SessionMapping.session_start_date AS char)','session_start_date')
            .addSelect('CAST(SessionMapping.session_end_date AS char)','session_end_date')
            .addSelect('SessionSegment.description','description')
            .addSelect('SessionSegment.duration','duration')
            .addSelect('SessionSegment.start_time','start_time')
            .addSelect('SessionSegment.end_time','end_time')
            .addSelect('SessionSegment.type','type')
            .addSelect('SessionSegment.sessionId','sessionId')
            .addSelect('SessionSegment.media_attachment_ids','media_attachment_ids')
            .addSelect('SessionSegment.media_attachment','media_attachment')
            .addSelect('SessionSegment.is_deleted','is_deleted')
            .addSelect('SessionSegment.activity_type','activity_type')
            .addSelect('SessionSegment.activity_data','activity_data')
            .addSelect('SessionSegment.session_plan_status','session_plan_status')
            .addSelect('Sessions.session_name','session_name')
            .innerJoin(Participants, 'participants', 'trainee.trainee_email = participants.email')
            .innerJoin(SessionMapping, 'SessionMapping', 'SessionMapping.batchId = participants.batchId')
            .innerJoin(Sessions, 'Sessions', 'participants.programId = Sessions.programId')
            .innerJoin(SessionSegment, 'SessionSegment', 'Sessions.id = SessionSegment.sessionId')
            .leftJoin(TraineeCompletedTask, 'TraineeCompletedTask', 'SessionSegment.id = TraineeCompletedTask.session_segment_id')
            .distinct(true)
            .getRawMany()

            console.log('pendingTask :', pendingTask);
            console.log('userId :', req.user)

            const calenderData = new Sessions({
                session_name: program.session_name,
                program: program.program.id,
                forAll: program.forAll,
                subscriber_id: req.user
            })

            await getRepository(Sessions).save(calenderData)
            res.status(200).json(success('true', {program, pendingTask}, res.statusCode));
        } catch (err) {
            console.log('err', err);
            res.status(400).json(success('', err.message, res.statusCode));
        }
    }

    public async getTraineeProfileData(req: VTTRequestVO, res: IResponse): Promise<void> {
        try {
            const userData = await getRepository(Trainee).findOne({
                where: {
                    id: req.user
                }
            })

            res.status(200).json(success('true', { userData }, res.statusCode));
        } catch (err) {
            res.status(400).json(success(err.message, {}, res.statusCode));
        }
    }

    public async createCollectedVisitingCard(req: Omit<VTTRequestVO, 'body'> & { body: CollectedVisitingCardVO }, res: IResponse): Promise<void> {
        try {
            const traineeId = req.user;

            const visitingCardData = await getRepository(VisitingCardModel).find({
                where: {
                    id: req.body.cardId
                }
            });
            // TODO check if length of visitingCardData is greater than 0. else throw excepyion
            if(visitingCardData.length == 0) {
                res.status(400).json(success('No Visiting Card Found With This Id', visitingCardData, res.statusCode));
                res.end();
                return;
            }
            
            const collectedCard:CollectedVisitingCardModel[] = await getRepository(CollectedVisitingCardModel).find({
                where: {
                    traineeId: req.user, sessionId: req.body.sessionId
                }
            });
            console.log('this is lenght', collectedCard.length);
            if(collectedCard.length > 0){
                // card exists for this user
                const userCollectedCard = collectedCard[0]
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                const cardList: VisitingCardModel[] = JSON.parse(userCollectedCard.data);
                console.log('card list length', cardList.length)
                cardList.push(visitingCardData[0]);
                console.log('card list length', cardList.length)
                userCollectedCard.numberOfCollectedCards = cardList.length
                userCollectedCard.data = JSON.stringify(cardList);
                await getRepository(CollectedVisitingCardModel).save(userCollectedCard);
                res.status(200).json(success('Visiting Card collected Successfully', userCollectedCard, res.statusCode));
            } else {
                // no card exist for this user
                const cardList = [];
                cardList.push(visitingCardData[0])
                const collectedVisitingCardInfo = new CollectedVisitingCardModel();
                collectedVisitingCardInfo.sessionName = req.body.sessionName
                collectedVisitingCardInfo.sessionDate = req.body.sessionDate
                collectedVisitingCardInfo.numberOfCollectedCards = cardList.length
                collectedVisitingCardInfo.data = JSON.stringify(cardList);
                collectedVisitingCardInfo.traineeId = req.user
                collectedVisitingCardInfo.sessionId = req.body.sessionId
                await getRepository(CollectedVisitingCardModel).save(collectedVisitingCardInfo);
                res.status(200).json(success('Collected Visiting Card Created Successfully', collectedVisitingCardInfo, res.statusCode));
            }
        } catch (err) {
            res.status(400).json(success(err.message, {}, res.statusCode));
        }
    }

    public async getCollectedVisitingCardList(req: Omit<VTTRequestVO, 'body'> & { body: CollectedVisitingCardVO }, res: IResponse): Promise<void> {
        try {
            const traineeId = req.user;
            const collectedVisitingCardList = await getRepository(CollectedVisitingCardModel).find({
                where: {
                    traineeId
                }
            });
            res.status(200).json(success('', { collectedVisitingCardList }, res.statusCode));
        } catch (err) {
            res.status(400).json(success(err.message, {}, res.statusCode));
        }
    }

    public async deleteCollectedVisitingCard(req: Omit<VTTRequestVO, 'body'> & { body: DeleteCollectedVisitingCardVO }, res: IResponse): Promise<void> {
        try {
            let idStr = '';
            if(req.body.ids.length == 0){
                res.status(400).json(success('Id Not Found', {}, res.statusCode));
                res.end();
                return;
            }
            req.body.ids.forEach((cardId, index) => {
                if( index == 0){
                    idStr = idStr.concat(cardId.toString())
                } else {
                    idStr = idStr.concat(',').concat(cardId.toString());
                }
            })
            // delete from collectedvisitingcardModel where id in idStr

            // const cardIds = await getRepository(CollectedVisitingCardModel).findOne({
            //     where: {
            //         //id: In([...idStr])
            //         id: req.body.id
            //     }
            // })
            const card = await getRepository(CollectedVisitingCardModel)
                .createQueryBuilder('cardItem')
                .where('cardItem.id = :id', {id : req.body.id})
                .getOne()

                console.log("card", card)
            console.log("cardIds.data", JSON.parse(card.data))
            const visitingCardList: VisitingCardModel[] = JSON.parse(card.data);
            const remainingVisitingCard = [];
            visitingCardList.forEach(vCard => {
                if(req.body.ids.includes(vCard.id)){
                    // it has to be removed

                } else {
                    remainingVisitingCard.push(vCard);
                }
            });
            card.data = JSON.stringify(remainingVisitingCard);
            card.numberOfCollectedCards = remainingVisitingCard.length
            // save this card
            await getRepository(CollectedVisitingCardModel).save(card);
            // await getRepository(CollectedVisitingCardModel).delete(cardIds.data[idStr])
            // for (let i = 0; i < req.body.ids.length; i++) {
            //     const idItem = req.body.ids[i];
            //     console.log(typeof(cardIds.data))
            //     console.log("idItem :", idItem)

            //     cardIds.data = JSON.parse(cardIds.data)
            //     console.log(typeof(cardIds.data))
            //     //cardIds.data = cardIds.data.filter({})
            // }
            //await getRepository(CollectedVisitingCardModel).remove(cardIds.data[idStr])
        
            // await getRepository(CollectedVisitingCardModel)
            // .createQueryBuilder()
            // .delete()
            // .where("id = :id", { id: In([...idStr]) })
            // .execute();

            res.status(200).json(success('', {} , res.statusCode));
        } catch (err) {
            res.status(400).json(success(err.message, {}, res.statusCode));
        }
    }
}

const traineeController = TraineeController.get();

export { traineeController as TraineeController }

