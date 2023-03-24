/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/prefer-for-of */
/* eslint-disable eqeqeq */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { User } from './../models/user.model';
import { LOGS } from '@config/environment.config';
/* eslint-disable @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/member-ordering */
import { Request, Response } from 'express';
import {
  createQueryBuilder,
  DeepPartial,
  getCustomRepository,
  getManager,
  getRepository,
  Index,
} from 'typeorm';
import { Clients } from '@models/clients.model';
import { Trainers } from '@models/trainers.model';
import { Programs } from '@models/programs.model';
import { Safe } from '@decorators/safe.decorator';
import { error, success } from '@utils/common.util';
import { IResponse } from '@interfaces';
import * as Dayjs from 'dayjs';
import { isEmptyOrBlank } from '@utils/string.util';
import { ErrorConstants } from '../../common/ErrorConstants';
import { ProgramDetailsVO } from '../types/uiVOs/program-detailsVO';
import { ProgramMeta } from '@models/program-meta.model';
import { ProgramFee } from '@models/program-fee.model';
import { ProgramParticipantsDetails } from '../types/uiVOs/createParticipantsDetailsVO';
import { AudienceType } from '@models/audiece-type.model';
import { SpecialInvitee } from '@models/special-invitee.model';
import { SupportTeam } from '@models/support-team.model';
import { SeatingStyleVO } from '../types/uiVOs/seating-styleVO';
import { DateRange } from '../types/uiVOs/programme-detailsVO-types';
import { ClientProgramListVO } from '../types/uiVOs/client-program-listVO';
import { ProgrammeDetailsVO } from '../types/uiVOs/programme-detailsVO';
import { Logger } from '@services/logger.service';
import { ProgramRepository } from '@repositories/program.repository';
import { SessionRepository } from '@repositories/session.repository';
import { ProgrammeFeeRepository } from '@repositories/programme-fee.repository';
import { ProgramMetaRepository } from '@repositories/program-meta.repository';
import { SeatingStyleRepository } from '@repositories/seating-style.repository';
import { SessionAvailabilityVO } from '../types/uiVOs/program/session-detailsVO';
import { SessionMappingVO } from '../types/uiVOs/session-mappingVO';
import { SessionController } from '@controllers/session.controller';
import  {addPendingTask , sendEmail,addNotification, programWiseFeedbackRating, sessionWiseFeedbackRating}  from '@utils/common.util';
import { Trainee } from '@models/trainee.model';
import { SessionProgress } from './../models/session_progress.model';
import { SeatingStyle } from '@models/seating-style.model';
import {  Brackets, Any } from 'typeorm';
import { ActivityTypes } from '@models/activity_types.model';
import { InputDetailsVO } from '../types/uiVOs/details-inputVO';
import { Segments } from '@models/segments.model';
import Sessions from '@models/sessions.model';
import { ProgramBatch } from '@models/program-batch.model';
import { Participants } from '@models/participants.model';
import { SegmentListVO } from '../types/uiVOs/segment-listVO';
import { PENDING_TASKTYPE, SEGMENT_TYPE_ENUMS } from '@enums';
import SessionMapping from '@models/session-mapping.model';
import { SESSION_TYPE_ENUMS } from '@enums/session-type.enum';
import { SlotCalculatorService } from '@services/slot-calculator.service';
import { TrainerSlot } from '@models/trainer-slot.model';
import * as Jwt from 'jwt-simple';
import { Session_Reactions } from '../models/session-reactions.model';
import { SessionSegment } from '../models/session_segment.model';
import { TraineeCompletedTask } from '@models/trainee_completed_tasks.model';
import { Notification } from '@models/Notification.model';
import { Ratings } from '@models/ratings.model';
import {VTTRequestVO} from '../types/uiVOs/VTTRequestVO';
/**
 * Manage incoming requests from api/{version}/.
 * End points of this router resolve response by itself.
 */
class ProgramController {
  /**
   * @description
   */
  private static instance: ProgramController;
  private slotCalculatorService: SlotCalculatorService;

  private constructor(slotCalculatorServer: SlotCalculatorService) {
    this.slotCalculatorService = slotCalculatorServer;
    // const logger = ;
  }

  /**
   * @description
   */
  static get(): ProgramController {
    if (!ProgramController.instance) {
      ProgramController.instance = new ProgramController(
        new SlotCalculatorService()
      );
    }
    return ProgramController.instance;
  }

  /**
   * @description Creates and save new client
   *
   * @param req Express request object derived from http.incomingMessage
   * @param res Express response object
   */
  // async createClient(
  //   req: Omit<Request, "body"> & { body: Clients },
  //   res: IResponse
  // ): Promise<void> {
  //   const repository = getRepository(Clients);
  //   const clientVO = req.body;
  //   clientVO.subscriber_id = req.user as number;
  //   clientVO.createdAt = Dayjs(new Date()).format("YYYY-MM-DD HH:ss");
  //   clientVO.updatedAt = Dayjs(new Date()).format("YYYY-MM-DD HH:ss");
  //   console.log(' clientVO.updatedAt',  clientVO.updatedAt)
  //   const response = await repository.save(clientVO);
  //   if(clientVO.address === null || clientVO.address.length === 0){

  //     let notificationContent = JSON.stringify({
  //       type:"pending onboaring of client"
  //     })

  //   await addNotification(response.id,4,notificationContent);

  //   await addPendingTask(response.id,4,notificationContent,7);

  //   }

  //   res
  //     .status(200)
  //     .json(success("Record inserted successfully", response, res.statusCode));
  // }

    async createClient(
    req: Omit<VTTRequestVO, 'body'> & { body: Clients },
    res: IResponse
  ): Promise<void> {
    try{
      const userId :number = req.user
      const repository = getRepository(Clients);
      const clientVO = req.body;

      let clientInfo = await getRepository(Clients)
        .createQueryBuilder('client')
        .where("client.contact_person_email = :email",{email:clientVO.contact_person_email})
        .getOne();
      
      if(clientInfo && clientInfo != undefined){
        res.status(200).json(success(`client with mail id '${clientInfo.contact_person_email} already exists'`, clientInfo, res.statusCode));
        res.end();
        return;
      }

      clientVO.subscriber_id = req.user ;
      clientVO.createdAt = Dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss');
      clientVO.updatedAt = Dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss');
      if(!clientVO.additional_info){
        clientVO.additional_info = '{}';
      }
      
      const response = await repository.save(clientVO);
      if(clientVO.address === null || clientVO.address.length === 0){

        const PendingTaskContent = JSON.stringify({
          taskType: PENDING_TASKTYPE.PENDING_CLIENT_ONBOARD,
          taskTitle:'Onboarding Client',
          task:'Pending Onboarding of a client',
          batch:'-',
          programme:'-',
          session:'-'
        })
        const NotificationContent = JSON.stringify({
          type: PENDING_TASKTYPE.PENDING_CLIENT_ONBOARD,
        })
        await addNotification(response.id,4,NotificationContent);
        await addPendingTask(userId,4,PendingTaskContent,8);
      }

      res.status(200).json(success('Record inserted successfully', {clientInfo,response}, res.statusCode));
    }catch(err){
      res.status(400).json(error(err, res.statusCode));
    }
  }

  /**
   * @description Get Client List api
   *
   * @param req Express request object derived from http.incomingMessage
   * @param res Express response object
   *
   * For record create. we will use this..
   * {
            "name": "Client Name v1",
            "email": "test.rai@ahom.tech13",
            "address": "Test address v1",
            "phone" : "875021111",
            "subscriber_id":1
        }
   */

  async clientList(req: Request, res: Response): Promise<void> {
    const clientRepository = getRepository(Clients);
    const clientProgramList: ClientProgramListVO[] = [];
    const dashBoardSummary = [
      {
        basedOnProgram: [
          // {name: '', score: 0, }, {name: '', score: 0}, {name: '', score: 0}
        ],
      },
      {
        basedOnEngagement: [
          { name: "", score: 0 },
          { name: "", score: 0 },
          { name: "", score: 0 },
        ],
      },
      {
        basedOnFeedback: [
          // {name: '', score: 0, }, {name: '', score: 0}, {name: '', score: 0}
        ],
      },
    ];
    const clientList: Clients[] = await clientRepository
      .createQueryBuilder("client")
      .where({ subscriber_id: req.user as number })
      .andWhere("client.isDeleted = :status", { status: false })
      .leftJoinAndSelect("client.related_industry", "industry")
      .leftJoinAndSelect("client.state", "state")
      .leftJoinAndSelect("client.country", "country")
      // .orderBy("client.id","DESC")
      // .limit(3)
      .getMany();
    // TODO Akash: Figure out an optimized approach for this problem.
    for (const client of clientList) {
      const clientProgram = {} as ClientProgramListVO;
      clientProgram.client = client;
      const programsList: Programs[] = await getRepository(Programs)
        .createQueryBuilder("program")
        .where("program.clientId = :clientId", { clientId: client.id })
        .leftJoinAndSelect("program.sessionList", "sessionList")
        .getMany();
      clientProgram.programmeListDetails = {
        participantCount: 0,
        programmeCount: 0,
        sessionCount: 0,
      };
      if (programsList && programsList.length > 0) {
        clientProgram.programmeListDetails.programmeCount = programsList.length;
        programsList.forEach((program) => {
          clientProgram.programmeListDetails.sessionCount += program.sessionList.length;
          clientProgram.programmeListDetails.participantCount += program.total_participants;
        });
      }
      clientProgramList.push(clientProgram);
    }
    // logic to get clients based on maximum number of programs

    if (clientProgramList.length > 0) {
      let tempClientProgramList = clientProgramList;
      for (let i = 0; i < 3; i++) {
        let maxClient;
        maxClient = tempClientProgramList[0];
        for (let j = 0; j < tempClientProgramList.length; j++) {
          const clientInfo = tempClientProgramList[j];
          if (clientInfo.programmeListDetails.programmeCount > maxClient.programmeListDetails.programmeCount) {
            maxClient = clientInfo;
          } else if (clientInfo.programmeListDetails.programmeCount == maxClient.programmeListDetails.programmeCount) {
            const date1 = Dayjs(clientInfo.client.createdAt);
            const date2 = Dayjs(maxClient.client.createdAt);
            const gap = date1.diff(date2, "day", false);
            if (gap > 0) {
              maxClient = clientInfo;
            }
          }
        }

        const clientData = {
          name: maxClient?.client != null ? maxClient.client.name : "",
          score: maxClient?.programmeListDetails != null ? maxClient.programmeListDetails.programmeCount : 0,
        };
        dashBoardSummary[0].basedOnProgram.push(clientData);
        tempClientProgramList = tempClientProgramList.filter((item) => item.client.id != maxClient.client.id);
      }
    }

    // logic for top 3 clients based on feedback
    // get program list against subscriber

    const programList: any = await getRepository(Programs)
      .createQueryBuilder("program")
      .where("program.subscriber_id = :id", { id: req.user })
      .leftJoinAndSelect("program.client", "client")
      .getMany();

    let tempProgramList = await programWiseFeedbackRating(programList);

    if (tempProgramList.length > 0) {
      for (let i = 0; i < 3; i++) {
        let maxAvgRating;
        maxAvgRating = tempProgramList[0];
        for (let j = 0; j < tempProgramList.length; j++) {
          const programInfo = tempProgramList[j];
          if (programInfo.average_program_rating > maxAvgRating.average_program_rating) {
            maxAvgRating = programInfo;
          }

          const clientData = {
            name: maxAvgRating?.client != null ? maxAvgRating.client?.name : "",
            score: maxAvgRating?.average_program_rating ? `${maxAvgRating.average_program_rating}/5` : 0,
          };
          dashBoardSummary[2].basedOnFeedback.push(clientData);
          tempProgramList = tempProgramList.filter((item) => item.id != maxAvgRating.id);
        }
      }
    }

    res.status(200).json(success("", { clientProgramList, dashBoardSummary }, res.statusCode));
  }

