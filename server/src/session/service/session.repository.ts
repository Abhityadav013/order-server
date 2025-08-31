// src/repositories/session.repository.ts

import Session, { ISession } from "../models/session.model";


export class SessionRepository {
  async findByGuestId(guestId: string) {
    return Session.findOne({ guestId }).exec();
  }

  async findByDeviceId(deviceId: string) {
    return Session.findOne({ deviceId }).exec();
  }

  async createNew(params: {
    latitude?: string;
    longitude?: string;
    tidTTLms: number;
    deviceTTLms: number;
  }) {
    const now = Date.now();
    const doc = new Session({
      latitude: params.latitude,
      longitude: params.longitude,
      tidExpiresAt: now + params.tidTTLms,
      deviceExpiresAt: now + params.deviceTTLms,
      // deviceId and guestId default via schema uuidv4
    });
    return doc.save();
  }

  async touch(session: ISession, tidTTLms: number, deviceTTLms: number) {
    const now = Date.now();
    session.tidExpiresAt = now + tidTTLms;
    session.deviceExpiresAt = now + deviceTTLms;
    return session.save();
  }
}
