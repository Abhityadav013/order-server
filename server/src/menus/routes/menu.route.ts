import { Router } from "express";
import { MenuDetailsController } from "../controllers/menu.controller";



const router = Router();
const controller = new MenuDetailsController();

router.get("/listing", (req, res, next) => controller.listing(req, res, next));

export default router;