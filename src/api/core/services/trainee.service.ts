/* eslint-disable @typescript-eslint/prefer-for-of */
/* eslint-disable @typescript-eslint/restrict-plus-operands */
/* eslint-disable prefer-arrow/prefer-arrow-functions */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Response } from 'express';
import { AuthTraineeService } from '@services/auth-trainee.service';
import { TraineeRepository } from '@repositories/trainee.repository';
import {
  getRepository,
  getCustomRepository,
  Between,
  LessThanOrEqual,
  MoreThanOrEqual,
  getManager,
} from 'typeorm';
import {
  IResponse,
  IUserRequest,
  ITraineeTokenOptions,
  ITokenOptions,
} from '@interfaces';
import { Trainee } from '@models/trainee.model';
import { Participants } from '@models/participants.model';
import { ProgramBatch } from '@models/program-batch.model';
import SessionMapping from '@models/session-mapping.model';
import * as Bcrypt from 'bcrypt';
import { Poll } from '@models/poll.model';
import { PollQuestion } from '@models/poll-question.model';
import { Programs } from '@models/programs.model';
import Sessions from '@models/sessions.model';
import { SessionSegment } from '@models/session_segment.model';
import { TraineeCompletedTask } from '@models/trainee_completed_tasks.model';
import { type } from 'os';
import { Trainee_notes } from '@models/trainee_notes.model';
const nodemailer = require('nodemailer');
const dayjs = require('dayjs');
import { error, success, success_with_error } from '@utils/common.util';
import { addNotification, sendOTPEmail, sendEmail, addPendingTask, generateOtp } from '../utils/common.util';
import { Pending_Tasks } from '@models/pendingTasks.model';
import { VTTRequestVO } from '../types/uiVOs/VTTRequestVO';

type OtpReq = {
  otp: string;
};

/**
 * @description
 */
class TraineeService {
  /**
   * @description
   */
  private static instance: TraineeService;

  private constructor() { }

  /**
   * @description
   */
  static get(): TraineeService {
    if (!TraineeService.instance) {
      TraineeService.instance = new TraineeService();
    }
    return TraineeService.instance;
  }


  async signUpUser(req: Trainee, res: Response): Promise<void> {
    let responseData;
    let token;
    const searchData = await getRepository(Trainee).findOne({
      where: { trainee_email: req.trainee_email },
    });
    if (!searchData) {
      const repository = getRepository(Trainee);
      const user = new Trainee(req as unknown as Record<string, unknown>);

      user.otp = generateOtp();
      // Code for sending OTP
      sendOTPEmail(user.trainee_email, user.trainee_name, user.otp).then(resp => {
        console.log(resp);
      }).catch(err => { })

      await repository.insert(user);
      token = await AuthTraineeService.generateTokenResponse(
        user,
        user.token()
      );
      responseData = { token, user };

      // edit by jaskirat and abhishek on call 07-11-2022
    } else if (searchData && searchData.is_verify_otp == true) {
      if (searchData.trainee_email === req.trainee_email) {
        res.status(200).json(success_with_error('User already present', {}, res.statusCode));
      }

      // edit by jaskirat and abhishek on call 07-11-2022  === to ==
    } else if (searchData && searchData.is_verify_otp == false) {
      searchData.otp = generateOtp();
      sendOTPEmail(searchData.trainee_email, searchData.trainee_name, searchData.otp).then(resp => {
        console.log(resp);
      }).catch(err => { })
      await getRepository(Trainee).save(searchData);

      token = await AuthTraineeService.generateTokenResponse(
        searchData,
        searchData.token()
      );
      responseData = { token, user: searchData };

      // Added by jaskirat and abhishek on call 07-11-2022
      res.status(200).json(success_with_error('please complete otp verification with this mail ID', responseData, res.statusCode));


      res.end();
    }
    res.status(200).json(success('', responseData, res.statusCode));
  }

