import { Router } from 'express';
import { OrderController } from '../controller/order.controller';


const router = Router();
const controller = new OrderController();

// This is the webhook endpoint that replaces Next.js API route
router.post('/order', (req, res, next) =>controller.createOrder(req, res, next));

export default router;
