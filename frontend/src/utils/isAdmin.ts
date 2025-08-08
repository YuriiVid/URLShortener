export const isAdmin = (user: { role: string } | null): boolean => {
  if (!user || !user.role) {
    return false;
  }
  return user.role === "Admin" || user.role === "SuperAdmin";
};
