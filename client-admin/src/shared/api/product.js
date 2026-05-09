import { axiosProduct } from './api';

// POST /paySmart/v1/products
export const createProduct = async (productData) => {
    return await axiosProduct.post('/products', productData);
};

// GET /paySmart/v1/products
export const getAllProducts = async () => {
    return await axiosProduct.get('/products');
};

// GET /paySmart/v1/products/:id
export const getProductById = async (id) => {
    return await axiosProduct.get(`/products/${id}`);
};

// PATCH /paySmart/v1/products/:id
export const updateProduct = async (id, productData) => {
    return await axiosProduct.patch(`/products/${id}`, productData);
};

// DELETE /paySmart/v1/products/:id
export const disableProduct = async (id) => {
    return await axiosProduct.delete(`/products/${id}`);
};

// PATCH /paySmart/v1/products/:id/activate
export const enableProduct = async (id) => {
    return await axiosProduct.patch(`/products/${id}/activate`);
};