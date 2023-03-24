import { SessionProgress } from './../models/session_progress.model';
import { SeatingStyle } from '@models/seating-style.model';
import { Request } from 'express';
import { IResponse } from '@interfaces';
import { getRepository, Brackets, getManager, Any } from 'typeorm';
import {  success } from '@utils/common.util';
import { ActivityTypes } from '@models/activity_types.model';
import { InputDetailsVO } from '../types/uiVOs/details-inputVO';
import { Segments } from '@models/segments.model';
import Sessions from '@models/sessions.model';
import { ProgramBatch } from '@models/program-batch.model';
import { Participants } from '@models/participants.model';
import { SegmentListVO } from '../types/uiVOs/segment-listVO';
import { SEGMENT_TYPE_ENUMS } from '@enums';
import SessionMapping from "@models/session-mapping.model";
import { SESSION_TYPE_ENUMS } from "@enums/session-type.enum";
import { SlotCalculatorService } from "@services/slot-calculator.service";
import { TrainerSlot } from "@models/trainer-slot.model";
import { ParticipantInputVO } from "../types/uiVOs/session/participant-inputVO";
import { SessionSegment } from "@models/session_segment.model";
import { SessionVideo } from '@models/session-video.model';
import { SessionReactionVO } from "../types/uiVOs/session-reactionVO";
import { Session_Reactions } from '@models/session-reactions.model';
import * as dayjs from 'dayjs';
let duration = require('dayjs/plugin/duration');
import { array, boolean, number, object } from 'joi';
import { chat_messages } from '@models/chat-msgs.model';
import { Trainee } from '@models/trainee.model';
import { chatDetailsVO } from '../types/uiVOs/chat-msgVO';
import { CHAT_TYPE_ENUM } from "../types/enums/chat-type.enum";
import { json } from 'body-parser';
import { log } from 'console';
import  { sendEmail}  from '../utils/common.util';
import { Library } from '@models/libary.model';
import { Trainersqueries } from '@models/trainer_queries.model';
import { SegmentActivity } from '@models/segment_activity.model';
import { SESSION_PLAN_STATUS } from '../types/enums/session-plan-status.enum';
import { Dayjs } from 'dayjs';
import { Notification } from '../models/Notification.model';
import  { addPendingTask}  from '../utils/common.util';
// import  {sendNotification}  from '../utils/common.util';
import { RaisedHand } from '../models/raised_hand.model';
import  {addNotification, findActivitySubmissionDate}  from '../utils/common.util';
import { TraineeCompletedTask } from '../models/trainee_completed_tasks.model';
import { Programs } from '@models/programs.model';
import { Subscription_Features } from '@models/subscription.features.model';
import { SubscriptionPlans } from '@models/subscriptionplans.model'
import { User } from '@models/user.model'

class SessionController {

    /**
     * @description
     */
    private static instance: SessionController;
    private slotCalculatorService: SlotCalculatorService;

    private constructor(slotCalculatorService: SlotCalculatorService) {
        this.slotCalculatorService = slotCalculatorService;
    }

    /**
     * @description
     */
    static get(): SessionController {
        if (!SessionController.instance) {
            SessionController.instance = new SessionController(new SlotCalculatorService());
        }
        return SessionController.instance;
    }

    // create segment

    public async checkMappingStatus(): Promise<void> {
        try{
            const sessMapRepo= getRepository(SessionMapping)
            var date = new Date();
            var currenttime = date.getHours()+":"+date.getMinutes();
            console.log("currenttime ",  currenttime)
            const mappingRepo = await sessMapRepo.createQueryBuilder('mapping')
            .getMany();
            mappingRepo.forEach(async element => {
                if(currenttime > element.session_end_time  && element.status === "Scheduled" ){
                    element = await sessMapRepo.save({ ...element, status: SESSION_TYPE_ENUMS.COMPLETED });
                    console.log(element);
                }
            });
        }catch(error){
            console.log('error', error);
        }

    }

    public async saveSegmentDetails(req: Omit<Request, 'body'> & { body: Segments }, res: IResponse): Promise<void> {
        const segmentRepo = getRepository(Segments);
        const sessionId = req.body.session;
        const inputSegment = req.body;

        const session = await getRepository(Sessions).createQueryBuilder('sessions')
            .where('id = :sessionId', { sessionId })
            .getOne()
        if (session) {
            inputSegment.activityType = await getRepository(ActivityTypes).findOne({ where: { name: req.body.type } });
            const segment: Segments = await segmentRepo.save(inputSegment);
            res.status(200).json(success('', { segment }, res.statusCode));
            res.end()
        } else {

            res.status(400).json(success(`No session found with ID ${sessionId}`, {}, res.statusCode));
            res.end()
        }

    }

    public async getSegmentDetails(req: Omit<Request, 'body'> & { body: InputDetailsVO }, res: IResponse): Promise<void> {
        const segmentRepo = getRepository(Segments);
        const segmentId = req.body.id;
        const segment: Segments = await segmentRepo.findOne({
            where: {
                id: segmentId
            }
        });
        res.status(200).json(success('', { segment }, res.statusCode));
        res.end()
    }

    public async getActivityTypeList(req: Omit<Request, 'body'>, res: IResponse): Promise<void> {
        const activityTypeRepo = getRepository(ActivityTypes);
        const activityTypeList: ActivityTypes[] = await activityTypeRepo.find();
        res.status(200).json(success('', { activityTypeList }, res.statusCode));
        res.end()
    }

    public async getParticipantListByBatchId(req: Omit<Request, 'body'> & { body: InputDetailsVO }, res: IResponse): Promise<void> {
        const batchRepo = getRepository(ProgramBatch);
        const batch: ProgramBatch = await batchRepo
            .createQueryBuilder('batch')
            .where('id = :batchId', { batchId: req.body.id })
            .getOne();
        if (batch) {
            const participantList = await getRepository(Participants)
                .createQueryBuilder('participant')
                .where('participant.batchId = :batchId', { batchId: batch.id })
                .getMany()
            res.status(200).json(success('', { participantList }, res.statusCode));
        } else {
            res.status(400).json(success('', {}, res.statusCode));
        }
        res.end()
    }

    public async updateSession(req: Omit<Request, 'body'> & { body: InputDetailsVO }, res: IResponse): Promise<void> {
        const sessionRepo = getRepository(Sessions);
        const session = await sessionRepo
            .createQueryBuilder()
            .where('id = :sessionId', { sessionId: req.body.id })
            .getOne();
        await sessionRepo
            .createQueryBuilder('batch')
            .update(Sessions)
            .set({ ...session, session_name: req.body.name })
            .where('id = :batchId', { batchId: req.body.id })
            .execute()
        res.status(200).json(success('', {}, res.statusCode));
        res.end()
    }


