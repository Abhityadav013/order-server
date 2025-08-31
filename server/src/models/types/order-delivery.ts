import { Coordinates } from "./coordinates";

export interface DeliveryCalculationResult {
  distanceKm: number;
  freeDeliveryRadiusKm: number;
  maxDeliveryRadiusKm: number;
  deliverable: boolean;
  deliveryCharge: number | null; // null if not deliverable
  message: string;
  userCoords: Coordinates;
}