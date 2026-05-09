import {
    CubeIcon,
    WrenchScrewdriverIcon,
    CheckCircleIcon,
    NoSymbolIcon,
    PencilSquareIcon,
    StarIcon,
    ShoppingCartIcon,
} from '@heroicons/react/24/outline';

const STATUS_BADGE = {
    ACTIVO:   { label: 'Activo',   bg: 'rgba(65,210,242,0.12)', color: '#41D2F2' },
    INACTIVO: { label: 'Inactivo', bg: 'rgba(239,68,68,0.12)',  color: '#fca5a5' },
};

const TYPE_CONFIG = {
    PRODUCT: { label: 'Producto', Icon: CubeIcon,               color: '#41D2F2' },
    SERVICE: { label: 'Servicio', Icon: WrenchScrewdriverIcon,  color: '#FFE968' },
};

export const ProductCard = ({ product, isAdmin, onEdit, onToggleStatus, onBuy }) => {
    const badge    = STATUS_BADGE[product.status] ?? STATUS_BADGE.INACTIVO;
    const typeConf = TYPE_CONFIG[product.type]    ?? TYPE_CONFIG.PRODUCT;
    const TypeIcon = typeConf.Icon;
    const isActive = product.status === 'ACTIVO';

    return (
        <div
            className='rounded-2xl p-5 flex flex-col gap-4 transition-all duration-200 hover:scale-[1.01]'
            style={{
                backgroundColor: '#162C5F',
                border: '1px solid rgba(65,210,242,0.12)',
                boxShadow: '0 2px 12px rgba(11,24,48,0.4)',
            }}
        >
            {/* Header */}
            <div className='flex items-start justify-between gap-3'>
                <div className='flex items-center gap-3 min-w-0'>
                    <div className='p-2.5 rounded-xl flex-shrink-0' style={{ backgroundColor: `${typeConf.color}18` }}>
                        <TypeIcon className='w-5 h-5' style={{ color: typeConf.color }} />
                    </div>
                    <div className='min-w-0'>
                        <div className='flex items-center gap-1.5'>
                            <h3 className='font-bold text-sm truncate' style={{ color: '#FFFFFF' }}>
                                {product.name}
                            </h3>
                            {product.exclusive && (
                                <StarIcon className='w-3.5 h-3.5 flex-shrink-0' style={{ color: '#FFE968' }} title='Exclusivo' />
                            )}
                        </div>
                        <span
                            className='text-xs px-2 py-0.5 rounded-full font-medium'
                            style={{ backgroundColor: `${typeConf.color}15`, color: typeConf.color }}
                        >
                            {typeConf.label}
                        </span>
                    </div>
                </div>

                {/* Badge — solo admin ve INACTIVO */}
                {isAdmin && (
                    <span
                        className='text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0'
                        style={{ backgroundColor: badge.bg, color: badge.color }}
                    >
                        {badge.label}
                    </span>
                )}
            </div>

            {/* Description */}
            {product.description && (
                <p className='text-xs leading-relaxed line-clamp-2' style={{ color: 'rgba(255,255,255,0.55)' }}>
                    {product.description}
                </p>
            )}

            {/* Details */}
            <div className='grid grid-cols-2 gap-2'>
                <div className='rounded-xl p-3' style={{ backgroundColor: 'rgba(11,24,48,0.5)' }}>
                    <p className='text-xs mb-0.5' style={{ color: 'rgba(255,255,255,0.4)' }}>Precio</p>
                    <p className='text-sm font-bold' style={{ color: '#41D2F2' }}>Q {product.price?.toFixed(2)}</p>
                </div>
                <div className='rounded-xl p-3' style={{ backgroundColor: 'rgba(11,24,48,0.5)' }}>
                    <p className='text-xs mb-0.5' style={{ color: 'rgba(255,255,255,0.4)' }}>Stock</p>
                    <p className='text-sm font-bold' style={{ color: 'rgba(255,255,255,0.85)' }}>
                        {product.stock === null ? 'Ilimitado' : product.stock}
                    </p>
                </div>
            </div>

            {/* Actions */}
            {isAdmin ? (
                <div className='flex gap-2 pt-1'>
                    <button
                        onClick={() => onEdit(product)}
                        className='flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold hover:opacity-80'
                        style={{ backgroundColor: 'rgba(65,210,242,0.1)', color: '#41D2F2', border: '1px solid rgba(65,210,242,0.2)' }}
                    >
                        <PencilSquareIcon className='w-4 h-4' />
                        Editar
                    </button>
                    <button
                        onClick={() => onToggleStatus(product)}
                        className='flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold hover:opacity-80'
                        style={
                            isActive
                                ? { backgroundColor: 'rgba(239,68,68,0.1)',   color: '#fca5a5', border: '1px solid rgba(239,68,68,0.2)' }
                                : { backgroundColor: 'rgba(65,210,242,0.1)',  color: '#41D2F2', border: '1px solid rgba(65,210,242,0.2)' }
                        }
                    >
                        {isActive ? (
                            <><NoSymbolIcon className='w-4 h-4' />Desactivar</>
                        ) : (
                            <><CheckCircleIcon className='w-4 h-4' />Activar</>
                        )}
                    </button>
                </div>
            ) : (
                <button
                    onClick={() => onBuy(product)}
                    className='w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold hover:opacity-90'
                    style={{ backgroundColor: '#41D2F2', color: '#0B1830' }}
                >
                    <ShoppingCartIcon className='w-4 h-4' />
                    Comprar
                </button>
            )}
        </div>
    );
};