  async verifyEmailOTP(
    req: OtpReq,
    res: Response,
    traineeId: number
  ): Promise<void> {
    const searchData = await getRepository(Trainee).findOne({
      where: { id: traineeId, otp: req.otp },
    });
    console.log('trainee ID ', traineeId, 'OTP ',  req.otp)
    if (searchData !== undefined) {
      const notificationContent = JSON.stringify({
        type: 'profile_completion_reminder'
      })
      const trainee: Trainee = await getRepository(Trainee).findOne({
        where: {
          id: traineeId, otp: req.otp
        }
      })
      trainee.is_verify_otp = true;
      await getRepository(Trainee).save(trainee);
      await addNotification(traineeId , 6, notificationContent);
      await addPendingTask(traineeId, 6, notificationContent, 7);
      const welcomeContent = `welcome ${searchData.trainee_name}, we are delighted to have you as a participant.`
      await sendEmail(searchData.trainee_email, welcomeContent);
      const response = { error: false, success: true };
      res.status(200).json(success('OTP verified successfully.', {response}, res.statusCode));
    } else {
      const response = { error: true, success: false };
      res.status(400).json(success_with_error('Invalid OTP.', {response}, res.statusCode));
    }
  }

  async resendOTP(
    req: OtpReq,
    res: Response,
    trainee_id: Express.User
  ): Promise<{ response } | Error> {
    const traineeRepo = getRepository(Trainee);
    const searchData = await traineeRepo.findOne({ where: { id: trainee_id } });
    let response = {};
    if (searchData !== undefined) {
      const otp: number = generateOtp();

      await sendOTPEmail(searchData.trainee_email, searchData.trainee_name, otp);

      searchData.otp = otp;
      await traineeRepo.save(searchData);
      response = {
        error: false,
        success: true,
      };
    } else {
      response = {
        error: true,
        success: false,
      };
    }
    return { response };
  }


  async loginUser(req: VTTRequestVO, res: IResponse): Promise<{ response } | Error> {
    let token;

    try {
      const searchData = await getRepository(Trainee).findOne({
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        where: { trainee_email: req.body.trainee_email },
      });

      let strErrorMessage = '';
      if (searchData === undefined) {
        res.status(400).json(error('please enter a valid mail ID', res.statusCode));
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore

      } else if (req.body.trainee_email && await searchData.passwordMatches(req.body.trainee_password) === false) {
          res.status(400).json(error('please enter a valid password', res.statusCode));
          return;
      } else if (searchData && searchData.is_verify_otp === false) {
          strErrorMessage = 'please complete otp verification with this mail ID';
          const otp: number = generateOtp();
          searchData.otp = otp;
          await getRepository(Trainee).save(searchData);
          sendOTPEmail(searchData.trainee_email, searchData.trainee_name, otp).then(resp => {}).catch(err => {
            console.log('Error occured while sending OTP', err);
          });
      }

      const repository = getCustomRepository(TraineeRepository);
      const { user, accessToken } = await repository.findAndGenerateToken(
        req.body as unknown as ITraineeTokenOptions
      );

      token = await AuthTraineeService.generateTokenResponse(user, accessToken);

      if (strErrorMessage.length > 0) {
        res.status(200).json(success_with_error(strErrorMessage, { token, user }, res.statusCode));
        return;
      }

      res.status(200).json(success("", { token, user }, res.statusCode));
      return;
    } catch (e) {
      res.status(400).json(success('Error occured while processing', {}, res.statusCode));
    }
  }

