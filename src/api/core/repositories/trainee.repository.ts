import * as Dayjs from 'dayjs';
import { Repository, EntityRepository, getRepository } from 'typeorm';
import { omitBy, isNil } from 'lodash';
import { badRequest, notFound, unauthorized } from '@hapi/boom';

import { Trainee } from '@models/trainee.model';
import { IRegistrableTrainee, ITraineeTokenOptions, ITraineeQueryString } from '@interfaces';

@EntityRepository(Trainee)
export class TraineeRepository extends Repository<Trainee>  {

  constructor() {
    super();
  }

  /**
   * @description Get one user
   *
   * @param id - The id of user
   *
   */
  async one(id: number): Promise<Trainee> {

    const repository = getRepository(Trainee);
    const options: { id: number } = omitBy({ id }, isNil) as { id: number };

    const user = await repository.findOne({
      where: options
    });

    if (!user) {
      throw notFound('User not found');
    }

    return user;
  }

  /**
   * @description Get a list of users according to current query parameters
   */
  async list({ page = 1, perPage = 30, trainee_name, trainee_email }: ITraineeQueryString): Promise<{result: Trainee[], total: number}> {

    const repository = getRepository(Trainee);
    const options = omitBy({ trainee_name, trainee_email}, isNil) as ITraineeQueryString;

    const query = repository
      .createQueryBuilder('trainee')
      .leftJoinAndSelect('trainee.medias', 'd');

    if(options.trainee_name) {
      query.andWhere('trainee.trainee_name = :trainee_name', { trainee_name });
    }

    if(options.trainee_email) {
      query.andWhere('trainee_email = :trainee_email', { trainee_email });
    }

    const [ result, total ] = await query
      .skip( ( parseInt(page as string, 10) - 1 ) * parseInt(perPage as string, 10) )
      .take( parseInt(perPage as string, 10) )
      .getManyAndCount();

    return { result, total };
  }

  /**
   * @description Find user by email and try to generate a JWT token
   *
   * @param options Payload data
   */
  async findAndGenerateToken(options: ITraineeTokenOptions): Promise<{user: Trainee, accessToken: string}> {

    const {trainee_email,trainee_password, refreshToken, apikey } = options;

    if (!trainee_email && !apikey) {
      throw badRequest('An email or an API key is required to generate a token')
    }

    const user = await this.findOne({
      where : trainee_email ? { trainee_email } : { apikey }
    });

    if (!user) {
      throw notFound('User not found');
    } else if (trainee_password && await user.passwordMatches(trainee_password) === false) {
      throw unauthorized('Password must match to authorize a token generating');
    } else if (refreshToken && refreshToken.user.trainee_email === trainee_email && Dayjs(refreshToken.expires).isBefore( Dayjs() )) {
      throw unauthorized('Invalid refresh token');
    }

    return { user, accessToken: user.token() };
  }

  

  async findAndGenerateSocialToken(options: ITraineeTokenOptions): Promise<{user: Trainee, accessToken: string}> {

    const {social_media_id,trainee_password, refreshToken, apikey } = options;

    if (!social_media_id && !apikey) {
      throw badRequest('An email or an API key is required to generate a token')
    }

    const user = await this.findOne({
      where : social_media_id ? { social_media_id } : { apikey }
    });

    if (!user) {
      throw notFound('User not found');
    } else if (trainee_password && await user.passwordMatches(trainee_password) === false) {
      throw unauthorized('Password must match to authorize a token generating');
    } else if (refreshToken && refreshToken.user.social_media_id === social_media_id && Dayjs(refreshToken.expires).isBefore( Dayjs() )) {
      throw unauthorized('Invalid refresh token');
    }

    return { user, accessToken: user.token() };
  }
  
  /**
   * @description Create / save user for oauth connexion
   *
   * @param options
   *
   * @fixme user should always retrieved from her email address. If not, possible collision on username value
   */
  async oAuthLogin(options: IRegistrableTrainee): Promise<Trainee> {

    const { trainee_email, trainee_name, trainee_password } = options;

    const userRepository = getRepository(Trainee);

    let user = await userRepository.findOne({
      where: [ { trainee_email }, { trainee_name } ],
    });

    if (user) {
      if (!user.trainee_name) {
        user.trainee_name = trainee_name;
        await userRepository.save(user)
      }
      if (user.trainee_email.includes('externalprovider') && !trainee_email.includes('externalprovider')) {
        user.trainee_email = trainee_email;
        await userRepository.save(user)
      }
      return user;
    }

    user = userRepository.create({ trainee_email,trainee_password,trainee_name });

    return userRepository.save(user);
  }
}
