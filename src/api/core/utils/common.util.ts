/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable eqeqeq */
/* eslint-disable prefer-arrow/prefer-arrow-functions */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/prefer-for-of */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-shadow */
const nodemailer = require('nodemailer');
import { getRepository } from 'typeorm';
import { Notification } from '../models/Notification.model';
import { Pending_Tasks } from '@models/pendingTasks.model';
import { SessionSegment } from '@models/session_segment.model';
import * as dayjs from 'dayjs';
import { Trainee } from '@models/trainee.model';
import { Participants } from '@models/participants.model';
import  SessionMapping  from '@models/session-mapping.model'
import { Ratings } from '@models/ratings.model'


const commonAPIHandler = (data: object): object => {
  return {}
}

const success = (message, data, statusCode) => {
  return {
    error: false,
    message,
    code: statusCode,
    data
  };
};


const success_with_error = (message, data, statusCode) => {
  return {
    error: true,
    message,
    code: statusCode,
    data
  };
};


const error = (message, statusCode) => {
  // List of common HTTP request code
  const codes = [200, 201, 400, 401, 404, 403, 422, 500];

  // Get matched code
  // eslint-disable-next-line eqeqeq
  const findCode = codes.find((code) => code == statusCode);

  if (!findCode) statusCode = 500;
  else statusCode = findCode;

  return {
    error: true,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    message,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    code: statusCode

  };
};

export async function sendEmail(email: string, mailContent: string): Promise<any> {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    auth: {
      user: 'ahom.scrapmail1@gmail.com',
      pass: 'puduymigpcgpcsum',
    },
  });

  const info = await transporter.sendMail({
    from: '"ahom scrapmail" <ahom.scrapmail1.com>', // sender address
    to: `${email}`, // list of receivers
    subject: 'vtt mail', // Subject line
    text: mailContent, // plain text body
    //  html: `<b>hello ${user.trainee_name} howz going, your otp is ${user.otp} :)</b>`, // html body
  });

  console.log('out log, mail sent,',email);

}

export function generateOtp() {
    // otp generated here
    let otp = Math.floor(Math.random() * 10000);
    if (otp < 1000) otp += 1000;
    return otp;
}


export async function sendOTPEmail(email: string, name: string, otp: number): Promise<any> {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    auth: {
      user: 'ahom.scrapmail1@gmail.com',
      pass: 'puduymigpcgpcsum',
    },
  });

  const info = await transporter.sendMail({
    from: '"ahom scrapmail" <ahom.scrapmail1.com>', // sender address
    to: `${email}`, // list of receivers
    subject: 'Your VTT OTP to verify email.', // Subject line
    text: `Dear ${name}, your OTP to verify your email id is ${otp}.`, // plain text body
    //  html: `<b>hello ${user.trainee_name} howz going, your otp is ${user.otp} :)</b>`, // html body
  });
}


export async function addNotification (pertain_to:number,user_type:any,content:string ,task_id?:number){

    const newNotification = new Notification();

    newNotification.pertain_to = pertain_to;
    newNotification.user_type = user_type;
    newNotification.content = content;
    newNotification.task_id = task_id;

    await getRepository(Notification).insert(newNotification);


}


export async function addPendingTask (pertain_to:number,user_type:any,content:string,type:number){

  const newPendingTask = new Pending_Tasks();

  newPendingTask.pertain_to = pertain_to;
  newPendingTask.user_type = user_type;
  newPendingTask.content = content;
  newPendingTask.type = type;

  await getRepository(Pending_Tasks).insert(newPendingTask);


}

