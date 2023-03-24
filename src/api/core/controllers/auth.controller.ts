/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { SOCIAL_MEDIA_TYPE } from './../types/enums/social-media-type.enum';
import { Request } from 'express';
import { getCustomRepository, getRepository, getConnection } from 'typeorm';
import { badRequest, notFound } from '@hapi/boom';

import * as Jwt from 'jwt-simple';

import { ACCESS_TOKEN } from '@config/environment.config';
import { IResponse, ITokenOptions, IUserRequest } from '@interfaces';
import { User } from '@models/user.model';
import { RoleList } from '@models/role-list.model';
import { UserTypeList } from '@models/user-type-list.model';
import { RefreshToken } from '@models/refresh-token.model';
import { UserRepository } from '@repositories/user.repository';
import { AuthService } from '@services/auth.service';
import { Safe } from '@decorators/safe.decorator';
import { RoleIds, STATUS } from '@enums';
import { EmailEmitter } from '@events';
import { v4 as uuidv4 } from 'uuid';
import { error, success, success_with_error } from '@utils/common.util';
import { generateOtp, sendOTPEmail } from '../utils/common.util';
import { SubscriptionPlans } from '@models/subscriptionplans.model';
import { Subscription_Features } from '@models/subscription.features.model';

/**
 * Manage incomiupdateProfileng requests from api/{version}/auth
 */
class AuthController {

  /**
   * @description
   */
  private static instance: AuthController;

  private constructor() {
  }

  /**
   * @description
   */
  static get(): AuthController {
    if (!AuthController.instance) {
      AuthController.instance = new AuthController();
    }
    return AuthController.instance;
  }

  /**
   * @description Creates and save new user
   *
   * @param req Express request object derived from http.incomingMessage
   * @param res Express response object
   */
  @Safe()
  async register(req: Request, res: IResponse): Promise<void> {


    // const repository = getRepository(User);
    // const _user: User = await getRepository(User).findOne({
    //     where: {
    //         email: req.body.email
    //     }
    // });
    // if (_user) {
    //     _user.otp = generateOtp();
    //     await sendOTPEmail(_user.email, _user.fullname, _user.otp);
    //     await getRepository(User).save(_user);
    //     const token = await AuthService.generateTokenResponse(_user, _user.token());
    //     res.locals.data = {token,_user,message: 'otp sent again on mail ID'};
    // } else {
    //     const user = new User(req.body as Record<string, unknown>);
    //     // console.log(59,user);

    //     const count = await repository.count();
    //     if (count === 0) {
    //         user.roleId = RoleIds.admin;
    //     }

    //     user.roleId = RoleIds.undecided;
    //     user.username = uuidv4();
    //     user.otp = generateOtp();
    //     await sendOTPEmail(user.email, user.fullname, user.otp);

    //     user.social_type = '';
    //     await repository.insert(user);
    //     // console.log(70,user);
    //     // check if user was added as invite
    //     await AuthService.checkAndUpdateAsInvitee(user);
    //     const token = await AuthService.generateTokenResponse(user, user.token());
    //     // console.log(73,user);

    //     res.locals.data = {token, user};
    // }


    const repository = getRepository(User);
    const _user: User = await getRepository(User).findOne({
      where: {
        email: req.body.email
      }
    });

    if (!_user) {
      const user = new User(req.body as Record<string, unknown>);

      const count = await repository.count();
      if (count === 0) {
        user.roleId = RoleIds.admin;
      }

      user.roleId = RoleIds.undecided;
      user.username = uuidv4();
      user.otp = generateOtp();
      sendOTPEmail(user.email, user.fullname, user.otp);

      user.social_type = '';
      await repository.insert(user);
      // console.log(70,user);
      // check if user was added as invite
      await AuthService.checkAndUpdateAsInvitee(user);
      const token = await AuthService.generateTokenResponse(user, user.token());

      res.locals.data = { token, user };
      return;
    } else if (_user && _user.is_verify_otp == true) {
      if (req.body.email === _user.email) {

        res.status(200).json(success_with_error('User already present', {}, res.statusCode));
        return;

      }

    } else if (_user && _user.is_verify_otp == false) {
      _user.otp = generateOtp();
      await sendOTPEmail(_user.email, _user.fullname, _user.otp);
      await repository.save(_user);
      await AuthService.checkAndUpdateAsInvitee(_user);
      const token = await AuthService.generateTokenResponse(_user, _user.token());
      // let responseData = { token, user: _user };
      res.locals.data = {
        message: 'please complete otp verification with this mail ID',
        token,
        user: _user,
        error: true
      };
      return;
    }

  }

