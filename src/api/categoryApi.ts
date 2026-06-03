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

export async function createCategory(name: string): Promise<CategoryItem> {
  const normalizedName = name.trim();
  if (!normalizedName) throw new Error("Vui lòng nhập tên danh mục.");

  if (USE_MOCK) {
    const existing = mockCategories.find((item) => item.name.toLowerCase() === normalizedName.toLowerCase());
    if (existing) return existing;
    const category = {
      categoryId: Math.max(0, ...mockCategories.map((item) => item.categoryId)) + 1,
      name: normalizedName,
    };
    mockCategories.push(category);
    return category;
  }

  const response = await axiosClient.post(CATEGORIES, { name: normalizedName });
  return unwrap<CategoryItem>(response);
}
