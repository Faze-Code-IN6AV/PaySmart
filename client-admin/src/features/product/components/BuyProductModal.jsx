import { useState } from 'react';
import { XMarkIcon, ShoppingCartIcon } from '@heroicons/react/24/outline';

export const BuyProductModal = ({ product, onClose, onConfirm, loading }) => {
    const [accountNumber, setAccountNumber] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [error, setError] = useState('');

    const total = (product.price * quantity).toFixed(2);

    const handleConfirm = () => {
        if (!accountNumber.trim()) {
            setError('Ingresa el número de cuenta.');
            return;
        }
        if (quantity < 1 || isNaN(quantity)) {
            setError('La cantidad debe ser al menos 1.');
            return;
        }
        // Payload que espera el backend: { product, quantity, fromAccountNumber }
        onConfirm({
            product: product._id,
            quantity: Number(quantity),
            fromAccountNumber: accountNumber.replace(/\s+/g, ''),
        });
    };

    const inputStyle = (hasError) => ({
        backgroundColor: 'rgba(11,24,48,0.6)',
        border: `1px solid ${hasError ? 'rgba(239,68,68,0.5)' : 'rgba(65,210,242,0.2)'}`,
        color: '#FFFFFF',
        borderRadius: '0.75rem',
        padding: '0.6rem 0.875rem',
        width: '100%',
        fontSize: '0.875rem',
        outline: 'none',
    });

    return (
        <div
            className='fixed inset-0 z-50 flex items-center justify-center p-4'
            style={{ backgroundColor: 'rgba(11,24,48,0.85)', backdropFilter: 'blur(4px)' }}
        >
            <div
                className='w-full max-w-sm rounded-2xl p-6 flex flex-col gap-5'
                style={{ backgroundColor: '#162C5F', border: '1px solid rgba(65,210,242,0.2)', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}
            >
                {/* Header */}
                <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-3'>
                        <div className='p-2.5 rounded-xl' style={{ backgroundColor: 'rgba(65,210,242,0.12)' }}>
                            <ShoppingCartIcon className='w-5 h-5' style={{ color: '#41D2F2' }} />
                        </div>
                        <div>
                            <h2 className='font-bold text-base' style={{ color: '#FFFFFF' }}>Confirmar compra</h2>
                            <p className='text-xs' style={{ color: 'rgba(255,255,255,0.4)' }}>{product.name}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className='p-1.5 rounded-lg hover:opacity-70' style={{ color: 'rgba(255,255,255,0.4)' }}>
                        <XMarkIcon className='w-5 h-5' />
                    </button>
                </div>

                {/* Resumen */}
                <div className='rounded-xl p-4 flex flex-col gap-2' style={{ backgroundColor: 'rgba(11,24,48,0.5)' }}>
                    <div className='flex justify-between'>
                        <span className='text-xs' style={{ color: 'rgba(255,255,255,0.45)' }}>Producto</span>
                        <span className='text-xs font-semibold' style={{ color: '#FFFFFF' }}>{product.name}</span>
                    </div>
                    <div className='flex justify-between'>
                        <span className='text-xs' style={{ color: 'rgba(255,255,255,0.45)' }}>Precio unitario</span>
                        <span className='text-xs font-semibold' style={{ color: '#FFFFFF' }}>Q {product.price?.toFixed(2)}</span>
                    </div>
                    <div className='flex justify-between border-t pt-2' style={{ borderColor: 'rgba(65,210,242,0.1)' }}>
                        <span className='text-xs' style={{ color: 'rgba(255,255,255,0.45)' }}>Total</span>
                        <span className='text-sm font-bold' style={{ color: '#41D2F2' }}>Q {total}</span>
                    </div>
                </div>

                {/* Cantidad */}
                <div>
                    <label className='block text-xs mb-1.5' style={{ color: 'rgba(255,255,255,0.55)' }}>
                        Cantidad *
                    </label>
                    <input
                        type='number'
                        min='1'
                        max={product.stock ?? undefined}
                        value={quantity}
                        onChange={(e) => { setQuantity(e.target.value); setError(''); }}
                        style={inputStyle(false)}
                    />
                    {product.stock !== null && (
                        <p className='text-xs mt-1' style={{ color: 'rgba(255,255,255,0.35)' }}>
                            Stock disponible: {product.stock}
                        </p>
                    )}
                </div>

                {/* Cuenta origen */}
                <div>
                    <label className='block text-xs mb-1.5' style={{ color: 'rgba(255,255,255,0.55)' }}>
                        Número de cuenta origen *
                    </label>
                    <input
                        value={accountNumber}
                        onChange={(e) => { setAccountNumber(e.target.value); setError(''); }}
                        placeholder='Ej. 1234567890'
                        style={inputStyle(!!error)}
                    />
                    {error && <p className='text-xs mt-1' style={{ color: '#fca5a5' }}>{error}</p>}
                </div>

                {/* Botones */}
                <div className='flex gap-3'>
                    <button
                        onClick={onClose}
                        className='flex-1 py-2.5 rounded-xl text-sm font-semibold hover:opacity-80'
                        style={{ backgroundColor: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.1)' }}
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={loading}
                        className='flex-1 py-2.5 rounded-xl text-sm font-bold hover:opacity-90 disabled:opacity-50'
                        style={{ backgroundColor: '#41D2F2', color: '#0B1830' }}
                    >
                        {loading ? 'Procesando...' : 'Confirmar'}
                    </button>
                </div>
            </div>
        </div>
    );
};