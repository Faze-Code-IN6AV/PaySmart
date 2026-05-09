import { XMarkIcon, ShoppingBagIcon } from '@heroicons/react/24/outline';

// El backend retorna status en inglés: COMPLETED, PENDING, FAILED
const STATUS_CONFIG = {
    COMPLETED: { bg: 'rgba(65,210,242,0.12)',  color: '#41D2F2',  label: 'Completado' },
    PENDING:   { bg: 'rgba(255,233,104,0.12)', color: '#FFE968',  label: 'Pendiente'  },
    FAILED:    { bg: 'rgba(239,68,68,0.12)',   color: '#fca5a5',  label: 'Fallido'    },
};

export const PurchaseDetailModal = ({ purchase, onClose }) => {
    if (!purchase) return null;
    const badge = STATUS_CONFIG[purchase.status] ?? STATUS_CONFIG.PENDING;

    const fmt = (iso) =>
        new Date(iso).toLocaleDateString('es-GT', {
            year: 'numeric', month: 'short', day: '2-digit',
            hour: '2-digit', minute: '2-digit',
        });

    // El backend hace .populate('product')
    const productName = purchase.product?.name ?? purchase.product ?? '—';

    return (
        <div
            className='fixed inset-0 z-50 flex items-center justify-center p-4'
            style={{ backgroundColor: 'rgba(11,24,48,0.85)', backdropFilter: 'blur(4px)' }}
        >
            <div
                className='w-full max-w-sm rounded-2xl p-6 flex flex-col gap-4'
                style={{ backgroundColor: '#162C5F', border: '1px solid rgba(65,210,242,0.2)', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}
            >
                <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-3'>
                        <div className='p-2.5 rounded-xl' style={{ backgroundColor: 'rgba(65,210,242,0.12)' }}>
                            <ShoppingBagIcon className='w-5 h-5' style={{ color: '#41D2F2' }} />
                        </div>
                        <div>
                            <h2 className='font-bold text-base' style={{ color: '#FFFFFF' }}>Detalle de compra</h2>
                            <p className='text-xs font-mono' style={{ color: 'rgba(255,255,255,0.35)' }}>{purchase._id}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className='p-1.5 rounded-lg hover:opacity-70' style={{ color: 'rgba(255,255,255,0.4)' }}>
                        <XMarkIcon className='w-5 h-5' />
                    </button>
                </div>

                <div className='flex flex-col gap-2'>
                    {[
                        { label: 'Producto',    value: productName },
                        { label: 'Cantidad',    value: purchase.quantity },
                        { label: 'Precio unit.', value: `Q ${purchase.unitPrice?.toFixed(2)}` },
                        { label: 'Total',       value: `Q ${purchase.amount?.toFixed(2)}` },
                        { label: 'Moneda',      value: purchase.currency ?? 'GTQ' },
                        { label: 'Transacción', value: purchase.transactionId ?? '—' },
                        { label: 'Fecha',       value: fmt(purchase.createdAt) },
                    ].map(({ label, value }) => (
                        <div key={label} className='flex justify-between items-center px-3 py-2.5 rounded-xl' style={{ backgroundColor: 'rgba(11,24,48,0.5)' }}>
                            <span className='text-xs' style={{ color: 'rgba(255,255,255,0.45)' }}>{label}</span>
                            <span className='text-xs font-semibold truncate max-w-[60%] text-right' style={{ color: '#FFFFFF' }}>{value}</span>
                        </div>
                    ))}
                    <div className='flex justify-between items-center px-3 py-2.5 rounded-xl' style={{ backgroundColor: 'rgba(11,24,48,0.5)' }}>
                        <span className='text-xs' style={{ color: 'rgba(255,255,255,0.45)' }}>Estado</span>
                        <span className='text-xs font-bold px-2.5 py-1 rounded-full' style={{ backgroundColor: badge.bg, color: badge.color }}>
                            {badge.label}
                        </span>
                    </div>
                </div>

                <button
                    onClick={onClose}
                    className='w-full py-2.5 rounded-xl text-sm font-semibold hover:opacity-80'
                    style={{ backgroundColor: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.1)' }}
                >
                    Cerrar
                </button>
            </div>
        </div>
    );
};