export async function findActivitySubmissionDate(trainee_id:number, sessSegmentId:number){

    try{

    let activity_submission_date
    let submission_in_days

    const traineeInfo = await getRepository(Trainee)
    .findOne({
      where: {
          id : trainee_id
      }
    })
    const participantInfo = await getRepository(Participants)
      .createQueryBuilder('participant')
      .where('participant.email = :mailId',{ mailId : traineeInfo.trainee_email})
      .leftJoinAndSelect('participant.batch','batch')
      .getMany();

    const allActivityData = await getRepository(SessionSegment)
      .createQueryBuilder('sessSegment')
      .where('sessSegment.id = :id', { id: sessSegmentId })
      .leftJoinAndSelect('sessSegment.session','session')
      .leftJoinAndSelect('session.program','program')
      .leftJoinAndSelect('program.programBatch','programBatch')
      .getOne();

    const sessionMappingRawInfo = await getRepository(SessionMapping)
      .createQueryBuilder('sessionMapping')
      .where('sessionMapping.sessionId = :sId',{ sId : allActivityData.session.id})
      .leftJoinAndSelect('sessionMapping.trainer','trainer')
      .leftJoinAndSelect('sessionMapping.batch','batch')
      .getMany();

    let sessionMappingInfo;

      for (let i = 0; i < participantInfo.length; i++) {
        const participantItem = participantInfo[i];
        console.log(159,'participantItem.batch.id', participantItem.batch.id)
        for (let j = 0; j < sessionMappingRawInfo.length; j++) {
          const sessMapItem = sessionMappingRawInfo[j];
          if(sessMapItem.batchId === participantItem.batch.id){
            sessionMappingInfo = sessMapItem
          }

        }
      }

    const session_start_date = sessionMappingInfo.session_start_date;

    const activityData = JSON.parse(allActivityData.activity_data)

    const val = allActivityData.activity_type as unknown as number;

    if(allActivityData.type == 'Pre' || allActivityData.type == 'Post'){

      if(val == 21 || val == 15){
        activity_submission_date = activityData.submission_date
      } else if (val == 22 || val == 16){
        activity_submission_date = activityData.completionDate
      }else if (val == 18 || val == 19 || val == 20 || val == 23){
        // pre work activity submission date calculation

        submission_in_days = activityData.activity_submission_date as number;
        const startDate = dayjs(session_start_date)
        activity_submission_date = startDate.subtract(submission_in_days, 'day').toDate().toISOString();

      }else if (val == 12 || val == 13 || val == 14 || val == 17){
        // post work activity submission date calculation

        submission_in_days = activityData.activity_submission_date as number;
        const startDate = dayjs(session_start_date)
        activity_submission_date = startDate.add(submission_in_days, 'day').toDate().toISOString();

      }
    }
    return {allActivityData, activityData, sessionMappingInfo, participantInfo, activity_submission_date};

    }catch(error){
      console.log('error', error)
    }
}


export async function programWiseFeedbackRating(programList:any){
  try {
      for (let i = 0; i < programList.length; i++) {
        const programItem = programList[i];
        let average_program_rating = await getRepository(Ratings)
            .createQueryBuilder('rating')
            .where('rating.program_id = :id', { id: programItem.id })
            .select('AVG(rating.program_rating)','average_program_rating')
            .getRawOne();

        average_program_rating = Number(average_program_rating.average_program_rating)
        average_program_rating = average_program_rating.toFixed(1)

        programItem.average_program_rating = average_program_rating
      }

      return programList ;

  } catch (error) {
    console.log('error', error)
  }
}

export async function sessionWiseFeedbackRating(sessionList:any){
  try {

      for (let i = 0; i < sessionList.length; i++) {
        const sessionItem = sessionList[i];
        let average_session_rating = await getRepository(Ratings)
            .createQueryBuilder('rating')
            .where('rating.session_id = :id', { id: sessionItem.id })
            .select('AVG(rating.session_rating)','average_session_rating')
            .getRawOne();
            average_session_rating = Number(average_session_rating.average_session_rating)
            average_session_rating = average_session_rating.toFixed(1)

        sessionItem.average_session_rating = average_session_rating
      }

      return sessionList ;

  } catch (error) {
    console.log('error', error)
  }
}



export { success, error, success_with_error };
