// src/cart/controllers/cart.controller.ts
import { Request, Response, NextFunction } from "express";
import { CartService } from "../services/cart.service";

export class CartController {
  private readonly service = new CartService();

  /**
   * @swagger
   * tags:
   *   name: Cart
   *   description: Cart management
   */

  /**
   * @swagger
   * components:
   *   schemas:
   *     Customization:
   *       type: object
   *       properties:
   *         notes:
   *           type: string
   *           example: "No onions, extra sauce"
   *         options:
   *           type: array
   *           items:
   *             type: string
   *           example: ["Cheese", "Olives"]
   *         spicyLevel:
   *           type: string
   *           enum: [no_spicy, spicy, very_spicy]
   *           example: spicy
   *
   *     CartItem:
   *       type: object
   *       required:
   *         - itemId
   *         - itemName
   *         - quantity
   *         - price
   *       properties:
   *         itemId:
   *           type: string
   *           example: "ITEM_123"
   *         itemName:
   *           type: string
   *           example: "Margherita Pizza"
   *         quantity:
   *           type: integer
   *           example: 2
   *         price:
   *           type: number
   *           format: float
   *           example: 19.98
   *         addons:
   *           type: array
   *           items:
   *             type: string
   *           example: ["Extra cheese", "Garlic dip"]
   *         customization:
   *           $ref: '#/components/schemas/Customization'
   *
   *     CartData:
   *       type: object
   *       properties:
   *         id:
   *           type: string
   *           example: "4b8a5c3e-6f9b-4c1a-9e2b-2f1b7f1f4d5a"
   *         cartItems:
   *           type: array
   *           items:
   *             $ref: '#/components/schemas/CartItem'
   *         basketId:
   *           type: string
   *           example: "BASKET-ABCDE12345"
   *
   *     ApiResponseCart:
   *       type: object
   *       properties:
   *         statusCode:
   *           type: integer
   *           example: 200
   *         data:
   *           oneOf:
   *             - $ref: '#/components/schemas/CartData'
   *             - type: object
   *               description: Empty object when cart is empty
   *               example: {}
   *             - type: "null"
   *         message:
   *           type: string
   *           example: "Cart retrieved successfully."
   *         success:
   *           type: boolean
   *           example: true
   *
   *     ApiResponseCartUpdated:
   *       type: object
   *       properties:
   *         statusCode:
   *           type: integer
   *           example: 201
   *         data:
   *           $ref: '#/components/schemas/CartData'
   *         message:
   *           type: string
   *           example: "Cart updated successfully"
   *         success:
   *           type: boolean
   *           example: true
   *
   *     ApiResponseCartCleared:
   *       type: object
   *       properties:
   *         statusCode:
   *           type: integer
   *           example: 200
   *         data:
   *           type: "null"
   *           example: null
   *         message:
   *           type: string
   *           example: "Cart cleared successfully"
   *         success:
   *           type: boolean
   *           example: true
   */