    // segment_list_by_session
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
            .andWhere('segment.is_deleted = 0')
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
        //Session Mapping
        const _batches = await sessionmappingRepo.createQueryBuilder('mapping')
            .where('mapping.sessionId = :sessionId', { sessionId: req.body.id })
            .leftJoinAndSelect('mapping.trainer', 'trainer')
            .getMany();
        let Seating = {};
        let seatingStyle;
        let batches = []
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

    public async cancelSession(req: Omit<Request, 'body'> & { body: InputDetailsVO }, res: IResponse): Promise<void> {
        const sessMapRepo = getRepository(SessionMapping);
        const sessMapId = req.body.id;
        const sessMapType = req.body.type;

        let sessionMap;
        let trainee;
        let traineeid;
        if(sessMapType==='single'){
            sessionMap = await sessMapRepo
            .createQueryBuilder('sessionMap')
            .where('sessionMap.id = :sessMapId', { sessMapId: sessMapId })
            .leftJoinAndSelect('sessionMap.trainer', 'trainer')
            .leftJoinAndSelect('sessionMap.session', 'session')
            .getOne();
        await SessionController.instance.removeSessionFromTrainer(sessionMap);
        
        sessionMap = await sessMapRepo.save({ ...sessionMap, status: SESSION_TYPE_ENUMS.Cancelled });

         // TRIGGER point 12 -> cancel session notification and email

        let participantData = await getRepository(Participants)
                .createQueryBuilder('participants')
                .where(`participants.batchId = '${sessionMap.batchId}'`)
                .getMany();

        // console.log('participantData', participantData)

        for (let k = 0; k < participantData.length; k++) {
            const partItem = participantData[k];


                // to participants that session has been cancelled -- point 12
                let notificationContent = JSON.stringify({
                    type:"session_cancelled"
                  })
            
                await addNotification(partItem.id,7,notificationContent); //TODO : recheck 

                let mailContent = `dear participant your session with name ${sessionMap.session.session_name}, which was scheduled on ${sessionMap.session_start_date}, between ${sessionMap.session_start_time} to ${sessionMap.session_end_time} has been cancelled.`

                await sendEmail(partItem.email, mailContent);

        }


        //  trainee = await sessMapRepo.createQueryBuilder('trainee')
        // .where('trainee.id =:id',{id:sessMapId})
        //     .leftJoinAndSelect('trainee.session', 'session')
        //     .leftJoinAndSelect('session.sessionid', 'sessionid')
        //     .leftJoinAndSelect('sessionid.raised_by', 'raised_by')
        // .getOne();
        // if(trainee && trainee.session && trainee.session.sessionid){
        //     traineeid = trainee.session.sessionid.map(v=>v.raised_by)
        // }
        // if(traineeid.length >0){
        //     for (let i = 0; i < traineeid.length; i++) {
        //         const ele = traineeid[i];
        //         let notificationContent = JSON.stringify({
        //             type:"session_cancelled",
        //             sessionId : sessionMap.sessionId
        //           })
            
        //         await addNotification(ele.id,6,notificationContent);
            
        //         let emailContent = `welcome ${ele.trainee_name}, your session has been cancelled.`

        //         await sendEmail(ele.trainee_email, emailContent);

        //     }
        // }

        }
        else{
            // in case of else sessMapId is --> sessionId

            sessionMap = await sessMapRepo.createQueryBuilder('sessionMap')
            .where('sessionMap.sessionId = :sessMapId', { sessMapId: sessMapId })
            .leftJoinAndSelect('sessionMap.trainer', 'trainer')
            .leftJoinAndSelect('sessionMap.session', 'session')
            .getMany();
        
        sessionMap.forEach(async element => {
            await SessionController.instance.removeSessionFromTrainer(element);
            element = await sessMapRepo.save({ ...element, status: SESSION_TYPE_ENUMS.Cancelled });
        });

        // TRIGGER point 12 -> cancel session notification and email
        for (let i = 0; i < sessionMap.length; i++) {
            const sessionMapItem = sessionMap[i];
            console.log('sessionMapItem.batchId', sessionMapItem.batchId)
            let participantData = await getRepository(Participants)
                .createQueryBuilder('participants')
                .where('participants.batchId = :id', { id: sessionMapItem.batchId })
                .getMany();

            for (let k = 0; k < participantData.length; k++) {
                const partItem = participantData[k];


                    // to participants that session has been cancelled -- point 12
                    let notificationContent = JSON.stringify({
                        type:"session_cancelled"
                      })
                
                    await addNotification(partItem.id,7,notificationContent); 
                      
                    let mailContent = `dear participant your session with name ${sessionMapItem.session.session_name}, which was scheduled on ${sessionMapItem.session_start_date}, between ${sessionMapItem.session_start_time} to ${sessionMapItem.session_end_time} has been cancelled.`

                    await sendEmail(partItem.email, mailContent);

            }

        }

        trainee = await getRepository(Trainersqueries).createQueryBuilder('query')
        .where('query.session = :session', { session: sessMapId })
        .leftJoinAndSelect('query.raised_by', 'raised_by')
        .getMany();
        // console.log(trainee);

        if (trainee) {
            traineeid = trainee.map(v => v.raised_by)
        }
        if(traineeid.length >0){
            for (let i = 0; i < traineeid.length; i++) {
                if(traineeid[i] != null){
                    const ele = traineeid[i];
                    let notificationContent = JSON.stringify({
                        type:"session_cancelled",
                        sessionId : sessionMap.sessionId
                    })
                    await addNotification(ele.id,6,notificationContent);
                    
                    
                        let emailContent = `welcome ${ele.trainee_name}, your session has been cancelled.`

                        await sendEmail(ele.trainee_email, emailContent);
                }
                }
            }
        }

        res.status(200).json(success('', { sessionMap }, res.statusCode));
        res.end();
    }

    async removeSessionFromTrainer(sessionMap: SessionMapping) {
        const trainerId = sessionMap.trainer.id;
        const eventDate = sessionMap.session_start_date;
        const toRemoveSlotList = this.slotCalculatorService.getSlotListAsArrayByInterval(sessionMap.session_start_time, sessionMap.session_end_time,
            this.slotCalculatorService.getSlotMap());
        const trainerSlot: TrainerSlot = await getRepository(TrainerSlot).createQueryBuilder('trainerSlot')
            .where('trainerSlot.trainerId = :trainerId', { trainerId: trainerId })
            .andWhere('trainerSlot.date = :eventDate', { eventDate: eventDate })
            .getOne();
        console.log(trainerSlot.bookedSlots)
        if (trainerSlot) {
            const savedSlot = trainerSlot.bookedSlots.split(',');
            toRemoveSlotList.forEach(slot => {
                savedSlot.forEach(item => {
                    if (item == slot) {
                        console.log('Removing slot', item, 'trainer ID')
                        savedSlot.splice(savedSlot.indexOf(item))
                    }
                });
            });
            trainerSlot.bookedSlots = this.slotCalculatorService.convertSlotListToCommaString(savedSlot)
            await getRepository(TrainerSlot).save(trainerSlot);
        }
    }

