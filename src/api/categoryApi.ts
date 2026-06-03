import axiosClient, { USE_MOCK, unwrap } from "./axiosClient";
import { CATEGORIES } from "./endpoints";

export interface CategoryItem {
  categoryId: number;
  name: string;
}

const mockCategories: CategoryItem[] = [
  { categoryId: 1, name: "Lập trình Web" },
  { categoryId: 2, name: "Backend" },
  { categoryId: 3, name: "Thiết kế" },
];

export async function getCategories(): Promise<CategoryItem[]> {
  if (USE_MOCK) return mockCategories;
  const response = await axiosClient.get(CATEGORIES);
  return unwrap<CategoryItem[]>(response);
}