  /**
   * @swagger
   * /v1/cart:
   *   post:
   *     summary: Create or update cart
   *     description: Updates the cart for the current device (identified via "ssid" header or middleware-provided deviceId). If `isCartEmpty` is true, the cart is cleared.
   *     tags: [Cart]
   *     parameters:
   *       - in: header
   *         name: ssid
   *         required: false
   *         schema:
   *           type: string
   *         description: Device identifier used to associate the cart (middleware may also set req.deviceId)
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - cart
   *               - isCartEmpty
   *             properties:
   *               cart:
   *                 type: array
   *                 items:
   *                   $ref: '#/components/schemas/CartItem'
   *                 example:
   *                   - itemId: "ITEM_123"
   *                     itemName: "Margherita Pizza"
   *                     quantity: 2
   *                     price: 19.98
   *                     customization:
   *                       notes: "Extra crispy"
   *                       options: ["Extra cheese"]
   *                       spicyLevel: "no_spicy"
   *                   - itemId: "ITEM_456"
   *                     itemName: "Coke 330ml"
   *                     quantity: 1
   *                     price: 2.50
   *               isCartEmpty:
   *                 type: boolean
   *                 example: false
   *     responses:
   *       201:
   *         description: Cart updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiResponseCartUpdated'
   *       200:
   *         description: Cart cleared successfully (when isCartEmpty is true)
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiResponseCartCleared'
   *       400:
   *         description: Invalid input payload
   *       500:
   *         description: Internal server error
   */
  async updateCart(req: Request, res: Response, next: NextFunction) {
    try {
      const deviceId = (req as any).deviceId;
      const tid = (req as any).tid;
      if (!deviceId) {
        return res.status(400).json({
          statusCode: 400,
          data: null,
          message:
            "Missing device identifier (ssid header or middleware deviceId).",
          success: false,
        });
      }
      const payload = req.body;
      const result = await this.service.updateCart(deviceId,tid, payload);
      res.status(result.statusCode).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/v1/cart:
   *   get:
   *     summary: Get cart by device
   *     description: Retrieves the cart associated with the current device (identified via "ssid" header or middleware-provided deviceId).
   *     tags: [Cart]
   *     parameters:
   *       - in: header
   *         name: ssid
   *         required: false
   *         schema:
   *           type: string
   *         description: Device identifier used to associate the cart (middleware may also set req.deviceId)
   *     responses:
   *       200:
   *         description: Cart retrieved or empty response
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiResponseCart'
   *       400:
   *         description: Missing device identifier
   *       500:
   *         description: Internal server error
   */
  async getCart(req: Request, res: Response, next: NextFunction) {
    try {
      const deviceId = (req as any).deviceId;

      if (!deviceId) {
        return res.status(400).json({
          statusCode: 400,
          data: null,
          message:
            "Missing device identifier (ssid header or middleware deviceId).",
          success: false,
        });
      }
      const result = await this.service.getCart(deviceId);
      res.status(result.statusCode).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * 
   * /v1/cart/basket/{basketId}:
   *   get:
   *     summary: Get cart by basketId
   *     description: Retrieve a user's cart using the basketId.
   *     tags:
   *       - Cart
   *     parameters:
   *       - in: path
   *         name: basketId
   *         required: true
   *         description: Unique basket identifier
   *         schema:
   *           type: string
   *           example: "ABC123XYZ"
   *     responses:
   *       200:
   *         description: Cart retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 statusCode:
   *                   type: integer
   *                   example: 200
   *                 data:
   *                   type: object
   *                   properties:
   *                     id:
   *                       type: string
   *                       example: "123e4567-e89b-12d3-a456-426614174000"
   *                     deviceId:
   *                       type: string
   *                       example: "device-001"
   *                     basketId:
   *                       type: string
   *                       example: "ABC123XYZ"
   *                     cartItems:
   *                       type: array
   *                       items:
   *                         type: object
   *                         properties:
   *                           itemId:
   *                             type: string
   *                             example: "101"
   *                           itemName:
   *                             type: string
   *                             example: "Pizza Margherita"
   *                           quantity:
   *                             type: integer
   *                             example: 2
   *                           price:
   *                             type: number
   *                             example: 9.99
   *                           customization:
   *                             type: object
   *                             properties:
   *                               notes:
   *                                 type: string
   *                                 example: "Extra cheese"
   *                               options:
   *                                 type: array
   *                                 items:
   *                                   type: string
   *                                 example: ["Thin crust"]
   *                               spicyLevel:
   *                                 type: string
   *                                 enum: [no_spicy, spicy, very_spicy]
   *                                 example: "spicy"
   *       400:
   *         description: Missing basketId parameter
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 statusCode:
   *                   type: integer
   *                   example: 400
   *                 data:
   *                   type: "null"
   *                   example: null
   *                 message:
   *                   type: string
   *                   example: "Missing basketId parameter."
   *                 success:
   *                   type: boolean
   *                   example: false
   *       404:
   *         description: Cart not found for this basketId
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 statusCode:
   *                   type: integer
   *                   example: 200
   *                 data:
   *                   type: object
   *                   example: {}
   *                 message:
   *                   type: string
   *                   example: "Cart not found for this basketId."
   */
  async getCartByBasketId(req: Request, res: Response, next: NextFunction) {
    try {
      const { basketId } = req.params;

      if (!basketId) {
        return res.status(400).json({
          statusCode: 400,
          data: null,
          message: "Missing basketId parameter.",
          success: false,
        });
      }

      const result = await this.service.getCartByBasketId(basketId);
      res.status(result.statusCode).json(result);
    } catch (error) {
      next(error);
    }
  }
}
