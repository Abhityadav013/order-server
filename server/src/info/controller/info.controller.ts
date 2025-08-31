// src/controllers/restroInfo.controller.ts
import { Request, Response, NextFunction } from "express";
import { RestroInfoService } from "../service/info.service";
import ApiResponse from "../../utils/ApiResponse";

export class RestroInfoController {
  private readonly service = new RestroInfoService();

  /**
   * @swagger
   * /api/v1/info:
   *   get:
   *     summary: Get restaurant operating status
   *     description: Returns current opening state, hours and next opening time
   *     tags: [Restaurant]
   *     responses:
   *       200:
   *         description: Restaurant operating status
   */
  async getInfo(req: Request, res: Response, next: NextFunction) {
    try {
      const data = this.service.getRestaurantInfo();
      res.status(200).json(new ApiResponse(200,data,'Info fetched succesfully'));
    } catch (err) {
      next(err);
    }
  }
}
