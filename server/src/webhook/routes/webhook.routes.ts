import { Router } from "express";
import { deliveryChargeWebhook } from "../deliveryCharge.webhook";


const router = Router();

router.post("/delivery-charge", deliveryChargeWebhook);

export default router;
