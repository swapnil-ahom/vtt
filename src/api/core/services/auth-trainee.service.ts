import * as Dayjs from 'dayjs';
import { badData } from '@hapi/boom';
import { getCustomRepository, getRepository } from 'typeorm';
import { ACCESS_TOKEN } from '@config/environment.config';
import { ErrorConstants } from '../../common/ErrorConstants';
import { TraineeRepository } from '@repositories/trainee.repository';
import { Trainee } from '@models/trainee.model';
import { RefreshTraineeToken } from '@models/trainee-refresh-token.model';
import { IOauthTraineeResponse } from '@interfaces';
import { hash } from '@utils/string.util';
import { Request, Response } from 'express';
import * as Jwt from 'jwt-simple';
import { RefreshTraineeTokenRepository } from '@repositories/trainee-refresh-token.repository';
import { type } from 'os';

/**
 * @description
 */
class AuthTraineeService {
  /**
   * @description
   */
  private static instance: AuthTraineeService;
  private constructor() {}

  /**
   * @description
   */
  static get(): AuthTraineeService {
    if (!AuthTraineeService.instance) {
        AuthTraineeService.instance = new AuthTraineeService();
    }
    return AuthTraineeService.instance;
  }
  
  /**
   * @description Build a token response and return it
   *
   * @param user
   * @param accessToken
   */
  async generateTokenResponse(user: Trainee, accessToken: string): Promise<{ tokenType, accessToken, refreshToken, expiresIn }|Error> {
    if (!user || !(user instanceof Trainee) || !user.trainee_email) {
      return badData('User is not an instance of User');
    }
    if (!accessToken) {
      return badData('Access token cannot be retrieved');
    }
    const tokenType = 'Bearer';
    const oldToken = await getRepository(RefreshTraineeToken).findOne({ where : { user } });
    if (oldToken) {
      await getRepository(RefreshTraineeToken).remove(oldToken)
    }
    const refreshToken = getCustomRepository(RefreshTraineeTokenRepository).generate(user).token;
    const expiresIn = Dayjs().add(ACCESS_TOKEN.DURATION, 'minutes');
    const userID:number = user.id;
    const userData = await getRepository(Trainee).findOne(userID);
    await getRepository(Trainee).save(userData);
    return { tokenType, accessToken, refreshToken, expiresIn };
  }

  

  async generateSocialTokenResponse(user: Trainee, accessToken: string): Promise<{ tokenType, accessToken, refreshToken, expiresIn }|Error> {
    if (!user || !(user instanceof Trainee) || !user.social_media_id) {
      return badData('User is not an instance of User');
    }
    if (!accessToken) {
      return badData('Access token cannot be retrieved');
    }
    const tokenType = 'Bearer';
    const oldToken = await getRepository(RefreshTraineeToken).findOne({ where : { user } });
    if (oldToken) {
      await getRepository(RefreshTraineeToken).remove(oldToken)
    }
    const refreshToken = getCustomRepository(RefreshTraineeTokenRepository).generate(user).token;
    const expiresIn = Dayjs().add(ACCESS_TOKEN.DURATION, 'minutes');
    const userID:number = user.id;
    const userData = await getRepository(Trainee).findOne(userID);
    await getRepository(Trainee).save(userData);
    return { tokenType, accessToken, refreshToken, expiresIn };
  }

  async socialMediaRegisterResponse(user: Trainee, accessToken: string): Promise<{ tokenType, accessToken, refreshToken, expiresIn }|Error> {
    if (!user || !(user instanceof Trainee) || !user.trainee_email) {
      return badData('User is not an instance of User');
    }
    if (!accessToken) {
      return badData('Access token cannot be retrieved');
    }
    const tokenType = 'Bearer';
    const oldToken = await getRepository(RefreshTraineeToken).findOne({ where : { user } });
    if (oldToken) {
      await getRepository(RefreshTraineeToken).remove(oldToken)
    }
    const refreshToken = getCustomRepository(RefreshTraineeTokenRepository).generate(user).token;
    const expiresIn = Dayjs().add(ACCESS_TOKEN.DURATION, 'minutes');
    return { tokenType, accessToken, refreshToken, expiresIn };
  }
  
 /**
   * @description Revoke a refresh token
   *
   * @param user
   */
  async revokeRefreshToken(user: Trainee): Promise<void|Error> {

    if (!user || !(user instanceof Trainee) || !user.id) {
      return badData('User is not an instance of User');
    }

    const oldToken = await getRepository(RefreshTraineeToken).findOne({ where : { user } });

    if (oldToken) {
      await getRepository(RefreshTraineeToken).remove(oldToken)
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
  async oAuth(token: string, refreshToken: string, profile: IOauthTraineeResponse, next: (e?: Error, v?: Trainee|boolean) => void): Promise<void> {
    try {
    //   const email = profile.trainee_email ? profile.trainee_email.filter(mail => ( mail.hasOwnProperty('verified') && mail.verified ) || !mail.hasOwnProperty('verified') ).slice().shift().value : `${profile.trainee_name.givenName.toLowerCase()}${profile.name.familyName.toLowerCase()}@externalprovider.com`;
      const iRegistrable = {
        trainee_email:profile.trainee_email,
        trainee_name: profile.trainee_name,
        trainee_password: hash("email", 16)
      }
      const userRepository = getCustomRepository(TraineeRepository);
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
  async jwt(payload: { sub }, next: (e?: Error, v?: Trainee|boolean) => void): Promise<void> {
    try {
      const userRepository = getRepository(Trainee);
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

  authenticateToken = ( req: Request, res: Response,next: (e?: Error) => void) : void | Response => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]
    try{
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const decoded = Jwt.decode(token, ACCESS_TOKEN.SECRET);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-assignment
      req.user = decoded.sub;
      if(decoded.type!="trainee")
      {
        return res.status(401).send('Unauthorized'); 
      }
      next();
    }catch(error){
      return res.status(401).send('Unauthorized');
    }
  }
}



const authService = AuthTraineeService.get();

export { authService as AuthTraineeService }
