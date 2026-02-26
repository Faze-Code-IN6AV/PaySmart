'use strict';

import Product from './product.model.js';

export const createProductRecord = async ({ productData }) => {
    const product = new Product(productData);
    await product.save();
    return product;
};

export const getAllProductRecords = async () => {
    return await Product.find();
};

export const getActiveProducts = async () => {
    return await Product.find({ status: 'ACTIVO' });
};

export const getProductByIdRecord = async (id) => {
    return await Product.findById(id);
};

export const updateProductRecord = async (id, data) => {
    return await Product.findByIdAndUpdate(
        id,
        data,
        { new: true }
    );
};

export const disableProductRecord = async (id) => {
    return await Product.findByIdAndUpdate(
        id,
        { status: 'INACTIVO' },
        { new: true }
    );
};