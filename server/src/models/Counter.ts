import mongoose, { Document } from 'mongoose';

export const CounterSchemaName = "Counter"; 

export interface ICounter extends Document {
  _id: string; // sequence name like 'user', 'order', etc.
  seq: number;
  type:string
}
// Counter schema with sequence type and number
const CounterSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },  // The key to identify the type (e.g., 'orderId', 'paymentId')
    seq: { type: Number, default: 0 },      // The sequence number for this type
    type: { type: String, required: true },  // The type of sequence (e.g., 'orderId', 'paymentId')
  },
  {
    collection: CounterSchemaName,  // Collection name (this can be any name)
    versionKey: false,       // Disable version key (_v)
  }
);

// Check if the model already exists in mongoose.models to avoid overwriting
const CounterModel =  mongoose.model<ICounter>("Counter", CounterSchema);
export default CounterModel;


