import { Request, Response, NextFunction } from "express";
import ApiResponse from "../utils/ApiResponse";
import { ApiError } from "../utils/ApiError";

export function errorHandler(err: any, req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ApiError) {
    const payload = new ApiResponse(err.statusCode, { errors: err.validationErrors }, err.message);
    return res.status(err.statusCode).json(payload);
  }

  // Mongoose duplicate key error handling
  if (err?.code === 11000) {
    const fields = Object.keys(err.keyPattern || {});
    const validationErrors = fields.map((f) => ({ field: f, message: `${f} already exists` }));
    const payload = new ApiResponse(400, { errors: validationErrors }, "Validation failed");
    return res.status(400).json(payload);
  }

  console.error("Unexpected error:", err);
  const payload = new ApiResponse(500, {}, "Internal Server Error");
  return res.status(500).json(payload);
}
