import { firestore } from '../firebase';
import firebaseAdmin from 'firebase-admin';
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
		this.collection.doc(id).update(userInfo);
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

	async findByQuery(query: string, type: UserType): Promise<User[]> {
		const users = await this.fetchAllByType(type);
		const sanitize = (query: string) => query.toLowerCase().trim();

		const findByEmail = (user: User) => sanitize(user.email).includes(sanitize(query));
		const findByName = (user: User) => sanitize(user.firstName).includes(sanitize(query));
		const findByLastName = (user: User) => sanitize(user.lastName).includes(sanitize(query));

		const filteredUsers = users.filter(user => findByEmail(user) || findByName(user) || findByLastName(user));

		console.log(filteredUsers);

		return filteredUsers;
		// if (students) {
		// 	searchedStudents = students.filter(student => {
		// 		filter = filter.toLocaleLowerCase().toString();
		// 		return (
		// 			student.firstName.toLocaleLowerCase().includes('Jefdale2') ||
		// 			student.lastName.toLocaleLowerCase().includes(filter) ||
		// 			student.email.toLocaleLowerCase().includes(filter)
		// 		);
		// 	});
		// }
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

	async findByLevel(level: number): Promise<User | undefined> {
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
