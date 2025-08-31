import { DeliveryCalculationResult } from "../models/types/order-delivery";


export function calculateDistanceKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const toRad = (x: number) => (x * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function calculateDeliveryCharge(
  distanceKm: number,
  freeRadius = 3,
  maxRadius = 10
): Omit<DeliveryCalculationResult, "distanceKm" | "restaurantCoords" | "userCoords" | "freeDeliveryRadiusKm" | "maxDeliveryRadiusKm"> {
  
  if (distanceKm > maxRadius) {
    return { deliverable: false, deliveryCharge: null, message: `Delivery not available beyond ${maxRadius} km` };
  }

  if (distanceKm <= freeRadius) {
    return { deliverable: true, deliveryCharge: 0, message: "Free delivery available." };
  }

  let deliveryCharge = 1; // 3–4 km base charge
  if (distanceKm > 4) {
    const increments = Math.ceil(distanceKm - 4);
    deliveryCharge += increments * 0.5;
  }

  return { deliverable: true, deliveryCharge: parseFloat(deliveryCharge.toFixed(2)), message: `Delivery charge: €${deliveryCharge.toFixed(2)}` };
}
