// El backend retorna status en inglés: COMPLETED, PENDING, FAILED
const STATUS_CONFIG = {
    COMPLETED: { bg: 'rgba(65,210,242,0.12)',  color: '#41D2F2',  label: 'Completado' },
    PENDING:   { bg: 'rgba(255,233,104,0.12)', color: '#FFE968',  label: 'Pendiente'  },
    FAILED:    { bg: 'rgba(239,68,68,0.12)',   color: '#fca5a5',  label: 'Fallido'    },
};

export const PurchaseRow = ({ purchase, onClick }) => {
    const badge = STATUS_CONFIG[purchase.status] ?? STATUS_CONFIG.PENDING;

    const fmt = (iso) =>
        new Date(iso).toLocaleDateString('es-GT', {
            year: 'numeric', month: 'short', day: '2-digit',
            hour: '2-digit', minute: '2-digit',
        });

    // El backend hace .populate('product'), por lo que el campo es purchase.product
    const productName = purchase.product?.name ?? purchase.product ?? '—';

    return (
        <div
            onClick={() => onClick(purchase)}
            className='rounded-2xl p-4 flex items-center justify-between gap-4 cursor-pointer hover:scale-[1.005] transition-all'
            style={{ backgroundColor: '#162C5F', border: '1px solid rgba(65,210,242,0.1)' }}
        >
            <div className='min-w-0'>
                <p className='text-sm font-semibold truncate' style={{ color: '#FFFFFF' }}>
                    {productName}
                </p>
                <p className='text-xs font-mono truncate' style={{ color: 'rgba(255,255,255,0.4)' }}>
                    {purchase.transactionId ?? purchase._id}
                </p>
            </div>
            <div className='flex items-center gap-3 flex-shrink-0'>
                <div className='text-right hidden sm:block'>
                    <p className='text-sm font-bold' style={{ color: '#41D2F2' }}>Q {purchase.amount?.toFixed(2)}</p>
                    <p className='text-xs' style={{ color: 'rgba(255,255,255,0.35)' }}>{fmt(purchase.createdAt)}</p>
                </div>
                <span className='text-xs font-bold px-2.5 py-1 rounded-full' style={{ backgroundColor: badge.bg, color: badge.color }}>
                    {badge.label}
                </span>
            </div>
        </div>
    );
};