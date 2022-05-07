import FileSchema, { SyncInfoSchema } from "./schemas/file";
import { firestore as getFirestoreInstance } from "./firebase";

export async function synchronize() {
  console.log('Initializing sync process...');
  const firestore = getFirestoreInstance();

  console.log('Getting collection instance...');
  const collection = firestore.collection('filesMetadata');
  
  console.log('Initializing delete batch...');
  const deleteBatch = firestore.batch();
  const snapshots = await collection.get();

  snapshots.forEach(doc => {
    deleteBatch.delete(doc.ref);
  });

  await deleteBatch.commit();
  console.log('Delete batch has been completed');

  console.log('Initializing insert batch...');
  const insertBatch = firestore.batch();

  const mongoDocs = await FileSchema.find();
  
  mongoDocs.forEach(async doc => {
    const docRef = collection.doc(doc.id);

    const data = {
      id: doc.id,
      name: doc.name,
      type: doc.type,
      path: doc.path,
      rawName: doc.rawName,
      parentId: doc.parentId,
      createdAt: doc.createdAt
    }
    
    insertBatch.set(docRef, data)
  });

  await insertBatch.commit();
  console.log('Insert batch has been completed');

  console.log('Data has been synced successfully ✔');
}