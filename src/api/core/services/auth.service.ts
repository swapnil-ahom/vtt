import * as Dayjs from 'dayjs';

import { badData } from '@hapi/boom';
import { getConnection, getCustomRepository, getRepository } from 'typeorm';

import { ACCESS_TOKEN } from '@config/environment.config';
import { ErrorConstants } from '../../common/ErrorConstants';


import { UserRepository } from '@repositories/user.repository';
import { RefreshTokenRepository } from '@repositories/refresh-token.repository';

import { User } from '@models/user.model';
import { UserProfile } from '@models/user-profile.model';
import { RefreshToken } from '@models/refresh-token.model';
import { RoleList } from '@models/role-list.model';

import { UserTypeList } from '@models/user-type-list.model';
import { Trainers } from '@models/trainers.model';

import { IOauthResponse } from '@interfaces';

import { hash } from '@utils/string.util';

import { Request, Response } from 'express';

import * as Jwt from 'jwt-simple';
import {Expertiselist} from '@models/expertiselist.model';
import {UserProfileVO} from '../types/uiVOs/UserProfileVO';
import {Sectorslist} from '@models/sectorslist.model';
import { TraineeService } from '@services/trainee.service';
import  {addNotification, sendOTPEmail, sendEmail, addPendingTask, generateOtp}  from '../utils/common.util';
import { RoleMapping } from '@models/role-mapping.model';
import { Role } from '@models/role.model'
import { RoleIds } from '@enums';
import { SubscriptionPlans } from '@models/subscriptionplans.model';
import { UserSubscription } from '@models/user.subscription.model';
import { SubUserModel } from '@models/sub-user.model';
import {VTTRequestVO} from '../types/uiVOs/VTTRequestVO';

/**
 * @description
 */

class AuthService {

  /**
   * @description
   */
  private static instance: AuthService;

  private constructor() {}

  /**
   * @description
   */
  static get(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }
  /**
   * @description Build a token response and return it
   *
   * @param user
   * @param accessToken
   */
  async generateTokenResponse(user: User, accessToken: string): Promise<{ tokenType, accessToken, refreshToken, expiresIn }|Error> {
    if (!user || !(user instanceof User) || !user.email) {
      return badData('User is not an instance of User');
    }
    if (!accessToken) {
      return badData('Access token cannot be retrieved');
    }
    const tokenType = 'Bearer';
    const oldToken = await getRepository(RefreshToken).findOne({ where : { user } });
    if (oldToken) {
      await getRepository(RefreshToken).remove(oldToken)
    }
    const refreshToken = getCustomRepository(RefreshTokenRepository).generate(user).token;
    const expiresIn = Dayjs().add(ACCESS_TOKEN.DURATION, 'minutes');
    const userID:number = user.id;
    const userData = await getRepository(User).findOne(userID);
    await getRepository(User).save(userData);
    return { tokenType, accessToken, refreshToken, expiresIn };
  }

  async socialMediaRegisterResponse(user: User, accessToken: string): Promise<{ tokenType, accessToken, refreshToken, expiresIn }|Error> {
    if (!user || !(user instanceof User) || !user.email) {
      return badData('User is not an instance of User');
    }
    if (!accessToken) {
      return badData('Access token cannot be retrieved');
    }
    const tokenType = 'Bearer';
    const oldToken = await getRepository(RefreshToken).findOne({ where : { user } });
    if (oldToken) {
      await getRepository(RefreshToken).remove(oldToken)
    }
    const refreshToken = getCustomRepository(RefreshTokenRepository).generate(user).token;
    const expiresIn = Dayjs().add(ACCESS_TOKEN.DURATION, 'minutes');
    return { tokenType, accessToken, refreshToken, expiresIn };
  }

  /**
   * @description Build a token response and return it
   *
   * @param data
   * @param userId
   */
   async verifyOTPUserData(data: User, userId: number): Promise<{response}|Error> {
    try{

      const userData = await getRepository(User).findOne({ where: { id: userId, otp: data.otp  } });

      let response = {};
      if (userData == undefined) {

        response = {
          message: ErrorConstants.verifyOTPFailed,
          error: true,
          success: false,
        }
        return { response };
      }

      response = {
        message: ErrorConstants.verifyOTPSuccess,
        error: false,
        success: true,
      }

      const PendingtaskContent = JSON.stringify({
      taskType:'Profile completion reminder',
      taskTitle:'Profile',
      task:'Please complete your profile ',
      batch:'-',
      programme:'-',
      session:'-',
      });
      const NotificationContent = JSON.stringify({
      type:'profile_completion_reminder',
      })

      const user: User = await getRepository(User).findOne({
        where: {
        id: userId, otp: data.otp
        }
      });
      user.is_verify_otp = true;

      //  const role = new Role({
      //   id: RoleIds.undecided
      //  })

      // //  const users = new User({
      // //   id: user.id
      // //  })
      //  //console.log('users :', users)

      //  let userRole = new RoleMapping({
      //   userId: user.id,
      //   roleId: role.id
      //  });

      //  await getRepository(RoleMapping).save(userRole);

      await getRepository(User).save(user);

      await addNotification(userId,4,NotificationContent);

      await addPendingTask(userId,4,PendingtaskContent,7);

      const welcomeContent = `welcome ${userData.fullname}, we are delighted to have you as a trainer.`

      await sendEmail(userData.email, welcomeContent);

    
      return { response };
    }catch(error){
      console.log('catch error ' +error);
    }
  }