  /**
   * @description Update one document according to :clientId
   *
   * @param req Express request object derived from http.incomingMessage
   * @param res Express response object
   *
   * @public
   */
  // eslint-disable-next-line @typescript-eslint/member-ordering
  // TODO Akash: Fix the edge case when request is missing the body.
  @Safe()
  async clientUpdate(
    req: Omit<Request, 'body'> & { body: Clients },
    res: Response
  ): Promise<void> {
    try {
      const repository = getRepository(Clients);
      req.body.subscriber_id = req.user as number;
      const clientId: string = req.body.id.toString()

      if (isEmptyOrBlank(clientId)) {
        // TODO throw an error that id can not be blank
        console.log('Not Found ClientId In The URL')
      }
      req.body.updatedAt = Dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss');
      console.log(req.body)
    const response = await repository
      .createQueryBuilder()
      .update(Clients)
      .set(req.body)
      .where('id = :id', { id: clientId })
      .execute();
    if (response.affected > 0) {
      // Get the updated data & return
      const client = await repository.findOneOrFail(clientId);
      res
        .status(200)
        .json(
          success(ErrorConstants.clientUpdateSuccess, client, res.statusCode)
        );
    } else {
      // throw error that client with that ID was not found.
      res
        .status(ErrorConstants.badRequestHttpCode)
        .json(
          error(`Client with ID ${clientId} was not found`, res.statusCode)
        );
    }
    console.log(response, 'this is update result');
    } catch (error) {
      console.log('error :', error)
    }
  }

  /**
   * @description Creates and save new Trainer
   *
   * @param req Express request object derived from http.incomingMessage
   * @param res Express response object
   */
  @Safe()
  async createTrainer(
    req: Omit<Request, 'body'> & { body: Trainers },
    res: IResponse
  ): Promise<void> {
    const repository = getRepository(Trainers);
    req.body.subscriber_id = req.user as number;
    req.body.createdAt = Dayjs(new Date()).format('YYYY-MM-DD HH:ss');
    req.body.updatedAt = Dayjs(new Date()).format('YYYY-MM-DD HH:ss');

    const response = await repository.save(req.body);
    res.status(200).json(success('', response, res.statusCode));
  }

  /**
   * @description Get Trainer List api
   *
   * @param req Express request object derived from http.incomingMessage
   * @param res Express response object
   *
   * For record create. we will use this..
   * {
            "name": "Trainer Name v1",
            "email": "test.rai@ahom.tech13",
            "address": "Test address v1",
            "phone" : "875021111",
            "subscriber_id":1
        }
   */

  async trainerList(req: Request, res: Response): Promise<void> {
    const repository = getRepository(Trainers);
    req.body.subscriber_id = req.user as number;

    const response = await repository
      .createQueryBuilder('trainers')
      .where('trainers.subscriber_id = :subscriber_id', {
        subscriber_id: req.user as number,
      })
      .getMany();
    res.status(200).json(success('', response, res.statusCode));
  }

  /**
   * @description Update one document according to :trainerId
   *
   * @param req Express request object derived from http.incomingMessage
   * @param res Express response object
   *
   * @public
   */
  @Safe()
  async trainerUpdate(
    req: Omit<Request, 'body'> & { body: Trainers },
    res: Response
  ): Promise<void> {
    const repository = getRepository(Trainers);
    req.body.subscriber_id = req.user as number;

    req.body.updatedAt = Dayjs(new Date()).format('YYYY-MM-DD HH:ss');
    const trainerId: string = req.query.trainerId.toString();

    const response = await repository
      .createQueryBuilder()
      .update(Trainers)
      .set(req.body)
      .where('id = :id', { id: trainerId })
      .execute();
    res.status(200).json(success('', response, res.statusCode));
  }

  /**
   * @description Creates and save new user
   *
   * @param req Express request object derived from http.incomingMessage
   * @param res Express response object
   */
  // @Transaction()
  async createProgram(
    req: Omit<Request, 'body'> & { body: Programs },
    res: IResponse
  ): Promise<void> {
    const programRepo = getRepository(Programs);
    const batchRepo = getRepository(ProgramBatch);
    const program: Programs = req.body;
    program.subscriber_id = req.user as number;
    const now = Dayjs(new Date()).format('YYYY-MM-DD HH:ss');
    program.createdAt = program.updatedAt = now;
    program.subscriber_id = req.user as number;
    program.sessionList.forEach((session) => {
      session.subscriber_id = req.user as number;
    });
    // TODO Akash: Make sure to add check for validating the clientId received here from the UI.
    const savedProgram = await programRepo.save(program); // .then(res => response ).catch(err => {});
    let batch = new ProgramBatch({ program, batch_name: 'Batch 1' });
    batch = await batchRepo.save(batch);
    const sessionMappingList: SessionMapping[] = [];
    let trainerSlotList = [];
    for (const session of program.sessionList) {
      // At this point sessions have already been saved in the DB
      session.program = savedProgram;
      console.log(session.sessionMappings);
      session.sessionMappings.forEach((mapping) => {
        mapping.batch = batch;
        sessionMappingList.push(mapping);
      });
      trainerSlotList =
        await ProgramController.instance.getAndSaveTrainerSlotBySessionMapping(
          sessionMappingList
        );
      const importedSegmentList: Segments[] = [];


      if (session.imported_session_id !== 0) {
        // call new temp wala call kara va na he
        // console.log("PROGRAMM",session.imported_session_id ,savedProgram.sessionList );

        // SessionController.testingforcopySegment(session.imported_session_id,session.sessionid)

      }

      if (trainerSlotList.length > 0) {
        await getRepository(TrainerSlot).save(trainerSlotList);
      }
    }
    if (sessionMappingList.length > 0) {
      await getRepository(SessionMapping).save(sessionMappingList);
    }
    await getRepository(Sessions).save(savedProgram.sessionList);
    for (const session of program.sessionList) {
      if (session.imported_session_id !== 0) {
        // call new temp wala call kara va na he
        console.log('PROGRAMM',session.imported_session_id ,savedProgram.sessionList.map(v=>v.id) );

       await SessionController.testingforcopySegment(session.imported_session_id ,savedProgram.sessionList.map(v=>v.id))

      }
    }

    const content = JSON.stringify({
      type:'pending_onboarding_of_clients'
    })

  await addNotification(req.user as number ,4,content);
    res.status(200).json(
      success(
        '',
        {
          sessionCount: savedProgram.sessionList.length,
          programId: savedProgram.id,
          name: savedProgram.program_name,
        },
        res.statusCode
      )
    );
  }

  async getAndSaveTrainerSlotBySessionMapping(
    sessionMappings: SessionMappingVO[]
  ) {
    const slotMap = this.slotCalculatorService.getSlotMap();
    const trainerSlotList: TrainerSlot[] = [];
    for (let i = 0; i < sessionMappings.length; i++) {
      const mapping = sessionMappings[i];
      let tBookedSlot: TrainerSlot = await getRepository(TrainerSlot)
        .createQueryBuilder('bookedSlot')
        .where('trainerId = :trainerId', { trainerId: mapping.trainer })
        .andWhere({
          date: Dayjs(mapping.session_start_date).format('YYYY-MM-DD HH:ss'),
        })
        .getOne();
      console.log(
        'fetching for the',
        mapping.session_start_date,
        'booked slot',
        tBookedSlot
      );
      if (!tBookedSlot) {
        // console.log('creating new trainer slot trainer id', mapping.trainer);
        const getDatedSlot =
          await ProgramController.instance.checkIfExistInCollection(
            mapping,
            trainerSlotList
          );
        if (getDatedSlot) {
          // If already in collection, assign to existing one
          tBookedSlot = getDatedSlot;
        } else {
          // create another object. If new created push it to array
          tBookedSlot = new TrainerSlot();
          tBookedSlot.persist = true;
          tBookedSlot.trainer = await getRepository(Trainers)
            .createQueryBuilder('trainer')
            .where({ id: mapping.trainer })
            .getOne();
          tBookedSlot.date = mapping.session_start_date;
        }
      }
      // console.log('hi', tBookedSlot);
      // append the slot by fetching from the map
      const slots = this.slotCalculatorService.getSlotListCommaSeparated(
        mapping.session_start_time,
        mapping.session_end_time,
        slotMap
      );
      if (tBookedSlot.bookedSlots && tBookedSlot.bookedSlots.length > 0) {
        // console.log('data found against booked slot, appending now')
        tBookedSlot.bookedSlots += ',' + slots;
      } else {
        // console.log('no data found against booked slot, assigning now')
        tBookedSlot.bookedSlots =
          this.slotCalculatorService.getSlotListCommaSeparated(
            mapping.session_start_time,
            mapping.session_end_time,
            slotMap
          );
      }
      // console.log('getting booked slot list', tBookedSlot.bookedSlots)
      if (tBookedSlot.persist) {
        trainerSlotList.push(tBookedSlot);
      }
    }
    // TODO Make sure that additional slots are added here.
    return trainerSlotList;
  }

