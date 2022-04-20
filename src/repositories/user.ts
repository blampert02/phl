import { firestore } from '../firebase';
import firebaseAdmin from 'firebase-admin'
import { User, UserType } from '../models/user';

interface UpdateUserInfo {
  firstName: string;
  lastName: string;
  address: string;
  phoneNumber?: string;
  address2?: string;
  isActive: boolean;
}

interface UpdateStudentInfo extends UpdateUserInfo {
  level: number;
}

interface UpdateTeacherInfo extends UpdateUserInfo {
  inss: string;
}

class UserRepository {
  constructor(
    private readonly collection: FirebaseFirestore.CollectionReference<firebaseAdmin.firestore.DocumentData>
  ) {}

  async save(user: User): Promise<void> {
    try {
      console.log(user);
      await this.collection.doc(user.id).set(user);
    } catch (err) {
      console.log('failed');
      console.log(err);
    }
  }

  async deleteById(id: string): Promise<void> {
    console.log();
    await this.collection.doc(id).delete();
  }

  async findByEmail(email: string): Promise<User | undefined> {
    const querySnapshot = await this.collection
      .where('email', '==', email)
      .get();

    if (querySnapshot.empty) {
      return undefined;
    }

    const user = this.asUser(querySnapshot.docs[0].data());

    return user;
  }

  async update(id: string, userInfo: UpdateUserInfo) {
    this.collection.doc(id).update(userInfo);
  }

  async findByUsernameAndPassword(
    username: string,
    password: string
  ): Promise<User | undefined> {
    const querySnapshot = await this.collection
      .where('username', '==', username)
      .where('password', '==', password)
      .get();

    if (querySnapshot.empty) {
      return undefined;
    }

    const user = this.asUser(querySnapshot.docs[0].data());

    return user;
  }

  async findById(id: string): Promise<User | undefined> {
    const querySnapshot = await this.collection.doc(id).get();

    const data = querySnapshot.data();

    return data !== undefined ? this.asUser(data) : undefined;
  }

  async findByIdAndType(id: string, type: UserType): Promise<User | undefined> {
    const querySnapshot = await this.collection
      .where('id', '==', id)
      .where('type', '==', type)
      .get();

    if (querySnapshot.empty) {
      return undefined;
    }

    const user = this.asUser(querySnapshot.docs[0].data());

    return user;
  }

  async fetchAllByType(type: UserType): Promise<User[]> {
    const querySnapshot = await this.collection.where('type', '==', type).get();
    const docs = querySnapshot.docs.map(doc => doc.data());
    const users = docs.map(this.asUser);
    return users;
  }

  private asUser(doc: any): User {
    return {
      id: doc.id,
      type: doc.type,
      username: doc.username,
      email: doc.email,
      password: doc.password,
      firstName: doc.firstName,
      lastName: doc.lastName,
      isActive: doc.isActive,
      birthDate: doc.birthDate,
      phoneNumber: doc.phoneNumber,
      address: doc.address,
      address2: doc.address2,
      city: doc.city,
      level: doc.level,
      inss: doc.inss,
    };
  }
}

const instance = new UserRepository(firestore().collection('users'));

export default instance;
