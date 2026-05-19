import { axiosProduct } from './api';

// POST /paySmart/v1/products  (ADMIN)
export const createProduct = async (productData) => {
    return await axiosProduct.post('/products', productData);
};

// GET /paySmart/v1/products  (ADMIN — todos, incluyendo INACTIVO)
export const getAllProducts = async () => {
    return await axiosProduct.get('/products');
};

// GET /paySmart/v1/products/available/list  (cualquier usuario autenticado — solo ACTIVO)
export const getAvailableProducts = async () => {
    return await axiosProduct.get('/products/available/list');
};

// GET /paySmart/v1/products/:id  (ADMIN)
export const getProductById = async (id) => {
    return await axiosProduct.get(`/products/${id}`);
};

// PATCH /paySmart/v1/products/:id  (ADMIN)
export const updateProduct = async (id, productData) => {
    return await axiosProduct.patch(`/products/${id}`, productData);
};

// DELETE /paySmart/v1/products/:id  (ADMIN)
export const disableProduct = async (id) => {
    return await axiosProduct.delete(`/products/${id}`);
};

// PATCH /paySmart/v1/products/:id/activate  (ADMIN)
export const enableProduct = async (id) => {
    return await axiosProduct.patch(`/products/${id}/activate`);
};
