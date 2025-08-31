import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";

const router = Router();
const controller = new AuthController();

router.post("/register", (req, res, next) => controller.register(req, res, next));
router.post("/login", (req, res, next) => controller.login(req, res, next));
router.post("/google", (req, res, next) => controller.google(req, res, next));


export default router;
