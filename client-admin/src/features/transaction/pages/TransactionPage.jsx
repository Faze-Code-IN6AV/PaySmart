import { useState, useEffect } from 'react';
import { PlusCircleIcon, ClockIcon, ListBulletIcon, MagnifyingGlassIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

import { useTransaction } from '../hooks/useTransaction.js';
import { useAccountStore } from '../../account/store/accountStore.js';
import { TransactionCard } from '../components/TransactionCard.jsx';
import { TransactionModal } from '../components/TransactionModal.jsx';

const TYPE_FILTERS = [
    { key: 'TODOS', label: 'Todos' },
    { key: 'DEPOSIT', label: 'Depósitos' },
    { key: 'TRANSFER', label: 'Transferencias' },
    { key: 'PURCHASE', label: 'Compras' },
];

export const TransactionPage = ({ accountNumber: propAccountNumber }) => {
    const [accountInput, setAccountInput]   = useState(propAccountNumber ?? '');
    const [activeAccount, setActiveAccount] = useState(propAccountNumber ?? '');
    const [view, setView]       = useState('last');
    const [filter, setFilter]   = useState('TODOS');
    const [showModal, setShowModal]     = useState(false);
    const [modalLoading, setModalLoading] = useState(false);

    const {
        transactions, lastTransactions, loading, error,
        isAdmin, fetchTransactions, fetchLastTransactions,
        deposit, transfer, purchase,
    } = useTransaction(activeAccount);

    // Cuentas del usuario (para el selector del cliente)
    const myAccounts = useAccountStore((s) => s.accounts);
    const fetchAccounts = useAccountStore((s) => s.fetchAccounts);

    useEffect(() => {
        if (!isAdmin) fetchAccounts();
    }, []);

    const handleSearch = () => {
        const trimmed = accountInput.trim();
        if (!trimmed) return;
        setActiveAccount(trimmed);
        if (view === 'all') fetchTransactions(trimmed);
        else fetchLastTransactions(trimmed);
    };

    const handleViewChange = (v) => {
        setView(v);
        if (!activeAccount) return;
        if (v === 'all') fetchTransactions(activeAccount);
        else fetchLastTransactions(activeAccount);
    };

    const handleSubmit = async ({ type, accountNumber, toAccountNumber, amount, description }) => {
        setModalLoading(true);
        let res;
        if (type === 'DEPOSIT')  res = await deposit({ accountNumber, amount, description });
        else if (type === 'TRANSFER') res = await transfer({ fromAccountNumber: accountNumber, toAccountNumber, amount, description });
        else res = await purchase({ accountNumber, amount, description });
        setModalLoading(false);
        if (res?.success) {
            setShowModal(false);
            if (activeAccount) {
                if (view === 'all') fetchTransactions(activeAccount);
                else fetchLastTransactions(activeAccount);
            }
        }
        return res;
    };

    const displayList  = view === 'all' ? transactions : lastTransactions;
    const filteredList = view === 'all' && filter !== 'TODOS'
        ? displayList.filter((tx) => tx.type === filter)
        : displayList;

    return (
        <div className='flex flex-col h-full'>
            <div className='flex items-start justify-between mb-6 flex-wrap gap-4'>
                <div>
                    <h1 className='text-2xl font-bold' style={{ color: '#FFFFFF' }}>
                        {isAdmin ? 'Consulta de Transacciones' : 'Mis Transacciones'}
                    </h1>
                    <p className='text-sm mt-1' style={{ color: '#41D2F2' }}>
                        {isAdmin
                            ? 'Consulta el historial de cualquier cuenta'
                            : 'Historial de movimientos de tus cuentas'}
                    </p>
                </div>

                {activeAccount && (
                    <button
                        onClick={() => setShowModal(true)}
                        className='flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-opacity hover:opacity-80'
                        style={{ backgroundColor: '#41D2F2', color: '#0B1830' }}
                    >
                        <PlusCircleIcon className='w-5 h-5' />
                        Nueva transacción
                    </button>
                )}
            </div>

            {/* Selector de cuenta */}
            {isAdmin ? (
                // Admin: busca cualquier cuenta por número
                <div
                    className='flex items-center gap-3 p-3 rounded-xl mb-6'
                    style={{ backgroundColor: '#162C5F', border: '1px solid rgba(65,210,242,0.2)' }}
                >
                    <MagnifyingGlassIcon className='w-4 h-4 flex-shrink-0' style={{ color: '#41D2F2' }} />
                    <input
                        value={accountInput}
                        onChange={(e) => setAccountInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        placeholder='Número de cuenta (18 dígitos)'
                        className='flex-1 bg-transparent outline-none text-sm'
                        style={{ color: '#FFFFFF' }}
                    />
                    <button
                        onClick={handleSearch}
                        disabled={!accountInput.trim()}
                        className='px-4 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-40 transition-opacity hover:opacity-80'
                        style={{ backgroundColor: '#41D2F2', color: '#0B1830' }}
                    >
                        Buscar
                    </button>
                </div>
            ) : (
                // Cliente: solo puede elegir entre SUS cuentas
                <div className='mb-6'>
                    <label className='block text-xs font-medium mb-1.5' style={{ color: 'rgba(255,255,255,0.5)' }}>
                        Selecciona una de tus cuentas
                    </label>
                    {myAccounts.length === 0 ? (
                        <p className='text-sm' style={{ color: 'rgba(255,255,255,0.35)' }}>
                            No tienes cuentas bancarias aún. Contacta al banco.
                        </p>
                    ) : (
                        <div className='relative'>
                            <select
                                value={activeAccount}
                                onChange={(e) => {
                                    setActiveAccount(e.target.value);
                                    setView('last');
                                    if (e.target.value) fetchLastTransactions(e.target.value);
                                }}
                                className='w-full appearance-none px-3 py-2.5 text-sm rounded-xl border focus:outline-none pr-10'
                                style={{ backgroundColor: '#162C5F', borderColor: 'rgba(65,210,242,0.3)', color: '#FFFFFF' }}
                            >
                                <option value=''>— Elige una cuenta —</option>
                                {myAccounts.map((acc) => (
                                    <option key={acc._id} value={acc.accountNumber}>
                                        {acc.accountType} · {acc.accountNumber} · Q{Number(acc.balance).toFixed(2)}
                                    </option>
                                ))}
                            </select>
                            <ChevronDownIcon className='absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none' style={{ color: '#41D2F2' }} />
                        </div>
                    )}
                </div>
            )}

            {!activeAccount && (
                <div
                    className='flex flex-col items-center justify-center py-20 rounded-2xl'
                    style={{ backgroundColor: '#162C5F', border: '1px dashed rgba(65,210,242,0.25)' }}
                >
                    <ListBulletIcon className='w-12 h-12 mb-4' style={{ color: 'rgba(65,210,242,0.35)' }} />
                    <p className='text-base font-semibold mb-1' style={{ color: 'rgba(255,255,255,0.6)' }}>
                        Sin cuenta seleccionada
                    </p>
                    <p className='text-sm' style={{ color: 'rgba(255,255,255,0.35)' }}>
                        {isAdmin ? 'Ingresa un número de cuenta para ver el historial' : 'Selecciona una de tus cuentas arriba'}
                    </p>
                </div>
            )}

            {activeAccount && (
                <>
                    <div className='flex items-center justify-between mb-4 flex-wrap gap-3'>
                        <div className='flex gap-2'>
                            {[
                                { key: 'last', label: 'Últimas 5', Icon: ClockIcon },
                                { key: 'all',  label: 'Historial completo', Icon: ListBulletIcon },
                            ].map(({ key, label, Icon }) => (
                                <button
                                    key={key}
                                    onClick={() => handleViewChange(key)}
                                    className='flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all'
                                    style={{
                                        backgroundColor: view === key ? 'rgba(65,210,242,0.12)' : 'rgba(65,210,242,0.04)',
                                        color: view === key ? '#41D2F2' : 'rgba(255,255,255,0.5)',
                                        border: `1px solid ${view === key ? 'rgba(65,210,242,0.3)' : 'rgba(65,210,242,0.1)'}`,
                                    }}
                                >
                                    <Icon className='w-4 h-4' />
                                    {label}
                                </button>
                            ))}
                        </div>

                        {view === 'all' && (
                            <div className='flex gap-2 flex-wrap'>
                                {TYPE_FILTERS.map(({ key, label }) => (
                                    <button
                                        key={key}
                                        onClick={() => setFilter(key)}
                                        className='px-3 py-1.5 rounded-lg text-xs font-semibold transition-all'
                                        style={{
                                            backgroundColor: filter === key ? 'rgba(255,233,104,0.12)' : 'transparent',
                                            color: filter === key ? '#FFE968' : 'rgba(255,255,255,0.4)',
                                            border: `1px solid ${filter === key ? 'rgba(255,233,104,0.3)' : 'rgba(255,255,255,0.1)'}`,
                                        }}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {loading ? (
                        <div className='flex justify-center py-10'>
                            <p className='text-sm' style={{ color: 'rgba(65,210,242,0.6)' }}>Cargando transacciones…</p>
                        </div>
                    ) : filteredList.length === 0 ? (
                        <div
                            className='flex flex-col items-center justify-center py-16 rounded-2xl'
                            style={{ backgroundColor: '#162C5F', border: '1px dashed rgba(65,210,242,0.2)' }}
                        >
                            <p className='text-sm font-semibold' style={{ color: 'rgba(255,255,255,0.4)' }}>
                                Sin transacciones para mostrar
                            </p>
                        </div>
                    ) : (
                        <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4'>
                            {filteredList.map((tx) => (
                                <TransactionCard
                                    key={tx._id}
                                    transaction={tx}
                                    // Revertir solo disponible para el admin en últimas transacciones
                                    showReverseButton={isAdmin && view === 'last'}
                                />
                            ))}
                        </div>
                    )}
                </>
            )}

            <TransactionModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                onSubmit={handleSubmit}
                loading={modalLoading}
                defaultAccountNumber={activeAccount}
                isAdmin={isAdmin}
                // Pasar las cuentas propias del usuario para el selector de origen
                myAccounts={myAccounts}
            />
        </div>
    );
};