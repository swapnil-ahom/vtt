import { SessionController } from "@controllers/session.controller";
import { preWorkCronFunction, postWorkCronFunction, changeInSubscriptionPlan, changeProgramStatus } from "./cron.methods";

const cron = require('node-cron');




export async function preWorkCron(){
    // Schedule tasks to be run on the server.
    
    cron.schedule('*/1 * * * * *', function() {
        console.log('trigger points of pre work');
        preWorkCronFunction();
    });

}

export async function postWorkCron(){
    // Schedule tasks to be run on the server.
    
    cron.schedule('*/2 * * * * *', function() {
        console.log('trigger points of post work');
        postWorkCronFunction();
    });
 
}

export async function updateSessionStatusCron(){
    cron.schedule('*/30 * * * *', function() {
        console.log(new Date());// sent to trainee
        SessionController.checkMappingStatus()
    });
}



export async function changeInSubscriptionPlanCron(){
    cron.schedule('* * * * *', function() {
        changeInSubscriptionPlan()
    });
}

export async function changeProgramStatusCron(){
    cron.schedule('* * * * *', function() {
        changeProgramStatus()
    });
}