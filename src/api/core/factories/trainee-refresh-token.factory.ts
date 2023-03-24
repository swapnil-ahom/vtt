import * as Dayjs from 'dayjs';
import { randomBytes } from 'crypto';
import { Trainee } from '@models/trainee.model';
import { RefreshTraineeToken } from '@models/trainee-refresh-token.model';
import { REFRESH_TOKEN } from '@config/environment.config';

/**
 * @description
 */
export class RefreshTraineeTokenFactory {

  /**
   * @description
   *
   * @param user
   */
  static get(user: Trainee): RefreshTraineeToken {
    const token = `${user.id}.${randomBytes(40).toString('hex')}`;
    const expires = Dayjs().add(REFRESH_TOKEN.DURATION, REFRESH_TOKEN.UNIT).toDate();
    return new RefreshTraineeToken( token, user, expires );
  }
}