    async removeParticipants(req: Omit<Request, 'body'> & { body: ParticipantInputVO }, res: IResponse): Promise<void> {
        // TODO Earlier this API was implemented using the soft-delete approach. Later we decide to use hard delete
        const inputVO = req.body;
        const status = await getRepository(Participants).createQueryBuilder('participants')
            .delete()
            .from(Participants)
            .whereInIds(inputVO.ids)
            .execute();
        if (status.affected > 0) {
            res.status(200).json(success('Participants deleted', {}, res.statusCode));
        } else {
            res.status(200).json(success('Failed to delete Participants', {}, res.statusCode));
        }
        res.end();
    }

    async SessionDetails(req: Omit<Request, 'body'> & { body: InputDetailsVO }, res: IResponse): Promise<void> {
        const sessionId = req.body.id;
        try {
            const details = await getRepository(Sessions).createQueryBuilder('session')
                .where('session.id = :id', { id: sessionId })
                .select('session.session_name')
                .leftJoinAndSelect('session.program', 'program')
                .leftJoinAndSelect('session.sessionMappings', 'session_mappings')
                .leftJoinAndSelect('session_mappings.participantsList', 'participantsList')
                .leftJoinAndSelect('program.programBatch', 'batch')
                .leftJoinAndSelect('session_mappings.trainer', 'trainer')
                .leftJoinAndSelect('batch.participants', 'participants')
                .getOne();

            let sessionDetails = {
                session_name: details.session_name,
                session_mappings: [],
                program: details.program
            }

            for (let i = 0; i < details.sessionMappings.length; i++) {
                sessionDetails.session_mappings.push({
                    ...details.sessionMappings[i],
                    engagemnt_score: 0,
                    reactions: 0,
                    average_rating: 0,
                    badges_collected: 0,
                    no_of_participants: details.sessionMappings[i].participantsList.length
                });
            }

            res.status(200).json(success('', { sessionDetails }, res.statusCode));
        } catch (err) {
            res.status(400).json(success(err.message, {}, res.statusCode));
        }
        res.end();
    }

    async startRecording(req: Omit<Request, 'body'> & { body: InputDetailsVO }, res: IResponse): Promise<void> {

        const sessMapRepo = getRepository(SessionMapping);
        const sessMapId = req.body.id;
        const sessionMap = await sessMapRepo.findOne(sessMapId);

        if (!sessionMap) {
            res.status(400).json(success('Invalid session mapping', {}, res.statusCode));
            res.end();
        }
        let sessionVideo: SessionVideo = new SessionVideo({
            // sessionMap,
            name: sessionMap.id
        });
        const segmentactivityRepo = getRepository(SessionVideo);

        const id = await segmentactivityRepo.findOne({ name: sessMapId })

        if (!id) {
            const _SessionVideo: SessionVideo = await segmentactivityRepo.save(sessionVideo);
        }

        res.status(200).json(success('', { sessionMap, sessionVideo }, res.statusCode));
        res.end();


    }

    public async createSessionReactions(req: Omit<Request, 'body'> & { body: SessionReactionVO }, res: IResponse): Promise<void> {
        try {
            let responseData;
            let inputData = req.body;

            let user_reaction : SessionReactionVO = JSON.parse(inputData.user_reaction_data);

            let todaysDate = dayjs().format("YYYY-MM-DD HH:mm:ss");

            let reactionData = new Session_Reactions();

            reactionData.session_map_id = inputData.session_map_id;
            reactionData.reaction_type = user_reaction.reaction_type
            reactionData.reacted_by = user_reaction.reacted_by;
            reactionData.reacted_by_type = user_reaction.reacted_by_type;
            reactionData.reaction_time = todaysDate;

            await getRepository(Session_Reactions).insert(reactionData);
            responseData = reactionData;

            res.status(200).json(success('', { responseData }, res.statusCode));
        } catch (err) {
            res.status(400).json(success(err.message, {}, res.statusCode));
        }
    }

    public async getSessionReactions(req: Request, res: IResponse): Promise<void> {
        try {

            let reactionData = await getRepository(Session_Reactions)
                .createQueryBuilder('sessionReaction')
                .where('sessionReaction.reaction_type != "null"')
                .getMany();


            let reactionsObject = {
                "clap":0,
                "thumbsUp":0,
                "highFive":0,
                "heart":0,
                "hundred":0,
                "smiley":0
            }

            for (let i = 0; i < reactionData.length; i++) {
                const ele = reactionData[i];
                if (ele.reaction_type == "clap") reactionsObject.clap++;
                else if (ele.reaction_type == "thumbs_up") reactionsObject.thumbsUp++;
                else if (ele.reaction_type == "high_five") reactionsObject.highFive++;
                else if (ele.reaction_type == "heart") reactionsObject.heart++;
                else if (ele.reaction_type == "100") reactionsObject.hundred++;
                else if (ele.reaction_type == "smiley") reactionsObject.smiley++;

            }


            res.status(200).json(success('', { reactionsObject }, res.statusCode));
        } catch (err) {
            res.status(400).json(success(err.message, {}, res.statusCode));
        }
    }

    public async createChat(req: Omit<Request, 'body'> & { body: chatDetailsVO }, res: IResponse): Promise<void> {
        try {

            // const query = "select @@character_set_client";

            // await getManager().query("set names 'utf8mb4' collate 'utf8mb4_bin' ");

            // let result = await getManager().query('select @@character_set_client');


            let responseData = {
                "chats_saved" : false
            }
            let userInput = req.body;

            let todaysDate = dayjs().format("YYYY-MM-DD HH:mm:ss");

            let user_message : chatDetailsVO  = JSON.parse(userInput.user_message_data);

            // let user_message : user_message_data = userInput.user_message_data

            const newChat = new chat_messages();


                newChat.type = userInput.type;
                newChat.room_id = userInput.room_id;
                newChat.session_map_id = userInput.session_map_id;
                newChat.message_by_id = userInput.message_by_id;
                newChat.message_to_id = userInput.message_to_id;
                newChat.message_by_type = user_message.message_by_type;
                newChat.message_by = user_message.message_by;
                newChat.message_type = user_message.message_type;
                newChat.message_to = user_message.message_to;
                newChat.message = user_message.message;
                // newChat.message = userInput.message;
                newChat.created_at = todaysDate;
                newChat.user_message_data = JSON.stringify(user_message);

                await getRepository(chat_messages).insert(newChat);
                responseData.chats_saved = true;


            res.status(200).json(success('', responseData, res.statusCode));
        } catch (err) {
            res.status(400).json(success(err.message, {}, res.statusCode));
        }
    }

