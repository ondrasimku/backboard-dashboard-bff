import type { Role } from './role';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  emailVerified: boolean;
  roles?: Role[];
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

