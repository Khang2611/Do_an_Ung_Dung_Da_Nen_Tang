import axiosClient, { USE_MOCK, unwrap } from "./axiosClient";
import { USERS } from "./endpoints";
import { mockUsers } from "../data/mockData";
import type { FrontendRole } from "../types/auth";
import type { User } from "../types/user";
import { normalizeRole, normalizeStatus, toApiRole, toApiStatus } from "../utils/format";

function normalizeUser(raw: any): User {
  return {
    id: String(raw?.userId ?? raw?.id),
    fullName: raw?.fullName || raw?.username || "Người dùng",
    email: raw?.email || "",
    username: raw?.username || raw?.email || "",
    role: normalizeRole(raw?.role || "USER"),
    status: normalizeStatus(raw?.status || "active"),
    createdAt: raw?.createdDate || raw?.createdAt || "",
    avatar: raw?.avatar || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80`,
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
    if (index < 0) throw new Error("Không tìm thấy người dùng.");
    mockUsers[index] = { ...mockUsers[index], ...data };
    return mockUsers[index];
  }
  
  if (data.role) {
    const rolePayload = toApiRole(data.role);
    const response = await axiosClient.patch(`${USERS}/${id}/role`, { role: rolePayload });
    return normalizeUser(unwrap<any>(response));
  }

  if (data.status) {
    const statusPayload = toApiStatus(data.status);
    const response = await axiosClient.patch(`${USERS}/${id}/status`, { status: statusPayload });
    return normalizeUser(unwrap<any>(response));
  }
  
  throw new Error("Chức năng cập nhật không được hỗ trợ.");
}

export async function updateUserRole(id: string, role: FrontendRole) {
  const rolePayload = toApiRole(role);
  if (USE_MOCK) {
    const index = mockUsers.findIndex((item) => item.id === id);
    if (index < 0) throw new Error("Không tìm thấy người dùng.");
    mockUsers[index] = { ...mockUsers[index], role: normalizeRole(role) };
    return mockUsers[index];
  }

  const response = await axiosClient.patch(`${USERS}/${id}/role`, { role: rolePayload });
  return normalizeUser(unwrap<any>(response));
}

export async function updateUserStatus(id: string, status: "ACTIVE" | "LOCKED") {
  if (USE_MOCK) {
    const index = mockUsers.findIndex((item) => item.id === id);
    if (index < 0) throw new Error("Không tìm thấy người dùng.");
    mockUsers[index] = { ...mockUsers[index], status: normalizeStatus(status) };
    return mockUsers[index];
  }

  const response = await axiosClient.patch(`${USERS}/${id}/status`, { status });
  return normalizeUser(unwrap<any>(response));
}

export async function deleteUser(id: string) {
  if (USE_MOCK) {
    const index = mockUsers.findIndex((item) => item.id === id);
    if (index >= 0) mockUsers.splice(index, 1);
    return;
  }
  await axiosClient.delete(`${USERS}/${id}`);
}
