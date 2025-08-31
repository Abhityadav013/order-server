import { BasketItem } from "./basket"

export type GetCartData = {
    cartItems:BasketItem[];
    basketId:string
}