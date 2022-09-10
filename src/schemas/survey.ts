import mongoose, { Schema } from 'mongoose';

const fileSchema = new Schema({
    name: String, 
    rawName: String,
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
  