  async checkIfExistInCollection(
    mapping: SessionMapping,
    trainerSlotList: TrainerSlot[]
  ) {
    const found: TrainerSlot[] = trainerSlotList.filter((item) => {
      item.trainer == mapping.trainer &&
        item.date == mapping.session_start_date;
    });
    return found[0];
  }

  /**
   * @description Return the program details
   *
   * @param req Express request object derived from http.incomingMessage
   * @param res Express response object
   */
  async getProgramDetails(
    req: Omit<Request, 'body'> & { body: Programs },
    res: IResponse
  ): Promise<void> {
    const repository = getRepository(Programs);
    const programId = req.query.programId as string;
    const response = await repository
      .createQueryBuilder('program')
      .leftJoinAndSelect('program.sessionList', 'sessionList')
      .where({ id: programId })
      .getOne();
    res.status(200).json(success('', response, res.statusCode));
  }

  async createProgramDetailed(
    req: Omit<Request, 'body'> & { body: ProgramDetailsVO },
    res: IResponse,
    next: () => void
  ): Promise<void> {
    switch (req.body.type) {
      case 'cancel_setup':
        await ProgramController.instance.cancelSetup(
          req.body.data,
          req.user as number,
          res
        );
        break;
      case 'save_details':
        await ProgramController.instance.saveProgramDetail(
          req.body.data,
          req.user as number,
          res
        );
        break;
      case 'batch_details':
        await ProgramController.instance.saveBatchDetails(
          req.body,
          req.user as number,
          res
        );
        break;
      case 'participant_details':
        // Note: Format that is used for passing on the UI object to the further methods is different
        // Note how arguments are transferred.
        await ProgramController.instance.saveParticipantDetails(
          req.body as ProgramParticipantsDetails,
          req.user as number,
          res
        );
        break;
      case 'seating_style':
        await ProgramController.instance.saveSeatingStyle(
          req.body,
          req.user as number,
          res
        );
        break;
      case 'live_session_settings':
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        await ProgramController.instance.saveLiveSessionSettings(
          req.body as any,
          req.user as number,
          res
        );
        break;
      case 'programme_setup_completed':
        await ProgramController.instance.programSetupCompleted(
          req.body as any,
          req.user as number,
          res
        );
        break;
      default:
        console.log('no matching type found for the API');
        break;
    }
  }

  async getProgramList(req: Omit<Request, 'body'> & { body: Record<any, any> }, res: IResponse): Promise<void> {
    try {
      const Session = []
      const MapAry = []
      const completed = []
      const ongoing = []
      let newProgram
      const repository = getRepository(Programs);
      const programRepo = await getRepository(Sessions)
      const subscriber_id = req.user as number;
      const response = await repository
        .createQueryBuilder('programs')
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
        .where('programs.subscriber_id = :subscriber_id', { subscriber_id })
        .getMany();
      for (let i = 0; i < response.length; i++) {
        const session = await getRepository(Sessions).createQueryBuilder('session')
          .where('session.program =:program', { program: response[i].id })
          .getMany();
        Session.push(session)
        for (let j = 0; j < session.length; j++) {
          const mapping = await getRepository(SessionMapping).createQueryBuilder('mapping')
            .where('mapping.sessionId =:sessionId', { sessionId: session[j].id })
            .getMany();
          MapAry.push(mapping)

          if (mapping[j] != undefined && mapping[j].status === 'Completed' || mapping[j].status === 'Cancelled'  ) {
            completed.push(session[j])
            const _Session = await programRepo.createQueryBuilder('Session')
              .where('Session.id =:id', { id: session[j].id })
              .leftJoinAndSelect('Session.program', 'program')
              .getOne()
            newProgram = await repository.save({ ..._Session.program, status: SESSION_TYPE_ENUMS.COMPLETED })
            console.log(newProgram);
            console.log('Program update and set Completed');
          } else if (mapping[j] != undefined && mapping[j].status != 'Completed' || mapping[j].status != 'Cancelled') {
            ongoing.push(session[j])
            console.log(session[j]);
            const _Session = await programRepo.createQueryBuilder('Session')
              .where('Session.id =:id', { id: session[j].id })
              .leftJoinAndSelect('Session.program', 'program')
              .getOne()
            newProgram = await repository.save({ ..._Session.program, status: SESSION_TYPE_ENUMS.ONGOING })
            console.log(newProgram);
            console.log('Program update and set Ongoing');
          }
        }
      }
      res.status(200).json(success('', { response }, res.statusCode));
      res.end();
    } catch (error) {
      res.status(400).json(success(error.message, {}, res.statusCode));
    }
  }

  async getBatchList(
    req: Omit<Request, 'body'> & { body: Record<any, any> },
    res: IResponse
  ): Promise<void> {
    const programId = req.body.programId;
    const batchRepo = getRepository(ProgramBatch);
    const batchList = await batchRepo
      .createQueryBuilder()
      .where('programId = :programId', { programId })
      .getMany();

    res.status(200).json(success('', batchList, res.statusCode));
    res.end();
  }

  async getSessionList(
    req: Request,
    res: Response,
    next: () => void
  ): Promise<void> {
    const payload = req.body as DateRange;
    const subscriberId = req.user as number;
    const fromDate = Dayjs(payload.fromDate).format('YYYY-MM-DD'); // new Date(payload.fromDate);
    const toDate = Dayjs(payload.toDate).format('YYYY-MM-DD');
    const repo = getRepository(Sessions);
    const sessionRepo = getRepository(SessionMapping);
    const sessionList: SessionMapping[] = await sessionRepo
      .createQueryBuilder('sessionMapping')
      .leftJoinAndSelect('sessionMapping.session', 'session')
      .leftJoinAndSelect('session.program', 'programs')
      .where('session.subscriber_id = :subscriberId', { subscriberId })
      .andWhere(
        `sessionMapping.session_start_date BETWEEN '${fromDate}' AND '${toDate}'`
      )
      .orderBy('sessionMapping.session_start_time')
      .getMany();

    // const sessionList: Sessions[] = await repo.createQueryBuilder('sessions')
    //     .where('sessions.subscriber_id = :subscriberId', { subscriberId })
    //     .andWhere(`sessionMappings.session_start_date BETWEEN '${fromDate}' AND '${toDate}'`)
    //     .leftJoinAndSelect('sessions.sessionMappings', 'sessionMappings')
    //     .leftJoinAndSelect('sessions.program', 'programs')
    //     .getMany()
    res.json({ statusCode: 200, data: sessionList });
    res.status(200);
    res.end();
  }
// cancelSetup

protected async cancelSetup(
  data: any,
  subscriber_id: number,
  res: IResponse
): Promise<void> {
  const programId = data.id;
  await getRepository(Programs).createQueryBuilder('program')
  .delete()
  .from(Programs)
  .where('id = :id', { id: programId })
  .execute()
  res.status(200).json(success('', { programId }, res.statusCode));
}
  protected async saveProgramDetail(
    data: any,
    subscriber_id: number,
    res: IResponse
  ): Promise<void> {

    try{
      Logger.log('info', 'Inside method saveProgramDetail');
    const programRepo = getCustomRepository(ProgramRepository);
    const programMetaRepo = getRepository(ProgramMeta);
    const programFeeRepo = getCustomRepository(ProgrammeFeeRepository);
    const program: Programs = data;
    if(data?.clientId)
    program.client = await getRepository(Clients).findOne({
      id: data?.clientId,
    });
    program.subscriber_id = subscriber_id;
    const now = Dayjs(new Date()).format('YYYY-MM-DD HH:ss');
    program.createdAt = program.updatedAt = now;
    if (program.sessionList && program.sessionList.length > 0) {
      program.sessionList.forEach((session) => {
        session.subscriber_id = subscriber_id;
      });
    }
    const result: Programs = await programRepo.save(program);
    const savedProgram = await programRepo
      .createQueryBuilder('program')
      .leftJoinAndSelect('program.programFee', 'programFee')
      .where('program.id = :programId', { programId: result.id })
      .getOne();
    let programFee: ProgramFee = data.program_fee as ProgramFee;
    const savedProgramFee: ProgramFee = await programFeeRepo.findOne({
      where: {
        program: savedProgram,
      },
    });
    if (savedProgramFee) {
      console.log('Updating programme fee');
      // update it
      programFee = programFeeRepo.create(programFee);
      await programFeeRepo
        .createQueryBuilder()
        .update(ProgramFee)
        .set({
          ...programFee,
          program: savedProgram,
          total_programme_fee: data.program_fee.total_programme_fee,
          id: savedProgramFee.id,
          other_fee: data.program_fee.other_fee,
          created_on: savedProgram.createdAt,
        })
        .where('id = :id', { id: savedProgramFee.id })
        .execute();
    } else {
      console.log('Creating programme fee');
      // create it
      programFee = await programFeeRepo.save({
        ...programFee,
        program: savedProgram,
        total_programme_fee: data.program_fee.total_programme_fee,
        other_fee: data.program_fee.other_fee,
      });
    }
    let programMeta: ProgramMeta = await programMetaRepo
      .createQueryBuilder('programMeta')
      .where('programMeta.program = :programId', { programId: savedProgram.id })
      .getOne();
    const updateValueObj = {} as DeepPartial<ProgramMeta>;
    if (!isEmptyOrBlank(data.nature_name as string)) {
      updateValueObj.nature_name = data.nature_name;
    }
    if (!isEmptyOrBlank(data.program_about as string)) {
      updateValueObj.program_about = data.program_about;
    }
    if (!isEmptyOrBlank(data.program_mode as string)) {
      updateValueObj.program_mode = data.program_mode;
    }
    if (data.program_fee_applicable as boolean) {
      updateValueObj.program_fee_applicable = data.program_fee_applicable;
    }
    if (programMeta) {
      console.log('updating meta');
      // update it.
      programMeta = { ...updateValueObj, id: programMeta.id } as ProgramMeta;
      programMeta.program = savedProgram;
      // savedProgram.programMeta = programMeta;
      const metaRepo = getCustomRepository(ProgramMetaRepository);
      programMeta = metaRepo.create(programMeta);
      await metaRepo
        .createQueryBuilder()
        .update(ProgramMeta)
        .set({
          id: programMeta.id,
          program: programMeta.program,
          nature_name: programMeta.nature_name,
          program_about: programMeta.program_about,
          program_mode: programMeta.program_mode,
          program_fee_applicable: programMeta.program_fee_applicable,
        })
        .where('id = :id', { id: programMeta.id })
        .execute();
    } else {
      console.log('creating new meta');
      programMeta = { ...updateValueObj, id: null } as ProgramMeta;
      programMeta.program = savedProgram;
      const metaRepo = getRepository(ProgramMeta);

      programMeta = await metaRepo.save(programMeta);
    }

    console.log(programFee);
    programFee.id = savedProgram.id;
    savedProgram.programFee = programFee;
    programFee.program = savedProgram;
    console.log(programMeta.id, 'programMeta.id');
    await programRepo
      .createQueryBuilder()
      .update(Programs)
      .set({
        programMeta,
      })
      .where('id = :id', { id: savedProgram.id })
      .execute();
      const participant = await getRepository(Programs).createQueryBuilder('program')
      .where('program.id =:id',{id:result.id})
      .leftJoinAndSelect('program.participantsList','participantsList')
      .getOne();


    res.status(200).json(success('', { programId: savedProgram.id ,participant }, res.statusCode));
    }catch(error){
      res.status(400).json(success(error.message, {  }, res.statusCode));
      res.end();
    }

  }

