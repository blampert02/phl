import mongoose, { Schema } from 'mongoose';
import { Directory, LocalFile } from '../models/file';

const syncInfoSchema = new Schema({
  lastTimeSyncedAt: {
    type: Date,
    required: false
  }
});

const fileSchema = new Schema({
  name: String, 
  path: String,
  downloadUrl: {
    type: String,
    required: false
  },
  type: {
    type: String,
    enum: ['directory', 'file'],
    default: 'directory'
  },
  parentId: {
    type: String,
    required: false
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now()
  }
});

const FileSchema = mongoose.model('FileMetadata', fileSchema); 
export const SyncInfoSchema = mongoose.model('sync-info', syncInfoSchema);

export default FileSchema;