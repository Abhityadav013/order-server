// src/services/session.service.ts

import { ISession } from "../models/session.model";
import { SessionRepository } from "./session.repository";

const DEVICE_TTL_MS = 10 * 60 * 1000;
const TID_TTL_MS = 10 * 24 * 60 * 60 * 1000;

export class SessionService {
  constructor(private repo: SessionRepository) {}

  private isValid(s: ISession) {
    const now = Date.now();
    return s.tidExpiresAt > now && s.deviceExpiresAt > now;
  }

  // Note return type: Promise<ISession>
  async createOrRestore(params: {
    tid?: string | null;
    ssid?: string | null;
    latitude?: string | null;
    longitude?: string | null;
  }): Promise<ISession> {
    const { tid, ssid, latitude, longitude } = params;
    let rec: ISession | null = null;

    if (tid) rec = await this.repo.findByGuestId(tid);
    if (!rec && ssid) rec = await this.repo.findByDeviceId(ssid);

    if (!rec) {
      rec = await this.repo.createNew({
        latitude: latitude ?? undefined,
        longitude: longitude ?? undefined,
        tidTTLms: TID_TTL_MS,
        deviceTTLms: DEVICE_TTL_MS,
      });
      if (!rec) throw new Error('Session creation failed');
      return rec;
    }

    if (!this.isValid(rec)) {
      rec = await this.repo.touch(rec, TID_TTL_MS, DEVICE_TTL_MS);
      if (!rec) throw new Error('Session refresh failed');
      return rec;
    }

    rec = await this.repo.touch(rec, TID_TTL_MS, DEVICE_TTL_MS);
    if (!rec) throw new Error('Session refresh failed');
    return rec;
  }
}