  private async saveBatchDetails(
    data: any,
    user: number,
    res: IResponse
  ): Promise<void> {
    const programData = data as ProgrammeDetailsVO;
    const programRepo = getRepository(Programs);
    const sessionRepo = getCustomRepository(SessionRepository);
    let savedProgram: Programs = await programRepo
      .createQueryBuilder('program')
      .leftJoinAndSelect('program.sessionList', 'sessionList')
      .leftJoinAndSelect('program.programBatch', 'programBatch')
      .leftJoinAndSelect('sessionList.sessionMappings', 'sessionMappings')
      .where('program.id = :programId', { programId: programData.data.id })
      .getOne();

    // console.log(751,'savedProgram', savedProgram,751);

    const batchList: ProgramBatch[] = [];
    let sessionList: Sessions[] = [];
    let trainerSlotList = [];
    const sessionMappingList: SessionMapping[] = [];
    for (const sessionObj of programData.data.sessionList) {
      sessionObj.program = savedProgram;  // getting details of program here , date also
      // console.log(766,'savedProgram', savedProgram,766)
      for (const batchObj of programData.data.batchList) {
        batchObj.batch.program = savedProgram;
        if (!batchObj.batch.id) {
          // console.log("creating a new batch");
          const batchRepo = getRepository(ProgramBatch);
          // console.log(batchObj.batch);
          batchObj.batch = await batchRepo.save(batchObj.batch);
        }
        // after batch is created assign the same batch ID to all the elements of sessionMapping

        programData.data.sessionList.forEach((session) => {
          session.sessionMappings.forEach((mapping, index) => {
            if (index == programData.data.batchList.indexOf(batchObj)) {
              // console.log("assigning batch ID now", batchObj.batch);
              mapping.batch = batchObj.batch;
            } else {
              console.log('going into the else');
            }
          });
        });
        batchList.push(batchObj.batch);
      }

      sessionObj.program = savedProgram;
      // console.log(867,'savedProgram', savedProgram,867)
      sessionObj.subscriber_id = user;
      sessionObj.sessionMappings.forEach((mapping) => {
        if (!mapping.session) {
          sessionMappingList.push(mapping);
        }
      });
      sessionList.push(sessionObj);
      trainerSlotList =
        await ProgramController.instance.getAndSaveTrainerSlotBySessionMapping(
          sessionMappingList
        );
      if (trainerSlotList.length > 0) {
        await getRepository(TrainerSlot).save(trainerSlotList);
      }

      sessionObj.sessionMappings.forEach((mapping) => {
        savedProgram.sessionList.forEach(item => {
          item.sessionMappings.forEach(async oldMapping => {
            if(oldMapping.id == mapping.id){
              if(oldMapping.session_start_date != mapping.session_start_date){
                // send mail that date has changed.
                // console.log('mapping.id', mapping.id)
                // console.log('oldMapping', oldMapping,825)
                 const participantList =  await getRepository(Participants)
                  .createQueryBuilder('particitants')
                  .where(`particitants.batchId = '${oldMapping.batchId}'`)
                  .getMany();

                // console.log(799,'participantList', participantList,799)
                if(participantList.length > 0){
                    participantList.forEach(async participant => {
                      // to participants that session date has been changed --> point 12
                          console.log(900);

                          const notificationContent = JSON.stringify({
                            type:'session_date_changed'
                          })
                        // recheck
                        await addNotification(participant.id,7,notificationContent);

                        const mailContent = `dear participant your session date has been changed to ${mapping.session_start_date}`

                        await sendEmail(participant.email, mailContent);

                    })
                }
              }
            }
          })
        });
      });

    }
    if (sessionMappingList && sessionMappingList.length > 0) {
      await getRepository(SessionMapping).save(sessionMappingList);
    }
    sessionList = await sessionRepo.save(sessionList);
    for (const sessionObj of programData.data.sessionList) {
      if (sessionObj.imported_session_id !== 0) {
        // call new temp wala call kara va na he
        console.log('PROGRAMM',sessionObj.imported_session_id ,sessionList.map(v=>v.id) );

       await SessionController.testingforcopySegment(sessionObj.imported_session_id ,sessionList.map(v=>v.id))

      }
    }

    // console.log(sessionList, batchList);
    if (batchList && batchList.length !== 0) {
      savedProgram.programBatch = batchList;
    }
    if (sessionList && sessionList.length !== 0) {
      savedProgram.sessionList = sessionList;
    }
    savedProgram.from_date = programData.data.from_date;
    savedProgram.to_date = programData.data.to_date;
    savedProgram.training_days = programData.data.training_days;
    savedProgram.training_hours = programData.data.training_hours;
    savedProgram = await programRepo.save(savedProgram);

    const participant = await getRepository(Programs).createQueryBuilder('program')
      .where('program.id =:id',{id:programData.data.id})
      .leftJoinAndSelect('program.participantsList','participantsList')
      .getOne();

    res.status(200).json(success('', {participant}, res.statusCode));
    res.end();
  }

