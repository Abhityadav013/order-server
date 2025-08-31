import mongoose, { Schema, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';  // uuid for generating unique menuItemId

export const CategorySchemaName = "Category"; // Collection name

// Define the structure of the Menu Schema
export interface ICategory extends Document {
  id: string;  // Unique Menu Item ID (UUID)
  categoryName: string;  // food item category name
  imageUrl: string;  // image for that category
  isDelivery: boolean;  // Is category is deliverable
}

const CategorySchema = new Schema<ICategory>({
  id: {
    type: String,  // UUID for id
    required: true,
    default: uuidv4,  // Automatically generate a UUID for the itemId
  },
  categoryName: {
    type: String,  // Unique item ID for the menu
    required: true,
  },
  imageUrl: {
    type: String,  // Name of the menu item
    required: true,
  },
  isDelivery: {
    type: Boolean,  // Price of the menu item
    required: true,
  },
}, 
{
  timestamps: true,  // Automatically add createdAt and updatedAt fields
  versionKey: false,  // Disable the "__v" version key
  collection: CategorySchemaName,  // Use the collection name
});

// Remove _id from the response when querying (optional)
CategorySchema.set('toJSON', {
  transform: (doc, ret) => {
    // Optionally remove _id from the response
    delete ret._id;
    return ret;
  }
});

// Create and export the Menu model
const Category =   mongoose?.models?.Category || mongoose.model('Category', CategorySchema);

export default Category;
