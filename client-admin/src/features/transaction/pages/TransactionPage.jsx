import { useState } from 'react';
import { PlusCircleIcon, ClockIcon, ListBulletIcon, MagnifyingGlassIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

import { useTransaction } from '../hooks/useTransaction.js';
import { TransactionCard } from '../components/TransactionCard.jsx';
import { TransactionModal } from '../components/TransactionModal.jsx';

const TYPE_FILTERS = [
    { key: 'TODOS', label: 'Todos' },
    { key: 'DEPOSIT', label: 'Depósitos' },
    { key: 'WITHDRAW', label: 'Retiros' },
    { key: 'TRANSFER', label: 'Transferencias' },
];

export const TransactionPage = ({ accountNumber: propAccountNumber }) => {
    const [accountInput, setAccountInput] = useState(propAccountNumber ?? '');
    const [activeAccount, setActiveAccount] = useState(propAccountNumber ?? '');
    const [view, setView] = useState('last');
    const [filter, setFilter] = useState('TODOS');
    const [showModal, setShowModal] = useState(false);
    const [modalLoading, setModalLoading] = useState(false);

    const {
        transactions,
        lastTransactions,
        loading,
        error,
        isAdmin,
        fetchTransactions,
        fetchLastTransactions,
        deposit,
        transfer,
        purchase,
    } = useTransaction(activeAccount);

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
        if (type === 'DEPOSIT') res = await deposit({ accountNumber, amount, description });
        else if (type === 'TRANSFER') res = await transfer({ fromAccountNumber: accountNumber, toAccountNumber, amount, description });
        else res = await purchase({ accountNumber, amount, description });
        setModalLoading(false);
        if (res?.success) setShowModal(false);
        return res;
    };

    const displayList = view === 'all' ? transactions : lastTransactions;

    const filteredList =
        view === 'all' && filter !== 'TODOS'
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
                            : 'Historial de movimientos de tu cuenta'}
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

            <div
                className='flex items-center gap-3 p-3 rounded-xl mb-6'
                style={{ backgroundColor: '#162C5F', border: '1px solid rgba(65,210,242,0.2)' }}
            >
                <MagnifyingGlassIcon className='w-4 h-4 flex-shrink-0' style={{ color: '#41D2F2' }} />
                <input
                    value={accountInput}
                    onChange={(e) => setAccountInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder='Número de cuenta (ACC-000123)'
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
                        Ingresa un número de cuenta para ver el historial
                    </p>
                </div>
            )}

            {activeAccount && (
                <>
                    <div className='flex items-center justify-between mb-4 flex-wrap gap-3'>
                        <div className='flex gap-2'>
                            {[
                                { key: 'last', label: 'Últimas 5', Icon: ClockIcon },
                                { key: 'all', label: 'Historial completo', Icon: ListBulletIcon },
                            ].map(({ key, label, Icon }) => (
                                <button
                                    key={key}
                                    onClick={() => handleViewChange(key)}
                                    className='flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all'
                                    style={{
                                        backgroundColor: view === key ? 'rgba(65,210,242,0.12)' : 'rgba(255,255,255,0.04)',
                                        border: `1px solid ${view === key ? 'rgba(65,210,242,0.3)' : 'transparent'}`,
                                        color: view === key ? '#41D2F2' : 'rgba(255,255,255,0.35)',
                                    }}
                                >
                                    <Icon className='w-3.5 h-3.5' />
                                    {label}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={() =>
                                view === 'all'
                                    ? fetchTransactions(activeAccount)
                                    : fetchLastTransactions(activeAccount)
                            }
                            disabled={loading}
                            className='p-2 rounded-lg transition-opacity hover:opacity-70 disabled:opacity-40'
                            style={{ backgroundColor: 'rgba(65,210,242,0.08)', color: '#41D2F2' }}
                            title='Recargar'
                        >
                            <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>

                    {view === 'all' && (
                        <div className='flex gap-2 mb-4 flex-wrap'>
                            {TYPE_FILTERS.map(({ key, label }) => (
                                <button
                                    key={key}
                                    onClick={() => setFilter(key)}
                                    className='text-xs font-semibold px-3 py-1.5 rounded-full transition-all'
                                    style={{
                                        backgroundColor: filter === key ? 'rgba(65,210,242,0.15)' : 'rgba(255,255,255,0.05)',
                                        border: `1px solid ${filter === key ? 'rgba(65,210,242,0.3)' : 'transparent'}`,
                                        color: filter === key ? '#41D2F2' : 'rgba(255,255,255,0.35)',
                                    }}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    )}

                    {loading && (
                        <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4'>
                            {[...Array(3)].map((_, i) => (
                                <div
                                    key={i}
                                    className='rounded-2xl h-48 animate-pulse'
                                    style={{ backgroundColor: '#162C5F' }}
                                />
                            ))}
                        </div>
                    )}

                    {!loading && filteredList.length === 0 && (
                        <div
                            className='flex flex-col items-center justify-center py-16 rounded-2xl'
                            style={{ backgroundColor: '#162C5F', border: '1px dashed rgba(65,210,242,0.2)' }}
                        >
                            <ClockIcon className='w-10 h-10 mb-3' style={{ color: 'rgba(65,210,242,0.3)' }} />
                            <p className='text-sm font-semibold' style={{ color: 'rgba(255,255,255,0.5)' }}>
                                Sin transacciones
                            </p>
                            <p className='text-xs mt-1' style={{ color: 'rgba(255,255,255,0.3)' }}>
                                {filter !== 'TODOS' ? 'No hay transacciones de ese tipo' : 'Esta cuenta no tiene movimientos aún'}
                            </p>
                        </div>
                    )}

                    {!loading && filteredList.length > 0 && (
                        <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4'>
                            {filteredList.map((tx) => (
                                <TransactionCard
                                    key={tx._id}
                                    transaction={tx}
                                    showReverseButton={view === 'last'}
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
            />
        </div>
    );
};
