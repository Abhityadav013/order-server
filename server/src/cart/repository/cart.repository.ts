// src/cart/repository/cart.repository.

import Cart, { ICart } from "../model/cart.model";

export class CartRepository {
  async findByDeviceId(deviceId: string): Promise<ICart | null> {
    return Cart.findOne({ deviceId }).select("-cartItems.addons").exec();
  }

  async findByBasketId(basketId: string): Promise<ICart | null> {
    return Cart.findOne({ basketId }).select("-cartItems.addons").exec();
  }
  async create(cartData: Partial<ICart>): Promise<ICart> {
    const cart = new Cart(cartData);
    return cart.save();
  }

  async save(cart: ICart): Promise<ICart> {
    return cart.save();
  }

  async deleteByDeviceId(deviceId: string): Promise<void> {
    await Cart.deleteOne({ deviceId });
  }
}