  async resendUserLoginOTP(data:User, userId: number): Promise<{response}|Error> {
    const userData = await getRepository(User).findOne({ where: { id: userId } });
    let updateData = {};
    if (userData) {
      userData.otp = generateOtp();
      sendOTPEmail(userData.email, userData.fullname, userData.otp).then(resp => [

      ]).catch(err => {

      })
      updateData = await getRepository(User).save(userData);
    }
    let response = {};
    if (!userData) {
      response = {
        message: ErrorConstants.resendOTPFailed,
        error: false,
        success: true,
      }
    } else if (updateData) {
      response = {
        message: ErrorConstants.resendOTPSuccess,
        error: true,
        success: false,
      }
    }
    return { response };
  }

  async updateProfile(data: UserProfileVO, createdByUserId: number): Promise<{response}|Error> {
    const expertiseList = await AuthService.instance.processExpertiseList(data.expertiseList);
    const sectorList = await AuthService.instance.processSectorList(data.sectorList);
    const reqData = {...data, expertise: expertiseList, sectors: sectorList};
    // reqData.expertise = expertiseList;
    // reqData.sectors = sectorList;
    const repository = getRepository(UserProfile);
    const userData = await getRepository(UserProfile).find({ where: { userid: reqData.userid} });
    let response = {};
    if(userData.length > 0){
      console.log('updating profile')
      try {
        let profile: UserProfile = userData[0];
        profile = { ...profile, bio: reqData.bio, experience: reqData.experience, linkedin_profile: reqData.linkedin_profile,
        role: reqData.role, user_type: reqData.user_type }
        await repository
        .save(profile);
      } catch(error){
        console.log('Error while updating profile')
        response = {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          message: error.code,
          error: true,
          success: false,
        }
      }
        response = {
          message: ErrorConstants.profileSuccess,
          error: false,
          success: true,
        }

    }else{
      const updateData = await getRepository(UserProfile).save(reqData);
      if (updateData) {
        response = {
          message: ErrorConstants.profileSuccess,
          error: false,
          success: true,
        }
      } else{
        response = {
          message: ErrorConstants.profileFailed,
          error: true,
          success: false,
        }
      }
    }
    console.log('Returning 1')
    if(reqData.role === 1){ // update trainer when role===1.
      const userDetails =  await getRepository(User).find({ where: { id: reqData.userid} });
      const trainerData = {
        name:userDetails[0].fullname,
        email:userDetails[0].email,
        subscriber_id: createdByUserId
      }
      console.log('Returning 2')
      const findTrainer = await getRepository(Trainers).find({ where: { email: userDetails[0].email } });
      if (findTrainer.length < 1) {
        console.log('Returning 3')
        const trainerRepository = getRepository(Trainers);
        const TrainerResponse = await trainerRepository.save(trainerData);
        console.log('Returning 4')
      }
   }
   console.log('Returning response')
    return { response };
  }

  async processExpertiseList(expertiseList: Expertiselist[]){
     let expList = '';
     for (const expertise of expertiseList) {
       const index = expertiseList.indexOf(expertise);
       if(expertise.id){
         if(index == 0){
           expList += expertise.id;
         } else {
           expList += ',' + expertise.id;
         }
       } else {
         const newExpertise = await getRepository(Expertiselist).save({...expertise, public: false});
         if(index == 0){
           expList += newExpertise.id;
         } else {
           expList += ',' + newExpertise.id;
         }
       }
     }
     return expList;
  }

  async processSectorList(sectorList: Sectorslist[]){
    let secList = '';
    for (const sector of sectorList) {
      const index = sectorList.indexOf(sector);
      if(sector.id){
        if(index == 0){
          secList += sector.id;
        } else {
          secList += ',' + sector.id;
        }
      } else {
        const newSector = await getRepository(Sectorslist).save({...sector, public: false});
        if(index == 0){
          secList += newSector.id;
        } else {
          secList += ',' + newSector.id;
        }
      }
    }
    return secList;
  }

  async addUserRole(data:RoleList): Promise<{response}|Error> {
    const updateData = await getRepository(RoleList).save(data);
    let response = {};
    if (updateData) {
      response = {
        error: false,
        success: true,
      }
    } else{
      response = {
        error: true,
        success: false,
      }
    }
    return { response };
  }

  async addUserTypeList(data:UserTypeList): Promise<{response}|Error> {
    const updateData = await getRepository(UserTypeList).save(data);
    let response = {};
    if (updateData) {
      response = {
        error: false,
        success: true,
      }
    } else{
      response = {
        error: true,
        success: false,
      }
    }
    return { response };
  }
  /**
   * @description Revoke a refresh token
   *
   * @param user
   */
  async revokeRefreshToken(user: User): Promise<void|Error> {

    if (!user || !(user instanceof User) || !user.id) {
      return badData('User is not an instance of User');
    }

    const oldToken = await getRepository(RefreshToken).findOne({ where : { user } });

    if (oldToken) {
      await getRepository(RefreshToken).remove(oldToken)
    }
  }

