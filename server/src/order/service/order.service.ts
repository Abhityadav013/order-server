

import nodemailer from 'nodemailer';
import { OrderType } from '../../models/enums';
import { IOrder, OrderStatus } from '../models/order.model';
import { CreateOrderRequest, OrderSuccessSummary } from '../../models/types/order';
import { OrderRepository } from '../repository/order.repository';
import { generateOrderConfirmationEmail } from '../../utils/generateOrderConfirmationEmail';

export class OrderService {
  private repository: OrderRepository;

  constructor() {
    this.repository = new OrderRepository();
  }

  async createOrder(req: CreateOrderRequest, deviceId: string): Promise<OrderSuccessSummary> {
    const onlineOrder = req.orderType === OrderType.DELIVERY;
    const pickupOrder = req.orderType === OrderType.PICKUP;
    const status: OrderStatus = OrderStatus.PENDING;
    const orderDate = new Date().toISOString().split('T')[0];

    if (!req.orderDetails || req.orderDetails.length === 0) {
      throw new Error('Items are required to create an order.');
    }

    let totalAmount = 0;
    req.orderDetails.forEach((item) => (totalAmount += item.price));
    const isDiscountApplied = req.discount && Object.keys(req.discount).length > 0;

    const serviceFeeCharge = (Number(totalAmount) * 2.5) / 100;
    const serviceCharge = serviceFeeCharge < 0.99 ? Number(serviceFeeCharge.toFixed(2)) : 0.99;

    const orderAmount = {
      orderTotal: totalAmount,
      deliveryFee: req.deliveryFee ?? 0,
      serviceFee: serviceCharge,
      tipAmount: req.tipAmount ?? 0,
      ...(isDiscountApplied && { discount: req.discount }),
    };

    const newOrder: IOrder = await this.repository.createOrder({
      orderDate,
      orderItems: req.orderDetails,
      onlineOrder,
      pickupOrder,
      status,
      orderAmount,
      deviceId,
      deliveryAddress: req.deliveryAddress,
      deliveryNote: req.deliveryNote ?? '',
      deliveryTime: req.deliveryTime,
      userName: req.userName,
      userPhone: req.userPhone,
      selectedMethod: req.selectedMethod,
    });

    // Build response
    const orderResponse: OrderSuccessSummary = {
      displayId: newOrder.displayId,
      orderId: newOrder.id,
      orderType: newOrder.onlineOrder ? OrderType.DELIVERY : OrderType.PICKUP,
      status,
      deliveryTime: req.deliveryTime,
      deliveryNote: req.deliveryNote,
      deliveryAddress: req.deliveryAddress,
      userName: req.userName,
      userPhone: req.userPhone,
      selectedMethod: req.selectedMethod,
      orderItems: newOrder.orderItems.map((item) => ({
        id: item.itemId,
        name: item.itemName,
        quantity: item.quantity,
        price: item.price,
      })),
      orderAmount: newOrder.orderAmount,
      ...(onlineOrder && { deliveryAddress: req.deliveryAddress }),
      createdAt: new Date().toISOString(),
      orderDate: newOrder.orderDate,
    };

    // --- Send confirmation email ---
    const transporter = nodemailer.createTransport({
      host: 'smtp.hostinger.com',
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
        'X-Priority': '1',
        'X-MSMail-Priority': 'High',
        Importance: 'high',
      },
    };

    transporter.sendMail(mailOptions, (error) => {
      if (error) console.error('Error sending email:', error);
    });

    return orderResponse;
  }
}