  private async saveParticipantDetails(
    details: ProgramParticipantsDetails,
    user: number,
    res: IResponse
  ): Promise<void> {
    const payload = details.data;
    const programRepo = getRepository(Programs);
    const audienceRepo = getRepository(AudienceType);
    const sInviteRepo = getRepository(SpecialInvitee);
    const participantRepo = getRepository(Participants);
    const batchRepo = getRepository(ProgramBatch);
    const supportRepo = getRepository(SupportTeam);
    const program = await programRepo
      .createQueryBuilder('program')
      .leftJoinAndSelect('program.sessionList', 'sessionList')
      .where('program.id = :programId', { programId: payload.programId })
      .getOne();

    console.log(820,'payload', payload.programBatch[0].participantList)
    // set program attributes
    // if (payload.audienceType !== null && payload.audienceType !== 0) {
    //     program.target_audience = await audienceRepo.findOne(payload.audienceType);
    // }
    let Participant;
    const participantAry = [];
    await programRepo
      .createQueryBuilder('program')
      .update(Programs)
      .set({
        total_participants: payload.total_participants,
        invite_trgr_threshld_day: payload.invite_trgr_threshld_day,
        passcode_protected: payload.passcode_protected,
        passcode: payload.passcode,
      })
      .where('id = :programId', { programId: program.id })
      .execute();
    // set details for each of the batch
    for (const batch of payload.programBatch) {
      batch.program = program;
      const savedBatch = await batchRepo
        .createQueryBuilder()
        .where('id = :batchId', { batchId: batch.batchId })
        .getOne();
      // console.log(batch.audienceType);
      await batchRepo
        .createQueryBuilder()
        .update(ProgramBatch)
        .set({
          audienceType: batch.audienceType,
        })
        .where('id = :batchId', { batchId: batch.batchId })
        .execute();

        if(batch.participantList.length === 0){
          // notification trigger point 10
          const sessInfo = await getRepository(SessionMapping)
            .createQueryBuilder()
            .where('batchId = :batchId', { batchId: batch.batchId })
            .getRawOne();
          // console.log(1020,'payload.programId', payload.programId)
            const PendingtaskContent = JSON.stringify({
              taskType: PENDING_TASKTYPE.ADD_PARTICIPANT_TO_PROGRAM,
              taskTitle:'Program Set Up',
              task:'To Trainer for adding participants if not already added',
              batch:batch.batch_name,
              programme:batch.program.program_name,
              session:'-',
              programId : payload.programId
            })
            const NotificationContent = JSON.stringify({
              type: PENDING_TASKTYPE.ADD_PARTICIPANT_TO_PROGRAM,
             })
            await addNotification(sessInfo.SessionMapping_trainerId,4,NotificationContent);

            await addPendingTask(user,4,PendingtaskContent,10);

        }

      for (const participant of batch.participantList) {
        participant.program = program;
        participant.batch = savedBatch;
      Participant = await participantRepo.save(participant);
      participantAry.push(Participant);

        // notification trigger point 9

        const traineeInfo = await getRepository(Trainee)
                            .findOne({
                                where: {
                                    trainee_email : participant.email
                                }
                            })
                        // console.log('participant.email', participant.email)
                        // console.log('traineeInfo', traineeInfo)

                        if(traineeInfo !== undefined){
                            // to send notification,that participant has been added in the new program
                            const notificationContent = JSON.stringify({
                                type:'added_in_new_program'
                              })

                            await addNotification(traineeInfo.id,6,notificationContent);

                            const mailContent = `welcome ${participant.name}, we are delighted to have you as a participant. You are added in a program`

                            await sendEmail(participant.email, mailContent);

                        }
        // const sessInfo = await getRepository(SessionMapping)
        //     .createQueryBuilder()
        //     .where("batchId = :batchId", { batchId: batch.batchId })
        //     .getRawOne();

            // console.log('sessInfo', sessInfo.SessionMapping_trainerId)

      }
      for (const supportTeam of batch.supportTeamList) {
        supportTeam.program = program;
        supportTeam.batch = savedBatch;
        await supportRepo.save(supportTeam);
      }
      for (const inviteSp of batch.specialInviteeList) {
        // Note: You need to handle the case when there are no session in database against a program
        // inviteSp.id is actually the sessionId
        // TODO Handle this
        inviteSp.programId = program.id;
        inviteSp.forAll = inviteSp.sessionId === 0;
        inviteSp.session = program.sessionList.filter(
          (session) => session.id === inviteSp.sessionId
        )[0];
        inviteSp.programId = program.id;
        inviteSp.batch = savedBatch;
        await sInviteRepo.save(inviteSp);
      }
    }
    // Now assign the data & allocate it.
    res.status(200).json(success('', participantAry, res.statusCode));
    res.end();
  }

  protected async saveSeatingStyle(
    payload: ProgramDetailsVO,
    user: number,
    res: IResponse
  ): Promise<void> {
    const seatingRepo = getCustomRepository(SeatingStyleRepository);

    console.log(payload.data.programId);
    const savedProgram = await getCustomRepository(ProgramRepository)
      .createQueryBuilder('program')
      .where('program.id = :programId', { programId: payload.data.programId })
      .getOne();
    const data: SeatingStyleVO = payload.data as unknown as SeatingStyleVO;
    for (const batch of data.batchList) {
      const savedBatch = await getRepository(ProgramBatch)
        .createQueryBuilder()
        .where('id = :batchId', { batchId: batch.id })
        .getOne();
      console.log(
        'About to affect seating style for',
        batch.seatingArrangement.id
      );
      if (batch.seatingArrangement.id != null) {
        console.log('updating the seating style');
        // Update the sitting arrangement
        await seatingRepo
          .createQueryBuilder('')
          .update(SeatingStyle)
          .set(batch.seatingArrangement)
          .where('id = :id', { id: batch.seatingArrangement.id })
          .execute();
      } else {
        console.log('creating the seating style', batch.seatingArrangement.id);
        // create new arrangements
        // batch.seatingArrangement.program = savedProgram;
        let entity = seatingRepo.create();
        entity = {
          ...entity,
          seating_type: batch.seatingArrangement.seating_type,
          free_seating: batch.seatingArrangement.free_seating,
          batch: savedBatch,
          program: savedProgram,
          allowBlock: batch.seatingArrangement.allowBlock,
          allowSwap: batch.seatingArrangement.allowSwap,
          allowStand: batch.seatingArrangement.allowStand,
          noOfSpecialSeat: batch.seatingArrangement.noOfSpecialSeat,
          nos_of_participant_on_table:
            batch.seatingArrangement.nos_of_participant_on_table,
          showSeatOccupied: batch.seatingArrangement.showSeatOccupied,
          prefGroupSize: batch.seatingArrangement.prefGroupSize,
          spclInvitePerSeat: batch.seatingArrangement.spclInvitePerSeat,
          nos_of_table: batch.seatingArrangement.nos_of_table,
          assign_manually: batch.seatingArrangement.assign_manually,
          table: batch.seatingArrangement.table,
        };
        console.log(entity);
        entity.batch = savedBatch;
        entity.program = savedProgram;
        await seatingRepo.save(entity);
      }
    }
    const participant = await getRepository(Programs).createQueryBuilder('program')
    .where('program.id =:id',{id:payload.data.programId})
    .leftJoinAndSelect('program.participantsList','participantsList')
    .getOne();
    res.status(200).json(success('', {participant}, res.statusCode));
    res.end();
  }

  protected async saveLiveSessionSettings(
    payload: any,
    user: number,
    res: IResponse
  ): Promise<void> {
    const programId = payload.data.program;
    const programMetaRepo = getRepository(ProgramMeta);
    const response = await programMetaRepo
      .createQueryBuilder()
      .update(ProgramMeta)
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      .set(payload.data)
      .where('program = :programId', { programId })
      .execute();
      const participant = await getRepository(Programs).createQueryBuilder('program')
      .where('program.id =:id',{id:programId})
      .leftJoinAndSelect('program.participantsList','participantsList')
      .getOne();
    if (response.affected > 0) {
      res
        .status(200)
        .json(
          success(
            'Live session settings saved successfully',
            {participant},
            res.statusCode
          )
        );
      res.end();
    } else {
      res
        .status(401)
        .json(success('Failed to update program details', {}, res.statusCode));
      res.end();
    }
  }
  protected async programSetupCompleted(payload: any, user: number, res: IResponse): Promise<void> {
    try {
      const programId = payload.program_id;
      console.log(payload);
      await getRepository(Programs).createQueryBuilder()
        .update(Programs)
        .set({ program_setup_completed: true })
        .where('id = :id', { id: programId })
        .execute();

      res.status(200).json(success('Program Setup Completed', {}, res.statusCode));
      res.end();
    } catch (error) {
      res.status(401).json(success('Failed to Setup Program Completed', error.message, res.statusCode));
      res.end();
    }
  }

  public async getParticipantSpecialInviteeFromProgramId(
    req: Request,
    res: Response,
    next: () => void
  ): Promise<void> {
    const programId = req.body.programId;
    const specialInviteeRepo = getRepository(SpecialInvitee);
    const participantRepo = getRepository(Participants);
    const participantsList = await participantRepo.find({
      where: { program_id: programId },
    });
    const specialInviteeList = await specialInviteeRepo.find({
      where: { program_id: programId },
    });
    res
      .status(200)
      .json(
        success('', { participantsList, specialInviteeList }, res.statusCode)
      );
    res.end();
  }

  public async getSessionDetails(
    req: Request,
    res: Response,
    next: () => void
  ): Promise<void> {
    const programId = req.body.programId;
    const sessionList = await getRepository(Sessions).find({
      where: { program: programId },
    });
    res.status(200).json(success('', { sessionList }, res.statusCode));
    res.end();
  }

  public async getProgrammeListBySubscriber(
    req: Request,
    res: Response,
    next: () => void
  ): Promise<void> {
    const _Programs = getRepository(Programs);
    const subscriberId = req.user as number;
    let x = [];
    let _user;
    let No_Session = 0;
    let _Trainer_Name = '';
    let No_Of_Programs: number;
    let No_Of_Trainees : any;
    const Engagement: any = '0';
    const _programmeList: Programs[] = await getRepository(Programs)
      .createQueryBuilder('programs')
      .where('programs.subscriber_id = :subscriber_id', {
        subscriber_id: subscriberId,
      })
      .leftJoinAndSelect('programs.client', 'Clients')
      .leftJoinAndSelect('programs.sessionList', 'sessions')
      .leftJoinAndSelect('programs.programMeta', 'programMeta')
      .leftJoinAndSelect('sessions.sessionSegment', 'sessionSegment')
      .getMany();
      x = _programmeList.map((y) => y.id);
      let programListStr = '';
      _programmeList.forEach((program, index) => {
        if(index === 0){
          programListStr = programListStr.concat(program.id.toString());
        } else {
          programListStr = programListStr.concat(',').concat(program.id.toString());
        }
      })
      let participantCount = 0;
      if(programListStr.length > 0){
          participantCount = await getRepository(Participants).createQueryBuilder('participants')
          .where(`participants.programId IN (${programListStr})`)
          .getCount();
          console.log('participantCount', participantCount);
      }
    const no_programm = await _Programs
      .createQueryBuilder('progrmas')
      .select('COUNT(*)', 'count')
      .where('progrmas.subscriber_id = :subscriber_id', {
        subscriber_id: subscriberId,
      })
      .getRawOne();
    const noOfPrograms = no_programm.count;

    const trainee = await getRepository(Trainee).createQueryBuilder('trainee')
    .select('COUNT(*)','count')
    .where('trainee.id =:id',{id:subscriberId})
    .getRawOne();
    console.log(trainee);
    No_Of_Trainees = trainee.count 

    for (let i = 0; i < x.length; i++) {
      const _no_session = await getRepository(Sessions)
        .createQueryBuilder('session')
        // .select("COUNT(*)", 'count')
        .where('session.programId = :programId', { programId: x[i] })
        .select('session.id')
        .getOne();
      No_Session++;
    }
    const userrepo = getRepository(Trainers);
    const id = await userrepo.findOne({ where: { subscriber_id: subscriberId } });
    if (id) {
      const trainer_name = await getRepository(Trainers)
        .createQueryBuilder('trainer')
        .where('trainer.subscriber_id =:subscriber_id', {
          subscriber_id: subscriberId,
        })
        .select('trainer.name')
        .getOne();
      _Trainer_Name = trainer_name.name;
    }

    if (_programmeList.length != 0) {
      _user = await getRepository(User)
        .createQueryBuilder('user')
        .where('user.id=:id', { id: subscriberId })
        .select('user.status')
        .getOne();
    }
    const programmeList = _programmeList.map((v) => ({
      ...v,
      Status: _user.status,
      Trainer_Name: _Trainer_Name,
    }));

    res
      .status(200)
      .json(
        success(
          '',
          { programmeList, No_Of_Programs: noOfPrograms, No_Session, Engagement, No_Of_Trainees, totalParticipants: participantCount },
          res.statusCode
        )
      );
    res.end();
  }

