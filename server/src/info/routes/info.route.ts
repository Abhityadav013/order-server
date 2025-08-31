import { Router } from "express";
import { RestroInfoController } from "../controller/info.controller";



const router = Router();
const controller = new RestroInfoController();

router.get("/", (req, res, next) => controller.getInfo(req, res, next));

export default router;