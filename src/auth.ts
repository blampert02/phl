import { createUser, User, UserType } from './models/user';
import { UserRecord } from 'firebase-admin/lib/auth/user-record';
import firebaseAdmin from './firebase';
import repository from './repositories/user';

const firebaseAuth = firebaseAdmin.auth();

export async function signUp(
  email: string,
  password: string,
  type: UserType,
  profileData: any
): Promise<UserRecord | undefined> {
  try {
    const authRecord = await firebaseAuth.createUser({ email, password });
    const user = createUser(authRecord.uid, type, profileData);
    console.log(user);
    await repository.save(user);
  } catch {
    return undefined;
  }
}
