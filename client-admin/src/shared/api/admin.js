// SERVICIOS DE ADMINISTRACIÓN — PaySmart
import { axiosAdmin } from './api';

// GET /api/v1/users/by-role/ADMIN_ROLE  (solo ADMIN_ROLE)
export const getUsersByRole = async (roleName) => {
  return await axiosAdmin.get(`/users/by-role/${roleName}`);
};

// GET /api/v1/users/:userId/roles
export const getUserRoles = async (userId) => {
  return await axiosAdmin.get(`/users/${userId}/roles`);
};

// PUT /api/v1/users/:userId/role  (solo ADMIN_ROLE)
export const updateUserRole = async (userId, roleName) => {
  return await axiosAdmin.put(`/users/${userId}/role`, { roleName });
};