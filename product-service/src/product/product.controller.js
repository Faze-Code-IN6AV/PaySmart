'use strict';

import { createProductRecord, getAllProductRecords, getActiveProducts, getProductByIdRecord, updateProductRecord, disableProductRecord, enableProductRecord } from './product.service.js';

export const createProduct = async (req, res) => {
    try {
        const product = await createProductRecord({
            productData: req.body
        });

        res.status(201).json({
            success: true,
            message: 'Producto creado exitosamente!',
            data: product
        });

    } catch (err) {
        res.status(400).json({
            success: false,
            message: 'Error al crear el producto.',
            error: err.message
        });
    }
};

export const getAllProducts = async (req, res, next) => {
    try {
        const products = await getAllProductRecords();

        res.status(200).json({
            success: true,
            data: products
        });

    } catch (err) {
        next(err);
    }
};

export const getAvailableProducts = async (req, res, next) => {
    try {
        const products = await getActiveProducts();

        res.status(200).json({
            success: true,
            data: products
        });

    } catch (err) {
        next(err);
    }
};

export const getProductById = async (req, res) => {
    try {
        const product = await getProductByIdRecord(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Producto no encontrado'
            });
        }

        res.json({
            success: true,
            data: product
        });

    } catch (err) {
        res.status(400).json({
            success: false,
            message: err.message
        });
    }
};

export const updateProduct = async (req, res) => {
    try {
        const product = await updateProductRecord(
            req.params.id,
            req.body
        );

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Producto no encontrado'
            });
        }

        res.json({
            success: true,
            message: 'Producto actualizado correctamente',
            data: product
        });

    } catch (err) {
        res.status(400).json({
            success: false,
            message: err.message
        });
    }
};

export const disableProduct = async (req, res) => {
    try {
        const product = await disableProductRecord(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Producto no encontrado'
            });
        }

        res.json({
            success: true,
            message: 'Producto desactivado correctamente'
        });

    } catch (err) {
        res.status(400).json({
            success: false,
            message: err.message
        });
    }
};

export const enableProduct = async (req, res) => {
    try {
        const product = await enableProductRecord(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Producto no encontrado'
            });
        }

        res.json({
            success: true,
            message: 'Producto activado correctamente'
        });

    } catch (err) {
        res.status(400).json({
            success: false,
            message: err.message
        });
    }
};