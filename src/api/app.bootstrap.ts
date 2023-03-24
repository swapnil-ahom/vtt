require('module-alias/register');
import { TYPEORM } from '@config/environment.config';
import { Database } from '@config/database.config';
import { Server } from '@config/server.config';
import { Application } from '@config/app.config';
import { preWorkCron, postWorkCron, updateSessionStatusCron, changeInSubscriptionPlanCron, changeProgramStatusCron } from './cron';
import { preWorkCronFunction, postWorkCronFunction } from './cron.methods';
import { SessionController } from '@controllers/session.controller';

Database.connect(TYPEORM);

const application = Application;
const server = Server.init(application).listen() as unknown;

export { application, server };

updateSessionStatusCron();

// preWorkCron();
// postWorkCron()
// changeInSubscriptionPlanCron();
changeProgramStatusCron();
