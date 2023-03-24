import * as passport from 'passport';
import { Strategy } from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { OAuth2Strategy as GoogleStrategy } from 'passport-google-oauth';
import { Strategy as GithubStrategy } from 'passport-github2';
import { Strategy as LinkedInStrategy } from 'passport-linkedin-oauth2';

import { ACCESS_TOKEN, FACEBOOK, GOOGLE, GITHUB, LINKEDIN } from '@config/environment.config';
import { AuthService } from '@services/auth.service';

const ExtractJwtAlias = ExtractJwt as { fromAuthHeaderWithScheme: (type: string) => string };

/**
 * Authentication configuration
 */
class Authentication {

  /**
   * @description Authentication instance
   */
  private static instance: Authentication;

  /**
   * @description Default options
   */
  private options = {
    jwt: {
      secretOrKey: ACCESS_TOKEN.SECRET,
      jwtFromRequest: ExtractJwtAlias.fromAuthHeaderWithScheme('Bearer')
    }
  };

  private constructor() {}

  /**
   * @description Authentication singleton getter
   */
  static get(): Authentication {
    if (!Authentication.instance) {
      Authentication.instance = new Authentication();
    }
    return Authentication.instance;
  }

  /**
   * @description Wrap passport method
   */
  initialize = (): any => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    return passport.initialize() as unknown;
  }

  /**
   * @description Enable available auth strategies
   */
  plug(): void {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    passport.use(this.factory('jwt'));
    [ FACEBOOK, GITHUB, GOOGLE, LINKEDIN ]
      .filter(provider => provider.IS_ACTIVE)
      .forEach(provider => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        passport.use(this.factory(provider.KEY))
      });
  }

  /**
   * @description Provide a passport strategy instance
   *
   * @param strategy Strategy to instanciate
   */
  private factory (strategy: string): Strategy {
    switch(strategy) {
      case 'jwt':
        return new JwtStrategy( this.options.jwt, AuthService.jwt ) as Strategy;
      case 'facebook':
        return new FacebookStrategy({
          clientID: FACEBOOK.ID,
          clientSecret: FACEBOOK.SECRET,
          callbackURL: FACEBOOK.CALLBACK_URL,
          profileFields: ['id', 'link', 'email', 'name', 'picture', 'address']
        }, AuthService.oAuth ) as Strategy;
      case 'google':
        return new GoogleStrategy({
          clientID: GOOGLE.ID,
          clientSecret: GOOGLE.SECRET,
          callbackURL: GOOGLE.CALLBACK_URL,
          scope: ['profile', 'email']
        }, AuthService.oAuth ) as Strategy;
      case 'github':
        return new GithubStrategy({
          clientID: GITHUB.ID,
          clientSecret: GITHUB.SECRET,
          callbackURL: GITHUB.CALLBACK_URL,
          scope: ['profile', 'email']
        }, AuthService.oAuth ) as Strategy;
      case 'linkedin':
        return new LinkedInStrategy({
          clientID: LINKEDIN.ID,
          clientSecret: LINKEDIN.SECRET,
          callbackURL: LINKEDIN.CALLBACK_URL,
          scope: ['profile', 'email']
        }, AuthService.oAuth ) as Strategy;
    }
  }
}

const instance = Authentication.get();

export { instance as Authentication };