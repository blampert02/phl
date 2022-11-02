import { firestore } from '../firebase';
import firebaseAdmin from 'firebase-admin';
import { User, UserType } from '../models/user';
import { firebaseAuth } from '../auth'
import forumRepository from './forum';
import { EventEmitter } from 'stream';

export const UserEventEmitter = new EventEmitter();

interface UpdateUserInfo {
	firstName: string;
	lastName: string;
	address: string;
	phoneNumber?: string;
	address2?: string;
	isActive: boolean;
	email: string;
}

interface UpdateStudentInfo extends UpdateUserInfo {
	level: string;
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

	async bulkInsert(users: User[]): Promise<void> {
		const insertBatch = firestore().batch();

		users.forEach(user => {
			const docRef = this.collection.doc(user.id);
			insertBatch.set(docRef, user);
		});

		await insertBatch.commit();
	}

	async deleteById(id: string): Promise<void> {
		console.log();
		await this.collection.doc(id).delete();
	}

	async update(id: string, userInfo: UpdateUserInfo) {
		await this.collection.doc(id).update(userInfo);
		await firebaseAuth.updateUser(id, {email: userInfo.email});
		UserEventEmitter.emit('user-updated', { id });
		console.log(userInfo);
	}

	async findByUsernameAndPassword(username: string, password: string): Promise<User | undefined> {
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
		const querySnapshot = await this.collection.where('id', '==', id).where('type', '==', type).get();

		if (querySnapshot.empty) {
			return undefined;
		}

		const user = this.asUser(querySnapshot.docs[0].data());

		return user;
	}

	async findByQuery(search: string, type: UserType): Promise<User[]> {
		const users = await this.fetchAllByType(type);
		const sanitize = (query: string) => query.toLowerCase().trim();

		const findByEmail = (user: User) => sanitize(user.email).includes(sanitize(search));
		const findByName = (user: User) => sanitize(user.firstName).includes(sanitize(search));
		const findByLastName = (user: User) => sanitize(user.lastName).includes(sanitize(search));
		const findByBranch = (user: User) => {
            const branch = (user.branch || 'undefined').toString();
            return sanitize(branch).includes(sanitize(search));
        };

		const findByShift = (user: User) => {
            const shift = (user.shift || 'undefined').toString();
            return sanitize(shift).includes(sanitize(search));
        };

		const findByLevel = (user: User) => {
            const level = (user.level || 'undefined').toString();
            return sanitize(level).includes(sanitize(search));
        };
        const filteredUsers = users.filter(
            user => findByEmail(user) || findByName(user) || findByLastName(user) || findByLevel(user) || findByBranch(user) || findByShift(user)
        );

		return filteredUsers;

	}

	async fetchAllByType(type: UserType): Promise<User[]> {
		const querySnapshot = await this.collection.where('type', '==', type).get();
		const docs = querySnapshot.docs.map(doc => doc.data());
		const users = docs.map(this.asUser);
		return users;
	}

	// Searches needed
	async findByEmail(email: string): Promise<User | undefined> {
		const querySnapshot = await this.collection.where('email', '==', email).get();

		if (querySnapshot.empty) {
			return undefined;
		}

		const user = this.asUser(querySnapshot.docs[0].data());

		return user;
	}

	async findByName(firstName: string, lastName: string): Promise<User | undefined> {
		const querySnapshot = await this.collection
			.where('firstName', '==', firstName)
			.where('lastName', '==', lastName)
			.get();

		if (querySnapshot.empty) {
			return undefined;
		}

		const user = this.asUser(querySnapshot.docs[0].data());

		return user;
	}


	async findByLevel(level: string): Promise<User | undefined> {
		const querySnapshot = await this.collection.where('level', '==', level).get();

		if (querySnapshot.empty) {
			return undefined;
		}

		const user = this.asUser(querySnapshot.docs[0].data());

		return user;
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
			branch: doc.branch,
			shift: doc.shift,
			address: doc.address,
			address2: doc.address2,
			city: doc.city,
			level: doc.level,
			inss: doc.inss,
			activityFlag: doc.activityFlag,
			lastTimeActivity: doc.lastTimeActivity,
		};
	}
}

const instance = new UserRepository(firestore().collection('users'));

export default instance;
