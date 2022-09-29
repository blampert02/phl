import firebaseAdmin from 'firebase-admin';
import Path from 'path';

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