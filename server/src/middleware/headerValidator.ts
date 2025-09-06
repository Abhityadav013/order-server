import { Request, Response, NextFunction } from "express";

export function requireDeviceAndTid(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if(req.url.includes('/basket/')){
    return next();
  }
   if(req.url.includes('/order/')){
    return next();
  }

  const deviceId = req.header("x-device-id") ?? req.session?.deviceId;
  const tid = req.header("x-tid") ?? req.session?.guestId;

  if (!deviceId || !tid) {
    return res.status(400).json({
      statusCode: 400,
      message: "Missing required headers: device_id and/or tid",
    });
  }

  // Optionally attach them to req object for use later
  (req as any).deviceId = deviceId;
  (req as any).tid = tid;

  next();
}
