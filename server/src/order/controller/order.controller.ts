import { Request, Response, NextFunction } from "express";
import { OrderService } from "../service/order.service";

const service = new OrderService();

export class OrderController {
  async createOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const deviceId = (req as any).deviceId;
      const orderResponse = await service.createOrder(req.body, deviceId);
      return res.status(201).json({
        message: "Order created successfully",
        data: orderResponse,
      });
    } catch (error: any) {
      next(error);
    }
  }

    async getOrderByOrderId(req: Request, res: Response, next: NextFunction) {
    try {
      const { orderId } = req.params;

      if (!orderId) {
        return res.status(400).json({
          statusCode: 400,
          data: null,
          message: "Missing orderId parameter.",
          success: false,
        });
      }

      const result = await service.getOrderByOrderId(orderId);
      res.status(result.statusCode).json(result);
    } catch (error) {
      next(error);
    }
  }
}
