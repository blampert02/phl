import dotenv from 'dotenv-safe';
dotenv.config();

export const OAUTH2_CLIENT_ID = process.env['OAUTH2_CLIENT_ID']!;

export const OAUTH2_CLIENT_SECRET = process.env['OAUTH2_CLIENT_SECRET']!;