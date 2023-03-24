/* eslint-disable @typescript-eslint/prefer-for-of */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
// import { SessionMapping } from '@models/session-mapping.model';
import { Programs } from '@models/programs.model';
import { badData } from '@hapi/boom';
import { RepliesOnQueries } from './../models/replies_on_queries.model';
import { User } from '@models/user.model';
import { Trainersqueries } from './../models/trainer_queries.model';
import { Trainee } from '@models/trainee.model';
import { Notification } from '../models/Notification.model';
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { SESSION_PLAN_STATUS } from './../types/enums/session-plan-status.enum';
import { ActivityTypes } from '@models/activity_types.model';
import { TrainingJoiningLog } from '@models/training-joining-log.model';
import { CancelSessionVO } from './../types/uiVOs/cancel-sessionVO';
import { Trainers } from '@models/trainers.model';
import { SegmentActivity } from './../models/segment_activity.model';
import { SessionSegment } from './../models/session_segment.model';
import { Participants } from '@models/participants.model';
import { Segments } from './../models/segments.model';
import Sessions from '@models/sessions.model';
import { Request, response } from 'express';
import { IResponse, IRequest, ITraineeTokenOptions } from '@interfaces';
import { getRepository, Brackets, getCustomRepository, getTreeRepository, Index } from 'typeorm';
import { success, error, sendEmail } from '@utils/common.util';
import { InputDetailsVO } from '../types/uiVOs/details-inputVO';
import * as Dayjs from 'dayjs';
import { ProgramBatch } from '@models/program-batch.model';
import { SessionPlanLog } from '@models/session_plan_log.model';
import SessionMapping from '@models/session-mapping.model';
import { SESSION_TYPE_ENUMS } from '@enums/session-type.enum';
import { SegmentActivityVO } from '../types/uiVOs/segment-activityVO';
import { SEGMENT_TYPE_ENUMS } from './../types/enums/segment-type.enum';
const dayjs = require('dayjs');
import { Trainee_Attendance } from '@models/trainee_attendence.model';
import { traineeAttendanceVO } from '../types/uiVOs/trainee-attendanceVO';
import { Quick_Setup_Activites } from '@models/quick-setup-activites.model';
import { quickSetupVO } from '../types/uiVOs/quick-setupVO';
import { LiveConsoleLogVO } from '../types/uiVOs/live-console-logVO';
import { Live_Console_Log } from '@models/live-console-log.model';
import { getManager } from 'typeorm';
import { SessionPlanPreviewVO } from '../types/uiVOs/session-plan-previewVO';
import  {addNotification, addPendingTask}  from '../utils/common.util';
import { Pending_Tasks } from '@models/pendingTasks.model';
import { TrainerProfileVO } from '../types/uiVOs/trainer-profileVO';
import { Profile_Avatar } from '../models/avatar.model';
import { TraineeCompletedTask } from '@models/trainee_completed_tasks.model';
import {VTTRequestVO} from '../types/uiVOs/VTTRequestVO';
import { SessionLinkVO } from '../types/uiVOs/session-linkVO';
import { genLink } from '../utils/link.util';
import { SessionLink } from '@models/session-link.model';
import { link } from 'joi';
import { Buffer } from 'buffer';
import {PENDING_TASKTYPE} from '@enums';
import { AgeGroup } from "@models/age-group.model"
import { POLL_STATUS_ENUM } from '@enums/poll-status.enum';
import { IUserRequest } from "@interfaces";
import { PollStatusVO } from "../types/uiVOs/poll-statusVO"

class TrainersController {

    private static instance: TrainersController;


    static get(): TrainersController {
        if (!TrainersController.instance) {
            TrainersController.instance = new TrainersController();
        }
        return TrainersController.instance;
    }

    public async getParticipantbyBatchID(req: Omit<Request, 'body'> & { body: InputDetailsVO }, res: IResponse): Promise<void> {
        const batchRepo = getRepository(ProgramBatch);
        const batch: ProgramBatch = await batchRepo.createQueryBuilder('batch')
            .where('id = :batchId', { batchId: req.body.id })
            .getOne();
        if (batch) {
            const participant = await getRepository(Participants).createQueryBuilder('participant')
                .where('participant.batchId = :batchId', { batchId: batch.id })
                .getMany()
            res.status(200).json(success('', { participant }, res.statusCode));
        } else {
            res.status(400).json(success('', {}, res.statusCode));
        }
        res.end()

        // const participantdata = await getRepository(Participants).createQueryBuilder('participant')
        // .where('participant.id=:id',{id:req.body.id})
        // .getMany()
        // res.status(200).json(success('', { participantdata }, res.statusCode));
    }


    public async join_participant(req: Omit<Request, 'body'> & { body: TrainingJoiningLog }, res: IResponse): Promise<void> {
        try {
            const TrainingJoiningLogRepo = getRepository(TrainingJoiningLog);
            const trainingJoiningLog = await TrainingJoiningLogRepo.save(req.body);
            res.status(200).json(success('', { trainingJoiningLog }, res.statusCode));
        } catch (err) {
            res.status(400).json(success(err, {}, res.statusCode));
        }
        res.end()
    }


    // create session plan log POST
    public async createSessionPlanLog(req: Omit<Request, 'body'> & { body: SessionPlanLog }, res: IResponse): Promise<void> {
        const sessionplanlogRepo = getRepository(SessionPlanLog);

        const inputSessionPlanLog = new SessionPlanLog({ ...req.body });

        const sessionplanlog: SessionPlanLog = await sessionplanlogRepo.save(inputSessionPlanLog);
        res.status(200).json(success('', { sessionplanlog }, res.statusCode));
        res.end()

    }


    public async getSessionPlanLogBySessionMapId(req: Omit<Request, 'body'> & { body: InputDetailsVO }, res: IResponse, next: () => void): Promise<void> {

        const SessionplanLog = await getRepository(SessionPlanLog).createQueryBuilder('SessionPlanlog')
            .where('SessionPlanlog.id= :SessionMapId', { SessionMapId: req.body.id })
            .getMany();

        let programs
        if (SessionplanLog && SessionplanLog[0] && SessionplanLog[0].ProgramId) {
            programs = await getRepository(Programs).createQueryBuilder('programs')
                .where('programs.id= :ProgramsId', { ProgramsId: SessionplanLog[0].ProgramId })
                .getOne()
        } else {
            programs = {};
        }

        let sessions
        if (SessionplanLog && SessionplanLog[0] && SessionplanLog[0].SessionId) {
            sessions = await getRepository(Sessions).createQueryBuilder('sessions')
                .where('sessions.id= :id', { id: SessionplanLog[0].SessionId })
                .getOne()
        } else {
            sessions = {}
        }
        let sessionMap
        if (SessionplanLog && SessionplanLog[0] && SessionplanLog[0].SessionMapId) {
            sessionMap = await getRepository(SessionMapping).createQueryBuilder('sessionmap')
                .where('sessionmap.id= :id', { id: SessionplanLog[0].SessionMapId })
                .getOne()
        } else {
            sessionMap = {}
        }
        res.status(200).json(success('', { SessionplanLog, programs, sessions, sessionMap }, res.statusCode));


        res.end()
    }


