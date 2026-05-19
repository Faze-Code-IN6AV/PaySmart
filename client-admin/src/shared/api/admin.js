// SERVICIOS DE ADMINISTRACIÓN — PaySmart
import { axiosAdmin } from './api';

// ─── Gestión de clientes (CRUD completo) ─────────────────────────────────────

// GET /api/v1/users/clients — listar todos los clientes
export const getAllClients = async () => {
  return await axiosAdmin.get('/users/clients');
};

// GET /api/v1/users/clients/:userId — ver cliente por ID
export const getClientById = async (userId) => {
  return await axiosAdmin.get(`/users/clients/${userId}`);
};

// POST /api/v1/auth/admin/create-client — solo admin crea clientes
export const adminCreateClient = async (data) => {
  return await axiosAdmin.post('/auth/admin/create-client', data);
};

// PUT /api/v1/users/clients/:userId — editar cliente (sin DPI ni password)
export const updateClient = async (userId, data) => {
  return await axiosAdmin.put(`/users/clients/${userId}`, data);
};

// DELETE /api/v1/users/clients/:userId — eliminar cliente
export const deleteClient = async (userId) => {
  return await axiosAdmin.delete(`/users/clients/${userId}`);
};

// ─── Roles ────────────────────────────────────────────────────────────────────

// GET /api/v1/users/by-role/:roleName
export const getUsersByRole = async (roleName) => {
  return await axiosAdmin.get(`/users/by-role/${roleName}`);
};

// GET /api/v1/users/:userId/roles
export const getUserRoles = async (userId) => {
  return await axiosAdmin.get(`/users/${userId}/roles`);
};

// PUT /api/v1/users/:userId/role
export const updateUserRole = async (userId, roleName) => {
  return await axiosAdmin.put(`/users/${userId}/role`, { roleName });
};
