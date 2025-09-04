import { Request, Response, NextFunction } from "express";
import { OrderService } from "../service/order.service";

const service = new OrderService();

export class OrderController {
  async createOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const deviceId = req.headers["ssid"] as string;
      if (!deviceId) {
        return res
          .status(400)
          .json({ message: "Missing device identifier (ssid header)." });
      }

      const orderResponse = await service.createOrder(req.body, deviceId);
      return res.status(201).json({
        message: "Order created successfully",
        data: orderResponse,
      });
    } catch (error: any) {
      next(error);
    }
  }
}