  async loginOrSignUp(
    req: Trainee,
    res: Response
  ): Promise<{ response } | Error> {
    let responseData;
    let token;
    const searchData = await getRepository(Trainee).findOne({
      where: {
        social_media_id: req.social_media_id,
        social_media_type: req.social_media_type,
      },
    });
    if (
      searchData != undefined &&
      searchData.social_media_type == req.social_media_type &&
      searchData.social_media_id == req.social_media_id
    ) {
      const repository = getCustomRepository(TraineeRepository);
      const { user, accessToken } = await repository.findAndGenerateSocialToken(
        req as unknown as ITraineeTokenOptions
      );
      token = await AuthTraineeService.generateSocialTokenResponse(
        user,
        accessToken
      );
      responseData = { token, user };
      res.locals.data = { token, user };
    } else {
      const repository = getRepository(Trainee);
      const user = new Trainee(req as unknown as Record<string, unknown>);
      await repository.insert(user);
      token = await AuthTraineeService.generateSocialTokenResponse(
        user,
        user.token()
      );
      responseData = token;
      res.locals.data = { token, user };
    }

    let response = {};
    if (true) {
      response = {
        error: false,
        success: true,
        data: responseData,
      };
    } else {
      response = {
        error: true,
        success: false,
      };
    }
    return { response };
  }

  async addPollDetail(data: Poll): Promise<{ response } | Error> {
    let updateData;
    const updateVal = data;
    data.questions.forEach(async function (data) {
      updateData = await getRepository(PollQuestion).save(data);
    });
    delete updateVal.questions;
    updateData = await getRepository(Poll).save(data);
    let response = {};
    if (updateData) {
      response = {
        error: false,
        success: true,
        data,
      };
    } else {
      response = {
        error: true,
        success: false,
      };
    }
    return { response };
  }

  async searchPollDetail(data: Poll): Promise<{ response } | Error> {
    const updateData = await getRepository(Poll).find({ where: { id: data.id } });
    const questions = await getRepository(PollQuestion).find({
      where: { poll_id: data.id },
    });
    // let responseData = {};
    const responseData = updateData[0];
    responseData.questions = questions;
    let response = {};
    if (updateData) {
      response = {
        error: false,
        success: true,
        data: responseData,
      };
    } else {
      response = {
        error: true,
        success: false,
      };
    }
    return { response };
  }

  async searchDetailsbyId(id): Promise<{ response } | Error> {
    const searchData = await getManager()
      .createQueryBuilder(Trainee, 'trainee')
      .where(`trainee.id='${id}'`)
      .select('sessionMapping.id', 'session_map_id')
      .addSelect('sessionMapping.trainerId', 'trainerId')
      .addSelect('sessionMapping.session_start_time', 'session_start_time')
      .addSelect('sessionMapping.session_end_time', 'session_end_time')
      .addSelect('sessionMapping.sessionId', 'sessionId')
      .addSelect('sessionMapping.session_start_date', 'session_start_date')
      .addSelect('sessionMapping.session_end_date', 'session_end_date')
      .addSelect('sessionMapping.status', 'status')
      .addSelect('sessionMapping.batchId', 'batchId')
      .addSelect('sessionMapping.sessionPlanLogId', 'sessionPlanLogId')
      .innerJoin(
        Participants,
        'participants',
        'trainee.trainee_email = participants.email'
      )
      .innerJoin(
        SessionMapping,
        'sessionMapping',
        'participants.batchId = sessionMapping.batchId'
      )
      .getRawMany();
    let response = {};
    if (searchData) {
      response = {
        error: false,
        success: true,
        data: searchData,
      };
    } else {
      response = {
        error: true,
        success: false,
      };
    }
    return { response };
  }

