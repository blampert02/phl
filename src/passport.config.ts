import { OAUTH2_CLIENT_ID, OAUTH2_CLIENT_SECRET } from './constants';
import fetch from 'cross-fetch';
import { Request } from 'express';
import passport from 'passport';
import OAuth2 from 'passport-google-oauth2';
import { URL } from 'url';

const GoogleStrategy = OAuth2.Strategy;

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user: any, done) {
  done(null, user);
});

export type OAuth2Credentials = {
  token: string;
  refreshToken: string;
};

const internalOAuth2Credentials: OAuth2Credentials = {
  token: '',
  refreshToken: '',
};

export function getOAuth2Credentials(): OAuth2Credentials {
  return internalOAuth2Credentials;
}

export async function isTokenValid(token: string): Promise<boolean> {
  const url = new URL('https://www.googleapis.com/oauth2/v1/tokeninfo');
  url.searchParams.append('access_token', token);

  const response = await fetch(url.toString());
  return response.status === 200;
}

export async function renewToken(refreshToken: string): Promise<boolean> {
  const url = new URL('https://oauth2.googleapis.com/token');
  const content: any = {
    client_id: OAUTH2_CLIENT_ID,
    client_secret: OAUTH2_CLIENT_SECRET,
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
  };
  const formBody: any = [];

  for (let property in content) {
    const encodedKey = encodeURIComponent(property);
    const encodedValue = encodeURIComponent(content[property]);
    formBody.push(encodedKey + '=' + encodedValue);
  }

  const response = await fetch(url.toString(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
    },
    body: formBody,
  });
  
  console.log(await response.json());
  if (response.status !== 200) return false;

  const credentials = await response.json();
  // SIDE EFFECT -> This updates the internal OAuth2 credentials since the them are stored in memory!
  internalOAuth2Credentials.token = credentials.access_token;
  return true;
}

passport.use(
  new GoogleStrategy(
    {
      clientID: OAUTH2_CLIENT_ID,
      clientSecret: OAUTH2_CLIENT_SECRET,
      callbackURL: 'http://localhost:3000/callback',
      passReqToCallback: true,
    },
    function (request: Request, accessToken: string, refreshToken: string, profile: any, done: any) {
      console.log(`Access token -> ${accessToken}`);

      internalOAuth2Credentials.token = accessToken;
      internalOAuth2Credentials.refreshToken = refreshToken;

      return done(null, profile);
    }
  )
);
