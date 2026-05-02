import { useState } from 'react';
import { PlusCircleIcon } from '@heroicons/react/24/outline';

import { useTransaction } from '../hooks/useTransaction.js';
import { TransactionModal } from '../components/TransactionModal.jsx';

export const TransactionPage = ({ account }) => {
    const [showModal, setShowModal] = useState(false);
    const [modalLoading, setModalLoading] = useState(false);

    const { deposit, transfer, purchase } = useTransaction(account?.accountNumber);

    const isSuspended = account?.status === 'SUSPENDIDO';
    const isClosed = account?.status === 'CERRADO';
    const isBlocked = isSuspended || isClosed;

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

    return (
        <div className='flex flex-col h-full'>
            <div className='flex items-start justify-between mb-6 flex-wrap gap-4'>
                <div>
                    <h1 className='text-2xl font-bold' style={{ color: '#FFFFFF' }}>
                        Transferencias
                    </h1>
                    {account?.accountNumber && (
                        <p className='text-sm font-mono mt-0.5' style={{ color: 'rgba(255,255,255,0.35)' }}>
                            {account.accountNumber}
                        </p>
                    )}
                </div>

                <button
                    onClick={() => setShowModal(true)}
                    disabled={isBlocked}
                    className='flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-opacity hover:opacity-80 disabled:opacity-40 disabled:cursor-not-allowed'
                    style={{ backgroundColor: '#41D2F2', color: '#0B1830' }}
                >
                    <PlusCircleIcon className='w-5 h-5' />
                    Nueva transacción
                </button>
            </div>

            {isBlocked && (
                <div
                    className='flex items-center gap-3 px-4 py-3 rounded-xl mb-4'
                    style={{
                        backgroundColor: isSuspended ? 'rgba(255,233,104,0.08)' : 'rgba(239,68,68,0.08)',
                        border: `1px solid ${isSuspended ? 'rgba(255,233,104,0.25)' : 'rgba(239,68,68,0.25)'}`,
                    }}
                >
                    <p className='text-sm font-semibold' style={{ color: isSuspended ? '#FFE968' : '#fca5a5' }}>
                        {isSuspended
                            ? 'Cuenta suspendida — no se pueden realizar movimientos.'
                            : 'Cuenta cerrada — no se pueden realizar movimientos.'}
                    </p>
                </div>
            )}

            <TransactionModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                onSubmit={handleSubmit}
                loading={modalLoading}
                defaultAccountNumber={account?.accountNumber ?? ''}
            />
        </div>
    );
};