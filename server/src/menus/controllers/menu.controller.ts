import { Request, Response, NextFunction } from "express";
import { MenuDetailService } from "../services/menu.service";
import ApiResponse from "../../utils/ApiResponse";

export class MenuDetailsController {
  private readonly service = new MenuDetailService();

    /**
   * @swagger
   * /api/v1/menu/listing:
   *   get:
   *     summary: Get all menu items
   *     description: Returns a list of all available menu items in the menu.
   *     tags: [Menu]
   *     responses:
   *       200:
   *         description: List of menu items
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 type: object
   *                 properties:
   *                   id:
   *                     type: string
   *                     example: "550e8400-e29b-41d4-a716-446655440000"
   *                   name:
   *                     type: string
   *                     example: "Margherita Pizza"
   *                   description:
   *                     type: string
   *                     example: "Classic pizza with tomato sauce, mozzarella cheese, and fresh basil."
   *                   imageURL:
   *                     type: string
   *                     format: uri
   *                     example: "https://example.com/images/margherita.jpg"
   *                   isDelivery:
   *                     type: boolean
   *                     example: true
   *                   category:
   *                     type: object
   *                     properties:
   *                       id:
   *                         type: string
   *                         example: "cat123"
   *                       order:
   *                         type: integer
   *                         example: 1
   *                   price:
   *                     type: number
   *                     format: float
   *                     example: 9.99
   *       500:
   *         description: Server error
   */
  async listing(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.service.fetch();
      return res.status(200).json(new ApiResponse(200,result,'Menu fetched succesfully'));
    } catch (err) {
      next(err);
    }
  }
}