  public async getDetailedProgramSchemaWithSession(
    req: Omit<Request, 'body'> & { body: InputDetailsVO },
    res: Response,
    next: () => void
  ): Promise<void> {
    try{
      const programId = req.body.id;
      const program = await getRepository(Programs)
        .createQueryBuilder('programs')
        .where('programs.id = :programId', { programId })
        .leftJoinAndSelect('programs.client', 'client')
        .leftJoinAndSelect('programs.programMeta', 'programMeta')
        .leftJoinAndSelect('programs.programFee', 'programFee')
        .leftJoinAndSelect('programs.programBatch', 'programBatch')
        .leftJoinAndSelect('programs.sessionList', 'sessionList')
        .leftJoinAndSelect('programs.participantsList', 'participantsList')
        // .leftJoinAndSelect('programs.target_audience', 'audienceType')
        .loadRelationCountAndMap(
          'sessionList.segmentCount',
          'sessionList.sessionSegment'
        )

        // .loadRelationCountAndMap('sessionList.segmentCount', 'sessionList.segment')
        // Removed due to the latest changes introduced as many-to-many mapping
        // .leftJoinAndSelect('sessionList.batch', 'batch')

        .leftJoinAndSelect('sessionList.sessionMappings', 'sessionMappings')
        .leftJoinAndSelect('sessionMappings.trainer', 'trainer')
        .leftJoinAndSelect(
          'programBatch.specialInviteeList',
          'specialInviteeList'
        )
        .leftJoinAndSelect('specialInviteeList.session', 'specialInviteeSession')
        .leftJoinAndSelect('programBatch.supportTeamList', 'supportTeamList')
        .leftJoinAndSelect('programBatch.participants', 'participants')
        .leftJoinAndSelect('programBatch.sittingStyle', 'sittingStyle')
        .getOne();
        let x;
        if(program){
           x = program.targetAudienceId;

           var trainer =  await getRepository(Trainers).createQueryBuilder('trainer')
           .where('trainer.subscriber_id =:subscriber_id',{subscriber_id:program.subscriber_id})
           .getMany();
        }
        let total_no_of_reactions = 0
      Object.assign({ x }, program);

      if(program && program.status === 'Completed' && program.sessionList){
        for(let j=0; j<program.sessionList.length; j++){
          if(program.sessionList[j].sessionMappings){
            for(let p=0; p<program.sessionList[j].sessionMappings.length; p++){
              console.log(program.sessionList[j].sessionMappings[p].id);
              const totalReaction = await getRepository(Session_Reactions).createQueryBuilder('reaction')
                .select('COUNT(*)', 'total_no_of_reactions')
                .where('reaction.session_map_id = :session_map_id',{session_map_id: program.sessionList[j].sessionMappings[p].id })
                .getRawOne();
                 total_no_of_reactions = totalReaction.total_no_of_reactions
            }
          }
        }
      }

      res.status(200).json(success('', { program ,trainer ,total_no_of_reactions }, res.statusCode));

    }catch(error){
      res.status(400).json(success(error.message, {}, res.statusCode));
    }


    res.end();
  }

  public async getParticipantListByProgramId(
    req: Omit<Request, 'body'> & { body: InputDetailsVO },
    res: Response,
    next: () => void
  ): Promise<void> {
    const programId = req.body.id;
    const batchList: ProgramBatch[] = await getRepository(ProgramBatch)
      .createQueryBuilder('batch')
      .where('batch.program = :programId', { programId })
      .leftJoinAndSelect('batch.participants', 'participants')
      .getMany();
    res.status(200).json(success('', { batchList }, res.statusCode));
    res.end();
  }

  public async checkTrainerAvailability(
    req: Omit<Request, 'body'> & { body: SessionAvailabilityVO },
    res: Response,
    next: () => void
  ): Promise<void> {
    const inputVO: SessionAvailabilityVO = req.body;
    const trainerList: Trainers[] = await getManager().query(
      `
            SELECT trainers.id                   AS id,
                   trainers.name                 AS name,
                   trainers.email                AS email,
                   trainers.phone                AS email,
                   trainers.address              AS address,
                   trainers.subscriber_id        AS subscriber_id,
                   trainers.createdAt            AS createdAt,
                   trainers.updatedAt            AS updatedAt,
                   trainers.deletedAt            AS deletedAt,
                   (SELECT bookedSlots
                    FROM trainer_slot
                    WHERE trainer_slot.trainerId = trainers.id
                      AND trainer_slot.date = ?) AS trainerSlotStr
            FROM trainers
            WHERE trainers.subscriber_id = ?;
        `,
      [inputVO.date, req.user as number]
    );
    console.log(trainerList);
    const trainers =
      await ProgramController.instance.populateAndFilterTrainersByDataTime(
        trainerList,
        inputVO
      );
    res.status(200).json(success('', { trainers }, res.statusCode));
    res.end();
  }

  async populateAndFilterTrainersByDataTime(
    trainerList: Trainers[],
    queryCriteria: SessionAvailabilityVO
  ) {
    const availList: Trainers[] = [];
    for (let i = 0; i < trainerList.length; i++) {
      const trainer = trainerList[i];
      const slotList = this.slotCalculatorService.getSlotListAsArrayByInterval(
        queryCriteria.startTime,
        queryCriteria.endTime,
        this.slotCalculatorService.getSlotMap()
      );
      let trainerBusy = false;
      slotList.forEach((slot) => {
        if (trainer.trainerSlotStr) {
          if (trainer.trainerSlotStr.includes(slot)) {
            trainerBusy = true;
          }
        }
      });
      trainer.available = !trainerBusy;
      availList.push(trainer);
    }
    return availList;
  }

  public async getFirstSession(req: Request, res: IResponse): Promise<void> {
    try {
      const session = await getRepository(Sessions).createQueryBuilder('session')
        .where('session.programId=:programId', { programId: req.body.id })
        .leftJoinAndSelect('session.sessionMappings', 'sessionMappings')
        .orderBy('sessionMappings.session_start_date', 'ASC')
        .getOne();
      let session_start_date
      if (session) {
        session_start_date = session.sessionMappings.map(v=>v.session_start_date)[0]
      }
      res.status(200).json(success('', { session_start_date }, res.statusCode));
    } catch (err) {
      res.status(400).json(success(err.message, {}, res.statusCode));
    }

  }


  public async getProgramsByClientId(req: Request, res: IResponse): Promise<void> {
    try {
      const Engagement :any = 62;
      const rating :any = 5;
      const status:any = 'Completed'
      const AverageFeedbackRating = 4;
      const AverageEngagementScore = 50;
      const Program = await getRepository(Programs).createQueryBuilder('programs')
        .where('programs.clientId=:clientId', { clientId: req.body.id })
        .leftJoinAndSelect('programs.client','client')
        .leftJoinAndSelect('client.related_industry','related_industry')
        .leftJoinAndSelect('programs.sessionList','sessionList')
        .leftJoinAndSelect('programs.queries','queries')
        .leftJoinAndSelect('programs.programBatch','programBatch')
        .leftJoinAndSelect('programs.participantsList','participantsList')
        .leftJoinAndSelect('programs.programMeta','programMeta')
        .getMany();

        const program = Program.map((v) => ({
          ...v,
          Status:status,
          Rating:rating,
          Engagement,
          AverageFeedbackRating,
          AverageEngagementScore
        }));



      res.status(200).json(success('', { program }, res.statusCode));
    } catch (err) {
      res.status(400).json(success(err.message, {}, res.statusCode));
    }

  }

  public async getAllTasksByProgramId(req: Request, res: IResponse): Promise<void> {
    try {

      const allTaskInfo = await getRepository(Programs)
                .createQueryBuilder('program')
                .where('program.id = :id', { id: req.body.id })
                .leftJoinAndSelect('program.sessionList', 'sessionList')
                .leftJoinAndSelect('sessionList.sessionMappings', 'sessionMappings')
                .leftJoinAndSelect('sessionMappings.batch', 'batch')
                .leftJoinAndSelect('sessionList.sessionSegment', 'sessionSegment')
                .getOne();

                for (let i = 0; i < allTaskInfo.sessionList.length; i++) {
                  const sessionItem = allTaskInfo.sessionList[i];
                  for (let k = 0; k < sessionItem.sessionSegment.length; k++) {
                    const sessionSegmentItem = sessionItem.sessionSegment[k];
                    if(sessionSegmentItem.type == 'Live'){
                      delete sessionItem.sessionSegment[k];
                    }
                  }
                  for (let j = 0; j < sessionItem.sessionMappings.length; j++) {
                      const sessionMappingItem : any = sessionItem.sessionMappings[j];
                      sessionMappingItem.sessionSegment = sessionItem.sessionSegment

                  }
                  delete sessionItem.sessionSegment

              }

      res.status(200).json(success('',  allTaskInfo , res.statusCode));
    } catch (err) {
      res.status(400).json(success(err.message, {}, res.statusCode));
      console.log('error :', err)
    }
  }

