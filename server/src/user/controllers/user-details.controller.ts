import { Request, Response, NextFunction } from "express";
import { UserDetailsService } from "../services/user.details.service";
import { CustomerInfo } from "../../models/types/order-customer-info";

export class UserDetailsController {
  private readonly service = new UserDetailsService();
  /**
   * @swagger
   * /user-details/create:
   *   post:
   *     summary: Create customer info
   *     tags: [UserDetails]
   *     parameters:
   *       - in: header
   *         name: x-device-id
   *         required: true
   *         schema:
   *           type: string
   *         description: Device ID of the customer
   *       - in: header
   *         name: x-tid
   *         required: true
   *         schema:
   *           type: string
   *         description: Transaction/Session ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - orderType
   *               - customer
   *             properties:
   *               orderType:
   *                 type: string
   *                 enum: [PICKUP, DELIVERY]
   *                 description: Type of the order
   *               customer:
   *                 type: object
   *                 required:
   *                   - name
   *                   - phoneNumber
   *                 properties:
   *                   name:
   *                     type: string
   *                     example: "John Doe"
   *                   phoneNumber:
   *                     type: string
   *                     example: "+491234567890"
   *                   address:
   *                     type: object
   *                     properties:
   *                       pincode:
   *                         type: string
   *                         example: "12345"
   *                       buildingNumber:
   *                         type: string
   *                         example: "10A"
   *                       town:
   *                         type: string
   *                         example: "Berlin"
   *                       street:
   *                         type: string
   *                         example: "Alexanderplatz"
   *                       displayAddress:
   *                         type: string
   *                         example: "Alexanderplatz 10A, 10178 Berlin"
   *                       addressType:
   *                         type: string
   *                         example: "Home"
   *     responses:
   *       200:
   *         description: Customer info created successfully
   */
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const deviceId = (req as any).deviceId;
      const tid = (req as any).tid;
      const { orderType, customer } = req.body;
      const model: CustomerInfo = {
        orderType,
        ...customer,
      };
      const result = await this.service.create(deviceId, tid, model);
      return res.status(result.statusCode).json(result);
    } catch (err) {
      next(err);
    }
  }

 
  /**
   * @swagger
   * /api/v1/user-details/details:
   *   get:
   *     summary: Get customer info by deviceId and tid
   *     tags: [UserDetails]
   *     parameters:
   *       - in: header
   *         name: x-device-id
   *         schema:
   *           type: string
   *         required: true
   *         description: Device ID of the customer
   *       - in: header
   *         name: x-tid
   *         schema:
   *           type: string
   *         required: true
   *         description: Transaction/Session ID
   *     responses:
   *       200:
   *         description: Customer info fetched successfully
   */
  async getUserDetails(req: Request, res: Response, next: NextFunction) {
    try {
      const deviceId = (req as any).deviceId;
      const tid = (req as any).tid;

      const result = await this.service.fetchUserDetails(deviceId, tid);
      res.status(result.statusCode).json(result);
    } catch (err) {
      next(err);
    }
  }


  /**
   * @swagger
   * /api/v1/user-details/delivery:
   *   get:
   *     summary: Get delivery details by deviceId and tid
   *     tags: [UserDetails]
   *     parameters:
   *       - in: header
   *         name: x-device-id
   *         schema:
   *           type: string
   *         required: true
   *         description: Device ID of the customer
   *       - in: header
   *         name: x-tid
   *         schema:
   *           type: string
   *         required: true
   *         description: Transaction/Session ID
   *     responses:
   *       200:
   *         description: Delivery details fetched successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 statusCode:
   *                   type: integer
   *                   example: 200
   *                 data:
   *                   $ref: '#/components/schemas/DeliveryDetails'
   *                 message:
   *                   type: string
   *                   example: Success
   *                 success:
   *                   type: boolean
   *                   example: true
   */
  async getUserDeliveryDetails(req: Request, res: Response, next: NextFunction) {
    try {
      const deviceId = (req as any).deviceId;
      const tid = (req as any).tid;

      const result = await this.service.fetchUserDeliveryDetails(deviceId, tid);
      res.status(result.statusCode).json(result);
    } catch (err) {
      next(err);
    }
  }
}