  async searchDetailsDate(req): Promise<{ response } | Error> {
    const searchData = await getManager()
      .createQueryBuilder(Trainee, 'trainee')
      .where(`trainee.id='${req.user}'`)
      .andWhere(
        `sessionMapping.session_start_date >= '${req.body.session_start_date}' AND sessionMapping.session_end_date <= '${req.body.session_end_date}'`
      )
      .addSelect('sessionMapping.id', 'session_map_id')
      .addSelect(
        'CAST(sessionMapping.session_start_date AS char)',
        'session_start_date'
      )
      .addSelect(
        'CAST(sessionMapping.session_end_date AS char)',
        'session_end_date'
      )
      .addSelect('sessionMapping.session_start_time', 'session_start_time')
      .addSelect('sessionMapping.session_end_time', 'session_end_time')
      .addSelect('sessionMapping.status', 'status')
      .addSelect('sessionMapping.trainerId', 'trainerId')
      .addSelect('sessionMapping.sessionPlanLogId', 'sessionPlanLogId')
      .addSelect('session.id', 'session_id')
      .addSelect('session.session_name', 'session_name')
      .addSelect('session.programId', 'programId')
      .addSelect('Programs.program_name', 'program_name')
      .innerJoin(
        Participants,
        'participants',
        'trainee.trainee_email = participants.email'
      )
      .innerJoin(
        SessionMapping,
        'sessionMapping',
        'participants.batchId = sessionMapping.batchId'
      )
      .innerJoin(
        ProgramBatch,
        'programBatch',
        'sessionMapping.batch = programBatch.id'
      )
      .innerJoin(
        Sessions,
        'session',
        'session.programId = programBatch.programId'
      )
      .innerJoin(Programs, 'Programs', 'session.programId = Programs.id')
      .getRawMany();

    // console.log(searchData);

    const finalData = [];
    for (const element of searchData) {
      const obj = {
        session_map_id: element.session_map_id,
        session_start_date: element.session_start_date,
        session_end_date: element.session_end_date,
        session_start_time: element.session_start_time,
        session_end_time: element.session_end_time,
        status: element.status,
        trainerId: element.trainerId,
        sessionPlanLogId: element.sessionPlanLogId,
        session: {
          session_id: element.session_id,
          event_name: element.session_name,
          programId: element.programId,
          program_name: element.program_name,
        },
      };
      finalData.push(obj);
    }
    let response = {};
    if (searchData) {
      response = {
        error: false,
        success: true,
        data: finalData,
      };
    } else {
      response = {
        error: true,
        success: false,
      };
    }
    return { response };
  }

  async upcomingEventDetail(req: VTTRequestVO): Promise<{ response } | Error> {
    const todayDate: string = dayjs().format('YYYY-MM-DD');

    const searchData = await getManager()
      .createQueryBuilder(Trainee, 'trainee')
      .where(`trainee.id='${req.user}'`)
      .andWhere(`sessionMapping.session_start_date >= '${todayDate}'`)
      .andWhere('sessionMapping.status = \'Scheduled\'')
      .addSelect('sessionMapping.id', 'session_map_id')
      .addSelect(
        'CAST(sessionMapping.session_start_date as char)',
        'session_start_date'
      )
      .addSelect(
        'CAST(sessionMapping.session_end_date as char)',
        'session_end_date'
      )
      .addSelect('sessionMapping.session_start_time', 'session_start_time')
      .addSelect('sessionMapping.session_end_time', 'session_end_time')
      .addSelect('sessionMapping.status', 'status')
      .addSelect('sessionMapping.trainerId', 'trainerId')
      .addSelect('sessionMapping.sessionPlanLogId', 'sessionPlanLogId')
      .addSelect('session.id', 'session_id')
      .addSelect('session.session_name', 'session_name')
      .addSelect('session.programId', 'programId')
      .addSelect('Programs.program_name', 'program_name')
      .innerJoin(
        Participants,
        'participants',
        'trainee.trainee_email = participants.email'
      )
      .innerJoin(
        SessionMapping,
        'sessionMapping',
        'participants.batchId = sessionMapping.batchId'
      )
      .innerJoin(
        ProgramBatch,
        'programBatch',
        'sessionMapping.batch = programBatch.id'
      )
      .innerJoin(
        Sessions,
        'session',
        'session.programId = programBatch.programId'
      )
      .innerJoin(Programs, 'Programs', 'session.programId = Programs.id')
      .orderBy('sessionMapping.session_start_date', 'ASC')
      .orderBy('session.id', 'ASC')
      .getRawOne();

    const finalData = [];
    if (searchData) {
      const obj = {
        session_map_id: searchData.session_map_id,
        session_start_date: searchData.session_start_date,
        session_end_date: searchData.session_end_date,
        session_start_time: searchData.session_start_time,
        session_end_time: searchData.session_end_time,
        status: searchData.status,
        trainerId: searchData.trainerId,
        sessionPlanLogId: searchData.sessionPlanLogId,
        session: {
          session_id: searchData.session_id,
          event_name: searchData.session_name,
          programId: searchData.programId,
          program_name: searchData.program_name,
        },
      };
      finalData.push(obj);
    }

    let response = {};
    if (searchData) {
      response = {
        error: false,
        success: true,
        data: finalData,
      };
    } else {
      response = {
        error: true,
        success: false,
      };
    }
    return { response };
  }

