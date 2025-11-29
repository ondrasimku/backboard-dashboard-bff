export interface Role {
  id: string;
  name: string;
  description: string | null;
  permissions: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateRoleRequest {
  name: string;
  description?: string;
}

export interface UpdateRoleRequest {
  name?: string;
  description?: string;
}

export interface AssignPermissionToRoleRequest {
  permissionId: string;
}

export interface AssignRoleToUserRequest {
  roleId: string;
}

