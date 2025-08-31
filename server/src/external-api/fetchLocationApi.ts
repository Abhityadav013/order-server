import { reverse_geocode_url } from "../config/apiEndpoints";
import { AddressLocation } from "../models/types/address-location";


export const fetchLocationApi = async (
  address: string,
): Promise<AddressLocation[]> => {

  const params = new URLSearchParams({
    key: process.env.LOCATION_API_KEY || '',
    format: 'json',
    q: address,
  });
  const response = await fetch(`${reverse_geocode_url}?${params.toString()}`);
  const data = await response.json();

  if (!response.ok) {
    return [] as AddressLocation[];
    // throw new Error(data.message || 'Failed to fetch customer details');
  }

  return data as AddressLocation[];
};