import { firestore } from '../firebase';
import firebaseAdmin from 'firebase-admin';
import { Post, Message } from '../models/forum'


class ForumRepository {
	constructor(
		private readonly collection: FirebaseFirestore.CollectionReference<firebaseAdmin.firestore.DocumentData>
	) {}

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

export default instance;