  @Safe()
  async socialMediaRegister(req: Request, res: IResponse): Promise<void> {
    const repository = getRepository(User);
    const user = new User(req.body as Record<string, unknown>);
    const count = await repository.count();
    if (count === 0) {
      user.role.id = RoleIds.admin;
    }
    await repository.insert(user);
    const token = await AuthService.socialMediaRegisterResponse(user, user.token());
    res.locals.data = { token, user };
  }

  /**
   * @description Creates and save new user
   *
   * @param req Express request object derived from http.incomingMessage
   * @param res Express response object
   */
  @Safe()
  async verifyOTP(req: Request, res: IResponse): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const user = await AuthService.verifyOTPUserData(req.body, req.user as number)
    res.locals.data = { ...user };
  }

  @Safe()
  async addUserRole(req: Request, res: IResponse): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const user = await AuthService.addUserRole(req.body)
    res.locals.data = { ...user };
  }

  @Safe()
  async addUserTypeList(req: Request, res: IResponse): Promise<void> {
    const user = await AuthService.addUserTypeList(req.body)
    res.locals.data = { ...user };
  }

  @Safe()
  async resendOTP(req: Request, res: IResponse): Promise<void> {
    const user = await AuthService.resendUserLoginOTP(req.body, req.user as number)
    res.locals.data = { ...user };
  }

  @Safe()
  async updateProfile(req: Request, res: IResponse): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-assignment
    req.body.userid = req.user as number;
    const user = await AuthService.updateProfile(req.body, req.user as number);
    res.locals.data = { ...user };
  }


  /**
   * @description Login with an existing user or creates a new one if valid accessToken token
   *
   * @param req Express request object derived from http.incomingMessage
   * @param res Express response object
   */
  // @Safe()
  async login(req: Request, res: IResponse): Promise<void> {
    try {
      const Repo = await getRepository(User).createQueryBuilder('user')
        .where('user.email =:email', { email: req.body.email })
        .getOne();

      let strErrorMessage = '';
      if (Repo === undefined) {
        res.status(400).json(error('please enter a valid mail ID', res.statusCode));
        return;
      } else if (req.body.password && await Repo.passwordMatches(req.body.password) === false) {
        res.status(400).json(error('please enter a valid password', res.statusCode));
        return;
      } else if (Repo && Repo.is_verify_otp == false) {
        strErrorMessage = 'please complete otp verification with this mail ID';
        const otp: number = generateOtp();
        Repo.otp = otp;
        await getRepository(User).save(Repo);
        sendOTPEmail(Repo.email, Repo.fullname, otp);
      }
      const repository = getCustomRepository(UserRepository);
      const { user, accessToken } = await repository.findAndGenerateToken(req.body as ITokenOptions);
      const token = await AuthService.generateTokenResponse(user, accessToken);

      if (strErrorMessage.length > 0) {
        res.status(200).json(success_with_error(strErrorMessage, { token, user }, res.statusCode));
        return;
      }

      res.status(200).json(success('', { token, user }, res.statusCode));
      return;
    } catch (err) {
      console.log('catch err', err);
      res.status(400).json(success('Error occured while processing', {}, res.statusCode));
      return;
    }
  }


  // @Safe()
  async socialMediaLogin(req: Request, res: IResponse): Promise<void> {
    try {
      const repository = getRepository(User);
      const user = await repository.findOne({
        where: {
          email: req.body.email,
          social_type: req.body.social_type
        }
      });
      //     let x = await getRepository(Trainee).createQueryBuilder('trainee')
      //     .where('trainee.id=:id',{id:128})
      //     .getOne();
      //    let token = await AuthTraineeService.generateTokenResponse(x, x.token());
      //      console.log(token );

      if (user) {
        const repository = getCustomRepository(UserRepository);
        const { user, accessToken } = await repository.findAndGenerateToken(req.body as ITokenOptions);
        const token = await AuthService.generateTokenResponse(user, accessToken);
        res.locals.data = { token, user };
        res.status(200).json({ success: 'login successful', token, user });
      } else {
        if (req.body.social_type == SOCIAL_MEDIA_TYPE.FACEBOOK) {
          const newuser = new User({
            username: uuidv4(),
            fullname: req.body.username,
            email: req.body.email,
            password: '',
            otp: 1234,
            social_type: SOCIAL_MEDIA_TYPE.FACEBOOK
          });
          const count = await repository.count();
          if (count === 0) {
            newuser.role.id = RoleIds.admin;
          }
          await repository.save(newuser).then(async (newuser) => {
            const token = await AuthService.generateTokenResponse(newuser, newuser.token());
            res.locals.data = { token, newuser };
            res.status(200).json({ success: 'login successful', token, newuser });
          });
        } else if (req.body.social_type == SOCIAL_MEDIA_TYPE.GOOGLE) {
          const newuser = new User({
            username: uuidv4(),
            fullname: req.body.username,
            email: req.body.email,
            password: '',
            otp: 1234,
            social_type: SOCIAL_MEDIA_TYPE.GOOGLE
          });
          const count = await repository.count();
          if (count === 0) {
            newuser.role.id = RoleIds.admin;
          }
          await repository.save(newuser).then(async (newuser) => {
            const token = await AuthService.generateTokenResponse(newuser, newuser.token());
            res.locals.data = { token, newuser };
            res.status(200).json({ success: 'login successful', token, newuser });
          });


        } else {
          res.status(200).json({ error: 'invalid credentials' });
        }
      }
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
    res.end();
  }

  /**
   * @description Logout user
   *
   * @param req Express request object derived from http.incomingMessage
   * @param res Express response object
   */
  @Safe()
  async logout(req: IUserRequest, res: IResponse): Promise<void> {
    await AuthService.revokeRefreshToken(req.user as User);
    res.locals.data = null;
  }

  /**
   * @description Login with an existing user or creates a new one if valid accessToken token
   *
   * @param req Express request object derived from http.incomingMessage
   * @param res Express response object
   */
  @Safe()
  async oAuth(req: IUserRequest, res: IResponse): Promise<void> {
    const user = req.user as User;
    const accessToken = user.token();
    const token = await AuthService.generateTokenResponse(user, accessToken);
    res.locals.data = { token, user };
  }

  /**
   * @description Refresh JWT access token by RefreshToken removing, and re-creating
   *
   * @param req Express request object derived from http.incomingMessage
   * @param res Express response object
   */
  @Safe()
  async refresh(req: Request, res: IResponse, next: (e?: Error) => void): Promise<void> {
    const refreshTokenRepository = getRepository(RefreshToken);
    const userRepository = getCustomRepository(UserRepository);

    const { token } = req.body as { token: { refreshToken?: string } };

    const refreshToken = await refreshTokenRepository.findOne({
      where: { token: token.refreshToken }
    });

    if (typeof (refreshToken) === 'undefined') {
      return next(notFound('RefreshToken not found'));
    }

    await refreshTokenRepository.remove(refreshToken);

    // Get owner user of the token
    const { user, accessToken } = await userRepository.findAndGenerateToken({
      email: refreshToken.user.email,
      refreshToken
    });
    const response = await AuthService.generateTokenResponse(user, accessToken);

    res.locals.data = { token: response };
  }

  /**
   * @description Confirm email address of a registered user
   *
   * @param req Express request object derived from http.incomingMessage
   * @param res Express response object
   *
   * @fixme token should be temp: 24h
   */
  @Safe()
  async confirm(req: IUserRequest, res: IResponse): Promise<void> {

    const repository = getRepository(User);

    const decoded = Jwt.decode(req.body.token, ACCESS_TOKEN.SECRET) as { sub };
    if (!decoded) {
      throw badRequest('User token cannot be read');
    }

    const user = await repository.findOneOrFail(decoded.sub as string);

    if (user.status !== STATUS.REGISTERED && user.status !== STATUS.REVIEWED) {
      throw badRequest('User status cannot be confirmed');
    }

    user.status = STATUS.CONFIRMED;

    await repository.save(user);

    const token = await AuthService.generateTokenResponse(user, user.token());
    res.locals.data = { token, user };
  }

  /**
   * @description Request a temporary token to change password
   *
   * @param req Express request object derived from http.incomingMessage
   * @param res Express response object
   */
  @Safe()
  async requestPassword(req: IUserRequest, res: IResponse): Promise<void> {

    const repository = getRepository(User);

    const user = await repository.findOne({ email: req.query.email });

    if (user && user.status === STATUS.CONFIRMED) {
      void AuthService.revokeRefreshToken(user);
      EmailEmitter.emit('password.request', user);
    }

    res.locals.data = {};
  }

  /**
   * @description Get list of Roles
   *
   * @param req Express request object derived from http.incomingMessage
   * @param res Express response object
   */
  @Safe()
  async getRoleList(req: IUserRequest, res: IResponse): Promise<void> {
    const repository = getRepository(RoleList);
    const roles = await repository.find();
    res.locals.data = { roles };
  }

  /**
   * @description Get list of User Types
   *
   * @param req Express request object derived from http.incomingMessage
   * @param res Express response object
   */
  @Safe()
  async getUserTypeList(req: IUserRequest, res: IResponse): Promise<void> {
    const repository = getRepository(UserTypeList);
    const usertypes = await repository.find();
    res.locals.data = { usertypes };
  }

  async resetPassword(req: Request, res: IResponse): Promise<void> {

    try {

      const user: User = await getRepository(User).findOne({
        where: {
          id: req.user
        }
      });
      const isPasswordMatched = await user.passwordMatches(req.body.currentPassword);
      if (isPasswordMatched) {
        user.password = req.body.newPassword;
        await getRepository(User).save(user);
        res.status(200).json(success('', {
          message: 'password changes successfully',
          status: true
        }, res.statusCode));
      } else {
        res.status(200).json(success('', { message: 'incorrect password', status: false }, res.statusCode));
      }

    } catch (err) {
      console.log('err', err);
      res.status(400).json(success('', {}, res.statusCode));
    }
  }

  async forgotPassword(req: Request, res: IResponse): Promise<void> {

    try {

      // const user : User = await getRepository(User).findOne({
      //     where: {
      //         id: req.user
      //     }
      // });
      // let isPasswordMatched = await user.passwordMatches(req.body.currentPassword);
      // if(isPasswordMatched){
      //     user.password = req.body.newPassword;
      //     await getRepository(User).save(user);
      //     res.status(200).json(success('', { message:"user verified and new otp sent successfully",status:true }, res.statusCode));
      // }else{
      //     res.status(200).json(success('', { message:"invalid user", status:false}, res.statusCode));
      // }

      const users: User[] = await getRepository(User).find({
        where: {
          // id: req.user
          email: req.body.email
        }
      });
      if (users.length > 1) {
        // throw an exception taht multuple users found
      }
      if (users.length === 0) {
        // throw an exception that no user found
      }
      const user = users[0];
      if (user) {
        user.otp = generateOtp();
        // send otp
        sendOTPEmail(user.email, user.fullname, user.otp)

        // console.log('Updating user now')
        await getRepository(User).save(user);
      } else {
        console.log('error occured')
        // throw an exception that user not found
      }

    } catch (err) {
      console.log('err', err);
      res.status(400).json(success('', {}, res.statusCode));
    }
  }

  async getSubscriptionPlan(req: Request, res: IResponse): Promise<void> {

    try {

      const subPlanId = req.body.id;

      let subscriptionPlanDetails
      if (subPlanId) {
        subscriptionPlanDetails = await getRepository(SubscriptionPlans)
          .createQueryBuilder('subPlan')
          .where('subPlan.id = :id', { id: subPlanId })
          .leftJoinAndSelect('subPlan.featuresList', 'featuresList')
          .getOne();
      } else {
        subscriptionPlanDetails = await getRepository(SubscriptionPlans)
          .createQueryBuilder('subPlan')
          .leftJoinAndSelect('subPlan.featuresList', 'featuresList')
          .getMany();
      }
      res.status(200).json(success('', subscriptionPlanDetails, res.statusCode));

    } catch (err) {
      console.log('err', err);
      res.status(400).json(success('', {}, res.statusCode));
    }
  }

  async setSubscriptionPlan(req: Request, res: IResponse): Promise<void> {

    try {

      const user = await getRepository(SubscriptionPlans).findOne({
        where: {
          id: req.body.id
          // email : req.body.email
        }
      });

      if (user) {
        user.plan_name = req.body.plan_name;
        user.price = req.body.price;
        user.description = req.body.description;

        // console.log('Updating user now')
        await getRepository(SubscriptionPlans).save(user);
      } else {
        console.log('error occured')
        // throw an exception that user not found
      }

      res.status(200).json(success('', user, res.statusCode));
    } catch (err) {
      console.log('err', err);
      res.status(400).json(success('', {}, res.statusCode));
    }
  }

  async createSubscriptionPlan(req: Request, res: IResponse): Promise<void> {
    try {
      const plan = new SubscriptionPlans();
      plan.plan_name = req.body.plan_name;
      plan.price = req.body.price;
      plan.description = req.body.description;
      plan.duration = req.body.duration;
      plan.start_date = req.body.start_date;
      plan.end_date = req.body.end_date;
      plan.currencyType = req.body.currencyType

      // console.log('user :', plan)

      const basicPlan = await getRepository(SubscriptionPlans).save(plan);

      const subFeatures = {
        subscription: basicPlan,
        feature_name: req.body.feature_name,
        // feature_code: req.body.feature_code,
        description: req.body.description
      }


      // console.log('subFeatures :', subFeatures)

      await getRepository(Subscription_Features).insert(subFeatures);
      res.status(200).json(success('', {}, res.statusCode));
    } catch (err) {
      console.log('err', err);
      res.status(400).json(success('', {}, res.statusCode));
    }
  }

  async getSubscriptionPlanDetails(req: Request, res: IResponse): Promise<void> {
    const user = await AuthService.getUserSubscriptionDetails(req.body, req.user as number)
    res.locals.data = { ...user };
    res.status(200).json(success('', res.locals.data, res.statusCode))
  }

  async setSubscriptionForUser(req: Request, res: IResponse): Promise<void> {
    const user = await AuthService.setSubscriptionForUser(req.body, req.user as number)
    res.locals.data = { ...user };
    res.status(200).json(success('', {}, res.statusCode))
  }

  async getSubscriptionForUser(req: Request, res: IResponse): Promise<void> {
    const user = await AuthService.getSubscriptionForUser(req.body, req.user as number)
    res.locals.data = { ...user };
    res.status(200).json(success('', res.locals.data, res.statusCode))
  }

  async cancelSubscriptionForUser(req: Request, res: IResponse): Promise<void> {
    const user = await AuthService.cancelSubscriptionForUser(req.body, req.user as number)
    res.locals.data = { ...user };
    res.status(200).json(success('', res.locals.data, res.statusCode))
  }

  async getAllSubscriptions(req: Request, res: IResponse): Promise<void> {
    try {
      const id = req.body.id

      let subscriptionPlans

      if (id == 1) {
        subscriptionPlans = await getRepository(SubscriptionPlans).find({
          relations: ['featuresList'],
          where: {
            currencyType: 'INR'
          }
        })
      } else {
        subscriptionPlans = await getRepository(SubscriptionPlans).find({
          relations: ['featuresList'],
          where: {
            currencyType: 'USD'
          }
        })
      }
      res.status(200).json(success('', subscriptionPlans, res.statusCode));
    } catch (err) {
      console.log('err', err);
      res.status(400).json(success('', {}, res.statusCode));
    }
  }

  async getCurrencyList(req: Request, res: IResponse): Promise<void> {
    try {
      // const currencyList = await getRepository(SubscriptionPlans)
      // .createQueryBuilder('subscription_plans')
      // .select('subscription_plans.currencyType')
      // .groupBy('subscription_plans.currencyType')
      // .getMany()
      const currencyList = await getConnection().query(`
            SELECT currencyType as name,id FROM subscription_plans GROUP BY currencyType`);

      res.status(200).json(success('', currencyList, res.statusCode));
    } catch (err) {
      console.log('err', err);
      res.status(400).json(success('', {}, res.statusCode));
    }
  }

}

const authController = AuthController.get();

export { authController as AuthController }
