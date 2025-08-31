import { Router } from "express";
import { CategoryDetailsController } from "../controllers/category.controller";



const router = Router();
const controller = new CategoryDetailsController();

router.get("/listing", (req, res, next) => controller.listing(req, res, next));

export default router;