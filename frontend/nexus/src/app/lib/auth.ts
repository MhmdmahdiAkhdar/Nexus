export interface StoredUser {
  userId: number;
  email: string;
  fullName: string;
  roleId: number;
  roleName: string;
  mustChangePassword: boolean;
}

export function getCurrentUser(): StoredUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("nexus_user");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function isAdmin(): boolean {
  const user = getCurrentUser();
  return user?.roleName === "Admin";
}