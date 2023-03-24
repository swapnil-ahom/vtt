import { OAuthProvider } from '@types';

export interface IOauthTraineeResponse {

  /**
   *
   */
  id: number;

 
  /**
   *
   */
   trainee_email: string,

  /**
   *
   */
  photos: { value: string }[],

  /**
   *
   */
  provider: { name: OAuthProvider, _raw: string, _json: Record<string,unknown> }

  /**
   *
   */
   trainee_name?: string;
}