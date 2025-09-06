
import mongoose, { Schema, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { SpicyLevel } from '../../models/enums';
import { generateBasketId } from '../../utils/generateBasketId';

export const UserCartSchemaName = 'Cart'; // Collection name

export interface Customization {
  notes?: string;
  options?: string[];
  spicyLevel?: SpicyLevel;
}

interface CartItem {
  itemId: string;
  itemName: string;
  quantity: number;
  price: number;
  customization?: Customization;
}

export interface ICart extends Document {
  id: string;
  deviceId: string;
  tid:string
  userId?: string;
  cartItems: CartItem[];
  basketId?: string;
  refreshToken?: string;
}

export const CartItemSchema = new Schema<CartItem>(
  {
    itemId: { type: String, required: true },
    itemName: { type: String, required: true },
    quantity: { type: Number, required: true, default: 1 },
    price: { type: Number, required: true },

    customization: {
      notes: { type: String, default: '' },
      options: { type: [String], default: [] },
      spicyLevel: {
        type: String,
        enum: ['no_spicy', 'spicy', 'very_spicy'],
        default: 'no_spicy',
      },
    },
  },
  {
    _id: false, // ❗Important to avoid unwanted nested _ids
  }
);

const UserCartSchema = new Schema<ICart>(
  {
    id: {
      type: String,
      required: true,
      default: uuidv4,
    },
    deviceId: {
      type: String,
      required: true,
    },
    tid: {
      type: String,
      required: true,
    },
    userId: {
      type: String,
      required: false,
    },
    basketId: {
      type: String,
      required: false,
    },
    refreshToken: {
      type: String,
      required: false,
    },
    cartItems: [CartItemSchema],
  },
  {
    versionKey: false,
    collection: UserCartSchemaName,
    timestamps: true, // Optional: if you want createdAt and updatedAt
  }
);
UserCartSchema.pre('validate', async function (next) {
  if (this.isNew) {
    // Ensure custom ID is generated
    if (!this.id) {
      this.id = uuidv4();
    }

    try {
      // Now that ID is present, generate the basket ID
      this.basketId = await generateBasketId(this.id);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error('Error generating basketId:', err);
      return next(err);
    }
  }

  next();
});

// Optional: Clean cart item _id when serializing
UserCartSchema.set('toJSON', {
  transform: (_doc, ret) => {
    if (ret.cartItems && Array.isArray(ret.cartItems)) {
      // Each item is a plain JS object after toJSON, but TS still thinks CartItem
      ret.cartItems.forEach((item: any) => {
        if (item && typeof item === 'object') {
          delete item._id;
        }
      });
    }
    return ret;
  },
});


const Cart = mongoose.models.Cart || mongoose.model<ICart>('Cart', UserCartSchema);

export default Cart;