    public async getMappingDataById(req: Omit<Request, 'body'> & { body: InputDetailsVO }, res: IResponse, next: () => void): Promise<void> {

        const sessionmapping = await getRepository(SessionMapping).createQueryBuilder('sessionmapping')
            .where('sessionmapping.id = :id', { id: req.body.id })
            .getMany()


        let sessions
        if (sessionmapping && sessionmapping[0] && sessionmapping[0].sessionId) {
            sessions = await getRepository(Sessions).createQueryBuilder('session')
                .where('session.id = :id', { id: sessionmapping[0].sessionId })
                .getOne()
        } else {
            sessions = {}
        }

        let segment
        if (sessionmapping && sessionmapping[0] && sessionmapping[0].sessionId) {
            segment = await getRepository(Segments).createQueryBuilder('segment')
                .where('segment.sessionId=:id', { id: sessionmapping[0].sessionId })
                .getMany()
        } else {
            segment = {}
        }

        res.status(200).json(success('', { sessionmapping, sessions, segment }, res.sendStatus));

    }

    public async SegmentActicity(req: Omit<Request, 'body'> & { body: SegmentActivityVO }, res: IResponse): Promise<void> {
        try {
            const segmentActivityRepo = getRepository(SegmentActivity);
            const inputSegmentActivity = req.body;
            const sessSegment = await getRepository(SessionSegment).createQueryBuilder('sessionSeg')
                .where({
                    id: inputSegmentActivity.sessionSegmentId,
                    is_deleted: 0
                }).leftJoinAndSelect('sessionSeg.session', 'session')
                .getOne();

            if (!sessSegment) {
                res.status(200).json(success(`Session Segment with id ${inputSegmentActivity.sessionSegmentId} not found`, {}, res.statusCode));
                return;
            } else {
                // @ts-ignore
                if (sessSegment instanceof SessionSegment) {
                    inputSegmentActivity.sessionSegment = sessSegment;
                }
            }

            let segmentActivity = {
                id: inputSegmentActivity.id,
                activity_id: inputSegmentActivity.activity_id,
                activity_data: inputSegmentActivity.activity_data,
                activity_submission_date: inputSegmentActivity.activity_submission_date,
                activate_before_days: inputSegmentActivity.activate_before_days,
                activity_name: inputSegmentActivity.activity_name,
                activityType: inputSegmentActivity.activityType,
                media_attachment: inputSegmentActivity.media_attachment,
                media_attachment_ids: inputSegmentActivity.media_attachment_ids,
                is_deleted: inputSegmentActivity.is_deleted,
                sessionSegment: inputSegmentActivity.sessionSegment,
                pollStatus: inputSegmentActivity.pollStatus
            }
            if (segmentActivity.id === null || segmentActivity.id === 0) {
                // if( segmentActivity.activity_name === 'Poll'){
                //     segmentActivity.pollStatus = POLL_STATUS_ENUM.LAUNCH
                //     console.log('Poll')
                // }else {
                //     segmentActivity.pollStatus = null
                // }
                
                
                segmentActivity = await segmentActivityRepo.save(segmentActivity);

                await getRepository(Sessions).createQueryBuilder()
                    .update(Sessions)
                    .set({ last_updated_at: Dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss') })
                    .where({ id: inputSegmentActivity.sessionSegment.session.id })
                    .execute();

                res.status(200).json(success('', { segmentActivity }, res.statusCode));
            } else {
                await segmentActivityRepo.createQueryBuilder()
                    .update(SegmentActivity)
                    .set({ ...segmentActivity })
                    .where('id = :id', { id: segmentActivity.id })
                    .execute();

                await getRepository(Sessions).createQueryBuilder()
                    .update(Sessions)
                    .set({ last_updated_at: Dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss') })
                    .where({ id: inputSegmentActivity.sessionSegment.session.id })
                    .execute();

                res.status(200).json(success('', { segmentActivity }, res.statusCode));
            }
        } catch (e) {
            res.status(400).json(error(`Got error : ${e}`, res.statusCode));
        } finally {
            res.end();
        }
    }


    public async sessionSegment(req: Omit<Request, 'body'> & { body: SessionSegment }, res: IResponse): Promise<void> {

        const sessionSegmentRepo = getRepository(SessionSegment);
        const inputSessionSegment = req.body;
        try {
            const sessionSegment = await sessionSegmentRepo.createQueryBuilder('sessionSegment')
                .where('sessionSegment.id =:id', { id: req.body.id })
                .getOne();

            if (sessionSegment && sessionSegment.is_deleted) {
                res.status(200).json(success(`Segment with id ${req.body.id} is deleted`, {}, res.statusCode));
            } else if (inputSessionSegment.id === null || inputSessionSegment.id === 0) {
                const segments = await sessionSegmentRepo.createQueryBuilder('segment')
                    .select('COUNT(*)', 'count')
                    .where('segment.session = :sessionId', { sessionId: inputSessionSegment.session })
                    .andWhere('segment.type = :type', { type: inputSessionSegment.type })
                    .andWhere('segment.session_plan_status = :status', { status: SESSION_PLAN_STATUS.COMPLETED })
                    .getRawOne();

                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                if (segments.count > 0)
                    inputSessionSegment.session_plan_status = SESSION_PLAN_STATUS.COMPLETED;
                else
                    inputSessionSegment.session_plan_status = SESSION_PLAN_STATUS.PENDING;

                const sessionSegment: SessionSegment = await sessionSegmentRepo.save(inputSessionSegment);

                await getRepository(Sessions).createQueryBuilder()
                    .update(Sessions)
                    .set({ last_updated_at: Dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss') })
                    .where({ id: sessionSegment.session })
                    .execute();

                res.status(200).json(success('', { sessionSegment: inputSessionSegment }, res.statusCode));
            } else {
                const sessionSegment: SessionSegment = inputSessionSegment;
                await sessionSegmentRepo.createQueryBuilder()
                    .update(SessionSegment)
                    .set({ ...sessionSegment })
                    .where('id = :id', { id: inputSessionSegment.id })
                    .execute();

                await getRepository(Sessions).createQueryBuilder()
                    .update(Sessions)
                    .set({ last_updated_at: Dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss') })
                    .where({ id: sessionSegment.session })
                    .execute();

                res.status(200).json(success('', { sessionSegment }, res.statusCode));
            }
        } catch (e) {
            res.status(400).json(error(`catched error : ${e}`, res.statusCode));
        } finally {
            res.end();
        }
    }

    // new task

    public async getSegmentActivity(req: Omit<Request, 'body'> & { body: InputDetailsVO }, res: IResponse): Promise<void> {

        const sessionSegment = await getRepository(SessionSegment).createQueryBuilder('sessionSegment')
            .where('sessionSegment.id =:id', { id: req.body.id })
            .getOne();

        if (!sessionSegment) {
            res.status(200).json(success(`session_segment with id ${req.body.id} not found`, {}, res.statusCode));
        } else if (sessionSegment.is_deleted) {
            res.status(200).json(success(`session_segment with id ${req.body.id} is deleted`, {}, res.statusCode));
        } else {
            const segmentActivity = await getRepository(SegmentActivity).createQueryBuilder('segmentActivity')
                .where('segmentActivity.sessionSegmentId =:id', { id: req.body.id })
                .andWhere('segmentActivity.is_deleted = 0')
                .getMany();
            res.status(200).json(success('', { sessionSegment, segmentActivity }, res.statusCode));
        }
    }

    public async getSessionSegment(req: Omit<Request, 'body'> & { body: InputDetailsVO }, res: IResponse): Promise<void> {

        const sessionSegment = await getRepository(SessionSegment).createQueryBuilder('sessionSegment')
            .where('sessionSegment.id =:id', { id: req.body.id })
            .getOne();

        if (!sessionSegment) {
            res.status(200).json(success('session_segment not found', {}, res.statusCode));
        } else if (sessionSegment.is_deleted) {
            res.status(200).json(success('session_segment is deleted', {}, res.statusCode));
        } else {
            res.status(200).json(success('', { sessionSegment }, res.statusCode));
        }
    }

    public async deleteSessionSegment(req: Omit<Request, 'body'> & { body: InputDetailsVO }, res: IResponse): Promise<void> {
        const sessionsegmentRepo = await getRepository(SessionSegment);
        const segmentactivityRepo = await getRepository(SegmentActivity);
        try {
            const c = await sessionsegmentRepo.createQueryBuilder()
                .update(SessionSegment)
                .set({ is_deleted: true })
                .where('id = :id', { id: req.body.id })
                .execute();
            if (c.raw > 0) {
                await segmentactivityRepo.createQueryBuilder()
                    .update(SessionSegment)
                    .set({ is_deleted: true })
                    .where('sessionSegmentId = :id', { id: req.body.id })
                    .execute();
            }
            res.status(200).json(success('', {}, res.statusCode));
        } catch (e) {
            res.status(400).json(error('', res.statusCode));
        }
    }

    public async deleteSegmentActivity(req: Omit<Request, 'body'> & { body: InputDetailsVO }, res: IResponse): Promise<void> {
        try {
            await getRepository(SegmentActivity).createQueryBuilder()
                .update(SegmentActivity)
                .set({ is_deleted: true })
                .where('id = :id', { id: req.body.id })
                .execute();
            res.status(200).json(success('', {}, res.statusCode));
        } catch (e) {
            res.status(400).json(error('', res.statusCode));
        }
    }

    public async getTypeData(req: Omit<Request, 'body'> & { body: InputDetailsVO }, res: IResponse): Promise<void> {

        const sessionSegment = await getRepository(SessionSegment).createQueryBuilder('sessionSegment')
            .where('sessionSegment.sessionId =:id', { id: req.body.id })
            .andWhere(new Brackets(ab => {
                ab.where('sessionSegment.type = :type', { type: req.body.type })
                    .andWhere('is_deleted = 0')
            })).getMany();
        console.log(sessionSegment);
        console.log(...sessionSegment);


        const sessionSegmentList = []
        for (let i = 0; i < sessionSegment.length; i++) {
            const _segmentActivity = await getRepository(SegmentActivity).createQueryBuilder('segmentActivity')
                .where('segmentActivity.sessionSegmentId =:id', { id: sessionSegment[i].id })
                .andWhere('segmentActivity.is_deleted = 0')
                .getMany();
            sessionSegmentList.push({
                ...sessionSegment[i],
                subSegmentList: _segmentActivity,
            });
        }
        console.log(sessionSegmentList);

        res.status(200).json(success('', { sessionSegmentList }, res.statusCode));
    }

    public async getSessionMap(req: Omit<Request, 'body'> & { body: InputDetailsVO }, res: IResponse): Promise<void> {
        try {
            const sessionMap: SessionMapping[] = await getRepository(SessionMapping).createQueryBuilder('sessionmapping')
                .where('sessionmapping.session = :id', { id: req.body.id })
                .leftJoinAndSelect('sessionmapping.trainer', 'trainer')
                .getMany();
            const sessionMappingData = [];
            for (let i = 0; i < sessionMap.length; i++) {
                const trainer_name = await getRepository(Trainers).createQueryBuilder('trainer')
                    .where('trainer.id = :id', { id: sessionMap[i].trainer.id })
                    .select('trainer.name')
                    .getOne();
                const batch = await getRepository(ProgramBatch).createQueryBuilder('batch')
                    .where('batch.id = :id', { id: sessionMap[i].batchId })
                    .getOne();
                sessionMappingData.push({
                    ...sessionMap[i],
                    trainer: trainer_name,
                    batch
                });
            }
            res.status(200).json(success('', { sessionMappingData }, res.statusCode));
        } catch (err) {
            res.status(400).json(success(err.message, {}, res.statusCode));
        }
    }

    public async cancelSession(req: Omit<Request, 'body'> & { body: CancelSessionVO }, res: IResponse): Promise<void> {
        try {
            // const sessionMap : SessionMapping[] = await getRepository(SessionMapping).createQueryBuilder('sessionmapping')
            //     .where('sessionmapping.session = :id', {id : req.body.id})
            //     .getMany();
            if (req.body.isSessionId) {
                await getRepository(SessionMapping).createQueryBuilder()
                    .update(SessionMapping)
                    .set({ status: SESSION_TYPE_ENUMS.Cancelled })
                    .where('sessionId = :id', { id: req.body.id })
                    .execute()
            } else {
                await getRepository(SessionMapping).createQueryBuilder()
                    .update(SessionMapping)
                    .set({ status: SESSION_TYPE_ENUMS.Cancelled })
                    .where('id = :id', { id: req.body.id })
                    .execute()
            }
            res.status(200).json(success('', {}, res.statusCode));
        } catch (err) {
            res.status(400).json(success(err.message, {}, res.statusCode));
        }
    }

    public async getSessionUpdateTime(req: Request, res: IResponse): Promise<void> {
        try {
            const session_last_updated_at = await getRepository(Sessions)
                .createQueryBuilder('session')
                .select('session.last_updated_at')
                .where('session.id = :id', { id: req.params.sessionId })
                .getOne();

            res.status(200).json(success('', {
                last_updated_at: Dayjs(session_last_updated_at.last_updated_at).format('YYYY-MM-DD HH:mm:ss')
            }, res.statusCode));
        } catch (err) {
            res.status(400).json(success(err.message, {}, res.statusCode));
        }
    }

    public async listquerytrainer(req: Request, res: IResponse): Promise<void> {
        try {
            let trainer
            if (req.user) {
                trainer = await getRepository(Trainers).createQueryBuilder('trainer')
                    .where('trainer.subscriber_id = :subscriber_id', { subscriber_id: req.user })
                    .getOne();
            } else {
                res.status(400).json(success('Invalid token received', {  }, res.statusCode));
                res.end();
            }
            const trainerQuery = await getRepository(Trainersqueries).createQueryBuilder('queries')
                .where('queries.trainerId =:trainerId', { trainerId: trainer.id })
                .leftJoin('queries.program', 'program')
                .leftJoin('queries.session', 'session')
                .leftJoin('queries.raised_by', 'trainee')
                .select(['program.program_name', 'session.session_name', 'queries.id',
                'queries.query', 'queries.trainer_response','queries.query_date',
            'queries.title', 'queries.trainer_response_date', 'queries.type', 'trainee.trainee_name'])
                .getMany();

            res.status(200).json(success('', { trainerQuery }, res.statusCode));
            res.end();
        } catch (err) {
            res.status(400).json(success(err.message, {}, res.statusCode));
        }
    }



    public async allDetailsOfQueries(req: Request, res: IResponse): Promise<void> {
        try {

            const trainerQuery = await getRepository(Trainersqueries).createQueryBuilder('trainer')
                .where('trainer.id=:id', { id: req.body.id })
                .leftJoinAndSelect('trainer.replies', 'replies')
                .getOne();

            res.status(200).json(success('', { trainerQuery }, res.statusCode));
            res.end();
        } catch (err) {
            res.status(400).json(success(err.message, {}, res.statusCode));
        }
    }


    public async trainerQueryReply(req: Request, res: IResponse): Promise<void> {
        try {
            if (req.body.id) {
                const trainerQuery = await getRepository(Trainersqueries).findOne({ id: req.body.id })
                if (trainerQuery) {
                    await getRepository(Trainersqueries).createQueryBuilder()
                        .update(Trainersqueries)
                        .set({
                            trainer_response: req.body.trainer_response,
                            trainer_response_date: dayjs().format('YYYY-MM-DD'),
                        })
                        .where({ id: req.body.id })
                        .execute();

                        const data = await getRepository(Trainersqueries).createQueryBuilder('Trainersqueries')
                        .where('Trainersqueries.id=:id', { id: req.body.id })
                        .leftJoinAndSelect('Trainersqueries.trainer','trainer')
                        .leftJoinAndSelect('Trainersqueries.raised_by','raised_by')
                        .leftJoinAndSelect('Trainersqueries.session','session')
                        .leftJoinAndSelect('Trainersqueries.replies','replies')
                        .getOne()

                        // console.log(data);

                        const content = JSON.stringify({
                            type:'query_response_by_trainer',
                            sent_by_id:null,
                            queryId : req.body.id
                        })

                        await addNotification(data.raised_by.id,6,content);

                        await addPendingTask(data.raised_by.id,6,content,14);

                    res.status(200).json(success('Data updated successfully', data, res.statusCode));
                    res.end();
                } else {
                    res.status(201).json(success('', { message: 'please enter valid id' }, res.statusCode));
                    res.end();
                }
            } else {
                res.status(201).json(success('', { message: 'please enter id' }, res.statusCode));
                res.end();

            }
        } catch (err) {
            res.status(400).json(success(err.message, {}, res.statusCode));
        }
    }


    public async getQueriesByOther(req: Request, res: IResponse): Promise<void> {
        try {

            const user_email = await getRepository(User).createQueryBuilder('user')
                .where('user.id = :id', { id: req.user })
                .getOne();

            const trainerQuery = await getRepository(Participants).createQueryBuilder('participants')
                .where('participants.email = :email', { email: user_email.email })
                .leftJoinAndSelect('participants.program', 'program')
                .leftJoinAndSelect('program.queries', 'queries')
                .andWhere('queries.type=:type', { type: 'Public' })
                .getMany();

            const privateData = await getRepository(Participants).createQueryBuilder('participants')
                .where('participants.email = :email', { email: user_email.email })
                .leftJoinAndSelect('participants.program', 'program')
                .leftJoinAndSelect('program.queries', 'queries')
                .andWhere('queries.type=:type', { type: 'Private' })
                .andWhere('queries.raisedById =:raisedById', { raisedById: req.user })
                .getMany();

            const y: any = privateData.map(b => b.program.queries)
            const x: any = privateData.map(v => v.program.id)
            x.reverse()
            y.reverse()
            for (let i = 0; i < trainerQuery.length; i++) {
                if (x.length == 1) {
                    if (trainerQuery[i].program.id == x) {
                        console.log('only one program id');
                        trainerQuery[i].program.queries.push(...y[0])

                    }
                } else {
                    if (trainerQuery[i].program.id == x[i]) {
                        console.log('for multiple Program id ');
                        trainerQuery[i].program.queries.push(...y[i])

                    }
                }

            }

            res.status(200).json(success('', { trainerQuery }, res.statusCode));
            res.end();

        } catch (err) {
            res.status(400).json(success(err.message, {}, res.statusCode));
        }
    }


    public async listQueries(req: Request, res: IResponse): Promise<void> {
        try {
            let ListQuery

            ListQuery = await getRepository(Trainersqueries).createQueryBuilder('queries')
                .where('queries.raisedById = :raisedById', { raisedById: req.user })
                .leftJoinAndSelect('queries.session', 'session')
                .leftJoinAndSelect('queries.program', 'program')
                .leftJoinAndSelect('queries.raised_by', 'raised_by')
                .getMany();
            res.status(200).json(success('', { ListQuery }, res.statusCode));
            res.end();
        } catch (err) {
            res.status(400).json(success(err.message, {}, res.statusCode));
        }
    }

    // title
    // query
    // trainer repon
    // date
    // comment

    public async listQueriesId(req: Request, res: IResponse): Promise<void> {
        try {
            let ListQueryId
            ListQueryId = await getRepository(Trainersqueries).createQueryBuilder('queries')
                .where('queries.id = :id', { id: req.body.id })
                .leftJoinAndSelect('queries.program', 'program')
                .leftJoinAndSelect('queries.session', 'session')
                .leftJoinAndSelect('queries.raised_by', 'raised_by')
                .leftJoinAndSelect('queries.trainer', 'trainer')
                .leftJoinAndSelect('queries.replies', 'replies')
                .leftJoinAndSelect('replies.reply_by', 'reply_by')
                .getMany();
            res.status(200).json(success('', { ListQueryId }, res.statusCode));
            res.end();
        } catch (err) {
            res.status(400).json(success(err.message, {}, res.statusCode));
        }
    }



    public async createNewQuery(req: Request, res: IResponse): Promise<void> {
        try {
            let Id : any;
            Id = req.user
            let Mapping
            let participant
            if (req.body.email && req.body.programId && req.body.sessionId) {
                participant = await getRepository(Participants).createQueryBuilder('participant')
                    .where('participant.email=:email', { email: req.body.email })
                    .andWhere('participant.programId=:programId', { programId: req.body.programId })
                    .leftJoinAndSelect('participant.batch', 'batch')
                    .getOne()

                if (participant) {
                    Mapping = await getRepository(SessionMapping).createQueryBuilder('mapping')
                        .where('mapping.batchId=:batchId', { batchId: participant.batch.id })
                        .andWhere('mapping.sessionid=:sessionid', { sessionid: req.body.sessionId })
                        .leftJoinAndSelect('mapping.trainer', 'trainer')
                        .leftJoinAndSelect('mapping.session','session')
                        .getOne();
                }
            } else {
                res.end();
                return;
            }
            let trainerid: any
            if (Mapping) {
                trainerid = Mapping.trainer.id
            }
            const trainerQuery = [];
            const id = await getRepository(Trainersqueries).findOne({ id: req.body.id })
            const segmentactivityRepo = getRepository(Trainersqueries);
            if (Mapping && participant) {
                if (req.body.id) {
                    if (id) {
                        await getRepository(Trainersqueries).createQueryBuilder()
                            .update(Trainersqueries)
                            .set({
                                query: req.body.query,
                                trainer_response: null,
                                trainer_response_date: null,
                                raised_by: req.user,
                                trainer: trainerid,
                                program: req.body.programId,
                                session: req.body.sessionId,
                                title: req.body.title,
                                type: req.body.type
                            })
                            .where({ id: req.body.id })
                            .execute();
                        const data = req.body;

                        const obj = {
                            type: PENDING_TASKTYPE.NEW_QUERY_TO_TRAINER,
                            sent_by:req.user,
                            queryId : req.body.id
                        }
                        const content = JSON.stringify(obj)

                        await addNotification(trainerid,4,content);

                        res.status(200).json(success('', { message: 'Data updated successfully', data }, res.statusCode));
                        // res.end();
                        return
                    } else {
                        res.status(201).json(success('this id is not find in table', { trainerQuery }, res.statusCode));
                        res.end();
                        return
                    }

                } else {
                    const trainersqueries: Trainersqueries = new Trainersqueries({
                        query: req.body.query,
                        trainer_response: null,
                        trainer_response_date: null,
                        raised_by: req.user,
                        trainer: trainerid,
                        program: req.body.programId,
                        session: req.body.sessionId,
                        title: req.body.title,
                        type: req.body.type
                    });
                    const trainerQuery: Trainersqueries = await segmentactivityRepo.save(trainersqueries);
                    // console.log(trainerQuery.id);
                    const programs: Programs[] = await getRepository(Programs).find({
                        where: {
                            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                            id: req.body.programId as number
                        }
                    });
                    if(programs && programs.length > 0){
                        const obj = {
                            taskType: PENDING_TASKTYPE.NEW_QUERY_TO_TRAINER,
                            sent_by:req.user,
                            queryId : trainerQuery.id,
                            taskTitle:'Query',
                            task:'To user that they have received a query',
                            batch: req.body.batch ? req.body.batch : '',
                            programme: programs[0].program_name,
                            programId: programs[0].id,
                            session: req.body.sessionId,
                            sessionId: req.body.sessionId
                        }
                        const PendingtaskContent = JSON.stringify(obj)
                        const NotificationContent = JSON.stringify({
                            type: PENDING_TASKTYPE.NEW_QUERY_TO_TRAINER,
                           })
                        await addNotification(trainerid as number,4,NotificationContent);
                        await addPendingTask(Mapping.session.subscriber_id as number,4,PendingtaskContent,13);

                    }
                    res.status(200).json(success('new record save successfully', { trainerQuery }, res.statusCode));
                    res.end();
                }
            } else {
                res.status(400).json(success('plz enter Proper programId,sessionId and email ', { trainerQuery }, res.statusCode));
                res.end();
                return;
            }


        } catch (err) {
            res.status(400).json(success(err.message, {}, res.statusCode));
        }
    }


    public async replyOnOthersQueries(req: Request, res: IResponse): Promise<void> {
        try {

            const segmentactivityRepo = getRepository(RepliesOnQueries);
            if (!req.body.id) {
                const replyOnQuery: RepliesOnQueries = new RepliesOnQueries({
                    reply: req.body.reply,
                    query: req.body.query,
                    reply_by: req.body.reply_by
                });
                const _ReplyQuery: RepliesOnQueries = await segmentactivityRepo.save(replyOnQuery);
                const ReplyQuery = await getRepository(RepliesOnQueries).createQueryBuilder('Queries')
                    .where('Queries.id =:id', { id: _ReplyQuery.id })
                    .leftJoinAndSelect('Queries.query', 'query')
                    .leftJoinAndSelect('Queries.reply_by', 'reply_by')
                    .getOne()
                res.status(200).json(success('new record save sucessfully', { ReplyQuery }, res.statusCode));
                res.end();
            } else {
                const id = await getRepository(RepliesOnQueries).findOne({ id: req.body.id })
                if (id) {

                    await getRepository(RepliesOnQueries).createQueryBuilder()
                        .update(RepliesOnQueries)
                        .set({
                            reply: req.body.reply,
                            query: req.body.query,
                            reply_by: req.body.reply_by
                        })
                        .where({ id: req.body.id })
                        .execute();
                    const data = await getRepository(RepliesOnQueries).createQueryBuilder('Queries')
                        .where('Queries.id =:id', { id: req.body.id })
                        .leftJoinAndSelect('Queries.query', 'query')
                        .leftJoinAndSelect('Queries.reply_by', 'reply_by')
                        .getOne()
                    res.status(200).json(success('Data updated successfully', data, res.statusCode));
                    res.end();
                } else {
                    res.status(201).json(success('please enter valid id', {}, res.statusCode));
                    res.end();
                }
            }


        } catch (err) {
            res.status(400).json(success(err.message, {}, res.statusCode));
        }
    }


    public async changeSessionPlanStatus(req: Request, res: IResponse): Promise<void> {
        try {
            await getRepository(SessionSegment).createQueryBuilder()
                .update(SessionSegment)
                .set({ session_plan_status: SESSION_PLAN_STATUS.COMPLETED })
                .where('session = :id', { id: req.body.session_id })
                .andWhere('type = :type', { type: req.body.type })
                .execute();
            res.status(200).json(success('', {}, res.statusCode));
        } catch (err) {
            res.status(400).json(success(err.message, {}, res.statusCode));
        }
    }

    public async pendingSessionSegments(req: Request, res: IResponse): Promise<void> {
        try {
            const id = req.user
            const email = await getRepository(Trainee).createQueryBuilder('trainee')
                .where('trainee.id=:id', { id })
                .getOne();

            const m = 'Pre';
            const n = 'Post'
            const participants = await getRepository(Participants).createQueryBuilder('party')
                .where('party.email = :email', { email: email.trainee_email })
                .leftJoinAndSelect('party.program', 'program')
                .leftJoinAndSelect('program.sessionList', 'sessionList')
                .leftJoinAndSelect('sessionList.sessionSegment', 'sessionSegment')

                .andWhere('sessionSegment.type IN(:types)', { types: [m, n] })
                .getMany();

            res.status(200).json(success('', { participants }, res.statusCode));
        } catch (err) {
            res.status(400).json(success(err.message, {}, res.statusCode));
        }
    }

    public async traineeAttendance(req: Omit<Request, 'body'> & { body: traineeAttendanceVO }, res: IResponse): Promise<void> {
        try {
            let responseData
            const user = req.body;

            const traineeData = await getRepository(Trainee_Attendance).findOne({
                where: { session_map_id: user.session_map_id, email: user.email },
            });

            if (traineeData) {

                traineeData.status = user.status;

                responseData = traineeData;
                await getRepository(Trainee_Attendance).save(traineeData);
            } else {

                const newTraineeData = new Trainee_Attendance();

                newTraineeData.id = user.id;
                newTraineeData.session_map_id = user.session_map_id;
                newTraineeData.participant_id = user.participant_id;
                newTraineeData.email = user.email;
                newTraineeData.status = user.status;

                responseData = newTraineeData;
                await getRepository(Trainee_Attendance).insert(newTraineeData);
            }

            res.status(200).json(success('', { responseData }, res.statusCode));
        } catch (err) {
            res.status(400).json(success(err.message, {}, res.statusCode));
        }
    }

    public async quickSetupActivity(req: Omit<Request, 'body'> & { body: quickSetupVO }, res: IResponse): Promise<void> {
        try {
            let responseData
            const user = req.body;

            const traineeData = await getRepository(Quick_Setup_Activites).findOne({
                where: { id: user.id },
            });

            if (traineeData) {
                traineeData.activity_id = user.activity_id;
                traineeData.activity_data = user.activity_data;
                traineeData.activity_name = user.activity_name;

                await getRepository(Quick_Setup_Activites).save(traineeData);
                responseData = traineeData;
            } else {

                const newTraineeData = new Quick_Setup_Activites();

                newTraineeData.session_map_id = user.session_map_id;
                newTraineeData.activity_id = user.activity_id;
                newTraineeData.activity_data = user.activity_data;
                newTraineeData.activity_name = user.activity_name;

                await getRepository(Quick_Setup_Activites).insert(newTraineeData);
                responseData = newTraineeData;
            }


            res.status(200).json(success('true', { responseData }, res.statusCode));
        } catch (err) {
            res.status(400).json(success(err.message, {}, res.statusCode));
        }
    }


    public async insertLiveConsoleLog(req: Omit<Request, 'body'> & { body: LiveConsoleLogVO }, res: IResponse): Promise<void> {
        try {
            let responseData
            const user = req.body;
            const todaysDate = dayjs().format('YYYY-MM-DD HH:mm:ss');


            const newTraineeData = new Live_Console_Log();

            newTraineeData.session_map_id = user.session_map_id;
            newTraineeData.mode = user.mode;
            newTraineeData.activity_id = user.activity_id;
            newTraineeData.activity_status = user.activity_status;
            newTraineeData.activity_status_data = user.activity_status_data;
            newTraineeData.created_at = todaysDate;


            responseData = newTraineeData;
            await getRepository(Live_Console_Log).insert(newTraineeData);


            res.status(200).json(success('', { responseData }, res.statusCode));
        } catch (err) {
            res.status(400).json(success(err.message, {}, res.statusCode));
        }
    }


    public async getLiveConsoleLog(req: Omit<Request, 'body'> & { body: LiveConsoleLogVO }, res: IResponse): Promise<void> {
        try {
            let responseData
            const user = req.body;

            const fetchedData = await getManager()
                .createQueryBuilder(Live_Console_Log, 'traineeData')
                .where(`traineeData.session_map_id ='${user.session_map_id}'`)
                .orderBy('traineeData.id', 'DESC')
                .limit(1)
                .getRawMany();

            responseData = fetchedData;
            console.log(fetchedData);

            res.status(200).json(success('', { responseData }, res.statusCode));
        } catch (err) {
            res.status(400).json(success(err.message, {}, res.statusCode));
        }
    }



    async getNotification(req: VTTRequestVO, res: IResponse): Promise<void>{
        const userType = req.params.user_type
        try {
            const notification = await getRepository(Notification).createQueryBuilder('notification')
                .where('notification.user_type = :user_type', {user_type: 4})
                .andWhere('notification.pertain_to = :userId', { userId: req.user})
                .getMany();

            res.status(200).json(success('', notification, res.statusCode));
        } catch (err) {
            res.status(400).json(success(err.message, {}, res.statusCode));
        }
        res.end();
    }


    async getTrainerPendingTask(req: Request, res: IResponse): Promise<void>{
        try {
            // console.log('req.user', req.user)
            const TrainerAllTasks = await getRepository(Pending_Tasks).createQueryBuilder('pendingtask')
                .where('pendingtask.user_type = :user_type', {user_type: 4})
                .andWhere('pendingtask.pertain_to =:pertain_to',{pertain_to:req.user})
                .getMany();

            res.status(200).json(success('', { TrainerAllTasks }, res.statusCode));
        } catch (err) {
            res.status(400).json(success(err.message, {}, res.statusCode));
        }
        res.end();
    }



    public async CommentsOnQuery(req: Omit<Request, 'body'> & { body: LiveConsoleLogVO }, res: IResponse): Promise<void> {
        try {

            const Commentquery = await getRepository(RepliesOnQueries).createQueryBuilder('reply')
                .where('reply.query = :query', { query: req.body.id })
                .leftJoin('reply.reply_by', 'reply_by')
                .addSelect('reply_by.trainee_name')
                .addSelect('reply_by.trainee_email')
                .addSelect('reply_by.social_media_id')
                .addSelect('reply_by.social_media_type')
                .addSelect('reply_by.isActive')
                .addSelect('reply_by.created_at')
                .getMany();


            res.status(200).json(success('', { Commentquery }, res.statusCode));
        } catch (err) {
            res.status(400).json(success(err.message, {}, res.statusCode));
        }
    }


    public async getTrainerQueries(req: Omit<Request, 'body'> & { body: LiveConsoleLogVO }, res: IResponse): Promise<void> {
        try {
            let Trainerquery;
            const trainer = await getRepository(Trainers).createQueryBuilder('reply')
                .where('reply.subscriber_id = :subscriber_id', { subscriber_id: req.user })
                .getMany();
            const Trainee=[]
            const id = trainer.map(x => x.id)
            console.log(id);
            for (let i = 0; i < id.length; i++) {
                Trainerquery = await getRepository(Trainersqueries).createQueryBuilder('query')
                    .where('query.trainer =:trainer', { trainer: id[i] })
                    .leftJoin('query.raised_by','raised_by')
                    .addSelect('raised_by.id')
                    .addSelect('raised_by.trainee_name')
                    .addSelect('raised_by.trainee_email')
                    .getMany()
                    if(Trainerquery.length !== 0){
                        Trainee.push(Trainerquery)
                    }
            }
            res.status(200).json(success('', {Trainee}, res.statusCode));
        } catch (err) {
            res.status(400).json(success(err.message, {}, res.statusCode));
        }
    }

    public async getSessionPlanPreview(req: Omit<Request, 'body'> & { body: SessionPlanPreviewVO }, res: IResponse): Promise<void> {
        try {
            let responseData;
            const user = req.body;

            const sessionSegment = await getRepository(SessionSegment).createQueryBuilder('sessionSegment')
                .where('sessionSegment.sessionId =:id', { id: user.session_id })
                .andWhere(new Brackets(ele => {
                    ele.where('sessionSegment.type = :type', { type: 'live' })
                        .andWhere('is_deleted = 0')
                })).getMany();

            // console.log(sessionSegment);


            const sessionSegmentList = []
            for (let i = 0; i < sessionSegment.length; i++) {
                const _segmentActivity = await getRepository(SegmentActivity).createQueryBuilder('segmentActivity')
                    .where('segmentActivity.sessionSegmentId =:id', { id: sessionSegment[i].id })
                    .andWhere('segmentActivity.is_deleted = 0')
                    .getMany();
                sessionSegmentList.push({
                    ...sessionSegment[i],
                    subSegmentList: _segmentActivity,
                });
            }
            // console.log(sessionSegmentList);


            const quickSetupData = await getRepository(Quick_Setup_Activites)
                .createQueryBuilder('traineeData')
                .where('traineeData.session_map_id =:id', { id: user.session_map_id })
                .orderBy('id', 'ASC')
                .getMany();


            responseData = {
                prePlannedActivities: sessionSegmentList,
                quickSetupActivities: quickSetupData
            }

            res.status(200).json(success('true', { responseData }, res.statusCode));
        } catch (err) {
            res.status(400).json(success(err.message, {}, res.statusCode));
        }
    }

    public async saveTrainerProfileData(req: Omit<VTTRequestVO, 'body'> & { body: TrainerProfileVO }, res: IResponse): Promise<void> {
        try {
            // @ts-ignore
            const users: User[] = await getRepository(User).find({
                where: {
                    id: req.user
                }
            });
            if(users.length > 1){
                // throw an exception taht multuple users found
            }
            if(users.length === 0){
                // throw an exception that no user found
            }
            const user = users[0];
            if(user){
                        user.fullname = req.body.fullname as string;
                        user.experienceAsTrainer = req.body.experienceAsTrainer as number;
                        user.areaOfExpertise = req.body.areaOfExpertise as string;
                        user.sectorCaterTo = req.body.sectorCaterTo as string;
                        user.age_group = req.body.age_group as string;
                        user.trainer = req.body.trainer as string;
                        user.educational_qualification = req.body.educational_qualification;
                        user.hobbies = req.body.hobbies as string;
                        user.roleName = req.body.roleName as string;
                        user.town_city = req.body.town_city as string;
                        user.country = req.body.country as string;
                        user.website = req.body.website as string;
                        user.industry = req.body.industry as string;
                        user.organisationName = req.body.organisationName as string;
                        user.address = req.body.address as string;
                        user.nationality = req.body.nationality as string;
                        user.contactNumber = req.body.contactNumber as string;
                        user.micrositeLink = req.body.micrositeLink as string;
                        user.shortBio = req.body.shortBio as string;
                        user.resume = req.body.resume as string;
                        user.videoOrAttachments = req.body.videoOrAttachments as string;
                        user.profilePhoto = req.body.profilePhoto as string;
                        user.facebookLink = req.body.facebookLink as string;
                        user.instagramLink = req.body.instagramLink as string;
                        user.linkedinLink = req.body.linkedinLink as string;
                        user.pinterestLink = req.body.pinterestLink as string;
                        
                        // console.log('Updating user now')
                        await getRepository(User).save(user);
            } else {
                console.log('error occured')
                // throw an exception that user not found
            }
            res.status(200).json(success('true', {  }, res.statusCode));
        } catch (err) {
            console.log('err',err);
            res.status(400).json(success('', {}, res.statusCode));
        }
    }

    public async getTrainerProfileData(req: Omit<VTTRequestVO, 'body'> & { body: TrainerProfileVO }, res: IResponse): Promise<void> {
        try {

            const userData = await getRepository(User).createQueryBuilder('user')
                .where('id = :id', { id: req.user })
                .getOne();


            res.status(200).json(success('true', { userData }, res.statusCode));
        } catch (err) {
            res.status(400).json(success(err.message, {}, res.statusCode));
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

    public async getTrainerProfileAvatar(req: Request, res: IResponse): Promise<void> {
        try {

            // const userData = await getRepository(User).createQueryBuilder('user')
            //     .where('id = :id', { id: req.user })
            //     .getOne();
            let userData;

                if(req.body.id){
                     userData = await getRepository(Profile_Avatar).createQueryBuilder('profile_avatar')
                    .where('id = :id', { id: req.body.id })
                    .getOne();
                }else{
                    userData = await getRepository(Profile_Avatar).createQueryBuilder('profile_avatar')
                                .getMany();
                }


            res.status(200).json(success('true', { userData }, res.statusCode));
        } catch (err) {
            res.status(400).json(success(err.message, {}, res.statusCode));
        }
    }


    // public async getCompletedProgrammesDetail(req: Request, res: IResponse): Promise<void> {
    //     try {
    //         const userData = await getRepository(Trainers).createQueryBuilder('trainer')
    //             .where('trainer.email = :email', { email: req.body.trainer_email })
    //             .getOne();

    //         const program = await getRepository(Programs).createQueryBuilder('program')
    //         .where('program.subscriber_id = :subscriber_id',{subscriber_id :userData.subscriber_id })
    //         .getMany();

    //         res.status(200).json(success('true',  {userData ,program} , res.statusCode));
    //     } catch (err) {
    //         res.status(400).json(success(err.message, {}, res.statusCode));
    //     }
    // }

    // public async getTraineeSubmittedTaskOld(req: Request, res: IResponse): Promise<void> {
    //     try {

    //         const traineeActivityInfo = await getRepository(TraineeCompletedTask)
    //             .createQueryBuilder('traineeCompletedTask')
    //             .where('traineeCompletedTask.trainee_id = :id',{id:req.query.trainee_id})
    //             .andWhere('traineeCompletedTask.session_segment_id = :sId', {sId:req.query.session_segment_id})
    //             .getOne();

    //         res.status(200).json(success('data fetched successfully', traineeActivityInfo, res.statusCode));
    //     } catch (err) {
    //         res.status(400).json(error( err.message, res.statusCode));
    //     }
    // }

    public async getTraineeSubmittedTask(req: Request, res: IResponse): Promise<void> {
        try {
    
            let traineeCompletedTaskInfo
    
            if(req.query.trainee_id != null && req.query.session_segment_id != null){
              traineeCompletedTaskInfo = await getRepository(TraineeCompletedTask).findOne({
                where: {
                    trainee_id : req.query.trainee_id,
                    session_segment_id : req.query.session_segment_id,
                    redo : 0
                }
            });
            }else if(req.query.trainee_id == null && req.query.session_segment_id != null){
                traineeCompletedTaskInfo = await getRepository(TraineeCompletedTask).find({
                    where: {
                        session_segment_id : req.query.session_segment_id,
                        redo : 0
                    }
                });
            }else{
              res.status(400).json(error('please enter valid trainee_id and session_segment_id', res.statusCode));
              return;
            }
    
            res.status(200).json(success('data fetched successfully',  traineeCompletedTaskInfo , res.statusCode));
        } catch (err) {
            res.status(400).json(error(err.message, res.statusCode));
        }
    }

    public async evaluateSubmittedTask(req: Request, res: IResponse): Promise<void> {
        try {
            const traineeActivityInfo = await getRepository(TraineeCompletedTask).findOne({
                where: {
                    trainee_id : req.body.trainee_id,
                    session_segment_id : req.body.session_segment_id
                }
            });

            if(traineeActivityInfo){

                        traineeActivityInfo.evaluated_by = req.user as number;
                        // traineeActivityInfo.evaluated_by = 286;
                        traineeActivityInfo.grade = req.body.grade;
                        traineeActivityInfo.feedback = req.body.feedback;
                        traineeActivityInfo.isEvaluated = true;

                        // console.log('Updating traineeActivityInfo now')
                        await getRepository(TraineeCompletedTask).save(traineeActivityInfo);
            } else {
                console.log('error occured')
                // throw an exception that traineeActivityInfo not found
            }


            res.status(200).json(success('activity evaluation successfull', traineeActivityInfo, res.statusCode));
        } catch (err) {
            res.status(400).json(error( err.message, res.statusCode));
        }
    }

    public async sendReminderToTrainee(req: Request, res: IResponse): Promise<void> {
        try {

            const traineeInfo = await getRepository(Trainee).findOne({
                where: {
                    id : req.body.trainee_id
                }
            });
            // console.log('traineeInfo', traineeInfo)
            // TODO : pick only pre or post work activity

            const activityInfo = await getRepository(SessionSegment).findOne({
                where: {
                    id : req.body.session_segment_id
                }
            });
            // console.log('activityInfo', activityInfo)

            const mailContent = `dear trainee ${traineeInfo.trainee_name}, your ${activityInfo.type} work activity with title:${activityInfo.title} is pending for submission, please submit ASAP`

            await sendEmail(traineeInfo.trainee_email,mailContent)


            res.status(200).json(success('reminder mail sent successfully',mailContent , res.statusCode));
        } catch (err) {
            res.status(400).json(error( err.message, res.statusCode));
        }
    }

    public async askToRedo(req: Request, res: IResponse): Promise<void> {
        try {

                const traineeCompletedTaskInfo = await getRepository(TraineeCompletedTask).findOne({
                    where: {
                        trainee_id : req.body.trainee_id,
                        session_segment_id : req.body.session_segment_id
                    }
                });

                if(traineeCompletedTaskInfo){

                    traineeCompletedTaskInfo.redo = true;

                    await getRepository(TraineeCompletedTask).save(traineeCompletedTaskInfo);
                }


            res.status(200).json(success('trainee asked to redo task',traineeCompletedTaskInfo , res.statusCode));
        } catch (err) {
            res.status(400).json(error( err.message, res.statusCode));
        }
    }

    async generateLink(req: Omit<Request, 'body'> & { body: SessionLinkVO }, res: IResponse): Promise<void>{
        try {
            const linkType = req.body.type
            //let randomLink = genLink(15);

            if(linkType === "common") {
                const baseUrl = 'https://vtt.atwpl.com/trainee/live-session';
                const sessionData = req.body.sessionId;
                const registrationData = req.body.registration;
                const domainData = req.body.domain;
                const emailData = " ";

                // To encode the sessionId
                const encodeSessionData = Buffer.from(sessionData).toString('base64');
                const encodeTypeData = Buffer.from(linkType).toString('base64');
                const encodeDomainData = Buffer.from(domainData).toString('base64');
                const encodeEmail = Buffer.from(emailData).toString('base64');

                var modifiedLink = baseUrl+'?email='+encodeEmail+'&sessionId='+encodeSessionData+'&type='+encodeTypeData+'&registration='+registrationData+'&domain='+encodeDomainData;

                const commonLink = new SessionLink();
                commonLink.sessionId = req.body.sessionId;
                commonLink.sessionLink = modifiedLink;
                commonLink.type = linkType;
                commonLink.isActive = true;

                console.log("commonLink :", commonLink)

                await getRepository(SessionLink).save(commonLink);
            } else if (linkType === "unique") {
                const baseUrl = 'https://vtt.atwpl.com/trainee/live-session';
                const emailData = req.body.email;
                const sessionData = req.body.sessionId;
                const registrationData = req.body.registration;
                const domainData = req.body.domain;

                //To encode the email and sessionId
                const encodeEmail = Buffer.from(emailData).toString('base64');
                const encodeSessionData = Buffer.from(sessionData).toString('base64');
                const encodeTypeData = Buffer.from(linkType).toString('base64');
                const encodeDomainData = Buffer.from(domainData).toString('base64');

                var modifiedLink = baseUrl+'?email='+encodeEmail+'&sessionId='+encodeSessionData+'&type='+encodeTypeData+'&registration='+registrationData+'&domain='+encodeDomainData;

                const uniqueLink = new SessionLink();
                uniqueLink.sessionId = req.body.sessionId;
                uniqueLink.sessionLink = modifiedLink;
                uniqueLink.type = linkType;
                uniqueLink.isActive = true;

                console.log("uniqueLink :", uniqueLink)

                await getRepository(SessionLink).save(uniqueLink);
            }

            res.status(200).json(success('', {modifiedLink}, res.statusCode));
        } catch (err) {
            res.status(400).json(success(err.message, {}, res.statusCode));
        }
        res.end();
    }

    async openExportModal(req: IUserRequest,  res: IResponse): Promise<void>{
        try {
            // let payload = {title: 'This is test push notification', desc: 'This seems to be working'};
            // await PushNotifyService.addNotification(JSON.stringify(payload));
            // res.status(200).json(success('', {}, res.statusCode));
            // res.end();
        } catch (err) {
            res.status(400).json(success(err.message, {}, res.statusCode));
        }
        res.end();
    }

    async getPollStatus(req: Omit<Request, 'body'> & { body: PollStatusVO }, res: IResponse): Promise<void>{
        try {
            const pollStatus = await getRepository(SegmentActivity).find({
                where: {
                    activity_name: req.body.activity_name
                }
            })
            
        res.status(200).json(success('', pollStatus, res.statusCode));
        } catch (err) {
            res.status(400).json(success(err.message, {}, res.statusCode));
        }
        res.end();
    }

}


const trainersController = TrainersController.get();

export { trainersController as TrainersController }

