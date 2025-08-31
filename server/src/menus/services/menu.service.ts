import Menu, { IMenu } from "../models/Menu.model";

export class MenuDetailService {
  async fetch(): Promise<IMenu[] | []> {
    try {
      const menu: IMenu[] = await Menu.find()
        .sort({ "category.order": 1 })
        .select("-_id");
      return menu;
    } catch {
      return [];
    }
  }
}
