export interface User {
  id: number;
  userName: string;
  role: "User" | "Admin" | "SuperAdmin";
}
