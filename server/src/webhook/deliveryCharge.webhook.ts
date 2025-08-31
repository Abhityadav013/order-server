import { Request, Response } from "express";
import { geocodeAddress } from "../utils/googleMaps";
import {
  calculateDistanceKm,
  calculateDeliveryCharge,
} from "../utils/distanceCalculator";
import { DeliveryCalculationResult } from "../models/types/order-delivery";
import UserInfo from "../user/models/user-details.model";

export async function deliveryChargeWebhook(req: Request, res: Response) {
  try {
    const deviceId = (req as any).deviceId;
    const tid = (req as any).tid;

    const { address } = req.body;
    if (!address || typeof address !== "string") {
      return res
        .status(400)
        .json({ error: "User address is required as a string" });
    }
    const MAX_DELIVERY_DISTANCE_KM = parseFloat(
      process.env.MAX_DELIVERY_DISTANCE_KM || "10"
    );
    const FREE_DELIVERY_RADIUS = 3;
    const INDIAN_TADKA_LAT = Number(process.env.INDIAN_TADKA_LAT) ?? 0;
    const INDIAN_TADKA_LNG = Number(process.env.INDIAN_TADKA_LNG) ?? 0;

    const userCoords = await geocodeAddress(address);

    // Calculate distance
    const distanceKm = calculateDistanceKm(
      INDIAN_TADKA_LAT,
      INDIAN_TADKA_LNG,
      userCoords.lat,
      userCoords.lng
    );

    // Calculate charges and deliverability
    const result = calculateDeliveryCharge(
      distanceKm,
      FREE_DELIVERY_RADIUS,
      MAX_DELIVERY_DISTANCE_KM
    );

    const payload: DeliveryCalculationResult = {
      distanceKm: Number(distanceKm.toFixed(2)),
      freeDeliveryRadiusKm: FREE_DELIVERY_RADIUS,
      maxDeliveryRadiusKm: MAX_DELIVERY_DISTANCE_KM,
      userCoords,
      ...result,
    };

    await UserInfo.findOneAndUpdate(
      { deviceId, tid }, // filter criteria
      {
        $set: {
          userLocation: userCoords,
          isFreeDelivery: result.deliveryCharge === 0,
          deliveryFee: result.deliveryCharge ?? 0,
          deliverable: result.deliverable,
        },
      },
      { new: true } // return the updated document
    );

    res.json(payload);
  } catch (err: any) {
    console.error("Error in deliveryChargeWebhook:", err);
    res.status(500).json({ error: err.message || "Internal server error" });
  }
}
