import mongoose, { Schema, Document } from "mongoose";
import { v4 as uuidv4 } from "uuid"; // uuid for generating unique orderId
import CounterModel from "../../models/Counter";
import { PaymentMethod } from "../../models/types/paymentTypes";
import { SpicyLevel } from "../../models/enums";

export const OrderSchemaName = "Order"; // Collection name

// Define the structure of the Order Schema
export enum OrderType {
  DELIVERY = "DELIVERY",
  PICKUP = "PICKUP",
}

export enum OrderStatus {
  PENDING = "PENDING", // Order received but not yet accepted by the restaurant
  ACCEPTED = "ACCEPTED", // Restaurant has accepted the order
  IN_PROGRESS = "IN_PROGRESS", // Being prepared (merged with "PREPARING")
  COOKED = "COOKED", // Cooking/preparation is done
  READY_FOR_PICKUP = "READY_FOR_PICKUP", // For pickup orders, ready at counter
  OUT_FOR_DELIVERY = "OUT_FOR_DELIVERY", // For delivery orders, delivery person picked it
  DELIVERED = "DELIVERED", // Customer received the order
  CANCELLED = "CANCELLED", // Order was cancelled
  FAILED = "FAILED", // Payment or processing failure (optional)
  COMPLETED = "COMPLETED", // Final state (DELIVERED or PICKED_UP with confirmation)
}
export interface IOrder extends Document {
  orderId: string; // Unique Order ID (UUID)
  displayId: string; // Unique Display ID for the order
  orderDate: string; // Order date (ISO string or Date format)
  orderType: OrderType;
  pickupOrder: boolean; // Flag to identify pickup orders
  onlineOrder: boolean; // Flag to identify online orders
  status: OrderStatus; // Status of the order
  orderItems: Array<{
    itemId: string;
    itemName: string;
    quantity: number;
    price: number;
    customization?: {
      notes: string;
      options: string[];
      spicyLevel: SpicyLevel;
    };
  }>; // List of ordered items
  orderAmount: {
    orderTotal: number;
    deliveryFee: number;
    serviceFee: number;
    tipAmount: number;
    discount?: {
      code: string;
      amount: number;
    };
  };
  deliveryAddress?: string;
  deviceId: string;
  deliveryTime: { asap: boolean; scheduledTime: string };
  deliveryNote: string;
  userName: string;
  userPhone: string;
  selectedMethod: PaymentMethod;
}
const OrderSchema = new Schema<IOrder>(
  {
    orderId: {
      type: String, // UUID for orderId
      required: true,
      default: uuidv4, // Automatically generate a UUID for orderId
    },
    displayId: {
      type: String,
      unique: true, // Ensures the displayId is unique
    },
    orderDate: {
      type: String,
      required: true,
    },
    pickupOrder: {
      type: Boolean,
      required: false,
    },
    onlineOrder: {
      type: Boolean,
      required: false,
    },
    status: {
      type: String,
      required: true,
    },
    orderItems: [
      {
        itemId: {
          type: String, // GUID for itemId
          required: true,
        },
        itemName: {
          type: String,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
      },
    ],
    orderAmount: {
      type: Object,
      required: true,
    },
    deliveryAddress: {
      type: String,
      required: false,
    },
    deviceId: {
      type: String,
      required: true,
    },
    deliveryTime: {
      type: Object,
      required: true,
    },
    deliveryNote: {
      type: String,
      required: false,
    },
    userName: {
      type: String,
      required: true,
    },
    userPhone: {
      type: String,
      required: true,
    },
    selectedMethod: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt fields
    versionKey: false, // Disable the "__v" version key
    collection: OrderSchemaName,
  }
);

OrderSchema.pre("save", async function (next) {
  if (this.isNew) {
    try {
      // Get the counter for 'order' type and increment the sequence
      const counter = await CounterModel.findOneAndUpdate(
        { _id: "order" }, // Find by the 'order' type
        { $inc: { seq: 1 } }, // Increment the sequence
        { new: true, upsert: true } // Create if not found
      );

      // Generate the displayId (e.g., "O00000001")
      this.displayId = `B${String(counter.seq).padStart(8, "0")}`;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error("Error generating displayId:", err);
      next(err);
    }
  }
  next();
});

// Remove _id from orderItems when converting to JSON
OrderSchema.set("toJSON", {
  transform: (doc, ret) => {
    // Remove _id from each order item in the response
    ret.orderItems.forEach((item: any) => {
      if (item && typeof item === "object") {
        delete item._id;
      }
    });
    return ret;
  },
});

// Create and export the Order model
const Order = mongoose?.models?.Order || mongoose.model("Order", OrderSchema);

export default Order;