    public async readChat(req: Request, res: IResponse): Promise<void> {
        try {
            const userId = req.body.room_id;

            const chatData = await getRepository(chat_messages).createQueryBuilder('chatData')
                .where('room_id = :id', { id: userId })
                .getMany();

            res.status(200).json(success('', chatData, res.statusCode));
        } catch (err) {
            res.status(400).json(success(err.message, {}, res.statusCode));
        }
        res.end();

    }


    public async getChatUserTrainer(req: Request, res: IResponse): Promise<void> {
        try {
          const x = await getManager().query(
            "SET SESSION sql_mode=(SELECT REPLACE(@@sql_mode,'ONLY_FULL_GROUP_BY',''))"
          );

          let trainee_info = [];
          let last_chat_info = [];

          const room_ids = await getRepository(chat_messages)
            .createQueryBuilder("chat_messages")
            .select("chat_messages.room_id")
            .where("chat_messages.room_id like :room_id", {
              room_id: `_trainer_%`,
            })
            .andWhere("chat_messages.session_map_id =:id", {
              id: req.body.session_map_id,
            })
            .groupBy("chat_messages.room_id")
            .getMany();

          if (room_ids.length>0) {
            for (let i = 0; i < room_ids.length; i++) {
              const ele = room_ids[i];
              let trainee_ids = ele.room_id.split("_");
              trainee_ids = trainee_ids.slice(2, trainee_ids.length - 1);

              let last_chat_data = await getRepository(chat_messages)
                .createQueryBuilder("chat_messages")
                .orderBy("chat_messages.id","DESC")
                .where('chat_messages.room_id = :id', { id: ele.room_id })
                .limit(1)
                .getMany();

                last_chat_info.push(last_chat_data[0]);

              let temp_info = await getRepository(Trainee)
                .createQueryBuilder("trainee")
                .select("trainee.id")
                .addSelect("trainee.trainee_name")
                .addSelect("trainee.trainee_email")
                .addSelect("trainee.isActive")
                .addSelect("trainee.created_at")
                .where(`trainee.id IN (${trainee_ids.join(",")})`)
                .getMany();

              trainee_info.push({
                room_id: ele.room_id,
                users: temp_info,
              });
            }
          }

          for (let i = 0; i < last_chat_info.length; i++) {
            let ele = last_chat_info[i];
            for (let j = 0; j < trainee_info.length; j++) {
                let ele2 = trainee_info[j];
                if(ele2.room_id === ele.room_id){
                    ele2.lastMessage = ele;
                }

            }


        }

          res.status(200).json(success("", trainee_info, res.statusCode));
        } catch (err) {
          res.status(400).json(success(err.message, {}, res.statusCode));
        }
        res.end();

    }


    public async getChatUserTraineeOld(req: Request, res: IResponse): Promise<void> {
        try {

            const x = await getManager().query(
                "SET SESSION sql_mode=(SELECT REPLACE(@@sql_mode,'ONLY_FULL_GROUP_BY',''))"
            );

            let trainee_data;
            let trainee_info;

            const room_id_data = await getRepository(chat_messages)
              .createQueryBuilder("chat_messages")
              .select("chat_messages.room_id")
              .where("chat_messages.room_id like :room_id", { room_id: `%${req.user}%` })
              .andWhere("chat_messages.room_id not like 'trainer_%' ")
              .andWhere('chat_messages.session_map_id =:id', { id: req.body.session_map_id })
              .groupBy('chat_messages.room_id')
              .getMany();

            if(room_id_data.length){
                let trainee_ids_set = new Set();

            for (let i = 0; i < room_id_data.length; i++) {
                const ele = room_id_data[i];
                trainee_ids_set.add(ele.room_id.split('_')[0])
                trainee_ids_set.add(ele.room_id.split('_')[1])
            }

            let trainee_ids = Array.from(trainee_ids_set);

            trainee_data = await getRepository(Trainee)
                .createQueryBuilder("trainee")
                .where(`trainee.id IN (${trainee_ids.join(',')})`)
                .getMany();

            trainee_info = trainee_data.filter((item) => item.id !== req.user);

            for (let i = 0; i < trainee_info.length; i++) {
              const ele = trainee_info[i] as any;
              delete ele.trainee_password;
              delete ele.temporaryPassword;
              delete ele.otp;
              delete ele.social_media_id;
              delete ele.social_media_type;
              if (ele.id < req.user) {
                ele.room_id = `${ele.id}_${req.user}`;
              } else {
                ele.room_id = `${req.user}_${ele.id}`;
              }
            }
            }else{
                trainee_info = [];
            }

            res.status(200).json(success('', trainee_info, res.statusCode));
        } catch (err) {
            res.status(400).json(success(err.message, {}, res.statusCode));
        }
        res.end();

    }


    public async getChatUserTrainee(req: Request, res: IResponse): Promise<void> {
        try {
            const x = await getManager().query(
              "SET SESSION sql_mode=(SELECT REPLACE(@@sql_mode,'ONLY_FULL_GROUP_BY',''))"
            );

            let trainee_info = [];
            let last_chat_info = [];

            const room_ids = await getRepository(chat_messages)
              .createQueryBuilder("chat_messages")
              .select("chat_messages.room_id")
              .where("chat_messages.room_id like :room_id", { room_id: `%_${req.user}_%` })
              .andWhere('chat_messages.session_map_id =:id', { id: req.body.session_map_id })
              .groupBy("chat_messages.room_id")
              .getMany();



            if (room_ids.length>0) {
                let flag = false;
              for (let i = 0; i < room_ids.length; i++) {
                const ele = room_ids[i];
                let trainee_ids = ele.room_id.split("_");

                let last_chat_data = await getRepository(chat_messages)
                .createQueryBuilder("chat_messages")
                .orderBy("chat_messages.id","DESC")
                .where('chat_messages.room_id = :id', { id: ele.room_id })
                .limit(1)
                .getMany();

                // console.log(597,last_chat_data);
                last_chat_info.push(last_chat_data[0]);


                // _trainer_200_300_
                if(trainee_ids.includes("trainer")){
                    flag = true;
                    trainee_ids = trainee_ids.slice(2, trainee_ids.length - 1);
                }else{
                    trainee_ids = trainee_ids.slice(1, trainee_ids.length - 1);

                }
                trainee_ids = trainee_ids.filter(trainee_id => trainee_id != req.user)

                // console.log(610,trainee_ids);

                if(trainee_ids.length == 0){
                    trainee_info.push({
                        room_id: ele.room_id,
                        users: [{trainee_name:"Trainer"}]
                      });
                }else{
                    let temp_info = await getRepository(Trainee)
                  .createQueryBuilder("trainee")
                  .select("trainee.id")
                  .addSelect("trainee.trainee_name")
                  .addSelect("trainee.trainee_email")
                  .addSelect("trainee.isActive")
                  .addSelect("trainee.created_at")
                  .where(`trainee.id IN (${trainee_ids.join(",")})`)
                  .getMany();

                  if(ele.room_id.includes("trainer") && flag){
                    flag = false;
                    temp_info.push({trainee_name:"Trainer"} as unknown as Trainee);
                  }

                trainee_info.push({
                  room_id: ele.room_id,
                  users: temp_info,
                });
                }


              }

            }
            // console.log(642,last_chat_info);

            for (let i = 0; i < last_chat_info.length; i++) {
                let ele = last_chat_info[i];
                for (let j = 0; j < trainee_info.length; j++) {
                    let ele2 = trainee_info[j];
                    if(ele2.room_id === ele.room_id){
                        ele2.lastMessage = ele;
                    }

                }


            }
            // console.log(656,trainee_info);


            res.status(200).json(success("", trainee_info, res.statusCode));
          } catch (err) {
            res.status(400).json(success(err.message, {}, res.statusCode));
          }
          res.end();

    }



