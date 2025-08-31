import mongoose, { Schema, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid'; // uuid for generating unique menuItemId

export const MenuSchemaName = 'Menu'; // Collection name

export interface ICategoryType {
  id: string;
  order: number;
}

// Define the structure of the Menu Schema
export interface IMenu extends Document {
  id: string; // Unique Menu Item ID (UUID)
  name: string; // food item category name
  description: string;
  imageURL: string; // image for that category
  isDelivery: boolean; // Is category is deliverable
  category: ICategoryType;
  price: number;
}

const CategorySchema = new Schema<ICategoryType>(
    {
      id: { type: String, required: false },
      order: { type: Number, required: false },  // This should be Number, not string
    },
    { _id: false } // prevent adding an extra _id for subdocs
  );


const MenuSchema = new Schema<IMenu>(
  {
    id: {
      type: String, // UUID for id
      required: true,
      default: uuidv4, // Automatically generate a UUID for the itemId
    },
    name: {
      type: String, // Unique item ID for the menu
      required: true,
    },
    description: {
      type: String, // Name of the menu item
      required: false,
    },
    imageURL: {
      type: String, // Price of the menu item
      required: true,
    },
    isDelivery: {
      type: Boolean,
      required: true,
    },
    category: CategorySchema,
    price: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt fields
    versionKey: false, // Disable the "__v" version key
    collection: MenuSchemaName, // Use the collection name
  }
);

const Menu = mongoose?.models?.Menu || mongoose.model('Menu', MenuSchema);

export default Menu;
