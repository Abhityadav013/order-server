import mongoose, { Document, Schema, CallbackError } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import CounterModel from "../../models/Counter";

export interface IUser extends Document {
  id: string;          // UUID
  displayId: string;   // Auto incremented readable ID (U00000001)
  name: string;
  email: string;
  phone: string;
  password?: string;   // optional for OAuth users
  googleId?: string;
  picture?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    id: { type: String, required: true, default: uuidv4 }, // UUID auto
    displayId: { type: String, unique: true },             // Incremental readable ID
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, index: true },
    phone: { type: String, required: true, unique: true, trim: true },
    password: { type: String },
    googleId: { type: String },
    picture: { type: String }
  },
  { timestamps: true }
);

UserSchema.pre("save", async function (next) {
  if (this.isNew) {
    try {
      const counter = await CounterModel.findOneAndUpdate(
        { _id: "user" },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );

      if (counter) {
        this.displayId = `U${String(counter.seq).padStart(8, "0")}`;
      } else {
        throw new Error("Failed to generate displayId");
      }
    } catch (err: unknown) {
      console.error("Error generating displayId:", err);

      // Type cast err to CallbackError before passing to next
      return next(err as CallbackError | undefined);
    }
  }
  next();
});

export const User = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