  /**
   * @description Authentication by oAuth processing
   *
   * @param token Access token of provider
   * @param refreshToken Refresh token of provider
   * @param profile Shared profile information
   * @param next Callback function
   *
   * @async
   */
  async oAuth(token: string, refreshToken: string, profile: IOauthResponse, next: (e?: Error, v?: User|boolean) => void): Promise<void> {
    try {
      const email = profile.emails ? profile.emails.filter(mail => ( mail.hasOwnProperty('verified') && mail.verified ) || !mail.hasOwnProperty('verified') ).slice().shift().value : `${profile.name.givenName.toLowerCase()}${profile.name.familyName.toLowerCase()}@externalprovider.com`;
      const iRegistrable = {
        id: profile.id,
        username: profile.username ? profile.username : `${profile.name.givenName.toLowerCase()}${profile.name.familyName.toLowerCase()}`,
        email,
        picture: profile.photos.slice().shift()?.value,
        password: hash(email, 16)
      }
      const userRepository = getCustomRepository(UserRepository);
      const user = await userRepository.oAuthLogin(iRegistrable);
      return next(null, user);
    } catch (err) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      return next(err, false);
    }
  }

  /**
   * @description Authentication by JWT middleware function
   *
   * @async
   */
  async jwt(payload: { sub }, next: (e?: Error, v?: User|boolean) => void): Promise<void> {
    try {
      const userRepository = getRepository(User);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const user = await userRepository.findOne( payload.sub );
      if (user) {
        return next(null, user);
      }
      return next(null, false);
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      return next(error, false);
    }
  }

  authenticateToken = ( req: VTTRequestVO, res: Response, next: (e?: Error) => void ) : void | Response => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]
    if (token == null) return res.status(401).send('Unauthorized');
    try{
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const decoded = Jwt.decode(token, ACCESS_TOKEN.SECRET);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-assignment
      req.user = decoded.sub;
      next();
    }catch(error){
      return res.status(401).send('Unauthorized');
    }
  }

  async setSubscriptionForUser(params: SubscriptionPlans, userId: number): Promise<{response}|Error> {
    try{
      const subscriptionObj = await getRepository(SubscriptionPlans).findOne({
        where: {
          id: params.id
        }
      });

      let response = {};
      if (!subscriptionObj) {
        response = {
          message: ErrorConstants.profileFailed,
          error: true,
          success: false,
        }
      }
      const subscription = new SubscriptionPlans();
      subscription.id = params.id
      subscription.renewal_frequency = params.renewal_frequency

      const user = await getRepository(User).findOne({
        where: {
          id: userId
        }
      })

      const finalData = await getConnection().query(`
      UPDATE user SET subscriptionId = '${subscription.id}' WHERE id = '${user.id}'`);

      console.log('finalData :', finalData);

      return {response}
    }catch(error){
      console.log('catch error ',error);
    }
  }

  async getSubscriptionForUser(res: Response, userId: number) {
    try{
      const userSubscription = await getRepository(User).find({
        relations: ['subscription', 'subscription.featuresList'],
        where: {
          id: userId
        }
      });

      // console.log('userSubscription :', userSubscription)

      let response = {};
      if (!userSubscription) {
        response = {
          message: ErrorConstants.profileFailed,
          error: true,
          success: false,
        }
      }

      return userSubscription;
    }catch(error){
      console.log('catch error ',error);
      return {error: true, message: 'error occured'}
    }
  }

  async cancelSubscriptionForUser(res: Response, userId: number) {
    try{
      const finalData = await getConnection().query(`
      UPDATE user SET subscriptionId = NULL WHERE id = '${userId}'`);

      return finalData;
    }catch(error){
      console.log('catch error ',error);
      return {error: true, message: 'error occured'}
    }
  }

  async getUserSubscriptionDetails(res: Response, userId: number) {
    try{
      const userSubscription = await getRepository(User).findOne({
        relations: ['subscription'],
        where: {
          id: userId
        }
      });

      // console.log('userSubscription :', userSubscription)

      let response = {};
      if (!userSubscription) {
        response = {
          message: ErrorConstants.profileFailed,
          error: true,
          success: false,
        }
      }

      return userSubscription;
    }catch(error){
      console.log('catch error ',error);
      return {error: true, message: 'error occured'}
    }
  }

  async checkAndUpdateAsInvitee(user: User){
    const subUserRepo = getRepository(SubUserModel);
    const subUser = await subUserRepo.createQueryBuilder('subUser')
    .where('subUser.email = :email', { email: user.email })
    .execute();
    console.log('found user', subUser);
    if(subUser){
      subUser.userId = user.id;
      await subUserRepo.createQueryBuilder()
      .update({
        userId: user.id
      }).where({
        email: user.email
      })
      .execute()
    }
  }

}



const authService = AuthService.get();

export { authService as AuthService }
