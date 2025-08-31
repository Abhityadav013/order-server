import Category, { ICategory } from "../models/category.model";

export class CategroyDetailService {
  async fetch(): Promise<ICategory[] | []> {
    try {
      const category: ICategory[] = await Category.find({ isDelivery: true })
        .sort({ order: 1 })
        .select("-_id");
      return category;
    } catch {
      return [];
    }
  }
}
