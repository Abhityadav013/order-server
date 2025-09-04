import { Router } from "express";
import { CartController } from "../controller/cart.controller";

const router = Router();
const controller = new CartController();

router.post("/", (req, res, next) => controller.updateCart(req, res, next));
router.get("/", (req, res, next) => controller.getCart(req, res, next));
router.get("/basket/:basketId", (req, res, next) =>
  controller.getCartByBasketId(req, res, next)
);

export default router;
