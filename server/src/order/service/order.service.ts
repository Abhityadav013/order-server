import nodemailer from "nodemailer";
import { OrderType, SpicyLevel } from "../../models/enums";
import { IOrder, OrderStatus } from "../models/order.model";
import {
  CreateOrderRequest,
  OrderSuccessSummary,
} from "../../models/types/order";
import { OrderRepository } from "../repository/order.repository";
import { generateOrderConfirmationEmail } from "../../utils/generateOrderConfirmationEmail";
import ApiResponse from "../../utils/ApiResponse";
import Cart from "../../cart/model/cart.model";
import { CartRepository } from "../../cart/repository/cart.repository";
import { UserRepository } from "../../user/repository/user.repository";
import { SessionRepository } from "../../session/service/session.repository";

export class OrderService {
  private repository: OrderRepository;
  private cartRepository: CartRepository;
  private userRepository: UserRepository;
  private sessionRepository: SessionRepository;
  constructor() {
    this.repository = new OrderRepository();
    this.cartRepository = new CartRepository();
    this.userRepository = new UserRepository();
    this.sessionRepository = new SessionRepository();
  }

  async createOrder(
    req: CreateOrderRequest,
    deviceId: string
  ): Promise<OrderSuccessSummary> {
    const onlineOrder = req.orderType === OrderType.DELIVERY;
    const pickupOrder = req.orderType === OrderType.PICKUP;
    const status: OrderStatus = OrderStatus.PENDING;
    const orderDate = new Date().toISOString().split("T")[0];
    const {
      basketId,
      deliveryTime,
      deliveryNote,
      orderType,
      selectedMethod,
      discount,
    } = req;
    const basketDetail = await this.cartRepository.findByBasketId(basketId);
    if (!basketDetail) {
      throw new Error("Basket not found for the given basket Id");
    }
    const sessionDetails = await this.sessionRepository.findByDeviceId(
      basketDetail.deviceId
    );
    if (!sessionDetails) {
      throw new Error("Session not found for this user");
    }
    const userDetails = await this.userRepository.findByDeviceId(
      sessionDetails.deviceId,
      sessionDetails.guestId
    );
    if (!userDetails) {
      throw new Error("User Deails not found");
    }
    let totalAmount = 0;
    basketDetail.cartItems.forEach((item) => (totalAmount += item.price));
    const isDiscountApplied = discount && Object.keys(discount).length > 0;

    const serviceFeeCharge = (Number(totalAmount) * 2.5) / 100;
    const serviceCharge =
      serviceFeeCharge < 0.99 ? Number(serviceFeeCharge.toFixed(2)) : 0.99;

    const orderAmount = {
      orderTotal: totalAmount,
      deliveryFee: userDetails.deliveryFee ?? 0,
      serviceFee: serviceCharge,
      tipAmount: 0,
      ...(isDiscountApplied && { discount: req.discount }),
    };

    const newOrder: IOrder = await this.repository.createOrder({
      orderDate,
      orderItems: basketDetail.cartItems.map((item) => ({
        itemId: item.itemId,
        itemName: item.itemName,
        quantity: item.quantity,
        price: item.price,
        customization: item.customization
          ? {
              notes: item.customization.notes ?? "",
              options: item.customization.options ?? [], // ✅ default to empty array
              spicyLevel: item.customization.spicyLevel ?? SpicyLevel.NO_SPICY, // ✅ default enum value
            }
          : undefined,
      })),
      onlineOrder,
      pickupOrder,
      status,
      orderAmount,
      deviceId,
      deliveryAddress: userDetails.address.displayAddress,
      deliveryNote: deliveryNote ?? "",
      deliveryTime: deliveryTime ?? { asap: true, scheduledTime: '' },
      userName: userDetails.name,
      userPhone: userDetails.phoneNumber,
      selectedMethod: selectedMethod,
    });

    // Build response
    const orderResponse: OrderSuccessSummary = {
      displayId: newOrder.displayId,
      orderId: newOrder.id,
      orderType: newOrder.onlineOrder ? OrderType.DELIVERY : OrderType.PICKUP,
      status,
      deliveryTime: req.deliveryTime,
      deliveryNote: req.deliveryNote,
      deliveryAddress: userDetails.address.displayAddress,
      userName: userDetails.name,
      userPhone: userDetails.phoneNumber,
      selectedMethod: req.selectedMethod,
      orderItems: newOrder.orderItems.map((item) => ({
        id: item.itemId,
        name: item.itemName,
        quantity: item.quantity,
        price: item.price,
      })),
      orderAmount: newOrder.orderAmount,
      ...(onlineOrder && {
        deliveryAddress: userDetails.address.displayAddress,
      }),
      createdAt: new Date().toISOString(),
      orderDate: newOrder.orderDate,
    };

    // --- Send confirmation email ---
    const transporter = nodemailer.createTransport({
      host: "smtp.hostinger.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: `"Your Order"- ${newOrder.displayId} <${process.env.SENDER_EMAIL}>`,
      to: process.env.RECIEVER_EMAIL,
      subject: `🔥 New Order Received - ${newOrder.displayId}`,
      html: generateOrderConfirmationEmail(orderResponse),
      headers: {
        "X-Priority": "1",
        "X-MSMail-Priority": "High",
        Importance: "high",
      },
    };

    transporter.sendMail(mailOptions, (error) => {
      if (error) console.error("Error sending email:", error);
    });

    return orderResponse;
  }

  async getOrderByOrderId(orderId: string): Promise<ApiResponse<IOrder | {}>> {
    const order = await this.repository.findById(orderId);
    if (!order) {
      return new ApiResponse(200, {}, "Order not found for this checkout.");
    }
    return new ApiResponse(200, order, "Order retrieved successfully.");
  }
}
