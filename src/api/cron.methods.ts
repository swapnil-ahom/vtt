import { getRepository, Brackets, getManager, Any, MoreThan, LessThan } from "typeorm";
import * as dayjs from "dayjs";
import { addNotification, addPendingTask, sendEmail } from "@utils/common.util";
import { Participants } from "@models/participants.model";
import SessionMapping from "@models/session-mapping.model";
import { SessionSegment } from "@models/session_segment.model";
import { TraineeCompletedTask } from '@models/trainee_completed_tasks.model';
import { Trainee } from "@models/trainee.model";
import { Notification } from "@models/Notification.model";
import { Subscription_Features } from "@models/subscription.features.model"
import { User } from "@models/user.model"
import { Programs } from '@models/programs.model';
import {SESSION_TYPE_ENUMS} from "@enums/session-type.enum";

export async function preWorkCronFunction() {
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
            .createQueryBuilder('particitants')
            .where(`particitants.batchId = '${allMapItem.batchId}'`)
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
                    // console.log(1159,'addNotification',traineeInfo.id,6,1159);
                    

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
            
                await addNotification(allMapItem.trainer.subscriber_id,1,notificationContent, activityItem.id);
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
                            // console.log(1257);
                            
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

    } catch (err) {
        console.log(err);
    }

}

export async function postWorkCronFunction() {
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
            .createQueryBuilder('particitants')
            .where(`particitants.batchId = '${allMapItem.batchId}'`)
            .getMany();
        
        allMapItem.participants = participantData;


        let n;

        for (let j = 0; j < activityData.length; j++) {
            const activityItem = activityData[j];
            let activity_data = JSON.parse(activityItem.activity_data)

            // console.log(1177,'activity_data', activity_data,1177)
            if(activity_data.share_work === 1 && dayjs(todaysDate).isSame(allMapItem.session_start_date, 'day')){
                console.log(1469,dayjs(todaysDate).isSame(allMapItem.session_start_date, 'day'),1469);
                
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
                // console.log(1527);
                
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
                            // console.log(1577);
                            
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
                // console.log(1280);
                
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

    } catch (err) {
       console.log(err);
   }
}

export async function changeInSubscriptionPlan() {
    try {
        // if is updated column and todays date are same , add notification and email to subscriber-superAdmin-admin
        //Trigger Point 6

        let todaysDate = dayjs().format("YYYY-MM-DD HH:mm:ss");
            
            let subFeaturesData = await getRepository(Subscription_Features)
                .createQueryBuilder('subFeature')
                .leftJoinAndSelect('subFeature.subscription','subscription')
                .getMany();
            
            subFeaturesData.forEach(async feature => {
               
                if(dayjs(todaysDate).isSame(feature.updatedAt, 'day') || dayjs(todaysDate).isSame(feature.createdAt, 'day')){
                    // getting this feature details here 

                    let subscriberList = await getRepository(User)
                        .createQueryBuilder('user')
                        .where("user.subscriptionId = :id", {id : feature.subscription.id})
                        .getMany();

                    subscriberList.forEach(subscriber =>{
                        let mailContent 
                        if(dayjs(todaysDate).isSame(feature.updatedAt, 'day')){
                            mailContent = `dear user : ${subscriber.fullname}, feature : ${feature.feature_name}, is new updated feature in your subscription plan.`
                        }
                        if(dayjs(todaysDate).isSame(feature.createdAt, 'day')){
                            mailContent = `dear user : ${subscriber.fullname}, feature : ${feature.feature_name}, is new feature added in your subscription plan.`
                        }
                        sendEmail(subscriber.email,mailContent);

                        
                    })

                }
                
            });

    } catch (err) {
        console.log(err);
    }
}

export async function changeProgramStatus() {
    try {
        const currentDate = new Date();
        // console.log('currentDate :', currentDate)

        const program = await getRepository(Programs).find({
            where: {
                from_date: LessThan(currentDate),
                to_date: MoreThan(currentDate)
            }
        })

        //console.log("program :", program)
        
        if(program.length > 0){
            // await getRepository(Programs).createQueryBuilder().update({
            //     status: SESSION_TYPE_ENUMS.ONGOING
            // })
            // .execute()
            for (let i = 0; i < program.length; i++) {
                const programItem = program[i];

                await getRepository(Programs)
                .createQueryBuilder()
                .update(Programs)
                .set({
                    status: SESSION_TYPE_ENUMS.ONGOING
                })
                .where("id = :id", { id: programItem.id })
                .execute();

                //console.log('programItem.id :', programItem.id)
            }
            
        }
    } catch (err) {
        console.log(err);
    }
}


