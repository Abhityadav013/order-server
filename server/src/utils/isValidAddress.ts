import { AddressLocation } from "../models/types/address-location";

export const isValidAddress = (response: AddressLocation[]): boolean => {
  return (
    Array.isArray(response) &&
    response.length > 0 &&
    !!response[0].lat &&
    !!response[0].lon &&
    !!response[0].display_name
  );
};