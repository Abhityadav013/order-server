import { SpicyLevel } from "../enums";

export interface Cart {
    itemId:string,
    itemName:string,
    quantity:number,
    price:number,
    customization?: {
      notes: string;
      options: string[];
      spicyLevel: SpicyLevel;
    }
}