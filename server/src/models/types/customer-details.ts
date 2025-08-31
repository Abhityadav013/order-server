import { extend } from "dayjs";
import { IAddress } from "./address";

export interface CustomerDetails {
  name: string;
  phoneNumber: string;
  address: IAddress;
}

export interface DeliveryDetails {
  orderType: string;
  userLocation: {
    lat: number;
    lng: number;
  };
  isFreeDelivery: boolean;
  deliveryFee: number;
  deliverable: boolean;
}


export interface Customer extends CustomerDetails ,DeliveryDetails{}