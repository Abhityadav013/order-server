export type SessionRecord = {
  tid: string;
  deviceId: string;
  tidExpiresAt: number; // epoch ms
  deviceExpiresAt: number; // epoch ms
};