import { firestore } from '../firebase';
import firebaseAdmin from 'firebase-admin';
import { Post, Message } from '../models/forum'
import userRepository, {UserEventEmitter} from './user';
import { notify } from '../pusher';

class ForumRepository {
	constructor(
		readonly collection: FirebaseFirestore.CollectionReference<firebaseAdmin.firestore.DocumentData>
	) {}

	async bulkUpdate(userId: string): Promise<void> {
		const user = await userRepository.findById(userId);
		if(!user) return;
		
		const snapshot = await this.collection.where('senderId', '==', userId).get();
		if(snapshot.empty) return;

		const updateBatch = firestore().batch();

		for(const forum of snapshot.docs) {
			updateBatch.update(forum.ref, {
				sender_firstName: user.firstName,
				sender_lastName: user.lastName
			});

			const messagesQuerySnapshot = await this.collection.doc(forum.id).collection('messages').get();
			if(messagesQuerySnapshot.empty) return;

			const messageUpdateBatch = firestore().batch();

			for(const message of messagesQuerySnapshot.docs) {
				const { senderId } = message.data();
				if(senderId === userId) {
					messageUpdateBatch.update(message.ref, {
						sender_firstName: user.firstName,
						sender_lastName: user.lastName
					});		
				}
			}

			await messageUpdateBatch.commit();
		}

		await updateBatch.commit();
	}

	async save(post: Post): Promise<void> {
		try {
			await this.collection.doc(post.id).set(post);
		} catch (err) {
		}
	}

	async bulkInsert(posts: Post[]): Promise<void> {
		const insertBatch = firestore().batch();

		posts.forEach(post => {
			const docRef = this.collection.doc(post.id);
			insertBatch.set(docRef, post);
		});

		await insertBatch.commit();
	}

    async fetchPosts(): Promise<Post[]> {
		const postsQuerySnapshot = await this.collection.get();
		const docs = postsQuerySnapshot.docs.map(doc => doc.data());
		const notMappedPosts = docs.map(this.asForum);
		const posts: Post[] = [];

		for(let post of notMappedPosts) {
				const messagesQuerySnapshot = await this.collection.doc(post.id).collection('messages').get();
				const docs = messagesQuerySnapshot.docs.map(doc => doc.data());
				const messages = docs.map(doc => {
					return {
						id: doc.id,
						comment: doc.comment,
						main_tittle: doc.main_tittle,
						senderId: doc.senderId,
						timestamp: doc.timestamp,
						userImage: doc.userImage, 
						messages: [],
						sender_firstName: doc.sender_firstName,
    					sender_lastName:doc.sender_lastName,
					};
				});
				posts.push({ ...post, messages })
			}

		return posts;
	}

	async deleteById(id: string): Promise<void> {
		await this.collection.doc(id).delete();
	}

	async deleteMessageById(postId: string, messageId: string): Promise<void> {
		await this.collection.doc(postId).collection('messages').doc(messageId).delete();
	}

	async updatePost(postInfo: Post) {
		await this.collection.doc(postInfo.id).set(postInfo);
	}

	async updateMessage(postId: string, messageInfo: Message) {
		await this.collection.doc(postId).collection('messages').add(messageInfo);
	}

	async findById(id: string): Promise<Post | undefined> {
		const querySnapshot = await this.collection.doc(id).get();

		const data = querySnapshot.data();

		return data !== undefined ? this.asForum(data) : undefined;
	}

	private asForum(doc: any): Post {
		return {
			id: doc.id,
            comment: doc.comment,
            main_tittle: doc.main_tittle,
            senderId: doc.senderId,
            timestamp: doc.timestamp,
            userImage: doc.userImage,
			messages: [],
			sender_firstName: doc.sender_firstName,
    		sender_lastName:doc.sender_lastName,
		};
	}
}

const instance = new ForumRepository(firestore().collection('threads'));

UserEventEmitter.on('user-updated', async message => {
	console.log('user-updated trigger!');
	
	const { id } = message;
	await instance.bulkUpdate(id);
});

async function setListeners() {
	instance.collection.onSnapshot(async querySnapshot => {
		await notify('forum', { message: '' })

		querySnapshot.docs.forEach(message => {

		});

	}, err => {
		console.log(err);
	});
}

setListeners()


export default instance;