  // async dashboardDetailsOverview(req): Promise<{ response } | Error> {
  //   console.log('req.user', req.user)
  //   const searchData = await getManager()
  //     .createQueryBuilder(Trainee, 'trainee')
  //   // const searchData = await getRepository(Trainee)
  //   //   .createQueryBuilder('trainee')
  //     .where(`trainee.id='${req.user}'`)
  //     // .where('trainee.id = :id', { id: req.user })
  //     .select('participants.batchId', 'batchId')
  //     .addSelect('sessionMapping.status', 'status')
  //     // .andWhere('sessionMapping.status=\'Completed\'')
  //     .addSelect('sessionMapping.session_start_time', 'session_start_time')
  //     .addSelect('sessionMapping.session_end_time', 'session_end_time')
  //     .innerJoin(
  //       Participants,
  //       'participants',
  //       'trainee.trainee_email = participants.email'
  //     )
  //     .innerJoin(
  //       SessionMapping,
  //       'sessionMapping',
  //       'participants.batchId = sessionMapping.batchId'
  //     )
  //     .getRawMany();

  //     console.log('searchData', searchData)

  //   let finalData,
  //     noOfPrograms = 0,
  //     noOfSessions = 0;
  //   var sumHours = 0;
  //   for (const element of searchData) {
  //     var date1 = new Date('May 1,2019' + ' ' + element.session_start_time);
  //     var date2 = new Date('May 1,2019' + ' ' + element.session_end_time);

  //     var Difference_In_Time = date2.getTime() - date1.getTime();

  //     sumHours = sumHours + Difference_In_Time;

  //     if (element.batchId) {
  //       noOfPrograms = noOfPrograms + 1;
  //     }
  //     if (element.status) {
  //       noOfSessions = noOfSessions + 1;
  //     }
  //   }

  //   // To   calculate the no. of days between two dates
  //   var hoursDifference = Math.floor(sumHours / 1000 / 60 / 60);
  //   sumHours -= hoursDifference * 1000 * 60 * 60;
  //   var minutesDifference = Math.floor(sumHours / 1000 / 60);
  //   sumHours -= minutesDifference * 1000 * 60;

  //   finalData = {
  //     no_of_programs: noOfPrograms,
  //     no_of_sessions: noOfSessions,
  //     no_of_learning_hours: hoursDifference + ':' + minutesDifference,
  //     badges: 0
  //   //  TO DO add logic for badges
  //   };

  //   let response: {};
  //   if (finalData) {
  //     response = {
  //       error: false,
  //       success: true,
  //       data: finalData,
  //     };
  //   } else {
  //     response = {
  //       error: true,
  //       success: false,
  //     };
  //   }
  //   return { response };
  // }