    public async getSessionProgress(req: Omit<Request, 'body'> & { body: chatDetailsVO }, res: IResponse): Promise<void> {
        try {

            const Sessionprogress = await getRepository(SessionProgress).createQueryBuilder('Progress')
                .where('Progress.sessionMapId = :sessionMapId', { sessionMapId: req.body.id })
                .leftJoinAndSelect('Progress.sessionMap','mapping')
                .orderBy("Progress.id", "DESC")
                .getOne();

            res.status(200).json(success('', Sessionprogress, res.statusCode));
        } catch (err) {
            res.status(400).json(success(err.message, {}, res.statusCode));
        }
        res.end();
    }


    public async getLibraryBySub(req: Omit<Request, 'body'> & { body: chatDetailsVO }, res: IResponse): Promise<void> {
        try {

            const LibraryData = await getRepository(Library).createQueryBuilder('library')
                .where('library.subscribe_id = :subscribe_id', { subscribe_id: req.user })
                .getMany();

            res.status(200).json(success('', LibraryData, res.statusCode));
        } catch (err) {
            res.status(400).json(success(err.message, {}, res.statusCode));
        }
        res.end();
    }


    public async addLibrary(req: Request, res: IResponse): Promise<void> {
        try {

            const libraryrepo = getRepository(Library);
            if (!req.body.id) {
                const LibraryData: Library = new Library({
                    content_name: req.body.content_name,
                    tags: req.body.tags,
                    type:req.body.type,
                    subscribe_id:req.user
                });
                const library: Library = await libraryrepo.save(LibraryData);
                const library_data = await getRepository(Library).createQueryBuilder('Progress')
                        .where('Progress.id =:id',{id:library.id})
                        .getOne()
                res.status(200).json(success('new record save sucessfully', { library_data }, res.statusCode));
                res.end();
            }else{
                const id = await getRepository(Library).findOne({ id: req.body.id })
                if (id) {

                    await getRepository(Library).createQueryBuilder()
                        .update(Library)
                        .set({
                            content_name: req.body.content_name,
                            type:req.body.type,
                            tags: req.body.tags
                        })
                        .where({ id: req.body.id })
                        .execute();
                        const data = await getRepository(Library).createQueryBuilder('Progress')
                        .where('Progress.id =:id',{id:req.body.id})
                        .getOne()
                    res.status(200).json(success('Data updated successfully', data , res.statusCode));
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


    public async saveSessionRaisedHand(req: Request, res: IResponse): Promise<void> {
        try {
            const raisedHand = getRepository(RaisedHand);
            if (!req.body.id) {
                const sessionProgress: RaisedHand = new RaisedHand({
                    content: req.body.content,
                    session_map: req.body.session_map_id,
                    trainee: req.body.trainee_id
                });
                let _raisedHand: RaisedHand = await raisedHand.save(sessionProgress);

                res.status(200).json(success('new record save sucessfully', {} , res.statusCode));
                res.end();
            } else {
                const id = await getRepository(RaisedHand).findOne({ id: req.body.id })
                if (id) {
                    await getRepository(RaisedHand).createQueryBuilder()
                        .update(RaisedHand)
                        .set({
                            content: req.body.content,
                            session_map: req.body.session_map_id,
                            trainee: req.body.trainee_id
                        })
                        .where({ id: req.body.id })
                        .execute();
                    res.status(200).json(success('Data updated successfully', {}, res.statusCode));
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


    public async getSessionRaisedHand(req:Request, res:IResponse): Promise<void>{
        try{
            const Raisedhend = await getRepository(RaisedHand).createQueryBuilder('raised')
             .select('raised.id')
             .addSelect('raised.content')
            .leftJoin('raised.trainee','trainee')
            .addSelect('trainee.trainee_email')
            .orderBy("raised.id", "DESC")
            .where('raised.session_map =:session_map',{session_map:req.body.session_map_id})
            .getMany();

            res.status(200).json(success('' , Raisedhend , res.statusCode));
            res.end();
        }catch(err){
            res.status(400).json(success(err.message, {}, res.statusCode));

        }
    }


    public async addSessionProgress(req: Request, res: IResponse): Promise<void> {
        try {

            const segmentactivityRepo = getRepository(SessionProgress);
            if (!req.body.id) {
                const sessionProgress: SessionProgress = new SessionProgress({
                    Session_Mode: req.body.Session_Mode,
                    Activity: req.body.Activity,
                    Activity_Data: req.body.Activity_Data,
                    sessionMap:req.body.sessionMap
                });
                const _sessionprogress: SessionProgress = await segmentactivityRepo.save(sessionProgress);
                const Sessionprogress = await getRepository(SessionProgress).createQueryBuilder('Progress')
                        .where('Progress.id =:id',{id:_sessionprogress.id})
                        .getOne()
                res.status(200).json(success('new record save sucessfully', { Sessionprogress }, res.statusCode));
                res.end();
            }else{
                const id = await getRepository(SessionProgress).findOne({ id: req.body.id })
                if (id) {

                    await getRepository(SessionProgress).createQueryBuilder()
                        .update(SessionProgress)
                        .set({
                            Session_Mode: req.body.Session_Mode,
                            Activity: req.body.Activity,
                            Activity_Data: req.body.Activity_Data,
                            sessionMap:req.body.sessionMap
                        })
                        .where({ id: req.body.id })
                        .execute();
                        const data = await getRepository(SessionProgress).createQueryBuilder('Progress')
                        .where('Progress.id =:id',{id:req.body.id})
                        .getOne()
                    res.status(200).json(success('Data updated successfully', data , res.statusCode));
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

    public async testingforcopySegment(importId:any,sessionId:any): Promise<void> {
        try{
            console.log("SESSION",importId,sessionId);

            const sessionSegmentrepo = getRepository(SessionSegment)
            const segmentActivityRepo = getRepository(SegmentActivity)

            const Sessionsegment = await sessionSegmentrepo.createQueryBuilder('Segment')
            .where('Segment.session =:session',{session:importId})
            .leftJoinAndSelect('Segment.segmentActivities','segmentActivities')
            .getMany();

            let newsessionSegment = [];
            let newsegmentActivity = [];
            if(Sessionsegment.length != 0){
                for(let i=0; i<Sessionsegment.length; i++){
                    const activity = await segmentActivityRepo.createQueryBuilder('activity')
                    .where('activity.sessionSegment =:sessionSegment',{sessionSegment:Sessionsegment[i].id})
                    .getMany();

                    const sessionsegment: SessionSegment = new SessionSegment({
                        title:Sessionsegment[i].title,
                        description:Sessionsegment[i].description,
                        duration:Sessionsegment[i].duration,
                        start_time:Sessionsegment[i].start_time,
                        end_time:Sessionsegment[i].end_time,
                        type:Sessionsegment[i].type,
                        session_plan_status:SESSION_PLAN_STATUS.PENDING,
                        session:sessionId[i],
                        media_attachment_ids:Sessionsegment[i].media_attachment_ids,
                        media_attachment:Sessionsegment[i].media_attachment,
                        is_deleted:Sessionsegment[i].is_deleted,
                        activity_type:Sessionsegment[i].activity_type,
                        activity_data:Sessionsegment[i].activity_data,

                    });

                    var _sessionsegment: SessionSegment = await sessionSegmentrepo.save(sessionsegment);
                    newsessionSegment.push(_sessionsegment)
                        for(let t=0; t<activity.length; t++){
                            const segmentactivity : SegmentActivity = new SegmentActivity({
                                sessionSegment:_sessionsegment.id,
                                activityType:activity[t].activityType,
                                activity_id:activity[t].activity_id,
                                activity_name:activity[t].activity_name,
                                activity_data:activity[t].activity_data,
                                activity_submission_date:activity[t].activity_submission_date,
                                activate_before_days:activity[t].activate_before_days,
                                media_attachment_ids:activity[t].media_attachment_ids,
                                media_attachment:activity[t].media_attachment,
                                is_deleted:activity[t].is_deleted
                            })
                        var _SegmeentAvtivity: SegmentActivity = await segmentActivityRepo.save(segmentactivity);
                        newsegmentActivity.push(_SegmeentAvtivity)
                    }
                }
            }

        }catch(err){

        }


    }

    public async preWorkCron(req: Request, res: IResponse): Promise<void> {

    try {

        let todaysDate = dayjs().format("YYYY-MM-DD");

            todaysDate = '2022-12-08';

        let allMaps = await getRepository(SessionMapping)
            .createQueryBuilder('sessionMap')
            .where(`sessionMap.session_start_date >= '${todaysDate}'`)
            // .where(`sessionMap.session_start_date > '2022-12-01'`)
            .leftJoinAndSelect("sessionMap.trainer", "trainer")
            .getMany();

        // console.log('allMaps', allMaps)
        let activityData:any ;
        let participantData:any ;


        for (let i = 0; i < allMaps.length; i++) {

            const allMapItem : any = allMaps[i];

            let ssnDate = allMapItem.session_start_date
            // console.log('ssnDate', ssnDate)
            let date1 = dayjs(ssnDate);
            let date2 = dayjs(todaysDate);
            let gap = date1.diff(date2,'day',true);


            let twoDaysBeforeSession = date1.subtract(2, 'day').toDate().toISOString();

            // console.log('date1', date1)

            // console.log('twoDaysBeforeSession', twoDaysBeforeSession)

            twoDaysBeforeSession = dayjs(twoDaysBeforeSession).format("YYYY-MM-DD");

            console.log('twoDaysBeforeSession', twoDaysBeforeSession)


            activityData = await getRepository(SessionSegment)
                .createQueryBuilder('sessSegment')
                .where(`sessSegment.sessionId = '${allMapItem.sessionId}'`)
                .andWhere("sessSegment.type = 'Pre'")
                .getMany();

            allMapItem.activities  = activityData;


            participantData = await getRepository(Participants)
                .createQueryBuilder('participants')
                .where(`participants.batchId = '${allMapItem.batchId}'`)
                .getMany();

            allMapItem.participants = participantData;


            // trigger point 11, reminder to participants before session
            if(todaysDate == twoDaysBeforeSession){
                // console.log(996);

                for (let k = 0; k < participantData.length; k++) {
                    const partItem = participantData[k];
                    // console.log('partItem', partItem)
                    let traineeInfo = await getRepository(Trainee)
                        .findOne({
                            where: {
                                trainee_email : partItem.email
                            }
                        })
                    // console.log('participantId', participantId)

                    if(traineeInfo !== undefined){
                        // trigger point 11, reminder to participants before session
                        let notificationContent = JSON.stringify({
                            type:"upcoming_session_in_two_days , point 11",
                        })
                    
                        await addNotification(traineeInfo.id,6,notificationContent); 
                        // console.log(1159,'addNotification',traineeInfo.id,2,1159);
                        

                        let mailContent = `dear participant please you have a session in 2 days, be ready.`

                        // await sendEmail(partItem.email, mailContent);
                        console.log(1165,'session in 2 days TP-11',partItem.email,1165);


                    }

                }

            }


            let n;

            for (let j = 0; j < activityData.length; j++) {
                const activityItem = activityData[j];
                let activity_data = JSON.parse(activityItem.activity_data)

                // console.log(1177,'activity_data', activity_data,1177)

                if(activity_data.share_work === 1 && dayjs().isSame(activityItem.created_at, 'day')){
                    console.log(1207,dayjs().isSame(activityItem.created_at, 'day'),1207);
                    // send notification today for PRE work
                    //

                    // point 18 --> to participant when pre work is launched by trainer and lands in pending tasks

                    for (let k = 0; k < participantData.length; k++) {
                        const partItem = participantData[k];
                        // console.log('partItem', partItem)

                        let traineeInfo = await getRepository(Trainee)
                            .findOne({
                                where: {
                                    trainee_email : partItem.email
                                }
                            })

                        // console.log('traineeInfo', traineeInfo)



                        if(traineeInfo !== undefined){
                            // Check if notification is already sent
                            // Check if there is already an entry against this participant (pertain_to) and taskId(task_id) if true then skip the next block.
                            // console.log('traineeInfo.id', traineeInfo.id)
                              let isPresent = await getRepository(Notification)
                            .findOne({
                                    where: {
                                        pertain_to : traineeInfo.id,
                                        task_id : activityItem.id
                                    }
                                })
                                console.log('isPresent', isPresent)
                            if(isPresent === undefined){ 
                                // to send notification of pending task 
                                let notificationContent = JSON.stringify({ 
                                    type:"pending_task_pre_work" 
                                }) 
                            
                                await addNotification(traineeInfo.id,6,notificationContent,activityItem.id);
                                await addPendingTask(traineeInfo.id,6,notificationContent,18);
                                console.log(1257);

                            }

                        }else{
                            //trigger point 16 --> to participant to ask to register
                            let content = `dear participant ${traineeInfo.trainee_name} please register for trainee profile to get started with the program.`
                            await sendEmail(partItem.email, content);
                        }

                    }

                    // point 17 , notification to trainer , when pre or post work is autosent on a specific date
                    // console.log('allMapItem.trainer.id', allMapItem.trainer.id)
                    // 17 -> against subscriber id , to trainer

                    let notificationContent = JSON.stringify({
                        type:"to_trainer_task_auto_sent"
                    })
                
                    await addNotification(allMapItem.trainer.subscriber_id,4,notificationContent, activityItem.id);
                    console.log(1280);

                }else if(activity_data.share_work === 2){
                    // n = 7;
                }else if(activity_data.share_work === 3){
                    // n = activity_data.share_work_in_days;
                }

                let participantId;

                // in if block point (17, 18)

                if(gap===n){
                    // point 18 --> to participant when pre work is launched by trainer and lands in pending tasks

                    for (let k = 0; k < participantData.length; k++) {
                        const partItem = participantData[k];
                        // console.log('partItem', partItem)

                        let traineeInfo = await getRepository(Trainee)
                            .findOne({
                                where: {
                                    trainee_email : partItem.email
                                }
                            })

                        // console.log('traineeInfo', traineeInfo)



                        if(traineeInfo !== undefined){
                            // Check if notification is already sent
                            // Check if there is already an entry against this participant (pertain_to) and taskId(task_id) if true then skip the next block.
                            // console.log('traineeInfo.id', traineeInfo.id)
                              let isPresent = await getRepository(Notification)
                            .findOne({
                                    where: {
                                        pertain_to : traineeInfo.id,
                                        task_id : activityItem.id
                                    }
                                })
                                console.log('isPresent', isPresent)
                            if(isPresent === undefined){ 
                                // to send notification of pending task 
                                let notificationContent = JSON.stringify({ 
                                    type:"pending_task_pre_work" 
                                }) 
                            
                                await addNotification(traineeInfo.id,6,notificationContent,activityItem.id);
                                await addPendingTask(traineeInfo.id,6,notificationContent,18);
                                console.log(1257);

                            }

                        }else{
                            //trigger point 16 --> to participant to ask to register
                            let content = `dear participant ${traineeInfo.trainee_name} please register for trainee profile to get started with the program.`
                            await sendEmail(partItem.email, content);
                        }



                    }

                    // point 17 , notification to trainer , when pre or post work is autosent on a specific date
                    // console.log('allMapItem.trainer.id', allMapItem.trainer.id)
                    // 17 -> against subscriber id , to trainer

                    let notificationContent = JSON.stringify({
                        type:"to_trainer_task_auto_sent"
                    })
                
                    await addNotification(allMapItem.trainer.subscriber_id,4,notificationContent, activityItem.id);
                    console.log(1280);

                }

               // trigger point 22 --> to participant when his/her pre work is nearing due date
                    // Send reminder to those users who hasn't completed there tasks yet.

                    if(gap === activity_data.activity_submission_date + 2 ){
                        for (let k = 0; k < participantData.length; k++) {
                            const partItem = participantData[k];
                            // console.log('partItem', partItem)
                            let traineeInfo = await getRepository(Trainee)
                                .findOne({
                                    where: {
                                        trainee_email : partItem.email
                                    }
                                })
                            // console.log('traineeInfo', traineeInfo)

                            if(traineeInfo !== undefined){
                                // Check if notification is already sent
                                // Check if there is already an entry against this participant (pertain_to) and taskId(task_id) and task_status === 1, if true then skip the next block.

                                let  isSubmitted = await getRepository(TraineeCompletedTask)
                                    .findOne({
                                            where: {
                                                trainee_id : traineeInfo.id,
                                                session_segment_id : activityItem.id,
                                                status : 1
                                            }
                                        })

                                if(isSubmitted === undefined){
                                    // to send notification of pending task
                                    let notificationContent = JSON.stringify({
                                        type:"pending_pre_work_nearing_due_date"
                                    })
                                
                                    await addNotification(traineeInfo.id,6,notificationContent,activityItem.id);

                                    await addPendingTask(traineeInfo.id,6,notificationContent,22);

                                }

                            }



                        }
                    }


            }

        }

            res.status(200).json(success('', allMaps, res.statusCode));
        } catch (err) {
            console.log(err);

            res.status(400).json(success(err.message, {}, res.statusCode));
        }
        res.end();


    }


    public async postWorkCron(req: Request, res: IResponse): Promise<void> {

        try {

            let todaysDate = dayjs().format("YYYY-MM-DD");

                todaysDate = '2022-12-22';

            let allMaps = await getRepository(SessionMapping)
                .createQueryBuilder('sessionMap')
                .where('sessionMap.id = 585')
                // .where(`sessionMap.session_start_date <= '${todaysDate}'`)
                // .where(`sessionMap.session_start_date > '2022-12-01'`)
                .leftJoinAndSelect("sessionMap.trainer", "trainer")
                .getMany();

            // console.log('allMaps', allMaps)
            let activityData:any ;
            let participantData:any ;


            for (let i = 0; i < allMaps.length; i++) {

                const allMapItem : any = allMaps[i];

                let ssnDate = allMapItem.session_start_date
                // console.log('ssnDate', ssnDate)
                let date1 = dayjs(ssnDate);
                let date2 = dayjs(todaysDate);
                let gap = date2.diff(date1,'day',true);

                // console.log('date1', date1)

                activityData = await getRepository(SessionSegment)
                    .createQueryBuilder('sessSegment')
                    .where(`sessSegment.sessionId = '${allMapItem.sessionId}'`)
                    .andWhere("sessSegment.type = 'Post'")
                    .getMany();

                allMapItem.activities  = activityData;


                participantData = await getRepository(Participants)
                    .createQueryBuilder('participants')
                    .where(`participants.batchId = '${allMapItem.batchId}'`)
                    .getMany();

                allMapItem.participants = participantData;


                let n;

                for (let j = 0; j < activityData.length; j++) {
                    const activityItem = activityData[j];
                    let activity_data = JSON.parse(activityItem.activity_data)

                    // console.log(1177,'activity_data', activity_data,1177)
                    if(activity_data.share_work === 1 && dayjs(todaysDate).isSame(allMapItem.session_start_date, 'day')){
                        // console.log(1469,dayjs(todaysDate).isSame(allMapItem.session_start_date, 'day'),1469);

                        // send notification today for PRE work
                        //

                        // point 18 --> to participant when pre work is launched by trainer and lands in pending tasks

                        for (let k = 0; k < participantData.length; k++) {
                            const partItem = participantData[k];
                            // console.log('partItem', partItem)

                            let traineeInfo = await getRepository(Trainee)
                                .findOne({
                                    where: {
                                        trainee_email : partItem.email
                                    }
                                })

                            // console.log('traineeInfo', traineeInfo)



                            if(traineeInfo !== undefined){
                                // Check if notification is already sent
                                // Check if there is already an entry against this participant (pertain_to) and taskId(task_id) if true then skip the next block.
                                // console.log('traineeInfo.id', traineeInfo.id)
                                  let isPresent = await getRepository(Notification)
                                .findOne({
                                        where: {
                                            pertain_to : traineeInfo.id,
                                            task_id : activityItem.id
                                        }
                                    })
                                    console.log('isPresent', isPresent)
                                if(isPresent === undefined){ 
                                    // to send notification of pending task 
                                    let notificationContent = JSON.stringify({ 
                                        type:"pending_task_post_work" 
                                    }) 
                                
                                    await addNotification(traineeInfo.id,6,notificationContent,activityItem.id);
                                    await addPendingTask(traineeInfo.id,6,notificationContent,18);
                                    console.log(1510);

                                }

                            }

                        }

                        // point 17 , notification to trainer , when pre or post work is autosent on a specific date
                        // console.log('allMapItem.trainer.id', allMapItem.trainer.id)
                        // 17 -> against subscriber id , to trainer

                        let notificationContent = JSON.stringify({
                            type:"to_trainer_task_auto_sent"
                        })
                    
                        await addNotification(allMapItem.trainer.subscriber_id,4,notificationContent, activityItem.id);
                        console.log(1527);

                    }else if(activity_data.share_work === 2){
                        n = 7;
                    }else if(activity_data.share_work === 3){
                        n = activity_data.share_work_in_days;
                    }

                    let participantId;

                    // in if block point (17, 18)

                    if(gap===n){
                        // point 18 --> to participant when pre work is launched by trainer and lands in pending tasks

                        for (let k = 0; k < participantData.length; k++) {
                            const partItem = participantData[k];
                            // console.log('partItem', partItem)

                            let traineeInfo = await getRepository(Trainee)
                                .findOne({
                                    where: {
                                        trainee_email : partItem.email
                                    }
                                })

                            // console.log('traineeInfo', traineeInfo)



                            if(traineeInfo !== undefined){
                                // Check if notification is already sent
                                // Check if there is already an entry against this participant (pertain_to) and taskId(task_id) if true then skip the next block.
                                // console.log('traineeInfo.id', traineeInfo.id)
                                  let isPresent = await getRepository(Notification)
                                .findOne({
                                        where: {
                                            pertain_to : traineeInfo.id,
                                            task_id : activityItem.id
                                        }
                                    })
                                    console.log('isPresent', isPresent)
                                if(isPresent === undefined){ 
                                    // to send notification of pending task 
                                    let notificationContent = JSON.stringify({ 
                                        type:"pending_task_post_work" 
                                    }) 
                                
                                    await addNotification(traineeInfo.id,6,notificationContent,activityItem.id);
                                    await addPendingTask(traineeInfo.id,6,notificationContent,18);
                                    console.log(1577);

                                }

                            }



                        }

                        // point 17 , notification to trainer , when pre or post work is autosent on a specific date
                        // console.log('allMapItem.trainer.id', allMapItem.trainer.id)
                        // 17 -> against subscriber id , to trainer

                        let notificationContent = JSON.stringify({
                            type:"to_trainer_task_auto_sent"
                        })
                    
                        await addNotification(allMapItem.trainer.subscriber_id,4,notificationContent, activityItem.id);
                        console.log(1280);

                    }

                   // trigger point 22 --> to participant when his/her post work is nearing due date
                        // Send reminder to those users who hasn't completed there tasks yet.

                        if(gap === activity_data.activity_submission_date - 2 ){
                            for (let k = 0; k < participantData.length; k++) {
                                const partItem = participantData[k];
                                // console.log('partItem', partItem)
                                let traineeInfo = await getRepository(Trainee)
                                    .findOne({
                                        where: {
                                            trainee_email : partItem.email
                                        }
                                    })
                                // console.log('traineeInfo', traineeInfo)

                                if(traineeInfo !== undefined){
                                    // Check if notification is already sent
                                    // Check if there is already an entry against this participant (pertain_to) and taskId(task_id) and task_status === 1, if true then skip the next block.

                                    let  isSubmitted = await getRepository(TraineeCompletedTask)
                                        .findOne({
                                                where: {
                                                    trainee_id : traineeInfo.id,
                                                    session_segment_id : activityItem.id,
                                                    status : 1
                                                }
                                            })

                                    if(isSubmitted === undefined){
                                        // to send notification of pending task
                                        let notificationContent = JSON.stringify({
                                            type:"pending_post_work_nearing_due_date"
                                        })
                                    
                                        await addNotification(traineeInfo.id,6,notificationContent,activityItem.id);
    
                                        await addPendingTask(traineeInfo.id,6,notificationContent,22);
    
                                    }

                                }

                            }
                        }


                }

            }

                res.status(200).json(success('', allMaps, res.statusCode));
            } catch (err) {
               console.log(err);

               res.status(400).json(success(err.message, {}, res.statusCode));
           }
           res.end();


    }


    public async runCron(req: Request, res: IResponse): Promise<void> {

        try {
            let sessionMap = await getRepository(SessionMapping).createQueryBuilder('sessionMap')
            .where('sessionMap.sessionId = :sessMapId', { sessMapId: 311 })
            .leftJoinAndSelect('sessionMap.trainer', 'trainer')
            .leftJoinAndSelect('sessionMap.session', 'session')
            .getMany();

            let participantData = await getRepository(Participants)
                .createQueryBuilder('participants')
                .where('participants.batchId = :id', { id: 279 })
                .getMany();

                // participantData = await getRepository(Participants)
                //     .createQueryBuilder('participants')
                //     // .where(`participants.batchId = '${'279'}'`)
                //     // .leftJoinAndSelect("participants.batch","")
                //     .getMany();

            // participantData = await getRepository(Participants).find({
            //     where : ({
            //         batchId
            //     })
            // })
            // let participantData = await getRepository(Participants)
            //     .createQueryBuilder('participant')
            //     // .where("participant.id = '474'")
            //     .where('participant.id = :id', { id: 474 })
            //     .getOne();

            // console.log('participantData', participantData)

            
            
            res.status(200).json(success('',{participantData,sessionMap}, res.statusCode));
        }catch(err) {
           // console.log(err);
            res.status(400).json(success(err.message, {}, res.statusCode));
        }
        res.end();


    }

}

const sessionController = SessionController.get();

export { sessionController as SessionController }

