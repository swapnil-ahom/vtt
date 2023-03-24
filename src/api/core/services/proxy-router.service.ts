import { Router } from 'express';

import { IRoute } from '@interfaces';

import { MainRouter } from '@routes/main.route';
import { AuthRouter } from '@routes/auth.route';
import { MediaRouter } from '@routes/media.route';
import { UserRouter } from '@routes/user.route';
import { MasterRouter } from '@routes/master.route';
import { ProgramRouter } from '@routes/program.route';
import {SessionRouter} from '@routes/session.route';
import {TrainersRouter} from '@routes/trainers.route';
import {TrainingRoute} from '@routes/training.route';
import {TraineeRoute} from '@routes/trainee.route';
import {PushRouter} from '@routes/push-notification.route';
import {OnboardingRouter} from '@routes/onboardingRouter';
import {SupportRouter} from '@routes/support.route';
// import { SegmentRouter } from '@routes/segment.route';
import {FieldSettingsRouter} from '@routes/field-settings.route'
import {AdminRoute} from '@routes/admin.route';

/**
 * Load all application routes and plug it on main router
 */
class ProxyRouter {

  /**
   * @description Wrapper Express.Router
   */
  private static instance: ProxyRouter;

  /**
   * @decription
   */
  private router: Router = Router();

  /**
   * @description Routes descriptions
   */
  private readonly routes = [
    { segment: '', provider: MainRouter },
    { segment: '/auth/', provider: AuthRouter },
    { segment: '/master/', provider: MasterRouter },
    { segment: '/programme/', provider: ProgramRouter },
    { segment: '/medias/', provider: MediaRouter },
    { segment: '/users/', provider: UserRouter },
    {segment: '/session/', provider: SessionRouter},
    {segment:'/trainer/', provider: TrainersRouter},
    {segment: '/training/', provider: TrainingRoute},
    {segment: '/trainee/', provider: TraineeRoute},
    {segment: '/push-notification/', provider: PushRouter},
    {segment: '/field-setting/', provider: FieldSettingsRouter},
    // {segment: '/onboarding/', provider: OnboardingRouter}
    {segment: '/onboarding/', provider: OnboardingRouter},
    {segment: '/admin/', provider: AdminRoute},
    {segment: '/support/', provider: SupportRouter},
    // {segment:'/segment/', provider: SegmentRouter},
    // {segment: '/training/', provider: TrainingRoute},
    // {segment: '/trainee/', provider: TraineeRoute},
  ];

  private constructor() {}

  /**
   * @description
   */
  static get(): ProxyRouter {
    if ( !ProxyRouter.instance ) {
      ProxyRouter.instance = new ProxyRouter();
    }
    return ProxyRouter.instance;
  }

  /**
   * @description Plug sub routes on main router
   */
  map(): Router {
    this.routes.forEach( (route: IRoute) => {
      const instance = new route.provider() as { router: Router };
      this.router.use( route.segment, instance.router );
    });
    return this.router;
  }
}

const proxyRouter = ProxyRouter.get();

export { proxyRouter as ProxyRouter }