  async dashboardDetailsOverview(req): Promise<{ response } | Error> {
    const finalData = {
      no_of_programs: 0,
      no_of_sessions: 0,
      no_of_learning_hours: '',
      badges: 0,
    };
    const traineeInfo = await getRepository(Trainee)
      .createQueryBuilder('trainee')
      .where('trainee.id = :id', { id: req.user })
      .getOne();

    const partInfo = await getRepository(Participants)
      .createQueryBuilder('participant')
      .select('participant.programId')
      .addSelect('participant.batchId')
      .where('participant.email = :id', { id: traineeInfo.trainee_email })
      .getRawMany();

    const programIdList: any = new Set();
    const batchIdList: any = new Set();

    for (let i = 0; i < partInfo.length; i++) {
      const partItem = partInfo[i];
      programIdList.add(partItem.programId);
      batchIdList.add(partItem.batchId);
    }
    const programIdStr = [...programIdList].join(',');
    const batchIdStr = [...batchIdList].join(',');

    finalData.no_of_programs = [...programIdList].length;
    let sessionCount = 0;
    if(programIdStr.length > 0){
      sessionCount = await getRepository(Sessions)
      .createQueryBuilder('session')
      .where(`session.programId IN (${programIdStr})`)
      .getCount();
    }
    finalData.no_of_sessions = sessionCount;

    let sessionMappingInfo = [];
    if(batchIdStr.length > 0){
      sessionMappingInfo = await getRepository(SessionMapping)
      .createQueryBuilder('sessionMap')
      .where(`sessionMap.batchId IN (${batchIdStr})`)
      .getMany();
    }
    let differenceInMinutes = 0;

    for (const sessionMapItem of sessionMappingInfo) {
      let date1: any = new Date('May 1,2019' + ' ' + sessionMapItem.session_start_time);
      let date2: any = new Date('May 1,2019' + ' ' + sessionMapItem.session_end_time);

      date1 = dayjs(date1);
      date2 = dayjs(date2);
      const difference = date2.diff(date1, 'minute');

      differenceInMinutes += difference;
    }

    const hoursDiff = Math.floor(differenceInMinutes / 60);
    const minutesDiff = differenceInMinutes % 60;

    finalData.no_of_learning_hours = hoursDiff + ':' + minutesDiff;


    let response = {};
    if (finalData) {
      response = {
        error: false,
        success: true,
        data: finalData,
      };
    } else {
      response = {
        error: true,
        success: false,
      };
    }
    console.log('returnng response')
    return { response };

  }

