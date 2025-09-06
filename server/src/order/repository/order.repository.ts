import Order, { IOrder } from "../models/order.model";


export class OrderRepository {
  async createOrder(orderData: Partial<IOrder>): Promise<IOrder> {
    const newOrder = new Order(orderData);
    return newOrder.save();
  }

  async findById(orderId: string): Promise<IOrder | null> {
    return Order.findOne({displayId:orderId}).exec();
  }
}