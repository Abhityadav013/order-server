import { Request, Response, NextFunction } from "express";
import { OrderService } from "../service/order.service";

const service = new OrderService();

export class OrderController {
  /**
   * @swagger
   * /order:
   *   post:
   *     summary: Create a new order
   *     tags:
   *       - Orders
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             description: Order creation payload
   *             properties:
   *               selectedMethod:
   *                 type: string
   *                 enum: [CASH, CARD, PAYPAL, GOOGLE_PAY, APPLE_PAY] # example
   *               basketId:
   *                 type: string
   *               orderType:
   *                 type: string
   *                 enum: [PICKUP, DELIVERY]
   *               deliveryTime:
   *                 type: object
   *                 properties:
   *                   asap:
   *                     type: boolean
   *                   scheduledTime:
   *                     type: string
   *                     format: date-time
   *               deliveryNote:
   *                 type: string
   *                 nullable: true
   *     responses:
   *       201:
   *         description: Order created successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                 data:
   *                   $ref: '#/components/schemas/OrderSuccessSummary'
   *       400:
   *         description: Bad request
   *       500:
   *         description: Internal server error
   */
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

  /**
   * @swagger
   * /order/{orderId}:
   *   get:
   *     summary: Get order details by orderId
   *     tags:
   *       - Orders
   *     parameters:
   *       - in: path
   *         name: orderId
   *         required: true
   *         schema:
   *           type: string
   *         description: Unique order ID
   *     responses:
   *       200:
   *         description: Order details retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/OrderSuccessSummary'
   *       400:
   *         description: Missing orderId parameter
   *       404:
   *         description: Order not found
   *       500:
   *         description: Internal server error
   */
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