  async pendingTaskList(req): Promise<{ response } | Error> {

    const x = await getManager().query(
      'SET SESSION sql_mode=(SELECT REPLACE(@@sql_mode,\'ONLY_FULL_GROUP_BY\',\'\'))'
    );

    const filterData = await getManager()
      .createQueryBuilder(Trainee, 'trainee')
      .where(`trainee.id='${req.user}'`)
      .andWhere('SessionSegment.is_deleted=0')
      .andWhere('SessionSegment.type IN(\'Pre\',\'Post\')')
      .andWhere('SessionSegment.session_plan_status = \'Pending\'')
      .andWhere('(TraineeCompletedTask.trainee_id != :userId OR TraineeCompletedTask.trainee_id IS NULL) ', { userId: req.user })
      // redo true
      // .orWhere('TraineeCompletedTask.trainee_id = :id AND TraineeCompletedTask.redo = \'true\'', { id: req.user })
      .orWhere('TraineeCompletedTask.trainee_id = :id AND TraineeCompletedTask.redo = :redo', { id: req.user, redo: true })
      .select('SessionSegment.id', 'id')
      .addSelect('SessionSegment.title', 'title')
      .addSelect('CAST(SessionMapping.session_start_date AS char)', 'session_start_date')
      .addSelect('CAST(SessionMapping.session_end_date AS char)', 'session_end_date')
      .addSelect('SessionSegment.description', 'description')
      .addSelect('SessionSegment.duration', 'duration')
      .addSelect('SessionSegment.start_time', 'start_time')
      .addSelect('SessionSegment.end_time', 'end_time')
      .addSelect('SessionSegment.type', 'type')
      .addSelect('SessionSegment.sessionId', 'sessionId')
      .addSelect('SessionSegment.media_attachment_ids', 'media_attachment_ids')
      .addSelect('SessionSegment.media_attachment', 'media_attachment')
      .addSelect('SessionSegment.is_deleted', 'is_deleted')
      .addSelect('SessionSegment.activity_type', 'activity_type')
      .addSelect('SessionSegment.activity_data', 'activity_data')
      .addSelect('SessionSegment.session_plan_status', 'session_plan_status')
      .addSelect('Sessions.session_name', 'session_name')
      .innerJoin(Participants, 'participants', 'trainee.trainee_email = participants.email')
      .innerJoin(SessionMapping, 'SessionMapping', 'SessionMapping.batchId = participants.batchId')
      .innerJoin(Sessions, 'Sessions', 'participants.programId = Sessions.programId')
      .innerJoin(SessionSegment, 'SessionSegment', 'Sessions.id = SessionSegment.sessionId')
      .leftJoin(TraineeCompletedTask, 'TraineeCompletedTask', 'SessionSegment.id = TraineeCompletedTask.session_segment_id')
      // .distinct(true)
      .groupBy('SessionSegment.id')
      .getRawMany();

    console.log(filterData.length, 'total length')

    const formattedData = [];
    filterData.map((item, index) => {
      let due_date = '';
      if (item.activity_data !== null) {
        const activity_data_obj = JSON.parse(item.activity_data);
        due_date = activity_data_obj.submission_date;
        if (due_date === undefined) {
          due_date = activity_data_obj.activity_submission_date;
        }

        if (due_date === undefined) {
          due_date = '';
        }
        const sessDate = dayjs(item.session_start_date)
        const shareInDays = activity_data_obj.share_work_in_days;
        if (shareInDays) {
          if (sessDate.diff(dayjs(new Date()), 'day') <= shareInDays) {
            formattedData.push(item);
          } else {
            // Do not push
          }
        } else {
          formattedData.push(item)
        }
      }
      item.due_date = due_date;
    });
    // formattedData.sort(function (a, b) {
    //   a = new Date(a.due_date === '' ? '2100-01-01' : a.due_date);
    //   b = new Date(b.due_date === '' ? '2100-01-01' : b.due_date);
    //   return b > a ? -1 : a < b ? 1 : 0;
    // });

    // const traineePendingTask = await getRepository(Pending_Tasks).createQueryBuilder('pendingtask')
    //             .where('pendingtask.user_type = :user_type', {user_type: 6})
    //             .andWhere('pendingtask.pertain_to =:pertain_to',{pertain_to:req.user})
    //             .getMany();

    let response = {};
    if (filterData) {
      response = {
        error: false,
        success: true,
        data: formattedData
      };
    } else {
      response = {
        error: true,
        success: false,
      };
    }
    return { response };
  }