  public async getAllPrePostWork(req: Request, res: IResponse): Promise<void> {
    try {
      // let Pre;
      // let Post
      const Pre = await getRepository(Programs).createQueryBuilder('program')
      .select('program.id')
      .addSelect('program.subscriber_id')
      .addSelect('program.program_name')
      .where('program.subscriber_id =:subscriber_id', { subscriber_id : req.user})
      .leftJoin('program.sessionList', 'sessionList')
      .addSelect('sessionList.id')
      .addSelect('sessionList.session_name')
      .leftJoin('sessionList.sessionSegment', 'sessionSegment')
      .addSelect('sessionSegment.id')
      .addSelect('sessionSegment.title')
      .addSelect('sessionSegment.description')
      .addSelect('sessionSegment.type')
      .addSelect('sessionSegment.activity_data')
      .andWhere( 'sessionSegment.type =:type', {type:'Pre' })
      .leftJoin('program.programBatch', 'programBatch')
      .addSelect('programBatch.id')
      .addSelect('programBatch.batch_name')
      .leftJoin('programBatch.participants', 'participants')
      .addSelect('participants.id')
      .addSelect('participants.name')
      .addSelect('participants.email')
      .getMany();

      const Post = await getRepository(Programs).createQueryBuilder('program')
      .select('program.id')
      .addSelect('program.subscriber_id')
      .addSelect('program.program_name')
      .where('program.subscriber_id =:subscriber_id', { subscriber_id : req.user})
      .leftJoin('program.sessionList', 'sessionList')
      .addSelect('sessionList.id')
      .addSelect('sessionList.session_name')
      .leftJoin('sessionList.sessionSegment', 'sessionSegment')
      .addSelect('sessionSegment.id')
      .addSelect('sessionSegment.title')
      .addSelect('sessionSegment.description')
      .addSelect('sessionSegment.type')
      .addSelect('sessionSegment.activity_data')
      .andWhere( 'sessionSegment.type =:type', {type:'Post' })
      .leftJoin('program.programBatch', 'programBatch')
      .addSelect('programBatch.id')
      .addSelect('programBatch.batch_name')
      .leftJoin('programBatch.participants', 'participants')
      .addSelect('participants.id')
      .addSelect('participants.name')
      .addSelect('participants.email')
      .getMany();


      res.status(200).json(success('', { Pre,Post }, res.statusCode));
      res.end();
    } catch (err) {
      res.status(400).json(success(err.message, {}, res.statusCode));

    }
  }

  public async viewActivityStatus(req: Request, res: IResponse): Promise<void>{
    try {
      let allActivityData;
      let ActivityData;
      const todaysDate = Dayjs().format('YYYY-MM-DD');

      allActivityData = await getRepository(SessionSegment)
        .createQueryBuilder('sessSegment')
        .where('sessSegment.id =:id', { id: req.body.sessionSegmentId })
        .leftJoinAndSelect('sessSegment.session','session')
        .leftJoinAndSelect('session.sessionMappings','sessionMappings')
        .getOne();

      // console.log('allActivityData', allActivityData)
      // let activity_data = JSON.parse(allActivityData.activity_data)
      // console.log('activity_data', activity_data)


        for (const sessionMapItem of allActivityData.session.sessionMappings) {

          const participantData = await getRepository(Participants)
            .createQueryBuilder('participants')
            .where('participants.batchId =:id', { id: req.body.batchId })
            .getMany();

          sessionMapItem.participantData = participantData;



          for (let i = 0; i < participantData.length; i++) {
            const partItem:any = participantData[i];

            let isParticipantRegisteredAsTrainee:boolean;
            let activitySubmissionStatus = 'pending';

            const traineeInfo:any = await getRepository(Trainee)
              .findOne({
                  where: {
                      trainee_email : partItem.email
                  }
              })

            if(traineeInfo !== undefined){
              delete traineeInfo.trainee_password;
              delete traineeInfo.temporaryPassword;
              delete traineeInfo.otp;
              partItem.traineeInfo = traineeInfo;
              isParticipantRegisteredAsTrainee = true;
              const traineeSubmittedTask = await getRepository(TraineeCompletedTask)
                .createQueryBuilder('traineeCompletedTask')
                .where('traineeCompletedTask.trainee_id =:id', { id: traineeInfo.id })
                .andWhere('traineeCompletedTask.session_segment_id =:sId', { sId: req.body.sessionSegmentId })
                .getOne();

              if(traineeSubmittedTask !== undefined){
                activitySubmissionStatus = 'submitted'
                partItem.traineeSubmittedTask = traineeSubmittedTask
              }

            }else{
              isParticipantRegisteredAsTrainee = false;
            }
            partItem.isParticipantRegisteredAsTrainee = isParticipantRegisteredAsTrainee
            partItem.activitySubmissionStatus = activitySubmissionStatus

          }

        }


        if(allActivityData && allActivityData.session && allActivityData.session.sessionMappings){
          const x = allActivityData.session.sessionMappings.map(v=>v.participantData)
           ActivityData = x[0]
        }


      res.status(200).json(success('ok', {  ActivityData }, res.statusCode));
      res.end();
    } catch (err) {
      res.status(400).json(success(err.message, {}, res.statusCode));

    }
  }

  public async deleteClient(req: Request, res: IResponse): Promise<void> {
    try {
      // delete a client

      let responseData;
      const todaysDate = Dayjs().format('YYYY-MM-DD HH:mm:ss');

      const clientData = await getRepository(Clients).findOne({
        where: { id: req.body.id }
      });

      if (clientData) {
        clientData.isDeleted = true
        clientData.deletedAt = todaysDate;
        await getRepository(Clients).save(clientData);
        responseData = clientData;
      }

      res.status(200).json(success('client deleted successfully', clientData , res.statusCode));
    } catch (err) {
      res.status(400).json(error(err.message, res.statusCode));
    }
  }

  public async markNotificationAsRead(req: Request, res: IResponse): Promise<void> {
    try {
      // mark notification as read
      const isRead = req.body.read;
      const notificationInfo = await getRepository(Notification).findOne({
        where: { id: req.body.id }
      });

      if (notificationInfo) {
        if(isRead == true){
            notificationInfo.read_status = 1
        } else {
          notificationInfo.read_status = 0
        }
        await getRepository(Notification).save(notificationInfo);
      }

      res.status(200).json(success('notification status updated successfully', notificationInfo , res.statusCode));
    } catch (err) {
      res.status(400).json(error(err.message, res.statusCode));
    }
  }

  public async markNotificationAsDelete(req: Request, res: IResponse): Promise<void> {
    try {
      let responseData;

      const notificationInfo = await getRepository(Notification).findOne({
        where: { id: req.body.id }
      });

      if (notificationInfo) {
        notificationInfo.delete_status = 1
        await getRepository(Notification).save(notificationInfo);
        responseData = notificationInfo;
      }

      res.status(200).json(success('notification marked as delete successfully', notificationInfo , res.statusCode));
    } catch (err) {
      res.status(400).json(error(err.message, res.statusCode));
    }
  }

  public async averageProgramRating(req: Request, res: IResponse): Promise<void> {
    try {
      let responseData
      const ratingInfo = await getRepository(Ratings).find({
        where: { program_id : req.query.program_id }
      });

      if (ratingInfo.length !=0) {
        let count = 0;
        var averageProgramRating = ratingInfo.reduce(function (sum,rating) {
            count+=1;
            return sum + rating.program_rating;

        },0)/count;
      }
      averageProgramRating = Math.round(averageProgramRating)

      const traineeRatingInfo = await getRepository(Ratings).findOne({
        where: { trainee_id : req.user}
      });

      responseData ={
        averageProgramRating,
        traineeProgramRating : traineeRatingInfo.program_rating
      }


      res.status(200).json(success('program wise rating calculated successfully', responseData , res.statusCode));
    } catch (err) {
      res.status(400).json(error(err.message, res.statusCode));
    }
  }

  public async averageSessionRating(req: Request, res: IResponse): Promise<void> {
    try {
      let responseData
      const ratingInfo = await getRepository(Ratings).find({
        where: { session_id : req.query.session_id }
      });
      console.log('ratingInfo', ratingInfo.length)


      if (ratingInfo.length !=0) {
        let count = 0;
        var averageSessionRating = ratingInfo.reduce(function (sum,rating) {
          count+=1;
          return sum + rating.session_rating;

        },0)/count;
      }
      averageSessionRating = Math.round(averageSessionRating)

      const traineeRatingInfo = await getRepository(Ratings).findOne({
        where: { trainee_id : 51}   // req.user
      });
      console.log('traineeRatingInfo', traineeRatingInfo)




      if(ratingInfo.length == 0 && traineeRatingInfo == undefined){
        console.log(1);
        res.status(200).json(success('neither is there a rating against current trainee nor are there ratings against the session id sent','data', res.statusCode))
      }else if(ratingInfo.length == 0){
        console.log(2);
        res.status(200).json(success('there are no ratings against the session id sent','data', res.statusCode))
      }else if(traineeRatingInfo == undefined){
        console.log(3);
        res.status(200).json(success('there is no rating against the trainee id sent','data', res.statusCode))
      }

      responseData ={
        averageSessionRating,
        traineeSessionRating : traineeRatingInfo.session_rating
      }

      res.status(200).json(success('session wise rating calculated successfully', responseData , res.statusCode));
    } catch (err) {
      res.status(400).json(error(err.message, res.statusCode));
    }
  }

