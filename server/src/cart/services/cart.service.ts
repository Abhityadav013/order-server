// src/cart/services/cart.service.ts
import ApiResponse from "../../utils/ApiResponse";
import { ICart } from "../model/cart.model";
import { CartRepository } from "../repository/cart.repository";

interface CartItemInput {
  itemId: string;
  itemName: string;
  quantity: number;
  price: number;
  customization?: any;
}

interface CartPayload {
  cart: CartItemInput[];
  isCartEmpty: boolean;
}

export class CartService {
  private readonly repository = new CartRepository();

  async updateCart(
    deviceId: string,
    payload: CartPayload
  ): Promise<ApiResponse<ICart | null>> {
    const { cart: cartItems, isCartEmpty } = payload;

    let cart = await this.repository.findByDeviceId(deviceId);

    if (isCartEmpty) {
      if (cart) {
        await this.repository.deleteByDeviceId(deviceId);
      }
      return new ApiResponse(200, null, "Cart cleared successfully");
    }

    if (!cart) {
      cart = await this.repository.create({ deviceId, cartItems: [] });
    }

    // Add/update items in cart
    cart.cartItems = cart.cartItems || [];

    // Update existing or push new items
    cartItems.forEach((item) => {
      const existingItem = cart.cartItems.find((i) => i.itemId === item.itemId);
      if (existingItem) {
        existingItem.quantity = item.quantity;
        existingItem.price = item.price;
        existingItem.customization = item.customization;
      } else {
        cart.cartItems.push(item as any);
      }
    });

    // Remove items not in the latest payload
    cart.cartItems = cart.cartItems.filter((ci) =>
      cartItems.some((i) => i.itemId === ci.itemId)
    );

    const savedCart = await this.repository.save(cart);

    return new ApiResponse(201, savedCart, "Cart updated successfully");
  }

  async getCart(deviceId: string): Promise<ApiResponse<ICart | {}>> {
    const cart = await this.repository.findByDeviceId(deviceId);
    if (!cart) {
      return new ApiResponse(200, {}, "Cart is empty.");
    }
    return new ApiResponse(200, cart, "Cart retrieved successfully.");
  }

  async getCartByBasketId(basketId: string): Promise<ApiResponse<ICart | {}>> {
    const cart = await this.repository.findByBasketId(basketId);
    if (!cart) {
      return new ApiResponse(200, {}, "Cart not found for this basketId.");
    }
    return new ApiResponse(200, cart, "Cart retrieved successfully.");
  }
}