  async allTasksList(req): Promise<{ response } | Error> {

    const x = await getManager().query(
      'SET SESSION sql_mode=(SELECT REPLACE(@@sql_mode,\'ONLY_FULL_GROUP_BY\',\'\'))'
    );

    const filterData = await getManager()
      .createQueryBuilder(Trainee, 'trainee')
      .where(`trainee.id='${req.user}'`)
      .andWhere('SessionSegment.is_deleted=0')
      .andWhere('SessionSegment.type IN(\'Pre\',\'Post\')')
      .andWhere('SessionSegment.session_plan_status = \'Pending\'')
      .select('SessionSegment.id', 'id')
      .addSelect('SessionSegment.title', 'title')
      .addSelect('TraineeCompletedTask.id', 'completed_task_id')
      .addSelect('CAST(SessionMapping.session_start_date AS char)', 'session_start_date')
      .addSelect('CAST(SessionMapping.session_end_date AS char)', 'session_end_date')
      .addSelect('SessionSegment.description', 'description')
      .addSelect('SessionSegment.duration', 'duration')
      .addSelect('SessionSegment.start_time', 'start_time')
      .addSelect('SessionSegment.end_time', 'end_time')
      .addSelect('SessionSegment.type', 'type')
      .addSelect('SessionSegment.sessionId', 'sessionId')
      .addSelect('SessionSegment.media_attachment_ids', 'media_attachment_ids')
      .addSelect('SessionSegment.media_attachment', 'media_attachment')
      .addSelect('SessionSegment.is_deleted', 'is_deleted')
      .addSelect('SessionSegment.activity_type', 'activity_type')
      .addSelect('SessionSegment.activity_data', 'activity_data')
      .addSelect('SessionSegment.session_plan_status', 'session_plan_status')
      .addSelect('Sessions.session_name', 'session_name')
      .innerJoin(
        Participants,
        'participants',
        'trainee.trainee_email = participants.email'
      )
      .innerJoin(
        SessionMapping,
        'SessionMapping',
        'SessionMapping.batchId = participants.batchId'
      )
      .innerJoin(
        Sessions,
        'Sessions',
        'participants.programId = Sessions.programId'
      )
      .innerJoin(
        SessionSegment,
        'SessionSegment',
        'Sessions.id = SessionSegment.sessionId'
      )
      .leftJoin(
        TraineeCompletedTask,
        'TraineeCompletedTask',
        'SessionSegment.id = TraineeCompletedTask.session_segment_id'
      )
      .groupBy('SessionSegment.id')
      .getRawMany();

    // console.log(filterData.length);

    const formattedData = [];
    filterData.map((item, index) => {
      let due_date = '';
      if (item.activity_data !== null) {
        const activity_data_obj = JSON.parse(item.activity_data);
        due_date = activity_data_obj.submission_date;
        if (due_date === undefined) {
          due_date = activity_data_obj.activity_submission_date;
        }

        if (due_date === undefined) {
          due_date = '';
        }
      }
      item.due_date = due_date;
      formattedData.push(item);
    });
    formattedData.sort(function (a, b) {
      a = new Date(a.due_date === '' ? '2100-01-01' : a.due_date);
      b = new Date(b.due_date === '' ? '2100-01-01' : b.due_date);
      return b > a ? -1 : a < b ? 1 : 0;
    });
    console.log(formattedData.length);


    let response = {};
    if (filterData) {
      response = {
        error: false,
        success: true,
        data: formattedData,
      };
    } else {
      response = {
        error: true,
        success: false,
      };
    }


    return { response };
  }

  async createTraineeNotesDetail(req: Trainee_notes, res: Response, trainee_id): Promise<{ response } | Error> {
    let responseData;
    const todaysDate = dayjs().format('YYYY-MM-DD HH:mm:ss');
    // console.log(todaysDate);
    // console.log(req);


    const noteData = await getRepository(Trainee_notes).findOne({
      where: { id: req.id },
    });

    if (noteData) {
      noteData.notes = req.notes;
      noteData.trainee_id = trainee_id;
      noteData.created_at = todaysDate;
      await getRepository(Trainee_notes).save(noteData);
      responseData = noteData;
    } else {
      const traineeNote = new Trainee_notes();
      traineeNote.notes = req.notes;
      // traineeNote.trainee_id = trainee_id;
      traineeNote.trainee_id = parseInt(trainee_id);
      traineeNote.created_at = todaysDate;
      await getRepository(Trainee_notes).insert(traineeNote);
      responseData = traineeNote;
    }
    // await getRepository(Trainee_notes).insert(user);

    let response = {};
    if (true) {
      response = {
        error: false,
        success: true,
        data: responseData
      };
    } else {
      response = {
        error: true,
        success: false,
      };
    }
    return { response };
  }

  async deleteTraineeNotesDetail(req: Trainee_notes, res: Response): Promise<{ response } | Error> {

    let responseData;

    const note = await getRepository(Trainee_notes).findOne({
      where: { id: req.id },
    });
    if (note) {
      await getRepository(Trainee_notes).delete(note);
    } else { }

    let response = {};
    if (true) {
      response = {
        error: false,
        success: true,
        data: responseData,
      };
    } else {
      response = {
        error: true,
        success: false,
      };
    }
    return { response };
  }


}

const traineeService = TraineeService.get();

export { traineeService as TraineeService };