  public async setRating(req: Request, res: IResponse): Promise<void> {
    try {
      // TODO : to be completed
      let responseData
      // const ratingInfo = await getRepository(Ratings).find({
      //   where: { session_id : req.query.sessionId }
      // });

      // if (ratingInfo.length !=0) {
      //   let count = 0;
      //   var averageSessionRating = ratingInfo.reduce(function (sum,rating) {
      //       count+=1;
      //       return sum + rating.session_rating;

      //   },0)/count;
      // }
      // averageSessionRating = Math.round(averageSessionRating)

      // const traineeRatingInfo = await getRepository(Ratings).findOne({
      //   where: { trainee_id : req.user}
      // });

      // responseData ={
      //   averageSessionRating : averageSessionRating,
      //   traineeSessionRating : traineeRatingInfo.session_rating
      // }

      if(req.query.session_id){

        const traineeRatingInfo = await getRepository(Ratings).findOne({
          where: {
            trainee_id : 1, // req.user
            session_id : 1  // req.query.session_id
          }
        });

        if(traineeRatingInfo){
            // traineeRatingInfo.
        }
      }

      if(req.query.program_id){

      }


      res.status(200).json(success('session wise rating calculated successfully', responseData , res.statusCode));
    } catch (err) {
      res.status(400).json(error(err.message, res.statusCode));
    }
  }

  public async programmeSummaryReport(req: Request, res: IResponse): Promise<void> {
    try {

      let allProgramInfo:any = await getRepository(Programs)
        .createQueryBuilder('program')
        .where('program.subscriber_id = :subscriberId', { subscriberId: req.user })
        .leftJoinAndSelect('program.client','client')
        .leftJoinAndSelect('program.sessionList','sessionList')
        .leftJoinAndSelect('sessionList.sessionMappings','sessionMappings')
        .leftJoinAndSelect('program.programBatch','programBatch')
        .leftJoinAndSelect('program.participantsList','participantsList')
        .getMany();

        allProgramInfo = await programWiseFeedbackRating(allProgramInfo);

        for (let i = 0; i < allProgramInfo.length; i++) {
          const programItem = allProgramInfo[i];
          programItem.noOfSessions = programItem.sessionList.length
          programItem.noOfParticipants = programItem.participantsList.length
          programItem.noOfBatches = programItem.programBatch.length

        }


      res.status(200).json(success('program summary report sent successfully', allProgramInfo , res.statusCode));
    } catch (err) {
      res.status(400).json(error(err.message, res.statusCode));
    }
  }

  public async clientSummaryReport(req: Request, res: IResponse): Promise<void> {
    try {

      let allProgramInfo:any = await getRepository(Programs)
        .createQueryBuilder('program')
        .where('program.subscriber_id = :subscriberId', { subscriberId: req.user })
        .leftJoinAndSelect('program.client','client')
        .leftJoinAndSelect('program.sessionList','sessionList')
        .leftJoinAndSelect('sessionList.sessionMappings','sessionMappings')
        .leftJoinAndSelect('program.programBatch','programBatch')
        .leftJoinAndSelect('program.participantsList','participantsList')
        .getMany();

        allProgramInfo = await programWiseFeedbackRating(allProgramInfo);

        for (let i = 0; i < allProgramInfo.length; i++) {
          const programItem = allProgramInfo[i];
          programItem.noOfSessions = programItem.sessionList.length
          programItem.noOfParticipants = programItem.participantsList.length
          programItem.noOfBatches = programItem.programBatch.length

        }


      res.status(200).json(success('client summary report sent successfully', allProgramInfo , res.statusCode));
    } catch (err) {
      res.status(400).json(error(err.message, res.statusCode));
    }
  }

  public async participationSummaryReport(req: Request, res: IResponse): Promise<void> {
    try {

      let allProgramInfo:any = await getRepository(Programs)
        .createQueryBuilder('program')
        .where('program.subscriber_id = :subscriberId', { subscriberId: req.user })
        .leftJoinAndSelect('program.client','client')
        .leftJoinAndSelect('program.sessionList','sessionList')
        .leftJoinAndSelect('sessionList.sessionMappings','sessionMappings')
        .leftJoinAndSelect('program.programBatch','programBatch')
        .leftJoinAndSelect('program.participantsList','participantsList')
        .getMany();

        allProgramInfo = await programWiseFeedbackRating(allProgramInfo);

        for (let i = 0; i < allProgramInfo.length; i++) {

          const programItem = allProgramInfo[i];

          programItem.noOfSessions = programItem.sessionList.length
          programItem.noOfParticipants = programItem.participantsList.length
          programItem.noOfBatches = programItem.programBatch.length
          programItem.totalParticipantsAttended = programItem.programBatch.length

          for (let j = 0; j < programItem.sessionList.length; j++) {
            const sessionItem = programItem.sessionList[j];
            let sessionWiseBatchList = ''

            for (let k = 0; k < sessionItem.sessionMappings.length; k++) {
              const sessionMapItem = sessionItem.sessionMappings[k];

              if(k === 0){
                sessionWiseBatchList += sessionMapItem.batchId
              }else {
                sessionWiseBatchList += ',' + sessionMapItem.batchId
              }

            }
            let participantCount = 0
            if(sessionWiseBatchList != ''){
              participantCount = await getRepository(Participants).createQueryBuilder('participants')
                .where(`participants.batchId IN (${sessionWiseBatchList})`)
                .getCount();
            }

            sessionItem.noOfParticipantsInSession = participantCount

            const preWorkActivityIds = await getRepository(SessionSegment)
              .createQueryBuilder('sessionSegment')
              .select('sessionSegment.id')
              .where('sessionSegment.sessionId = :id',{id: sessionItem.id})
              .andWhere('sessionSegment.type = \'Pre\'')
              .getMany();

            let preWorkActivityIdsList = ''
            for (let l = 0; l < preWorkActivityIds.length; l++) {
              const preItem = preWorkActivityIds[l];
              if(l === 0){
                preWorkActivityIdsList += preItem.id
              }else {
                preWorkActivityIdsList += ',' + preItem.id
              }
            }
            let participantCompletedPreWorkCount = 0
            if(preWorkActivityIdsList != ''){
              participantCompletedPreWorkCount = await getRepository(TraineeCompletedTask).createQueryBuilder('tct')
            .where(`tct.session_segment_id IN (${preWorkActivityIdsList})`)
            .getCount();
            }

            sessionItem.noOfParticipantsCompletedPreWork = participantCompletedPreWorkCount

            const postWorkActivityIds = await getRepository(SessionSegment)
              .createQueryBuilder('sessionSegment')
              .select('sessionSegment.id')
              .where('sessionSegment.sessionId = :id',{id: sessionItem.id})
              .andWhere('sessionSegment.type = \'Pre\'')
              .getMany();

            let postWorkActivityIdsList = ''
            for (let l = 0; l < postWorkActivityIds.length; l++) {
              const preItem = postWorkActivityIds[l];
              if(l === 0){
                postWorkActivityIdsList += preItem.id
              }else {
                postWorkActivityIdsList += ',' + preItem.id
              }
            }
            let participantCompletedPostWorkCount = 0
            if(postWorkActivityIdsList != ''){
              participantCompletedPostWorkCount = await getRepository(TraineeCompletedTask).createQueryBuilder('tct')
            .where(`tct.session_segment_id IN (${postWorkActivityIdsList})`)
            .getCount();
            }

            sessionItem.noOfParticipantsCompletedPostWork = participantCompletedPostWorkCount
          }
        }
        // TODO : totalParticipantsAttended --> this has to be calculated  -- DONE
        // TODO : preWorkCompletionStatus, postWorkCompletionStatus --> to be calculated -- DONE

        res.status(200).json(success('participation summary report sent successfully', allProgramInfo , res.statusCode));
      } catch (err) {
        res.status(400).json(error(err.message, res.statusCode));
    }
  }

  public async engagementReport(req: Request, res: IResponse): Promise<void> {
    try {



      res.status(200).json(success('engagement report sent successfully', 'responseData' , res.statusCode));
    } catch (err) {
      res.status(400).json(error(err.message, res.statusCode));
    }
  }

  public async feedbackReport(req: Request, res: IResponse): Promise<void> {
    try {

      let allProgramInfo:any = await getRepository(Programs)
        .createQueryBuilder('program')
        .where('program.subscriber_id = :subscriberId', { subscriberId: req.user })
        .leftJoinAndSelect('program.client','client')
        .leftJoinAndSelect('program.sessionList','sessionList')
        .leftJoinAndSelect('sessionList.sessionMappings','sessionMappings')
        .leftJoinAndSelect('program.programBatch','programBatch')
        .leftJoinAndSelect('program.participantsList','participantsList')
        .getMany();

        allProgramInfo = await programWiseFeedbackRating(allProgramInfo);

        for (let i = 0; i < allProgramInfo.length; i++) {
          const programItem = allProgramInfo[i];
          programItem.sessionList =  await sessionWiseFeedbackRating(programItem.sessionList)
          programItem.noOfSessions = programItem.sessionList.length
          programItem.noOfParticipants = programItem.participantsList.length
          programItem.noOfBatches = programItem.programBatch.length

        }

        res.status(200).json(success('feedback report sent successfully', allProgramInfo , res.statusCode));
      } catch (err) {
        res.status(400).json(error(err.message, res.statusCode));
    }
  }

  public async billingReport(req: Request, res: IResponse): Promise<void> {
    try {
      let allBillingInfo:any = await getRepository(Programs)
        .createQueryBuilder('program')
        .where('program.subscriber_id = :subscriberId', { subscriberId: req.user })
        .leftJoinAndSelect('program.client','client')
        .leftJoinAndSelect('program.sessionList','sessionList')
        .leftJoinAndSelect('sessionList.sessionMappings','sessionMappings')
        .leftJoinAndSelect('program.programBatch','programBatch')
        .leftJoinAndSelect('program.participantsList','participantsList')
        .getMany();

      allBillingInfo = await programWiseFeedbackRating(allBillingInfo);

      for (let i = 0; i < allBillingInfo.length; i++) {
        const billingItem = allBillingInfo[i];
        billingItem.noOfSessions = billingItem.sessionList.length
        billingItem.noOfParticipants = billingItem.participantsList.length
        billingItem.noOfBatches = billingItem.programBatch.length

      }

      res.status(200).json(success('billing report sent successfully', allBillingInfo , res.statusCode));
    } catch (err) {
      res.status(400).json(error(err.message, res.statusCode));
    }
  }



}

const programController = ProgramController.get();

export { programController as ProgramController };
