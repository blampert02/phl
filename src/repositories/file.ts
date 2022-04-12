import firebaseAdmin, { firestore } from 'firebase-admin';
import { LocalFile, Directory } from '../models/file';
import FileSchema from '../schemas/file';

export type ContentFirebaseModel = {
	path: string; 
	id: string;
	name: string;
	type: 'directory' | 'file',
	parentDirectoryId: string;
}

function isLocalFile(object: any): object is LocalFile {
	return 'downloadUrl' in object;
}

export class DirectoryRepository {
	async create(type: string, path: string, item: LocalFile | Directory): Promise<void> {
		if(isLocalFile(item)) {
			const document = new FileSchema({
				path: path,
				type: type,
				parentId: item.parentDirectoryId,
				name: item.name.replace(/\s/g, '').replace('/', ''),
				downloadUrl: item.downloadUrl
			});

			await document.save();

			return;
		}
		
		if(!item.name) return;

		path = path.endsWith("/") && path.length == 1 ? path : path + '/'; 

		item.name = item.name.replace(/\s/g, '').replace('/', '');

		const existingDocument = await FileSchema.findOne({
			$and: [{ path: { $eq: path } }, { name: { $eq: item.name } }]
		});

		if(existingDocument) return;

		const document = new FileSchema({
			path: path,
			type: type,
			parentId: item.parentDirectoryId,
			name: item.name.replace(/\s/g, '').replace('/', '')
		});

		await document.save();
		
		return;
	}

	async FindRootDirectory(): Promise<Directory | undefined> {
		const document = await FileSchema.findOne({ path: '/' });

		if(document == undefined) return undefined;

		return {
			id: document._id,
			name: document.name,
			content: [],
			parentDirectoryId: document.parentId,
			path: document.path
		}
	}

	async findDirectoryByPath(path: string): Promise<Directory | undefined> {
		console.log('before decoded: ' + path);
		path = decodeURI(path);
		console.log('Decoded: ' + path);

		path = path.endsWith('/') ? path.substring(path.lastIndexOf('/'), 1) : path;
		const lastPathSlashPosition = path.lastIndexOf('/');
		const directoryName = path.substring(lastPathSlashPosition + 1, path.length);
		const lastIndexPos = path.lastIndexOf(directoryName);
		path = path.substring(0, lastIndexPos);

		console.log('dirname: ' + directoryName);
		console.log('path: ' + path);

		const document = await FileSchema.findOne({
			$and: [{ path: { $eq: path } }, { name: { $eq: directoryName } }]
		});

		if(document === null) return undefined;

		return {
			id: document._id,
			name: document.name,
			content: [],
			parentDirectoryId: document.parentId,
			path: document.path
		}
	}

  async findContentByDirectory(directory: Directory): Promise<Directory | undefined> { 
		const documents = await FileSchema.find({ parentId: directory.id });

		if(documents === undefined) return undefined;
		console.log(documents);

		const content: (Directory | LocalFile)[] = documents.map(doc => {
			if(doc.type === 'file') {
				let name = doc.name;

				if(doc.name.length > 24) {
					const position = doc.name.lastIndexOf(".");
					const extension = doc.name.substring(position, doc.name.length);
					name = doc.name.substring(0, 20) + extension;
				}

				const file: LocalFile = {
					id: doc._id,
					name: name,
					downloadUrl: doc.downloadUrl,
					parentDirectoryId: doc.parentId,
					path: doc.path
				}

				return file;

			} else {
				const directory: Directory = {
					id: doc._id,
					name: doc.name,
					parentDirectoryId: doc.parentId,
					content: [],
					path: doc.path
				}

				return directory;
			}
		});

		return {
			...directory,
			content
		}
	}

	async delete(id: string): Promise<void> {
		const document = await FileSchema.findOne({ _id: id });

		if(!document) return;

		if(document.type === 'file') {
			await FileSchema.deleteOne({ _id: id });
			return;
		}

		const path = document.path + document.name + '/';
		console.log('path to delete: ' + path);
		await FileSchema.deleteOne({ _id: id });
		await FileSchema.deleteMany({ path: { $regex: path }});
	}

	async update(name: string, id: string): Promise<void> {
		const document = await FileSchema.findOne({ _id: id });

		if(!document) return;

		if(document.type === 'file') {
			await FileSchema.updateOne({ _id: id });
			return;
		}

		const folderPath = document.path + document.name + '/';
		const newFolderPath = document.path + name + '/';

		await FileSchema.updateOne({ _id: id }, { $set: { name: name } });
		await FileSchema.updateMany({ path: { $regex: folderPath }}, { $set: { path: newFolderPath } });
	}
}

export default new DirectoryRepository();