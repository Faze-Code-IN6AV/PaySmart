import { useState } from 'react';
import {
    ArrowDownCircleIcon,
    ArrowUpCircleIcon,
    ArrowsRightLeftIcon,
    ArrowUturnLeftIcon,
} from '@heroicons/react/24/outline';
import { useTransactionStore } from '../store/transactionStore.js';

const TYPE_CONFIG = {
    DEPOSIT: {
        label: 'Depósito',
        Icon: ArrowDownCircleIcon,
        gradient: 'linear-gradient(135deg, #162C5F 0%, #1a3a7a 100%)',
        accent: '#41D2F2',
        symbol: '+',
    },
    WITHDRAW: {
        label: 'Retiro / Compra',
        Icon: ArrowUpCircleIcon,
        gradient: 'linear-gradient(135deg, #1a1a2e 0%, #162C5F 100%)',
        accent: '#fca5a5',
        symbol: '-',
    },
    TRANSFER: {
        label: 'Transferencia',
        Icon: ArrowsRightLeftIcon,
        gradient: 'linear-gradient(135deg, #0d2347 0%, #162C5F 100%)',
        accent: '#FFE968',
        symbol: '↗',
    },
};

const STATUS_BADGE = {
    COMPLETADA: { label: 'Completada', bg: 'rgba(65,210,242,0.12)', color: '#41D2F2' },
    REVERTIDA: { label: 'Revertida', bg: 'rgba(239,68,68,0.12)', color: '#fca5a5' },
};

export const TransactionCard = ({ transaction, showReverseButton = false }) => {
    const reverseDeposit = useTransactionStore((s) => s.reverseDeposit);
    const loading = useTransactionStore((s) => s.loading);

    const cfg = TYPE_CONFIG[transaction.type] ?? TYPE_CONFIG.DEPOSIT;
    const { Icon, label, gradient, accent, symbol } = cfg;
    const statusBadge = STATUS_BADGE[transaction.status] ?? STATUS_BADGE.COMPLETADA;

    const diffSeconds = transaction.createdAt
        ? (Date.now() - new Date(transaction.createdAt).getTime()) / 1000
        : Infinity;

    const canReverse =
        showReverseButton &&
        transaction.type === 'DEPOSIT' &&
        transaction.status !== 'REVERTIDA' &&
        diffSeconds < 60;

    const formattedAmount = Number(transaction.amount ?? 0).toLocaleString('es-GT', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

    const formattedBalance = Number(transaction.newBalance ?? 0).toLocaleString('es-GT', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

    return (
        <div
            className='relative rounded-2xl overflow-hidden shadow-lg transition-transform hover:-translate-y-0.5'
            style={{
                background: gradient,
                border: `1px solid ${accent}30`,
                opacity: transaction.status === 'REVERTIDA' ? 0.6 : 1,
            }}
        >
            <div
                className='absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-10'
                style={{ backgroundColor: accent }}
            />

            <div className='relative p-5 flex flex-col gap-4'>
                <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-2'>
                        <div className='p-2 rounded-xl' style={{ backgroundColor: `${accent}18` }}>
                            <Icon className='w-5 h-5' style={{ color: accent }} />
                        </div>
                        <p className='text-sm font-semibold' style={{ color: '#FFFFFF' }}>
                            {label}
                        </p>
                    </div>
                    <span
                        className='text-xs font-semibold px-2.5 py-1 rounded-full'
                        style={{ backgroundColor: statusBadge.bg, color: statusBadge.color }}
                    >
                        {statusBadge.label}
                    </span>
                </div>

                {transaction.description && (
                    <p className='text-xs' style={{ color: 'rgba(255,255,255,0.45)' }}>
                        {transaction.description}
                    </p>
                )}

                {transaction.toAccountNumber && (
                    <div>
                        <p className='text-xs mb-0.5' style={{ color: 'rgba(255,255,255,0.4)' }}>
                            Cuenta destino
                        </p>
                        <p className='text-xs font-mono font-semibold' style={{ color: '#FFFFFF' }}>
                            {transaction.toAccountNumber}
                        </p>
                    </div>
                )}

                <div className='flex items-end justify-between'>
                    <div>
                        <p className='text-xs mb-1' style={{ color: 'rgba(255,255,255,0.4)' }}>
                            Monto
                        </p>
                        <p className='text-2xl font-bold tracking-tight' style={{ color: accent }}>
                            {symbol}Q{formattedAmount}
                            <span className='text-xs font-normal ml-1.5' style={{ color: 'rgba(255,255,255,0.4)' }}>GTQ</span>
                        </p>
                    </div>
                    <div className='text-right'>
                        <p className='text-xs mb-0.5' style={{ color: 'rgba(255,255,255,0.4)' }}>
                            Nuevo saldo
                        </p>
                        <p className='text-sm font-semibold' style={{ color: 'rgba(255,255,255,0.7)' }}>
                            Q{formattedBalance}
                        </p>
                    </div>
                </div>

                <div
                    className='flex items-center justify-between pt-3'
                    style={{ borderTop: `1px solid ${accent}18` }}
                >
                    <p className='text-xs' style={{ color: 'rgba(255,255,255,0.3)' }}>
                        {transaction.createdAt
                            ? new Date(transaction.createdAt).toLocaleString('es-GT')
                            : '—'}
                    </p>

                    {canReverse && (
                        <button
                            onClick={() => reverseDeposit(transaction._id)}
                            disabled={loading}
                            className='flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-opacity hover:opacity-70 disabled:opacity-40'
                            style={{ backgroundColor: 'rgba(252,165,165,0.12)', color: '#fca5a5', border: '1px solid rgba(252,165,165,0.2)' }}
                        >
                            <ArrowUturnLeftIcon className='w-3.5 h-3.5' />
                            Revertir
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
