import { firestore } from '../firebase';
import firebaseAdmin from 'firebase-admin';
import { News } from '../models/news';
import { EventEmitter } from 'stream';
import { nanoid } from 'nanoid';

export const UserEventEmitter = new EventEmitter();

interface UpdateNewsInfo {
	title: string;
	postContent: string;
}

class NewsRepository {
	constructor(
		private readonly collection: FirebaseFirestore.CollectionReference<firebaseAdmin.firestore.DocumentData>
	) {}

	async save(news: News): Promise<void> {
		try {
			console.log(news);
			await this.collection.doc(news.id).set(news);
		} catch (err) {
			console.log('failed');
			console.log(err);
		}
	}

	async bulkInsert(news: News[]): Promise<void> {
		const insertBatch = firestore().batch();

		news.forEach(news => {
			const docRef = this.collection.doc(news.id);
			insertBatch.set(docRef, news);
		});

		await insertBatch.commit();
	}

	async fetchAll(): Promise<News[]> {
		const querySnapshot = await this.collection.get();
		const docs = querySnapshot.docs.map(doc => doc.data());
		const news = docs.map(this.asNews);
		return news;
	}

	async deleteById(id: string): Promise<void> {
		console.log();
		await this.collection.doc(id).delete();
	}

	async update(newsInfo: News) {
		await this.collection.doc(newsInfo.id).set(newsInfo);
	}

	async findById(id: string): Promise<News | undefined> {
		const querySnapshot = await this.collection.doc(id).get();

		const data = querySnapshot.data();

		return data !== undefined ? this.asNews(data) : undefined;
	}

	// Searches needed
	async findByName(sender_firstName: string, sender_lastName: string): Promise<News | undefined> {
		const querySnapshot = await this.collection
			.where('sender_firstName', '==', sender_firstName)
			.where('sender_lastName', '==', sender_lastName)
			.get();

		if (querySnapshot.empty) {
			return undefined;
		}

		const user = this.asNews(querySnapshot.docs[0].data());

		return user;
	}

	private asNews(doc: any): News {
		return {
			id: doc.id,
            title: doc.title,
            postContent: doc.postContent,
            media: doc.media, 
            postedTime: doc.postedTime,
            sender_firstName: doc.sender_firstName,
            sender_lastName:doc.sender_lastName,
		};
	}
}

const instance = new NewsRepository(firestore().collection('news'));

export default instance;
