import { OrderStatus } from "../../order/models/order.model";
import { OrderType } from "../enums";
import { Cart } from "./cart_type";
import { PaymentMethod } from "./paymentTypes";


export type OrderItemSummary = {
  id: string;
  name: string;
  quantity: number;
  price: number;
};

export type OrderSuccessSummary = {
  displayId: string;
  orderId: string;
  orderType: OrderType;
  selectedMethod: PaymentMethod;
  orderItems: OrderItemSummary[];
  orderAmount: {
    orderTotal: number;
    deliveryFee: number;
    serviceFee: number;
    tipAmount: number;
    discount?: {
      amount: number;
      code: string;
    };
  };
  deliveryTime: { asap: boolean; scheduledTime: string };
  deliveryNote?: string;
  deliveryAddress?: string;
  createdAt: Date | string;
  status: OrderStatus;
  userName: string;
  userPhone: string;
  orderDate: string;
};

export interface CreateOrderRequest {
  orderDetails: Cart[];
  orderType: OrderType;
  selectedMethod: PaymentMethod;
  paymentIntentId?: string | null;
  deliveryFee: number;
  tipAmount: number;
  serviceFee: number;
  deliveryAddress?: string;
  discount?: {
    amount: number;
    code: string;
  };
  deliveryTime: { asap: boolean; scheduledTime: string };
  deliveryNote?: string;
  userName: string;
  userPhone: string;
}
