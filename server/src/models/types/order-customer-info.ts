import { OrderType } from "../enums";
import { CustomerDetails } from "./customer-details";

export interface CustomerInfo extends CustomerDetails{
    orderType:OrderType | string
}