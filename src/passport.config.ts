import { Request } from 'express';
import passport from 'passport';
import OAuth2 from 'passport-google-oauth2';
const GoogleStrategy = OAuth2.Strategy;

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user: any, done) {
  done(null, user);
});

export let token = '';

passport.use(
  new GoogleStrategy(
    {
      clientID: '984076766810-2ufuvjkb42mo3ad5pt5415cccrieedaa.apps.googleusercontent.com',
      clientSecret: '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',
      callbackURL: 'http://localhost:3000/callback',
      passReqToCallback: true,
    },
    function (request: Request, accessToken: string, refreshToken: string, profile: any, done: any) {
      console.log(`Access token -> ${accessToken}`);
      token = accessToken;
      return done(null, profile);
    }
  )
);
