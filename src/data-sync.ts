import FileSchema, { SyncInfoSchema } from "./schemas/file";
import { firestore as getFirestoreInstance } from "./firebase";

export async function synchronize() {
  // let lastSyncedInfo = await SyncInfoSchema.findOne();

  // if(lastSyncedInfo === null) {
  //   await SyncInfoSchema.create({
  //     lastTimeSyncedAt: Date.now()
  //   })
  // }

  // const file = await FileSchema.findOne({ createdAt: { $gte: lastSyncedInfo.lastTimeSyncedAt} });

  // if(file === null) {
  //   console.log('Nothing to sync');
  //   return;
  // }
  console.log(':D');
  const firestore = getFirestoreInstance();
  const collection = firestore.collection('filesMetadata');

  const deleteBatch = firestore.batch();
  const snapshots = await collection.get();

  snapshots.forEach(doc => {
    deleteBatch.delete(doc.ref);
  });

  await deleteBatch.commit();

  const insertBatch = firestore.batch();

  const mongoDocs = await FileSchema.find();

  mongoDocs.forEach(async doc => {
    const docRef = collection.doc(doc.id);

    const data = {
      id: doc.id,
      name: doc.name,
      type: doc.type,
      parentId: doc.parentId,
      createdAt: doc.createdAt
    }

    insertBatch.set(docRef, data)
  });

  await insertBatch.commit();

  // lastSyncedInfo.lastTimeSyncedAt = Date.now();
  // await lastSyncedInfo.save();
  console.log('Data has been synced successfully 🔥');
}