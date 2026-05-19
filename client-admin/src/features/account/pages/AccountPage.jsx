import { useState } from 'react';
import {
    CreditCardIcon,
    MagnifyingGlassIcon,
    NoSymbolIcon,
    CheckCircleIcon,
    XCircleIcon,
} from '@heroicons/react/24/outline';

import { useAccount } from '../hooks/useAccount.js';
import { AccountCard } from '../components/AccountCard.jsx';
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

// ——— Modal crear cuenta para un cliente ———
const CreateAccountModal = ({ client, onClose, onCreated }) => {
    const [accountType, setAccountType] = useState('');
    const [loading, setLoading]         = useState(false);
    const [error, setError]             = useState('');

    const TYPES = ['AHORRO', 'MONETARIA', 'EMPRESARIAL'];

    const handleCreate = async () => {
        if (!accountType) { setError('Selecciona el tipo de cuenta'); return; }
        setLoading(true);
        setError('');
        try {
            await onCreated({ userId: client.id, email: client.email, accountType });
            onClose();
        } catch (err) {
            setError(err?.response?.data?.message || 'Error al crear la cuenta');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4'
            style={{ backgroundColor: 'rgba(11,24,48,0.9)', backdropFilter: 'blur(4px)' }}>
            <div className='w-full max-w-sm rounded-2xl p-6 space-y-4'
                style={{ backgroundColor: '#162C5F', border: '1px solid #41D2F2' }}>
                <div className='flex items-center justify-between'>
                    <div>
                        <h3 className='font-bold text-base' style={{ color: '#FFFFFF' }}>Nueva Cuenta Bancaria</h3>
                        <p className='text-xs mt-0.5' style={{ color: '#41D2F2' }}>
                            Cliente: <span className='font-semibold'>{client.username}</span>
                        </p>
                    </div>
                    <button onClick={onClose} style={{ color: '#41D2F2' }}>
                        <XCircleIcon className='w-5 h-5' />
                    </button>
                </div>

                {error && (
                    <p className='text-xs px-3 py-2 rounded-lg' style={{ backgroundColor: 'rgba(239,68,68,0.1)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.3)' }}>
                        {error}
                    </p>
                )}

                <div className='space-y-2'>
                    <label className='block text-xs font-medium' style={{ color: 'rgba(255,255,255,0.7)' }}>Tipo de cuenta</label>
                    {TYPES.map((t) => (
                        <button key={t} type='button'
                            onClick={() => setAccountType(t)}
                            className='w-full px-4 py-2.5 rounded-xl text-sm font-semibold text-left transition-all'
                            style={{
                                backgroundColor: accountType === t ? '#41D2F2' : 'rgba(65,210,242,0.06)',
                                color: accountType === t ? '#0B1830' : 'rgba(255,255,255,0.7)',
                                border: `1px solid ${accountType === t ? '#41D2F2' : 'rgba(65,210,242,0.15)'}`,
                            }}>
                            {t}
                        </button>
                    ))}
                </div>

                <p className='text-xs' style={{ color: 'rgba(255,255,255,0.35)' }}>
                    La cuenta se crea con saldo Q0.00. El administrador puede hacer depósitos desde Transacciones.
                </p>

                <div className='flex gap-3 pt-1'>
                    <button onClick={onClose} className='flex-1 py-2.5 rounded-lg text-sm font-medium'
                        style={{ backgroundColor: 'rgba(65,210,242,0.08)', color: '#41D2F2', border: '1px solid rgba(65,210,242,0.2)' }}>
                        Cancelar
                    </button>
                    <button onClick={handleCreate} disabled={loading || !accountType}
                        className='flex-1 py-2.5 rounded-lg text-sm font-bold disabled:opacity-50'
                        style={{ backgroundColor: '#41D2F2', color: '#0B1830' }}>
                        {loading ? 'Creando...' : 'Crear'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ——— Vista del admin ———
const AdminView = ({ searchResults, searchLoading, foundClient, searchClient, adminCreateForUser, suspendAccount, activateAccount, deactivateAccount }) => {
    const [query, setQuery]           = useState('');
    const [confirm, setConfirm]       = useState(null);
    const [showCreate, setShowCreate] = useState(false);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!query.trim()) return;
        await searchClient(query.trim());
    };

    const handleConfirm = async () => {
        if (!confirm) return;
        const { action, accountNumber } = confirm;
        if (action === 'suspend')    await suspendAccount(accountNumber);
        if (action === 'activate')   await activateAccount(accountNumber);
        if (action === 'deactivate') await deactivateAccount(accountNumber);
        setConfirm(null);
    };

    const handleCreateAccount = async (data) => {
        await adminCreateForUser(data);
    };

    return (
        <div className='flex flex-col gap-6'>
            <div>
                <h1 className='text-2xl font-bold' style={{ color: '#FFFFFF' }}>Gestión de Cuentas</h1>
                <p className='text-sm mt-1' style={{ color: '#41D2F2' }}>
                    Busca un cliente por correo, username o DPI para gestionar sus cuentas
                </p>
            </div>

            {/* Buscador libre */}
            <form onSubmit={handleSearch} className='flex gap-3 max-w-lg'>
                <div className='relative flex-1'>
                    <MagnifyingGlassIcon className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4' style={{ color: '#41D2F2' }} />
                    <input
                        type='text'
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder='Correo, username o DPI del cliente…'
                        className='w-full pl-9 pr-3 py-2.5 text-sm border rounded-xl focus:outline-none'
                        style={{ backgroundColor: '#0B1830', borderColor: '#41D2F2', color: '#FFFFFF' }}
                    />
                </div>
                <button type='submit' disabled={searchLoading || !query.trim()}
                    className='px-5 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50 hover:opacity-80'
                    style={{ backgroundColor: '#41D2F2', color: '#0B1830' }}>
                    {searchLoading ? 'Buscando...' : 'Buscar'}
                </button>
            </form>

            {/* Panel del cliente encontrado */}
            {foundClient && (
                <div className='rounded-2xl p-4 flex items-center justify-between flex-wrap gap-3'
                    style={{ backgroundColor: 'rgba(65,210,242,0.06)', border: '1px solid rgba(65,210,242,0.2)' }}>
                    <div>
                        <p className='text-xs' style={{ color: 'rgba(255,255,255,0.45)' }}>Cliente encontrado</p>
                        <p className='text-base font-bold mt-0.5' style={{ color: '#FFFFFF' }}>
                            {foundClient.name} {foundClient.surname}
                        </p>
                        <p className='text-xs font-mono' style={{ color: '#41D2F2' }}>
                            @{foundClient.username} · {foundClient.email}
                        </p>
                    </div>
                    {foundClient && (
                        <button
                            onClick={() => setShowCreate(true)}
                            className='flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold hover:opacity-80'
                            style={{ backgroundColor: '#41D2F2', color: '#0B1830' }}>
                            <CreditCardIcon className='w-4 h-4' />
                            Abrir cuenta
                        </button>
                    )}
                </div>
            )}

            {/* Cuentas del cliente */}
            {searchResults.length > 0 && (
                <div className='space-y-3'>
                    <p className='text-sm font-medium' style={{ color: 'rgba(255,255,255,0.5)' }}>
                        {searchResults.length} cuenta{searchResults.length > 1 ? 's' : ''} registrada{searchResults.length > 1 ? 's' : ''}
                    </p>

                    <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4'>
                        {searchResults.map((account) => {
                            const statusBadge = STATUS_BADGE[account.status] ?? STATUS_BADGE.ACTIVO;
                            const isActive    = account.status === 'ACTIVO';
                            const isSuspended = account.status === 'SUSPENDIDO';
                            const isClosed    = account.status === 'CERRADO';

                            return (
                                <div key={account._id} className='rounded-2xl p-5 flex flex-col gap-4'
                                    style={{
                                        backgroundColor: '#162C5F',
                                        border: `1px solid ${isClosed ? 'rgba(239,68,68,0.2)' : isSuspended ? 'rgba(255,233,104,0.2)' : 'rgba(65,210,242,0.2)'}`,
                                        opacity: isClosed ? 0.6 : 1,
                                    }}>
                                    <div className='flex items-center justify-between'>
                                        <div className='flex items-center gap-2'>
                                            <CreditCardIcon className='w-5 h-5' style={{ color: '#41D2F2' }} />
                                            <span className='text-sm font-semibold' style={{ color: '#FFFFFF' }}>{account.accountType}</span>
                                        </div>
                                        <span className='text-xs font-semibold px-2.5 py-1 rounded-full'
                                            style={{ backgroundColor: statusBadge.bg, color: statusBadge.color }}>
                                            {statusBadge.label}
                                        </span>
                                    </div>

                                    <div>
                                        <p className='text-xs mb-0.5' style={{ color: 'rgba(255,255,255,0.4)' }}>Número de cuenta</p>
                                        <p className='text-xs font-mono font-semibold' style={{ color: '#FFFFFF' }}>{account.accountNumber}</p>
                                    </div>

                                    <div>
                                        <p className='text-xs mb-0.5' style={{ color: 'rgba(255,255,255,0.4)' }}>Saldo</p>
                                        <p className='text-xl font-bold' style={{ color: '#FFE968' }}>
                                            Q{Number(account.balance).toLocaleString('es-GT', { minimumFractionDigits: 2 })}
                                        </p>
                                    </div>

                                    {!isClosed && (
                                        <div className='flex gap-2 pt-2' style={{ borderTop: '1px solid rgba(65,210,242,0.1)' }}>
                                            {isActive && (
                                                <button onClick={() => setConfirm({ action: 'suspend', accountNumber: account.accountNumber })}
                                                    className='flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold hover:opacity-70'
                                                    style={{ backgroundColor: 'rgba(255,233,104,0.08)', color: '#FFE968', border: '1px solid rgba(255,233,104,0.2)' }}>
                                                    <NoSymbolIcon className='w-3.5 h-3.5' />Suspender
                                                </button>
                                            )}
                                            {isSuspended && (
                                                <button onClick={() => setConfirm({ action: 'activate', accountNumber: account.accountNumber })}
                                                    className='flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold hover:opacity-70'
                                                    style={{ backgroundColor: 'rgba(65,210,242,0.08)', color: '#41D2F2', border: '1px solid rgba(65,210,242,0.2)' }}>
                                                    <CheckCircleIcon className='w-3.5 h-3.5' />Activar
                                                </button>
                                            )}
                                            <button onClick={() => setConfirm({ action: 'deactivate', accountNumber: account.accountNumber })}
                                                className='flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold hover:opacity-70'
                                                style={{ backgroundColor: 'rgba(239,68,68,0.08)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.2)' }}>
                                                <XCircleIcon className='w-3.5 h-3.5' />Cerrar
                                            </button>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {foundClient && searchResults.length === 0 && !searchLoading && (
                <div className='flex flex-col items-center justify-center py-16 rounded-2xl'
                    style={{ backgroundColor: '#162C5F', border: '1px dashed rgba(65,210,242,0.2)' }}>
                    <CreditCardIcon className='w-10 h-10 mb-3' style={{ color: 'rgba(65,210,242,0.3)' }} />
                    <p className='text-sm font-semibold mb-1' style={{ color: 'rgba(255,255,255,0.5)' }}>
                        Este cliente no tiene cuentas bancarias
                    </p>
                    <p className='text-xs mb-4' style={{ color: 'rgba(255,255,255,0.3)' }}>
                        Usa el botón "Abrir cuenta" para crear su primera cuenta
                    </p>
                </div>
            )}

            {confirm && (
                <ConfirmModal action={confirm.action} accountNumber={confirm.accountNumber}
                    onConfirm={handleConfirm} onCancel={() => setConfirm(null)} />
            )}

            {showCreate && foundClient && (
                <CreateAccountModal client={foundClient} onClose={() => setShowCreate(false)}
                    onCreated={handleCreateAccount} />
            )}
        </div>
    );
};
// ——— Vista usuario normal (solo visualización) ———
export const AccountPage = () => {
    const {
        accounts, loading, isAdmin,
        searchResults, searchLoading, foundClient,
        searchClient, adminCreateForUser,
        suspendAccount, activateAccount, deactivateAccount,
    } = useAccount();

    if (isAdmin) {
        return (
            <AdminView
                searchResults={searchResults}
                searchLoading={searchLoading}
                foundClient={foundClient}
                searchClient={searchClient}
                adminCreateForUser={adminCreateForUser}
                suspendAccount={suspendAccount}
                activateAccount={activateAccount}
                deactivateAccount={deactivateAccount}
            />
        );
    }

    return (
        <div className='flex flex-col h-full'>
            <div className='mb-6'>
                <h1 className='text-2xl font-bold' style={{ color: '#FFFFFF' }}>
                    Mis Cuentas
                </h1>
                <p className='text-sm mt-1' style={{ color: '#41D2F2' }}>
                    Tus cuentas bancarias activas
                </p>
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
                    <p className='text-sm' style={{ color: 'rgba(255,255,255,0.35)' }}>
                        Contacta al administrador del banco para abrir una cuenta
                    </p>
                </div>
            ) : (
                <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4'>
                    {accounts.map((account) => (
                        <AccountCard key={account._id} account={account} />
                    ))}
                </div>
            )}
        </div>
    );
};