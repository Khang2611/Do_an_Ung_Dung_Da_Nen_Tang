import axiosClient, { USE_MOCK, unwrap } from "./axiosClient";
import { USERS } from "./endpoints";
import { mockUsers } from "../data/mockData";
import type { User } from "../types/user";

function normalizeUser(raw: any): User {
  return {
    id: String(raw?.userId ?? raw?.id),
    fullName: raw?.fullName || raw?.username || "Nguoi dung",
    email: raw?.email || "",
    username: raw?.username || raw?.email || "",
    role: raw?.role || "USER",
    status: raw?.status || "active",
    createdAt: raw?.createdDate || raw?.createdAt || "",
  };
}

export async function getUsers(): Promise<User[]> {
  if (USE_MOCK) return mockUsers;
  const response = await axiosClient.get(USERS);
  return unwrap<any[]>(response).map(normalizeUser);
}

export async function updateUser(id: string, data: Partial<User>) {
  if (USE_MOCK) {
    const index = mockUsers.findIndex((item) => item.id === id);
    if (index < 0) throw new Error("Khong tim thay nguoi dung.");
    mockUsers[index] = { ...mockUsers[index], ...data };
    return mockUsers[index];
  }
  if (data.role) {
    const response = await axiosClient.patch(`${USERS}/${id}/role`, { role: data.role });
    return normalizeUser(unwrap<any>(response));
  }
  if (data.status) {
    const response = await axiosClient.patch(`${USERS}/${id}/status`, { status: data.status });
    return normalizeUser(unwrap<any>(response));
  }
  throw new Error("Khong co du lieu cap nhat user.");
}

export async function deleteUser(id: string) {
  if (USE_MOCK) {
    const index = mockUsers.findIndex((item) => item.id === id);
    if (index >= 0) mockUsers.splice(index, 1);
    return;
  }
  await axiosClient.delete(`${USERS}/${id}`);
}
