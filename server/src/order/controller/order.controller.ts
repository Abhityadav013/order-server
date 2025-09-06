import { Request, Response, NextFunction } from "express";
import { OrderService } from "../service/order.service";

const service = new OrderService();

export class OrderController {
  /**
   * @swagger
   * components:
   *   schemas:
   *     OrderItemSummary:
   *       type: object
   *       properties:
   *         itemId:
   *           type: string
   *         itemName:
   *           type: string
   *         quantity:
   *           type: number
   *         price:
   *           type: number
   *         customization:
   *           type: object
   *           properties:
   *             notes:
   *               type: string
   *             options:
   *               type: array
   *               items:
   *                 type: string
   *             spicyLevel:
   *               type: string
   *               enum: [MILD, MEDIUM, HOT] # example
   *           nullable: true
   *     OrderAmount:
   *       type: object
   *       properties:
   *         orderTotal:
   *           type: number
   *         deliveryFee:
   *           type: number
   *         serviceFee:
   *           type: number
   *         tipAmount:
   *           type: number
   *         discount:
   *           type: object
   *           properties:
   *             amount:
   *               type: number
   *             code:
   *               type: string
   *           nullable: true
   *     OrderSuccessSummary:
   *       type: object
   *       properties:
   *         displayId:
   *           type: string
   *         orderId:
   *           type: string
   *         orderType:
   *           type: string
   *           enum: [PICKUP, DELIVERY]
   *         selectedMethod:
   *           type: string
   *           enum: [CASH, CARD, PAYPAL, GOOGLE_PAY, APPLE_PAY]
   *         orderItems:
   *           type: array
   *           items:
   *             $ref: '#/components/schemas/OrderItemSummary'
   *         orderAmount:
   *           $ref: '#/components/schemas/OrderAmount'
   *         deliveryTime:
   *           type: object
   *           properties:
   *             asap:
   *               type: boolean
   *             scheduledTime:
   *               type: string
   *               format: date-time
   *         deliveryNote:
   *           type: string
   *           nullable: true
   *         deliveryAddress:
   *           type: string
   *           nullable: true
   *         createdAt:
   *           type: string
   *           format: date-time
   *         status:
   *           type: string
   *         userName:
   *           type: string
   *         userPhone:
   *           type: string
   *         orderDate:
   *           type: string
   */
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
   *             properties:
   *               selectedMethod:
   *                 type: string
   *                 enum: [CASH, CARD, PAYPAL, GOOGLE_PAY, APPLE_PAY]
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
   * /v1/order:
   *   get:
   *     summary: Get order details by orderId
   *     tags:
   *       - Orders
   *     parameters:
   *       - in: query
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
      const orderId = req.query.orderId as string;
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
