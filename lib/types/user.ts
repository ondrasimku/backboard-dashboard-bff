export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  emailVerified: boolean;
  role: 'admin' | 'user';
  avatarUrl?: string | null;
  avatarFileId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UsersListResponse {
  data: User[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface UsersFilters {
  search?: string;
  role?: string;
  emailVerified?: string;
}

