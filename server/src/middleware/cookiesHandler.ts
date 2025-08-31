import type { Request, Response, NextFunction } from "express";
import { ISession } from "../session/models/session.model";
import { SessionRepository } from "../session/service/session.repository";

// install and apply once in app bootstrap:
// app.use(cookieParser());

type RepoDeps = {
  repo: {
    findByGuestId(guestId: string): Promise<ISession>;
  };
};

export function sessionMiddleware({ repo }: RepoDeps) {
  return async function sessionMW(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      // Prefer cookies, fall back to body for first-time bootstrap
      console.log("sessionMiddleware: url", req.url);
      console.log("sessionMiddleware: cookies", req.cookies);
      const tid = (req.cookies?.tid as string) ?? req.body?.tid ?? null;
      const ssid = (req.cookies?.ssid as string) ?? req.body?.ssid ?? null;
      if (!tid && !ssid) {
        return next();
      }

      let rec: ISession | null = null;
      if (tid) rec = await repo.findByGuestId(tid);

      if (!rec) {
        return next();
      }

      const isProd = process.env.NODE_ENV === "production";

      // // Express expects maxAge in milliseconds; compute carefully.
      // // If using absolute expiry epochs in ms, subtract Date.now() and keep ms.
      const tidMs = Math.max(1, rec.tidExpiresAt - Date.now());
      const ssidMs = Math.max(1, rec.deviceExpiresAt - Date.now());

      res.cookie("tid", tid, {
        httpOnly: false, // consider true if JS does not need to read it
        sameSite: "lax",
        secure: isProd,
        maxAge: tidMs, // milliseconds in Express
        path: "/",
      });
      res.cookie("ssid", rec.deviceId, {
        httpOnly: false, // consider true if JS does not need to read it
        sameSite: "lax",
        secure: isProd,
        maxAge: ssidMs, // milliseconds in Express
        path: "/",
      });

      // Attach for server-side downstream handlers
      req.session = {
        deviceId: rec.deviceId,
        guestId: rec.guestId,
      };

      // Set response headers so the client can see them
      return next();
    } catch (err) {
      return res.status(500).json({ error: "Session middleware error" });
    }
  };
}
