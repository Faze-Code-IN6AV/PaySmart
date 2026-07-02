// /Users/diego/Tareas/Taller/PaySmart/client-user/src/features/products/hooks/useProducts.js
import { useCallback, useState } from "react";

import productClient from "../../../shared/api/productClient";

export function useProducts() {
  const [products, setProducts] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await productClient.get("/products/available/list");
      const data = response?.data?.data || response?.data || [];
      setProducts(Array.isArray(data) ? data : []);
      return data;
    } catch (err) {
      setError(err?.response?.data?.message || "No se pudieron cargar los productos.");
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const buyProduct = useCallback(async (values) => {
    setLoading(true);
    setError("");

    try {
      const response = await productClient.post("/purchases", {
        product: values.product,
        quantity: Number(values.quantity),
        fromAccountNumber: values.fromAccountNumber,
      });
      return response?.data?.data || response?.data;
    } catch (err) {
      setError(err?.response?.data?.message || "No se pudo completar la compra.");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const loadPurchases = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await productClient.get("/purchases/my");
      const data = response?.data?.data || response?.data || [];
      setPurchases(Array.isArray(data) ? data : []);
      return data;
    } catch (err) {
      setError(err?.response?.data?.message || "No se pudieron cargar las compras.");
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    products,
    purchases,
    loading,
    error,
    loadProducts,
    buyProduct,
    loadPurchases,
  };
}
