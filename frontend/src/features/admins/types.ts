export interface AdminDto {
  id: number;
  userName: string;
  createdAt: string;
}

export interface CreateAdminDto {
  userName: string;
  password: string;
}

export interface Admin {
  id: number;
  userName: string;
}
