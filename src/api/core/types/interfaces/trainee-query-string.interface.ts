import { IQueryString } from '@interfaces';

export interface ITraineeQueryString extends IQueryString {
  trainee_name?: string;
  trainee_email?: string;
  trainee_password?:string;
}