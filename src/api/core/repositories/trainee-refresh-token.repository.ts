import { Repository, EntityRepository } from 'typeorm';
import { Trainee } from '@models/trainee.model';
import { RefreshTraineeToken } from '@models/trainee-refresh-token.model';
import { RefreshTraineeTokenFactory } from '@factories/trainee-refresh-token.factory';

@EntityRepository(RefreshTraineeToken)
export class RefreshTraineeTokenRepository extends Repository<RefreshTraineeToken> {

  constructor() {
    super();
  }

  /**
   * @description Generate a new refresh token
   *
   * @param user
   */
  generate(user: Trainee): RefreshTraineeToken {
    const refreshToken = RefreshTraineeTokenFactory.get(user);
    void this.save(refreshToken);
    return refreshToken;
  }
}
