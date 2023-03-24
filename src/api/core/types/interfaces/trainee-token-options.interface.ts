import { RefreshTraineeToken } from '@models/trainee-refresh-token.model';

export interface ITraineeTokenOptions {
  trainee_name?: string;
  trainee_email: string;
  trainee_password?:string;
  social_media_id?:string;
  apikey?: string;
  refreshToken: RefreshTraineeToken
}