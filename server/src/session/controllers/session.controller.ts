// src/controllers/session.controller.ts
import { Request, Response } from "express";
import { SessionService } from "../service/session.service";

export class SessionController {
  constructor(private service: SessionService) {}

  /**
   * @openapi
   * /v1/session:
   *   post:
   *     tags:
   *       - Session
   *     summary: Create or restore a session using existing tid/ssid when provided.
   *     description: >
   *       The backend uses tid (guestId) and/or ssid (deviceId) from the request body to find an existing session.
   *       If not found or expired, it creates a new session and returns normalized identifiers. Expiries are refreshed
   *       on every successful call. Cookies may be set in the response for convenience.
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               tid:
   *                 type: string
   *                 nullable: true
   *                 description: Existing long-term ID (guestId). Send null if unknown.
   *               ssid:
   *                 type: string
   *                 nullable: true
   *                 description: Existing device ID. Send null if unknown.
   *               latitude:
   *                 type: string
   *                 nullable: true
   *               longitude:
   *                 type: string
   *                 nullable: true
   *             required: [tid, ssid]
   *     responses:
   *       '200':
   *         description: Session created or restored.
   *         headers:
   *           Set-Cookie:
   *             description: tid and ssid may be set as cookies.
   *             schema:
   *               type: string
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 data:
   *                   type: object
   *                   properties:
   *                     tid:
   *                       type: string
   *                       description: Returned guestId (long-term ID).
   *                     deviceId:
   *                       type: string
   *                       description: Returned deviceId (short-term ID).
   *                     displayId:
   *                       type: string
   *                       description: Auto-increment display id, e.g., S00000001.
   *                     tidExpiresAt:
   *                       type: integer
   *                       format: int64
   *                       description: Epoch ms when tid expires.
   *                     deviceExpiresAt:
   *                       type: integer
   *                       format: int64
   *                       description: Epoch ms when deviceId expires.
   *       '400':
   *         description: Invalid payload.
   *       '500':
   *         description: Failed to create or restore session.
   */
  createOrRestore = async (req: Request, res: Response) => {
    let {
      tid = null,
      ssid = null,
      latitude = null,
      longitude = null,
    } = req.body ?? {};
    if (tid === undefined || ssid === undefined) {
       tid = (req.cookies?.tid as string) ?? req.body?.tid ?? null;
       ssid = (req.cookies?.ssid as string) ?? req.body?.ssid ?? null;

       console.log("SessionController: pulled tid/ssid from cookies");
       console.log({ tid, ssid });
    }

    const rec = await this.service.createOrRestore({
      tid,
      ssid,
      latitude,
      longitude,
    });

    if (!rec) {
      // Decide a policy: 500 for unexpected null, or 404 if that’s business-logic
      return res
        .status(500)
        .json({ error: "Failed to create or restore session" });
    }

    const isProd = process.env.NODE_ENV === "production";
    res.cookie("tid", rec.guestId, {
      httpOnly: false,
      sameSite: "lax",
      secure: isProd,
      maxAge: Math.max(1, Math.floor((rec.tidExpiresAt - Date.now()) / 1000)),
      path: "/",
    });
    res.cookie("ssid", rec.deviceId, {
      httpOnly: false,
      sameSite: "lax",
      secure: isProd,
      maxAge: Math.max(
        1,
        Math.floor((rec.deviceExpiresAt - Date.now()) / 1000)
      ),
      path: "/",
    });

    return res.json({
      data: {
        tid: rec.guestId,
        deviceId: rec.deviceId,
        displayId: rec.displayId,
        tidExpiresAt: rec.tidExpiresAt,
        deviceExpiresAt: rec.deviceExpiresAt,
      },
    });
  };
}
