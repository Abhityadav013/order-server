import { Request, Response, NextFunction } from "express";
import { CategroyDetailService } from "../services/category.service";
import ApiResponse from "../../utils/ApiResponse";

export class CategoryDetailsController {
  private readonly service = new CategroyDetailService();

/**
 * @swagger
 * /api/v1/category/listing:
 *   get:
 *     summary: Get all categories of menu items
 *     description: Returns a list of all available categories of the menu.
 *     tags: [Category]
 *     responses:
 *       200:
 *         description: List of categories
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
 *                   categoryName:
 *                     type: string
 *                     example: "Dessert-Menü"
 *                   imageUrl:    # updated to match model
 *                     type: string
 *                     format: uri
 *                     example: "https://example.com/images/margherita.jpg"
 *                   isDelivery:
 *                     type: boolean
 *                     example: true
 *                   order:
 *                     type: number
 *                     example: 5
 *       500:
 *         description: Server error
 */

  async listing(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.service.fetch();
      return res.status(200).json(new ApiResponse(200,result,'Categroy fetched succesfully'));
    } catch (err) {
      next(err);
    }
  }
}
