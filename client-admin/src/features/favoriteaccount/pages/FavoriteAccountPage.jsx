import { useState } from 'react';
import {
    PlusCircleIcon,
    StarIcon,
    CheckCircleIcon,
    NoSymbolIcon,
} from '@heroicons/react/24/outline';

import { useFavoriteAccount } from '../hooks/useFavoriteAccount.js';
import { FavoriteAccountCard } from '../components/FavoriteAccountCard.jsx';
import { CreateFavoriteModal } from '../components/CreateFavoriteModal.jsx';
import { EditFavoriteModal } from '../components/EditFavoriteModal.jsx';

// ——— Modal de confirmación genérico ———
const ConfirmModal = ({ action, alias, onConfirm, onCancel }) => {
    const CONFIG = {
        deactivate: {
            title: 'Desactivar cuenta favorita',
            description: 'La cuenta quedará inactiva. Podrás reactivarla cuando lo necesites.',
            confirmLabel: 'Desactivar',
            confirmStyle: { backgroundColor: '#FFE968', color: '#0B1830' },
            borderColor: 'rgba(255,233,104,0.3)',
            Icon: NoSymbolIcon,
            iconColor: '#FFE968',
        },
        activate: {
            title: 'Activar cuenta favorita',
            description: 'La cuenta volverá a estar disponible en tu lista de favoritos.',
            confirmLabel: 'Activar',
            confirmStyle: { backgroundColor: '#41D2F2', color: '#0B1830' },
            borderColor: 'rgba(65,210,242,0.3)',
            Icon: CheckCircleIcon,
            iconColor: '#41D2F2',
        },
    };

    const cfg = CONFIG[action];
    if (!cfg) return null;

    return (
        <div
            className='fixed inset-0 z-50 flex items-center justify-center p-4'
            style={{ backgroundColor: 'rgba(11,24,48,0.85)', backdropFilter: 'blur(4px)' }}
        >
            <div
                className='w-full max-w-sm rounded-2xl p-6 space-y-4'
                style={{ backgroundColor: '#162C5F', border: `1px solid ${cfg.borderColor}` }}
            >
                <div className='flex items-center gap-3'>
                    <div className='p-2.5 rounded-xl' style={{ backgroundColor: `${cfg.iconColor}15` }}>
                        <cfg.Icon className='w-6 h-6' style={{ color: cfg.iconColor }} />
                    </div>
                    <div>
                        <h3 className='font-bold' style={{ color: cfg.iconColor }}>{cfg.title}</h3>
                        <p className='text-xs' style={{ color: 'rgba(255,255,255,0.5)' }}>
                            Alias: <span className='font-medium'>{alias}</span>
                        </p>
                    </div>
                </div>
                <p className='text-sm' style={{ color: 'rgba(255,255,255,0.7)' }}>
                    {cfg.description}
                </p>
                <div className='flex gap-3'>
                    <button
                        onClick={onCancel}
                        className='flex-1 py-2.5 rounded-lg text-sm font-medium hover:opacity-70'
                        style={{ backgroundColor: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.1)' }}
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={onConfirm}
                        className='flex-1 py-2.5 rounded-lg text-sm font-bold hover:opacity-80'
                        style={cfg.confirmStyle}
                    >
                        {cfg.confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ——— Página principal ———
export const FavoriteAccountPage = () => {
    const {
        favorites,
        loading,
        createFavorite,
        updateFavorite,
        activateFavorite,
        deactivateFavorite,
    } = useFavoriteAccount();

    const [showCreate, setShowCreate]     = useState(false);
    const [editTarget, setEditTarget]     = useState(null);   // favorite obj
    const [confirm, setConfirm]           = useState(null);   // { action, id, alias }
    const [modalLoading, setModalLoading] = useState(false);

    // ——— Handlers ———
    const handleCreate = async (data) => {
        setModalLoading(true);
        const res = await createFavorite(data);
        setModalLoading(false);
        if (res.success) setShowCreate(false);
        return res;
    };

    const handleEdit = async (id, alias) => {
        setModalLoading(true);
        const res = await updateFavorite(id, alias);
        setModalLoading(false);
        if (res.success) setEditTarget(null);
        return res;
    };

    const handleConfirm = async () => {
        if (!confirm) return;
        const { action, id } = confirm;
        if (action === 'activate')    await activateFavorite(id);
        if (action === 'deactivate')  await deactivateFavorite(id);
        setConfirm(null);
    };

    return (
        <div className='flex flex-col h-full'>
            {/* ——— Header ——— */}
            <div className='flex items-start justify-between mb-6 flex-wrap gap-4'>
                <div>
                    <h1 className='text-2xl font-bold' style={{ color: '#FFFFFF' }}>
                        Cuentas Favoritas
                    </h1>
                    <p className='text-sm mt-1' style={{ color: '#41D2F2' }}>
                        Administra tus cuentas de transferencia frecuente
                    </p>
                </div>
                <button
                    onClick={() => setShowCreate(true)}
                    className='flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-opacity hover:opacity-80'
                    style={{ backgroundColor: '#41D2F2', color: '#0B1830' }}
                >
                    <PlusCircleIcon className='w-5 h-5' />
                    Agregar favorita
                </button>
            </div>

            {/* ——— Contenido ——— */}
            {loading ? (
                <div className='flex items-center justify-center py-20'>
                    <p className='text-sm' style={{ color: 'rgba(65,210,242,0.6)' }}>
                        Cargando cuentas favoritas...
                    </p>
                </div>
            ) : favorites.length === 0 ? (
                <div
                    className='flex flex-col items-center justify-center py-20 rounded-2xl'
                    style={{ backgroundColor: '#162C5F', border: '1px dashed rgba(65,210,242,0.25)' }}
                >
                    <StarIcon className='w-12 h-12 mb-4' style={{ color: 'rgba(65,210,242,0.35)' }} />
                    <p className='text-base font-semibold mb-1' style={{ color: 'rgba(255,255,255,0.6)' }}>
                        Sin cuentas favoritas
                    </p>
                    <p className='text-sm mb-4' style={{ color: 'rgba(255,255,255,0.35)' }}>
                        Agrega cuentas para agilizar tus transferencias
                    </p>
                    <button
                        onClick={() => setShowCreate(true)}
                        className='flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold'
                        style={{ backgroundColor: '#41D2F2', color: '#0B1830' }}
                    >
                        <PlusCircleIcon className='w-5 h-5' />
                        Agregar favorita
                    </button>
                </div>
            ) : (
                <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4'>
                    {favorites.map((fav) => (
                        <FavoriteAccountCard
                            key={fav._id}
                            favorite={fav}
                            onEdit={(f) => setEditTarget(f)}
                            onActivate={(id) => setConfirm({ action: 'activate', id, alias: fav.alias })}
                            onDeactivate={(id) => setConfirm({ action: 'deactivate', id, alias: fav.alias })}
                        />
                    ))}

                    {/* Tarjeta para agregar nueva */}
                    <button
                        onClick={() => setShowCreate(true)}
                        className='rounded-2xl flex flex-col items-center justify-center gap-2 py-10 transition-opacity hover:opacity-70'
                        style={{
                            backgroundColor: 'rgba(65,210,242,0.04)',
                            border: '2px dashed rgba(65,210,242,0.2)',
                            color: 'rgba(65,210,242,0.5)',
                            minHeight: 160,
                        }}
                    >
                        <PlusCircleIcon className='w-8 h-8' />
                        <span className='text-sm font-medium'>Agregar favorita</span>
                    </button>
                </div>
            )}

            {/* ——— Modales ——— */}
            <CreateFavoriteModal
                isOpen={showCreate}
                onClose={() => setShowCreate(false)}
                onSubmit={handleCreate}
                loading={modalLoading}
            />

            <EditFavoriteModal
                isOpen={!!editTarget}
                favorite={editTarget}
                onClose={() => setEditTarget(null)}
                onSubmit={handleEdit}
                loading={modalLoading}
            />

            {confirm && (
                <ConfirmModal
                    action={confirm.action}
                    alias={confirm.alias}
                    onConfirm={handleConfirm}
                    onCancel={() => setConfirm(null)}
                />
            )}
        </div>
    );
};