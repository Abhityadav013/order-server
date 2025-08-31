// src/models/Session.ts
import mongoose, { Schema, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import CounterModel from '../../models/Counter';

export const UserSessionSchemaName = 'Session';

export interface ISession extends Document {
  id: string;           // UUIDv4 (business id, not _id)
  displayId: string;    // auto-increment label e.g. S00000001
  deviceId: string;     // UUIDv4 (short-term identity)
  guestId: string;      // UUIDv4 (long-term identity)
  latitude?: string;
  longitude?: string;
  tidExpiresAt: number;     // epoch ms (10 days)
  deviceExpiresAt: number;  // epoch ms (10 minutes)
}

const SessionSchema = new Schema<ISession>(
  {
    id: {
      type: String,
      required: true,
      default: uuidv4, // pass function reference, not invocation
    },
    displayId: {
      type: String,
      unique: true,
    },
    deviceId: {
      type: String,
      required: true,
      default: uuidv4,
      index: true,
    },
    guestId: {
      type: String,
      required: true,
      default: uuidv4,
      index: true,
    },
    latitude: { type: String },
    longitude: { type: String },
    tidExpiresAt: { type: Number, required: true },
    deviceExpiresAt: { type: Number, required: true },
  },
  {
    versionKey: false,
    collection: UserSessionSchemaName,
    timestamps: true,
  }
);

// Auto-increment displayId on create using Counter('session')
SessionSchema.pre('save', async function (next) {
  if (this.isNew && !this.displayId) {
    try {
      const counter = await CounterModel.findOneAndUpdate(
        { _id: 'session' },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );
      this.displayId = `S${String(counter!.seq).padStart(8, '0')}`;
    } catch (err) {
      return next(err as any);
    }
  }
  next();
});

const Session = mongoose.models.Session || mongoose.model<ISession>('Session', SessionSchema);
export default Session;
