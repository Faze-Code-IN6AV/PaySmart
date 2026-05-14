import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import {
    XMarkIcon,
    ArrowsRightLeftIcon,
    LockClosedIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';

/**
 * QuickTransferModal
 *
 * Modal de transferencia rápida hacia una cuenta favorita.
 * La cuenta DESTINO está pre-llenada y bloqueada (viene del favorito).
 * El usuario sólo ingresa: cuenta origen, monto y descripción opcional.
 *
 * Props:
 *  - isOpen       {boolean}
 *  - favorite     {{ _id, alias, accountNumber }} | null
 *  - onClose      () => void
 *  - onSubmit     ({ fromAccountNumber, toAccountNumber, amount, description }) => Promise<{ success }>
 *  - loading      boolean
 */
export const QuickTransferModal = ({
    isOpen,
    favorite,
    onClose,
    onSubmit,
    loading = false,
}) => {
    const {
        register,
        handleSubmit,
        reset,
        watch,
        formState: { errors },
    } = useForm({
        defaultValues: {
            fromAccountNumber: '',
            amount: '',
            description: '',
        },
    });

    // Limpiar form cuando cambia el favorito seleccionado
    useEffect(() => {
        if (favorite) reset({ fromAccountNumber: '', amount: '', description: '' });
    }, [favorite, reset]);

    const handleClose = () => {
        reset();
        onClose();
    };

    const handleFormSubmit = async (data) => {
        if (!favorite) return;
        const res = await onSubmit({
            fromAccountNumber: data.fromAccountNumber.trim(),
            toAccountNumber: favorite.accountNumber,
            amount: Number(data.amount),
            description: data.description.trim(),
        });
        if (res?.success) {
            reset();
        }
    };

    if (!isOpen || !favorite) return null;

    return (
        <div
            className='fixed inset-0 z-50 flex items-center justify-center p-4'
            style={{ backgroundColor: 'rgba(11,24,48,0.88)', backdropFilter: 'blur(6px)' }}
            onClick={(e) => e.target === e.currentTarget && handleClose()}
        >
            <div
                className='w-full max-w-md rounded-2xl shadow-2xl'
                style={{
                    backgroundColor: '#162C5F',
                    border: '1px solid rgba(255,233,104,0.4)',
                }}
            >
                {/* ——— Header ——— */}
                <div
                    className='flex items-center justify-between px-6 py-4 rounded-t-2xl'
                    style={{ borderBottom: '1px solid rgba(255,233,104,0.2)' }}
                >
                    <div className='flex items-center gap-3'>
                        <div
                            className='p-2.5 rounded-xl'
                            style={{ backgroundColor: 'rgba(255,233,104,0.12)' }}
                        >
                            <ArrowsRightLeftIcon className='w-5 h-5' style={{ color: '#FFE968' }} />
                        </div>
                        <div>
                            <h2 className='text-lg font-bold' style={{ color: '#FFFFFF' }}>
                                Transferencia rápida
                            </h2>
                            <p className='text-xs mt-0.5' style={{ color: '#FFE968' }}>
                                Envía dinero a una cuenta favorita
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleClose}
                        className='p-1.5 rounded-lg hover:opacity-70'
                        style={{ color: '#FFE968' }}
                    >
                        <XMarkIcon className='w-5 h-5' />
                    </button>
                </div>

                <form
                    onSubmit={handleSubmit(handleFormSubmit)}
                    className='px-6 py-5 space-y-5'
                >
                    {/* ——— Tarjeta del destinatario (pre-llenado, bloqueado) ——— */}
                    <div
                        className='rounded-xl p-4 flex items-center gap-3'
                        style={{
                            background: 'linear-gradient(135deg, rgba(255,233,104,0.08) 0%, rgba(255,233,104,0.04) 100%)',
                            border: '1px solid rgba(255,233,104,0.25)',
                        }}
                    >
                        <div
                            className='p-2 rounded-xl flex-shrink-0'
                            style={{ backgroundColor: 'rgba(255,233,104,0.15)' }}
                        >
                            <StarSolid className='w-5 h-5' style={{ color: '#FFE968' }} />
                        </div>
                        <div className='flex-1 min-w-0'>
                            <p className='text-xs font-medium mb-0.5' style={{ color: 'rgba(255,233,104,0.7)' }}>
                                Cuenta destino (favorita)
                            </p>
                            <p className='text-sm font-bold truncate' style={{ color: '#FFFFFF' }}>
                                {favorite.alias}
                            </p>
                            <p
                                className='text-xs font-mono mt-0.5'
                                style={{ color: 'rgba(255,255,255,0.45)' }}
                            >
                                {favorite.accountNumber}
                            </p>
                        </div>
                        <LockClosedIcon
                            className='w-4 h-4 flex-shrink-0'
                            style={{ color: 'rgba(255,233,104,0.45)' }}
                            title='Cuenta destino fija'
                        />
                    </div>

                    {/* ——— Cuenta origen ——— */}
                    <div>
                        <label
                            className='block text-sm font-medium mb-1.5'
                            style={{ color: '#FFFFFF' }}
                        >
                            Tu número de cuenta (origen)
                        </label>
                        <input
                            type='text'
                            placeholder='Ej. ACC-000123'
                            className='w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none'
                            style={{
                                backgroundColor: '#0B1830',
                                borderColor: errors.fromAccountNumber ? '#f87171' : '#FFE968',
                                color: '#FFFFFF',
                            }}
                            {...register('fromAccountNumber', {
                                required: 'Tu número de cuenta es requerido',
                                minLength: { value: 3, message: 'Ingresa un número válido' },
                                validate: (val) =>
                                    val.trim() !== favorite.accountNumber ||
                                    'La cuenta origen no puede ser la misma que el destino',
                            })}
                        />
                        {errors.fromAccountNumber && (
                            <p className='text-red-400 text-xs mt-1'>
                                {errors.fromAccountNumber.message}
                            </p>
                        )}
                    </div>

                    {/* ——— Monto ——— */}
                    <div>
                        <label
                            className='block text-sm font-medium mb-1.5'
                            style={{ color: '#FFFFFF' }}
                        >
                            Monto (GTQ)
                        </label>
                        <div className='relative'>
                            <span
                                className='absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold'
                                style={{ color: '#FFE968' }}
                            >
                                Q
                            </span>
                            <input
                                type='number'
                                step='0.01'
                                placeholder='0.00'
                                className='w-full pl-8 pr-3 py-2.5 text-sm border rounded-lg focus:outline-none'
                                style={{
                                    backgroundColor: '#0B1830',
                                    borderColor: errors.amount ? '#f87171' : '#FFE968',
                                    color: '#FFFFFF',
                                }}
                                {...register('amount', {
                                    required: 'El monto es requerido',
                                    min: { value: 0.01, message: 'El monto mínimo es Q0.01' },
                                    max: { value: 2000, message: 'Límite por transferencia: Q2,000' },
                                })}
                            />
                        </div>
                        {errors.amount ? (
                            <p className='text-red-400 text-xs mt-1'>{errors.amount.message}</p>
                        ) : (
                            <p className='text-xs mt-1' style={{ color: 'rgba(255,255,255,0.3)' }}>
                                Límite por transacción: Q2,000 · Límite diario: Q10,000
                            </p>
                        )}
                    </div>

                    {/* ——— Descripción ——— */}
                    <div>
                        <label
                            className='block text-sm font-medium mb-1.5'
                            style={{ color: '#FFFFFF' }}
                        >
                            Descripción{' '}
                            <span style={{ color: 'rgba(255,255,255,0.4)' }}>(opcional)</span>
                        </label>
                        <input
                            type='text'
                            placeholder={`Transferencia a ${favorite.alias}`}
                            maxLength={100}
                            className='w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none'
                            style={{
                                backgroundColor: '#0B1830',
                                borderColor: 'rgba(255,233,104,0.25)',
                                color: '#FFFFFF',
                            }}
                            {...register('description')}
                        />
                    </div>

                    {/* ——— Info chip ——— */}
                    <div
                        className='flex items-center gap-2 px-3 py-2 rounded-lg text-xs'
                        style={{
                            backgroundColor: 'rgba(255,233,104,0.08)',
                            border: '1px solid rgba(255,233,104,0.2)',
                            color: '#FFE968',
                        }}
                    >
                        <span>🇬🇹</span>
                        <span>
                            Transacción en <strong>Quetzales (GTQ)</strong> — moneda oficial
                        </span>
                    </div>

                    {/* ——— Botones ——— */}
                    <div className='flex gap-3 pt-1'>
                        <button
                            type='button'
                            onClick={handleClose}
                            className='flex-1 py-2.5 rounded-lg text-sm font-medium hover:opacity-70'
                            style={{
                                backgroundColor: 'rgba(255,255,255,0.06)',
                                color: 'rgba(255,255,255,0.6)',
                                border: '1px solid rgba(255,255,255,0.1)',
                            }}
                        >
                            Cancelar
                        </button>
                        <button
                            type='submit'
                            disabled={loading}
                            className='flex-1 py-2.5 rounded-lg text-sm font-bold disabled:opacity-60 flex items-center justify-center gap-2'
                            style={{ backgroundColor: '#FFE968', color: '#0B1830' }}
                        >
                            <ArrowsRightLeftIcon className='w-4 h-4' />
                            {loading ? 'Enviando...' : 'Transferir'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};