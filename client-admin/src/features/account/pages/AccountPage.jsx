import { useState } from 'react';
import {
    PlusCircleIcon,
    CreditCardIcon,
    MagnifyingGlassIcon,
    NoSymbolIcon,
    CheckCircleIcon,
    XCircleIcon,
} from '@heroicons/react/24/outline';

import { useAccount } from '../hooks/useAccount.js';
import { AccountCard } from '../components/AccountCard.jsx';
import { CreateAccountModal } from '../components/CreateAccountModal.jsx';
import { showError } from '../../../shared/utils/toast.js';

const STATUS_BADGE = {
    ACTIVO: { label: 'Activo', bg: 'rgba(65,210,242,0.12)', color: '#41D2F2' },
    SUSPENDIDO: { label: 'Suspendido', bg: 'rgba(255,233,104,0.12)', color: '#FFE968' },
    CERRADO: { label: 'Cerrado', bg: 'rgba(239,68,68,0.12)', color: '#fca5a5' },
};

// ——— Modal de confirmación genérico ———
const ConfirmModal = ({ action, accountNumber, onConfirm, onCancel }) => {
    const CONFIG = {
        suspend: {
            title: 'Suspender cuenta',
            description: 'La cuenta quedará bloqueada temporalmente. Se puede reactivar.',
            confirmLabel: 'Suspender',
            confirmStyle: { backgroundColor: '#FFE968', color: '#0B1830' },
            borderColor: 'rgba(255,233,104,0.3)',
            Icon: NoSymbolIcon,
            iconColor: '#FFE968',
        },
        activate: {
            title: 'Activar cuenta',
            description: 'La cuenta volverá a estar operativa.',
            confirmLabel: 'Activar',
            confirmStyle: { backgroundColor: '#41D2F2', color: '#0B1830' },
            borderColor: 'rgba(65,210,242,0.3)',
            Icon: CheckCircleIcon,
            iconColor: '#41D2F2',
        },
        deactivate: {
            title: 'Cerrar cuenta',
            description: 'Esta acción es permanente. La cuenta desaparecerá para el usuario y podrá abrir una nueva del mismo tipo.',
            confirmLabel: 'Cerrar cuenta',
            confirmStyle: { backgroundColor: '#ef4444', color: '#FFFFFF' },
            borderColor: 'rgba(239,68,68,0.3)',
            Icon: XCircleIcon,
            iconColor: '#fca5a5',
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
                            Cuenta: <span className='font-mono'>{accountNumber}</span>
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

// ——— Vista del admin ———
const AdminView = ({ searchResults, searchLoading, searchByEmail, suspendAccount, activateAccount, deactivateAccount }) => {
    const [email, setEmail] = useState('');
    const [confirm, setConfirm] = useState(null); // { action, accountNumber }

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!email.trim()) return;
        const emailRegex = /^\S+@\S+\.\S+$/;
        if (!emailRegex.test(email.trim())) {
            showError('Ingresa un correo electrónico válido');
            return;
        }
        await searchByEmail(email.trim());
    };

    const handleConfirm = async () => {
        if (!confirm) return;
        const { action, accountNumber } = confirm;
        if (action === 'suspend') await suspendAccount(accountNumber);
        if (action === 'activate') await activateAccount(accountNumber);
        if (action === 'deactivate') await deactivateAccount(accountNumber);
        setConfirm(null);
    };

    return (
        <div className='flex flex-col gap-6'>
            {/* Header */}
            <div>
                <h1 className='text-2xl font-bold' style={{ color: '#FFFFFF' }}>
                    Gestión de Cuentas
                </h1>
                <p className='text-sm mt-1' style={{ color: '#41D2F2' }}>
                    Busca un usuario por correo para gestionar sus cuentas
                </p>
            </div>

            {/* Buscador */}
            <form onSubmit={handleSearch} className='flex gap-3 max-w-lg'>
                <div className='relative flex-1'>
                    <MagnifyingGlassIcon
                        className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4'
                        style={{ color: '#41D2F2' }}
                    />
                    <input
                        type='email'
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder='correo@ejemplo.com'
                        className='w-full pl-9 pr-3 py-2.5 text-sm border rounded-xl focus:outline-none'
                        style={{ backgroundColor: '#0B1830', borderColor: '#41D2F2', color: '#FFFFFF' }}
                    />
                </div>
                <button
                    type='submit'
                    disabled={searchLoading || !email.trim()}
                    className='px-5 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50 transition-opacity hover:opacity-80'
                    style={{ backgroundColor: '#41D2F2', color: '#0B1830' }}
                >
                    {searchLoading ? 'Buscando...' : 'Buscar'}
                </button>
            </form>

            {/* Resultados */}
            {searchResults.length > 0 && (
                <div className='space-y-3'>
                    <p className='text-sm font-medium' style={{ color: 'rgba(255,255,255,0.5)' }}>
                        {searchResults.length} cuenta{searchResults.length > 1 ? 's' : ''} encontrada{searchResults.length > 1 ? 's' : ''} para{' '}
                        <span style={{ color: '#41D2F2' }}>{email}</span>
                    </p>

                    <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4'>
                        {searchResults.map((account) => {
                            const statusBadge = STATUS_BADGE[account.status] ?? STATUS_BADGE.ACTIVO;
                            const isActive = account.status === 'ACTIVO';
                            const isSuspended = account.status === 'SUSPENDIDO';
                            const isClosed = account.status === 'CERRADO';

                            return (
                                <div
                                    key={account._id}
                                    className='rounded-2xl p-5 flex flex-col gap-4'
                                    style={{
                                        backgroundColor: '#162C5F',
                                        border: `1px solid ${isClosed ? 'rgba(239,68,68,0.2)' : isSuspended ? 'rgba(255,233,104,0.2)' : 'rgba(65,210,242,0.2)'}`,
                                        opacity: isClosed ? 0.6 : 1,
                                    }}
                                >
                                    {/* Header */}
                                    <div className='flex items-center justify-between'>
                                        <div className='flex items-center gap-2'>
                                            <CreditCardIcon className='w-5 h-5' style={{ color: '#41D2F2' }} />
                                            <span className='text-sm font-semibold' style={{ color: '#FFFFFF' }}>
                                                {account.accountType}
                                            </span>
                                        </div>
                                        <span
                                            className='text-xs font-semibold px-2.5 py-1 rounded-full'
                                            style={{ backgroundColor: statusBadge.bg, color: statusBadge.color }}
                                        >
                                            {statusBadge.label}
                                        </span>
                                    </div>

                                    {/* Número */}
                                    <div>
                                        <p className='text-xs mb-0.5' style={{ color: 'rgba(255,255,255,0.4)' }}>
                                            Número de cuenta
                                        </p>
                                        <p className='text-xs font-mono font-semibold' style={{ color: '#FFFFFF' }}>
                                            {account.accountNumber}
                                        </p>
                                    </div>

                                    {/* Saldo */}
                                    <div>
                                        <p className='text-xs mb-0.5' style={{ color: 'rgba(255,255,255,0.4)' }}>
                                            Saldo
                                        </p>
                                        <p className='text-xl font-bold' style={{ color: '#FFE968' }}>
                                            Q{Number(account.balance).toLocaleString('es-GT', { minimumFractionDigits: 2 })}
                                        </p>
                                    </div>

                                    {/* Acciones */}
                                    {!isClosed && (
                                        <div
                                            className='flex gap-2 pt-2'
                                            style={{ borderTop: '1px solid rgba(65,210,242,0.1)' }}
                                        >
                                            {isActive && (
                                                <button
                                                    onClick={() => setConfirm({ action: 'suspend', accountNumber: account.accountNumber })}
                                                    className='flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-opacity hover:opacity-70'
                                                    style={{ backgroundColor: 'rgba(255,233,104,0.08)', color: '#FFE968', border: '1px solid rgba(255,233,104,0.2)' }}
                                                >
                                                    <NoSymbolIcon className='w-3.5 h-3.5' />
                                                    Suspender
                                                </button>
                                            )}

                                            {isSuspended && (
                                                <button
                                                    onClick={() => setConfirm({ action: 'activate', accountNumber: account.accountNumber })}
                                                    className='flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-opacity hover:opacity-70'
                                                    style={{ backgroundColor: 'rgba(65,210,242,0.08)', color: '#41D2F2', border: '1px solid rgba(65,210,242,0.2)' }}
                                                >
                                                    <CheckCircleIcon className='w-3.5 h-3.5' />
                                                    Activar
                                                </button>
                                            )}

                                            <button
                                                onClick={() => setConfirm({ action: 'deactivate', accountNumber: account.accountNumber })}
                                                className='flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-opacity hover:opacity-70'
                                                style={{ backgroundColor: 'rgba(239,68,68,0.08)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.2)' }}
                                            >
                                                <XCircleIcon className='w-3.5 h-3.5' />
                                                Cerrar
                                            </button>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Modal de confirmación */}
            {confirm && (
                <ConfirmModal
                    action={confirm.action}
                    accountNumber={confirm.accountNumber}
                    onConfirm={handleConfirm}
                    onCancel={() => setConfirm(null)}
                />
            )}
        </div>
    );
};

// ——— Vista usuario normal ———
export const AccountPage = () => {
    const {
        accounts, loading, isAdmin,
        createAccount, searchResults, searchLoading,
        searchByEmail, suspendAccount, activateAccount, deactivateAccount,
    } = useAccount();

    const [showCreate, setShowCreate] = useState(false);
    const [modalLoading, setModalLoading] = useState(false);

    const handleCreateAccount = async (data) => {
        setModalLoading(true);
        const res = await createAccount(data);
        setModalLoading(false);
        if (res.success) setShowCreate(false);
        return res;
    };

    if (isAdmin) {
        return (
            <AdminView
                searchResults={searchResults}
                searchLoading={searchLoading}
                searchByEmail={searchByEmail}
                suspendAccount={suspendAccount}
                activateAccount={activateAccount}
                deactivateAccount={deactivateAccount}
            />
        );
    }

    return (
        <div className='flex flex-col h-full'>
            <div className='flex items-start justify-between mb-6 flex-wrap gap-4'>
                <div>
                    <h1 className='text-2xl font-bold' style={{ color: '#FFFFFF' }}>
                        Mis Cuentas
                    </h1>
                    <p className='text-sm mt-1' style={{ color: '#41D2F2' }}>
                        Administra tus cuentas en Quetzales
                    </p>
                </div>
                {accounts.length < 3 && (
                    <button
                        onClick={() => setShowCreate(true)}
                        className='flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-opacity hover:opacity-80'
                        style={{ backgroundColor: '#41D2F2', color: '#0B1830' }}
                    >
                        <PlusCircleIcon className='w-5 h-5' />
                        Nueva Cuenta
                    </button>
                )}
            </div>

            {loading ? (
                <div className='flex items-center justify-center py-20'>
                    <p className='text-sm' style={{ color: 'rgba(65,210,242,0.6)' }}>Cargando cuentas...</p>
                </div>
            ) : accounts.length === 0 ? (
                <div
                    className='flex flex-col items-center justify-center py-20 rounded-2xl'
                    style={{ backgroundColor: '#162C5F', border: '1px dashed rgba(65,210,242,0.25)' }}
                >
                    <CreditCardIcon className='w-12 h-12 mb-4' style={{ color: 'rgba(65,210,242,0.35)' }} />
                    <p className='text-base font-semibold mb-1' style={{ color: 'rgba(255,255,255,0.6)' }}>
                        Sin cuentas registradas
                    </p>
                    <p className='text-sm mb-4' style={{ color: 'rgba(255,255,255,0.35)' }}>
                        Crea tu primera cuenta bancaria
                    </p>
                    <button
                        onClick={() => setShowCreate(true)}
                        className='flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold'
                        style={{ backgroundColor: '#41D2F2', color: '#0B1830' }}
                    >
                        <PlusCircleIcon className='w-5 h-5' />
                        Crear cuenta
                    </button>
                </div>
            ) : (
                <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4'>
                    {accounts.map((account) => (
                        <AccountCard key={account._id} account={account} />
                    ))}
                    {accounts.length < 3 && (
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
                            <span className='text-sm font-medium'>Agregar cuenta</span>
                        </button>
                    )}
                </div>
            )}

            <CreateAccountModal
                isOpen={showCreate}
                onClose={() => setShowCreate(false)}
                onSubmit={handleCreateAccount}
                loading={modalLoading}
            />
        </div>
    );
};