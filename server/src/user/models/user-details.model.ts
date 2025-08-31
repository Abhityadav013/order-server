import mongoose, { Document, Schema } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import CounterModel from "../../models/Counter";
import { IAddress } from "../../models/types/address";

export const UserInfoSchemaName = "UserDetails"; // Collection name

const UserAddressType = ["HOME", "WORK", "OTHER"] as const;
type UserAddressType = (typeof UserAddressType)[number];

export interface IUserAddress extends IAddress {
  addressType: UserAddressType;
}

export interface IUserInfo extends Document {
  id: string; // Make sure transactionId is part of the schema
  displayId: string;
  name: string;
  phoneNumber: string;
  address: IUserAddress;
  deviceId: string;
  tid: string;
  orderType: string;
  userLocation: {
    lat: number;
    lng: number;
  };
  isFreeDelivery: boolean;
  deliveryFee: number;
  deliverable: boolean;
}

export type IUserInfoLean = Omit<IUserInfo, keyof Document>; // remove Mongoose Document properties

const AddressSchema = new Schema<IUserAddress>(
  {
    pincode: { type: String, required: true },
    buildingNumber: { type: String, required: true },
    street: { type: String, required: true },
    town: { type: String, required: true },
    displayAddress: { type: String, required: true },
  },
  { _id: false }
);
const UserInfoSchema = new Schema<IUserInfo>(
  {
    id: { type: String, required: true, default: uuidv4 },
    displayId: { type: String, unique: true },
    name: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    address: AddressSchema,
    deviceId: { type: String, required: true },
    tid: { type: String, required: true },
    orderType: { type: String, required: true },
    userLocation: { type: Object, required: false },
    isFreeDelivery: { type: Boolean, required: false },
    deliveryFee: { type: Number, required: false },
    deliverable: { type: Boolean, required: false },
  },
  { versionKey: false, collection: UserInfoSchemaName }
);

UserInfoSchema.pre("save", async function (next) {
  if (this.isNew) {
    try {
      // Get the counter for 'user' type and increment the sequence
      const counter = await CounterModel.findOneAndUpdate(
        { _id: "user" }, // Find by the 'user' type
        { $inc: { seq: 1 } }, // Increment the sequence
        { new: true, upsert: true } // Create if not found
      );

      if (counter) {
        // Generate the displayId (e.g., "U00000001")
        this.displayId = `U${String(counter.seq).padStart(8, "0")}`;
      } else {
        throw new Error("Counter not found or created.");
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error("Error generating displayId:", err);
      return next(err); // Pass error to Mongoose
    }
  }
  next(); // Proceed with saving
});

const UserInfo =
  mongoose?.models?.UserInfo || mongoose.model("UserDetails", UserInfoSchema);
export default UserInfo;
