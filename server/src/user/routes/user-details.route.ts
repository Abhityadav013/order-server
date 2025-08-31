import { Router } from "express";
import { UserDetailsController } from "../controllers/user-details.controller";


const router = Router();
const controller = new UserDetailsController();

router.post("/create", (req, res, next) => controller.create(req, res, next));
router.get("/details",(req, res, next) => controller.getUserDetails(req, res, next));
router.get("/delivery",(req, res, next) => controller.getUserDeliveryDetails(req, res, next));

export default router;