import { Request, Response, NextFunction } from "express";

import { AuthService } from "../services/auth.service";
import { z } from "zod";
import { ApiError } from "../../utils/ApiError";
import ApiResponse from "../../utils/ApiResponse";

const service = new AuthService();

const registerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(3),
  password: z.string().min(6),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const googleSchema = z.object({
  idToken: z.string().min(1),
});

export class AuthController {
  /**
   * @swagger
   * /api/auth/register:
   *   post:
   *     summary: Create a new account
   *     tags: [Auth]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [name, email, phone, password]
   *             properties:
   *               name:
   *                 type: string
   *               email:
   *                 type: string
   *               phone:
   *                 type: string
   *               password:
   *                 type: string
   *                 format: password
   *     responses:
   *       200:
   *         description: User created successfully
   *       400:
   *         description: Validation error or duplicate data
   */
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = registerSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new ApiError(
          400,
          parsed.error.issues.map((e) => ({
            field: e.path.join("."),
            message: e.message,
          })),
          "Validation failed"
        );
      }

      const result = await service.register(parsed.data);
      res.json(new ApiResponse(200, result, "User registered"));
    } catch (err) {
      next(err);
    }
  }

  /**
   * @swagger
   * /api/auth/login:
   *   post:
   *     summary: Login for existing users
   *     tags: [Auth]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [email, password]
   *             properties:
   *               email:
   *                 type: string
   *               password:
   *                 type: string
   *                 format: password
   *     responses:
   *       200:
   *         description: Login successful; returns JWT
   *       401:
   *         description: Invalid credentials
   */
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = loginSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new ApiError(
          400,
          parsed.error.issues.map((e) => ({
            field: e.path.join("."),
            message: e.message,
          })),
          "Validation failed"
        );
      }
      const result = await service.login(parsed.data);
      res.json(new ApiResponse(200, result, "Login successful"));
    } catch (err) {
      next(err);
    }
  }

  /**
   * @swagger
   * /api/auth/google:
   *   post:
   *     summary: Google OAuth login
   *     tags: [Auth]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [idToken]
   *             properties:
   *               idToken:
   *                 type: string
   *     responses:
   *       200:
   *         description: Login successful; returns JWT
   *       400:
   *         description: Invalid token or failure
   */
  async google(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = googleSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new ApiError(
          400,
          parsed.error.issues.map((e) => ({
            field: e.path.join("."),
            message: e.message,
          })),
          "Validation failed"
        );
      }
      const result = await service.googleLogin(parsed.data.idToken);
      res.json(new ApiResponse(200, result, "Google login successful"));
    } catch (err) {
      next(err);
    }
  }
}
