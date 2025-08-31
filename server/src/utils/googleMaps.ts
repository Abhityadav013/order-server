import fetch from "node-fetch";
import { GeocodeResponse } from "../models/types/geoCode";
import { Coordinates } from "../models/types/coordinates";

export async function geocodeAddress(address: string): Promise<Coordinates> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) throw new Error("Google Maps API key not set");

  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;
  const response = await fetch(url);

  // Cast the response JSON to the GeocodeResponse type
  const data = (await response.json()) as GeocodeResponse;

  if (data.status === "OK" && data.results.length > 0) {
    const location = data.results[0].geometry.location;
    return { lat: location.lat, lng: location.lng };
  } else {
    throw new Error(`Geocoding failed: ${data.status}`);
  }
}
