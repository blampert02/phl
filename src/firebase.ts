import firebaseAdmin from 'firebase-admin';
import admin from 'firebase-admin'
import Path from 'path';
import firebase = require('firebase/app');
import { nanoid } from 'nanoid';
import { initializeApp } from 'firebase/app';
import { UserRecord } from 'firebase-admin/lib/auth/user-record';
import { isUidIdentifier } from 'firebase-admin/lib/auth/identifier';

firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert(
    Path.join(__dirname, '../service-account.json')
  ),
  storageBucket: "phla-cdd2c.appspot.com",
  databaseURL: 'https://.firebaseio.com'
});

const instance = firebaseAdmin.firestore();
instance.settings({ ignoreUndefinedProperties: true });

export default firebaseAdmin;

export function firestore() {
  return instance;
}