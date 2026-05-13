import { useEffect } from 'react';
import { useFavoriteAccountStore } from '../store/favoriteAccountStore.js';

export const useFavoriteAccount = () => {
    const favorites        = useFavoriteAccountStore((s) => s.favorites);
    const loading          = useFavoriteAccountStore((s) => s.loading);
    const error            = useFavoriteAccountStore((s) => s.error);

    const fetchFavorites   = useFavoriteAccountStore((s) => s.fetchFavorites);
    const createFavorite   = useFavoriteAccountStore((s) => s.createFavorite);
    const updateFavorite   = useFavoriteAccountStore((s) => s.updateFavorite);
    const deleteFavorite   = useFavoriteAccountStore((s) => s.deleteFavorite);
    const activateFavorite = useFavoriteAccountStore((s) => s.activateFavorite);
    const deactivateFavorite = useFavoriteAccountStore((s) => s.deactivateFavorite);
    const clearError       = useFavoriteAccountStore((s) => s.clearError);

    useEffect(() => {
        fetchFavorites();
    }, []);

    return {
        favorites,
        loading,
        error,
        createFavorite,
        updateFavorite,
        deleteFavorite,
        activateFavorite,
        deactivateFavorite,
        clearError,
    };
};