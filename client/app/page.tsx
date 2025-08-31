import { ApiService } from "@/lib/services/apiServices";
import { CategoryWithItems } from "@/lib/types/categoryItems";
import { MenuItem } from "@/lib/types/menu";
import MenuApp from "../components/MenuApp";
import {  DeliveryDetails } from "@/lib/types/user_details";
import { Info } from "@/lib/types/restro_info";
export const dynamic = 'force-dynamic'; // <- importantclear
async function getMenuData(): Promise<CategoryWithItems[]> {
  try {
    // Use the API service to fetch data
    return await ApiService.fetchMenuData();
  } catch (error) {
    console.error("Failed to fetch menu data:", error);
    // Fallback to direct import if API fails;
    return [];
  }
}
async function getMenuList(): Promise<MenuItem[]> {
  try {
    return await ApiService.fetchMenuItems();
  } catch (error) {
    console.error("Failed to fetch menu data:", error);
    // Fallback to direct import if API fails;
    return [];
  }
}
async function getInfo(): Promise<Info> {
  try {
    return await ApiService.fetchRestroInfo();
  } catch (error) {
    console.error("Failed to fetch menu data:", error);
    // Fallback to direct import if API fails;
    return {} as Info;
  }
}

// async function fetCustomerDetails(): Promise<{
//   customerDetails: CustomerDetails;
//   hasAddress: boolean;
// }> {
//   try {
//     return await ApiService.fetchUserDetails();
//   } catch (error) {
//     console.error("Failed to fetch customer details:", error);
//     // Fallback to direct import if API fails;
//     return {} as {
//       customerDetails: CustomerDetails;
//       hasAddress: boolean;
//     };
//   }
// }

export async function getCutomerDeliveryDetails(): Promise<DeliveryDetails> {
  try {
    return await ApiService.fetchCutomerDeliveryDetails();
  } catch (error) {
    console.error("Failed to fetch customer details:", error);
    // Fallback to direct import if API fails;
    return {} as DeliveryDetails
  }
}

export default async function HomePage() {
  const categories = await getMenuData();
  const menulist = await getMenuList();
  const info = await getInfo();
  return (
    <MenuApp
      initialCategories={categories}
      menulist={menulist}
      info={info}
    />
  );
}
