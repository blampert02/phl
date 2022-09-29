import { OAUTH2_CLIENT_ID, OAUTH2_CLIENT_SECRET } from './constants';
import fetch from 'cross-fetch';
import { Request } from 'express';
import passport from 'passport';
import OAuth2 from 'passport-google-oauth2';
import { URL } from 'url';
import fs from 'fs';
import path from 'path';

const GoogleStrategy = OAuth2.Strategy;
const CREDENTIALS_PATH = path.join(__dirname, 'credentials.json');

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

async function saveCredentials(filepath: string, credentials: OAuth2Credentials): Promise<void> {
  fs.writeFile(filepath, JSON.stringify(credentials), (err) => {
    if(err) return Promise.reject(err.message);
    return Promise.resolve();
  });
}

async function getCredentials(filepath: string): Promise<OAuth2Credentials | undefined> {
  return new Promise((resolve, reject) => {
    fs.readFile(filepath, { encoding: 'utf-8' }, (err, data) => {
      if(err) {
        resolve(undefined)
        return;
      }
      resolve(<OAuth2Credentials>JSON.parse(data));
    });
  });
}

export async function getOAuth2Credentials(): Promise<OAuth2Credentials> {
  return await getCredentials(CREDENTIALS_PATH) ?? { token: '', refreshToken: '' };
}

export async function isTokenValid(token: string): Promise<boolean> {
  const url = new URL('https://www.googleapis.com/oauth2/v1/tokeninfo');
  url.searchParams.append('access_token', token);

  const response = await fetch(url.toString());
  return response.status === 200;
}

export async function renewToken(refreshToken: string): Promise<boolean> {
  const url = new URL('https://oauth2.googleapis.com/token');

  const response = await fetch(url.toString(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: OAUTH2_CLIENT_ID,
      client_secret: OAUTH2_CLIENT_SECRET,
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
  });

  if (response.status !== 200) return false;

  const body = await response.json();
  // SIDE EFFECT -> This updates the internal OAuth2 credentials since the them are stored in memory!
  const credentials = await getCredentials(CREDENTIALS_PATH);
  saveCredentials(CREDENTIALS_PATH, {
    token: body.access_token,
    refreshToken: credentials?.refreshToken ?? ""
  })
  return true;
}

passport.use(new GoogleStrategy(
    {
      clientID: OAUTH2_CLIENT_ID,
      clientSecret: OAUTH2_CLIENT_SECRET,
      callbackURL: 'http://localhost:3000/callback',
      passReqToCallback: true,
    },
    function (request: Request, accessToken: string, refreshToken: string, profile: any, done: any) {
      saveCredentials(CREDENTIALS_PATH, {
        token: accessToken,
        refreshToken
      });
      return done(null, profile);
    }
  )
);
