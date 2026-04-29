import { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
    XMarkIcon,
    ArrowDownCircleIcon,
    ArrowsRightLeftIcon,
    ShoppingBagIcon,
} from '@heroicons/react/24/outline';

const TRANSACTION_TYPES = [
    {
        value: 'DEPOSIT',
        label: 'Depósito',
        Icon: ArrowDownCircleIcon,
        accent: '#41D2F2',
        description: 'Agregar saldo a la cuenta',
    },
    {
        value: 'TRANSFER',
        label: 'Transferencia',
        Icon: ArrowsRightLeftIcon,
        accent: '#FFE968',
        description: 'Enviar a otra cuenta',
    },
    {
        value: 'PURCHASE',
        label: 'Compra',
        Icon: ShoppingBagIcon,
        accent: '#fca5a5',
        description: 'Registrar un gasto',
    },
];

export const TransactionModal = ({ isOpen, onClose, onSubmit, loading = false, defaultAccountNumber = '' }) => {
    const [tab, setTab] = useState('DEPOSIT');

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm({
        defaultValues: {
            accountNumber: defaultAccountNumber,
            toAccountNumber: '',
            amount: '',
            description: '',
        },
    });

    const currentType = TRANSACTION_TYPES.find((t) => t.value === tab);
    const accent = currentType?.accent ?? '#41D2F2';

    const handleClose = () => {
        reset();
        setTab('DEPOSIT');
        onClose();
    };

    const handleFormSubmit = async (data) => {
        const payload = {
            type: tab,
            accountNumber: data.accountNumber,
            toAccountNumber: data.toAccountNumber,
            amount: Number(data.amount),
            description: data.description,
        };
        const res = await onSubmit(payload);
        if (res?.success) {
            reset();
            setTab('DEPOSIT');
        }
    };

    if (!isOpen) return null;

    return (
        <div
            className='fixed inset-0 z-50 flex items-center justify-center p-4'
            style={{ backgroundColor: 'rgba(11,24,48,0.85)', backdropFilter: 'blur(4px)' }}
            onClick={(e) => e.target === e.currentTarget && handleClose()}
        >
            <div
                className='w-full max-w-md rounded-2xl shadow-2xl'
                style={{ backgroundColor: '#162C5F', border: `1px solid ${accent}50` }}
            >
                <div
                    className='flex items-center justify-between px-6 py-4 rounded-t-2xl'
                    style={{ borderBottom: '1px solid rgba(65,210,242,0.2)' }}
                >
                    <div>
                        <h2 className='text-lg font-bold' style={{ color: '#FFFFFF' }}>
                            Nueva Transacción
                        </h2>
                        <p className='text-xs mt-0.5' style={{ color: accent }}>
                            {currentType?.description}
                        </p>
                    </div>
                    <button onClick={handleClose} className='p-1.5 rounded-lg hover:opacity-70' style={{ color: '#41D2F2' }}>
                        <XMarkIcon className='w-5 h-5' />
                    </button>
                </div>

                <form onSubmit={handleSubmit(handleFormSubmit)} className='px-6 py-5 space-y-5'>
                    <div>
                        <label className='block text-sm font-medium mb-3' style={{ color: '#FFFFFF' }}>
                            Tipo de transacción
                        </label>
                        <div className='grid grid-cols-3 gap-2'>
                            {TRANSACTION_TYPES.map(({ value, label, Icon, accent: a }) => {
                                const isSelected = tab === value;
                                return (
                                    <button
                                        key={value}
                                        type='button'
                                        onClick={() => setTab(value)}
                                        className='relative rounded-xl p-3 text-center transition-all flex flex-col items-center gap-1.5'
                                        style={{
                                            backgroundColor: isSelected ? `${a}18` : 'rgba(11,24,48,0.6)',
                                            border: isSelected ? `2px solid ${a}` : '2px solid rgba(65,210,242,0.2)',
                                        }}
                                    >
                                        <Icon className='w-4 h-4' style={{ color: isSelected ? a : 'rgba(255,255,255,0.4)' }} />
                                        <span className='text-xs font-semibold' style={{ color: isSelected ? a : '#FFFFFF' }}>
                                            {label}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div>
                        <label className='block text-sm font-medium mb-1.5' style={{ color: '#FFFFFF' }}>
                            {tab === 'TRANSFER' ? 'Cuenta origen' : 'Número de cuenta'}
                        </label>
                        <input
                            type='text'
                            placeholder='ACC-000123'
                            className='w-full px-3 py-2 text-sm border rounded-lg focus:outline-none'
                            style={{ backgroundColor: '#0B1830', borderColor: accent, color: '#FFFFFF' }}
                            {...register('accountNumber', { required: 'El número de cuenta es obligatorio' })}
                        />
                        {errors.accountNumber && (
                            <p className='text-red-400 text-xs mt-1'>{errors.accountNumber.message}</p>
                        )}
                    </div>

                    {tab === 'TRANSFER' && (
                        <div>
                            <label className='block text-sm font-medium mb-1.5' style={{ color: '#FFFFFF' }}>
                                Cuenta destino
                            </label>
                            <input
                                type='text'
                                placeholder='ACC-000456'
                                className='w-full px-3 py-2 text-sm border rounded-lg focus:outline-none'
                                style={{ backgroundColor: '#0B1830', borderColor: '#FFE968', color: '#FFFFFF' }}
                                {...register('toAccountNumber', {
                                    required: tab === 'TRANSFER' ? 'La cuenta destino es obligatoria' : false,
                                })}
                            />
                            {errors.toAccountNumber && (
                                <p className='text-red-400 text-xs mt-1'>{errors.toAccountNumber.message}</p>
                            )}
                        </div>
                    )}

                    <div>
                        <label className='block text-sm font-medium mb-1.5' style={{ color: '#FFFFFF' }}>
                            Monto (GTQ)
                        </label>
                        <div className='relative'>
                            <span className='absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold' style={{ color: accent }}>
                                Q
                            </span>
                            <input
                                type='number'
                                step='0.01'
                                placeholder='0.00'
                                className='w-full pl-8 pr-3 py-2 text-sm border rounded-lg focus:outline-none'
                                style={{ backgroundColor: '#0B1830', borderColor: accent, color: '#FFFFFF' }}
                                {...register('amount', {
                                    required: 'El monto es obligatorio',
                                    min: { value: 0.01, message: 'El monto mínimo es Q0.01' },
                                    max: tab === 'TRANSFER'
                                        ? { value: 2000, message: 'Límite por transferencia: Q2,000' }
                                        : undefined,
                                })}
                            />
                        </div>
                        {errors.amount && (
                            <p className='text-red-400 text-xs mt-1'>{errors.amount.message}</p>
                        )}
                        {tab === 'TRANSFER' && (
                            <p className='text-xs mt-1' style={{ color: 'rgba(255,255,255,0.3)' }}>
                                Límite por transacción: Q2,000 · Límite diario: Q10,000
                            </p>
                        )}
                    </div>

                    <div>
                        <label className='block text-sm font-medium mb-1.5' style={{ color: '#FFFFFF' }}>
                            Descripción <span style={{ color: 'rgba(255,255,255,0.4)' }}>(opcional)</span>
                        </label>
                        <input
                            type='text'
                            placeholder={
                                tab === 'DEPOSIT' ? 'Depósito de nómina' :
                                tab === 'TRANSFER' ? 'Pago de renta' :
                                'Compra en tienda'
                            }
                            className='w-full px-3 py-2 text-sm border rounded-lg focus:outline-none'
                            style={{ backgroundColor: '#0B1830', borderColor: 'rgba(65,210,242,0.25)', color: '#FFFFFF' }}
                            {...register('description')}
                        />
                    </div>

                    <div
                        className='flex items-center gap-2 px-3 py-2 rounded-lg text-xs'
                        style={{ backgroundColor: 'rgba(255,233,104,0.08)', border: '1px solid rgba(255,233,104,0.25)', color: '#FFE968' }}
                    >
                        <span>🇬🇹</span>
                        <span>Transacción en <strong>Quetzales (GTQ)</strong> — moneda oficial</span>
                    </div>

                    <div className='flex gap-3 pt-1'>
                        <button
                            type='button'
                            onClick={handleClose}
                            className='flex-1 py-2.5 rounded-lg text-sm font-medium hover:opacity-70'
                            style={{ backgroundColor: 'rgba(65,210,242,0.1)', color: '#41D2F2', border: '1px solid rgba(65,210,242,0.3)' }}
                        >
                            Cancelar
                        </button>
                        <button
                            type='submit'
                            disabled={loading}
                            className='flex-1 py-2.5 rounded-lg text-sm font-bold disabled:opacity-60'
                            style={{ backgroundColor: accent, color: '#0B1830' }}
                        >
                            {loading ? 'Procesando...' : `Confirmar ${currentType?.label}`}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
