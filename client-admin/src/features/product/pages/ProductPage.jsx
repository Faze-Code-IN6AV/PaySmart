import { useState } from 'react';
import {
    PlusCircleIcon, CubeIcon, NoSymbolIcon, CheckCircleIcon,
    XCircleIcon, FunnelIcon, ShoppingBagIcon, MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';

import { useProduct } from '../hooks/useProduct.js';
import { ProductCard } from '../components/ProductCard.jsx';
import { CreateProductModal } from '../components/CreateProductModal.jsx';
import { BuyProductModal } from '../components/BuyProductModal.jsx';
import { PurchaseRow } from '../components/PurchaseRow.jsx';
import { PurchaseDetailModal } from '../components/PurchaseDetailModal.jsx';

const TABS = {
    PRODUCTS:  'products',
    PURCHASES: 'purchases',
};

const ConfirmModal = ({ action, productName, onConfirm, onCancel }) => {
    const CONFIG = {
        disable: {
            title: 'Desactivar producto',
            description: 'El producto quedará inactivo y no estará disponible para los usuarios.',
            confirmLabel: 'Desactivar',
            confirmStyle: { backgroundColor: '#ef4444', color: '#FFFFFF' },
            borderColor: 'rgba(239,68,68,0.3)',
            Icon: NoSymbolIcon,
            iconColor: '#fca5a5',
        },
        enable: {
            title: 'Activar producto',
            description: 'El producto volverá a estar disponible para los usuarios.',
            confirmLabel: 'Activar',
            confirmStyle: { backgroundColor: '#41D2F2', color: '#0B1830' },
            borderColor: 'rgba(65,210,242,0.3)',
            Icon: CheckCircleIcon,
            iconColor: '#41D2F2',
        },
    };
    const cfg = CONFIG[action];
    if (!cfg) return null;

    return (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4' style={{ backgroundColor: 'rgba(11,24,48,0.85)', backdropFilter: 'blur(4px)' }}>
            <div className='w-full max-w-sm rounded-2xl p-6 space-y-4' style={{ backgroundColor: '#162C5F', border: `1px solid ${cfg.borderColor}` }}>
                <div className='flex items-center gap-3'>
                    <div className='p-2.5 rounded-xl' style={{ backgroundColor: `${cfg.iconColor}15` }}>
                        <cfg.Icon className='w-6 h-6' style={{ color: cfg.iconColor }} />
                    </div>
                    <div>
                        <h3 className='font-bold' style={{ color: cfg.iconColor }}>{cfg.title}</h3>
                        <p className='text-xs' style={{ color: 'rgba(255,255,255,0.5)' }}>{productName}</p>
                    </div>
                </div>
                <p className='text-sm' style={{ color: 'rgba(255,255,255,0.7)' }}>{cfg.description}</p>
                <div className='flex gap-3'>
                    <button onClick={onCancel} className='flex-1 py-2 rounded-xl text-sm font-semibold hover:opacity-80'
                        style={{ backgroundColor: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.1)' }}>
                        Cancelar
                    </button>
                    <button onClick={onConfirm} className='flex-1 py-2 rounded-xl text-sm font-bold hover:opacity-90' style={cfg.confirmStyle}>
                        {cfg.confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
};

export const ProductPage = () => {
    const {
        isAdmin, products, purchases, loading, purchasesLoading,
        createProduct, updateProduct, disableProduct, enableProduct,
        fetchPurchases, createPurchase,
    } = useProduct();

    const [activeTab, setActiveTab] = useState(TABS.PRODUCTS);

    // productos
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editProduct, setEditProduct] = useState(null);
    const [confirmAction, setConfirmAction] = useState(null);
    const [filter, setFilter] = useState('ALL');
    const [typeFilter, setTypeFilter] = useState('ALL');

    // compras
    const [buyProduct, setBuyProduct] = useState(null);
    const [selectedPurchase, setSelectedPurchase] = useState(null);
    const [purchaseSearch, setPurchaseSearch] = useState('');
    const [purchaseStatusFilter, setPurchaseStatusFilter] = useState('ALL');
    const [purchasesLoaded, setPurchasesLoaded] = useState(false);

    // ── al cambiar a tab compras, carga una sola vez ──
    const handleTabChange = (tab) => {
        setActiveTab(tab);
        if (tab === TABS.PURCHASES && !purchasesLoaded) {
            fetchPurchases(isAdmin);
            setPurchasesLoaded(true);
        }
    };

    // ── productos filtrados ──
    // usuario solo ve ACTIVOS, admin ve todos
    const visibleProducts = isAdmin ? products : products.filter((p) => p.status === 'ACTIVO');
    const filteredProducts = visibleProducts.filter((p) => {
        const statusOk = !isAdmin || filter === 'ALL' || p.status === filter;
        const typeOk   = typeFilter === 'ALL' || p.type === typeFilter;
        return statusOk && typeOk;
    });

    const productCounts = {
        total:    products.length,
        active:   products.filter((p) => p.status === 'ACTIVO').length,
        inactive: products.filter((p) => p.status === 'INACTIVO').length,
    };

    // ── compras filtradas ──
    const filteredPurchases = purchases.filter((p) => {
        const statusOk = purchaseStatusFilter === 'ALL' || p.status === purchaseStatusFilter;
        const searchOk = !purchaseSearch || p.accountNumber?.includes(purchaseSearch);
        return statusOk && searchOk;
    });

    const purchaseCounts = {
        total:      purchases.length,
        completado: purchases.filter((p) => p.status === 'COMPLETADO').length,
        pendiente:  purchases.filter((p) => p.status === 'PENDIENTE').length,
        fallido:    purchases.filter((p) => p.status === 'FALLIDO').length,
    };

    // ── handlers productos ──
    const handleCreate = async (data) => {
        const result = await createProduct(data);
        if (result.success) setShowCreateModal(false);
    };

    const handleEdit = async (data) => {
        const result = await updateProduct(editProduct._id, data);
        if (result.success) setEditProduct(null);
    };

    const handleToggleStatus = (product) => {
        setConfirmAction({ action: product.status === 'ACTIVO' ? 'disable' : 'enable', product });
    };

    const handleConfirm = async () => {
        if (!confirmAction) return;
        const { action, product } = confirmAction;
        if (action === 'disable') await disableProduct(product._id);
        else await enableProduct(product._id);
        setConfirmAction(null);
    };

    // ── handlers compras ──
    const handleBuy = async (data) => {
        const result = await createPurchase(data);
        if (result.success) setBuyProduct(null);
    };

    const tabStyle = (tab) =>
        activeTab === tab
            ? { color: '#41D2F2', borderBottom: '2px solid #41D2F2', paddingBottom: '0.5rem' }
            : { color: 'rgba(255,255,255,0.4)', borderBottom: '2px solid transparent', paddingBottom: '0.5rem' };

    return (
        <div className='flex flex-col gap-6 pb-10'>

            {/* ── Header ── */}
            <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
                <div className='flex items-center gap-3'>
                    <div className='p-2.5 rounded-xl' style={{ backgroundColor: 'rgba(65,210,242,0.12)' }}>
                        <CubeIcon className='w-6 h-6' style={{ color: '#41D2F2' }} />
                    </div>
                    <div>
                        <h1 className='text-xl font-bold' style={{ color: '#FFFFFF' }}>
                            {isAdmin ? 'Productos y Servicios' : 'Catálogo'}
                        </h1>
                        <p className='text-xs' style={{ color: 'rgba(255,255,255,0.45)' }}>
                            {isAdmin ? 'Gestión de catálogo y compras' : 'Explora y adquiere productos'}
                        </p>
                    </div>
                </div>
                {isAdmin && activeTab === TABS.PRODUCTS && (
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className='flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold hover:opacity-90'
                        style={{ backgroundColor: '#41D2F2', color: '#0B1830' }}
                    >
                        <PlusCircleIcon className='w-5 h-5' />
                        Nuevo producto
                    </button>
                )}
            </div>

            {/* ── Tabs ── */}
            <div className='flex gap-6 border-b' style={{ borderColor: 'rgba(65,210,242,0.12)' }}>
                <button className='text-sm font-semibold transition-all' style={tabStyle(TABS.PRODUCTS)}
                    onClick={() => handleTabChange(TABS.PRODUCTS)}>
                    <span className='flex items-center gap-2'>
                        <CubeIcon className='w-4 h-4' />
                        {isAdmin ? 'Productos' : 'Catálogo'}
                    </span>
                </button>
                <button className='text-sm font-semibold transition-all' style={tabStyle(TABS.PURCHASES)}
                    onClick={() => handleTabChange(TABS.PURCHASES)}>
                    <span className='flex items-center gap-2'>
                        <ShoppingBagIcon className='w-4 h-4' />
                        {isAdmin ? 'Todas las compras' : 'Mis compras'}
                    </span>
                </button>
            </div>

            {/* ══════════════ TAB PRODUCTOS ══════════════ */}
            {activeTab === TABS.PRODUCTS && (
                <>
                    {/* Stats — solo admin */}
                    {isAdmin && (
                        <div className='grid grid-cols-3 gap-3'>
                            {[
                                { label: 'Total',    value: productCounts.total,    color: 'rgba(255,255,255,0.8)' },
                                { label: 'Activos',  value: productCounts.active,   color: '#41D2F2' },
                                { label: 'Inactivos',value: productCounts.inactive, color: '#fca5a5' },
                            ].map(({ label, value, color }) => (
                                <div key={label} className='rounded-2xl p-4 text-center'
                                    style={{ backgroundColor: '#162C5F', border: '1px solid rgba(65,210,242,0.1)' }}>
                                    <p className='text-2xl font-bold' style={{ color }}>{value}</p>
                                    <p className='text-xs mt-0.5' style={{ color: 'rgba(255,255,255,0.45)' }}>{label}</p>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Filtros — admin ve filtro de status, ambos ven filtro de tipo */}
                    <div className='flex flex-wrap gap-2 items-center'>
                        <FunnelIcon className='w-4 h-4 flex-shrink-0' style={{ color: 'rgba(255,255,255,0.4)' }} />
                        {isAdmin && (
                            <>
                                {['ALL', 'ACTIVO', 'INACTIVO'].map((s) => (
                                    <button key={s} onClick={() => setFilter(s)}
                                        className='px-3 py-1.5 rounded-full text-xs font-semibold transition-all'
                                        style={filter === s
                                            ? { backgroundColor: '#41D2F2', color: '#0B1830' }
                                            : { backgroundColor: 'rgba(65,210,242,0.08)', color: 'rgba(255,255,255,0.55)', border: '1px solid rgba(65,210,242,0.15)' }}>
                                        {s === 'ALL' ? 'Todos' : s === 'ACTIVO' ? 'Activos' : 'Inactivos'}
                                    </button>
                                ))}
                                <div className='w-px h-4 mx-1' style={{ backgroundColor: 'rgba(255,255,255,0.12)' }} />
                            </>
                        )}
                        {['ALL', 'SERVICE', 'PRODUCT'].map((t) => (
                            <button key={t} onClick={() => setTypeFilter(t)}
                                className='px-3 py-1.5 rounded-full text-xs font-semibold transition-all'
                                style={typeFilter === t
                                    ? { backgroundColor: '#FFE968', color: '#0B1830' }
                                    : { backgroundColor: 'rgba(255,233,104,0.08)', color: 'rgba(255,255,255,0.55)', border: '1px solid rgba(255,233,104,0.15)' }}>
                                {t === 'ALL' ? 'Todos' : t === 'SERVICE' ? 'Servicios' : 'Productos'}
                            </button>
                        ))}
                    </div>

                    {/* Grid */}
                    {loading ? (
                        <div className='flex flex-col items-center justify-center py-20 gap-3'>
                            <div className='w-8 h-8 rounded-full border-2 animate-spin'
                                style={{ borderColor: '#41D2F2', borderTopColor: 'transparent' }} />
                            <p className='text-sm' style={{ color: 'rgba(255,255,255,0.4)' }}>Cargando productos...</p>
                        </div>
                    ) : filteredProducts.length === 0 ? (
                        <div className='flex flex-col items-center justify-center py-20 gap-3'>
                            <CubeIcon className='w-12 h-12' style={{ color: 'rgba(65,210,242,0.25)' }} />
                            <p className='text-sm' style={{ color: 'rgba(255,255,255,0.4)' }}>
                                No hay productos disponibles
                            </p>
                        </div>
                    ) : (
                        <div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4'>
                            {filteredProducts.map((product) => (
                                <ProductCard
                                    key={product._id}
                                    product={product}
                                    isAdmin={isAdmin}
                                    onEdit={(p) => setEditProduct(p)}
                                    onToggleStatus={handleToggleStatus}
                                    onBuy={(p) => setBuyProduct(p)}
                                />
                            ))}
                        </div>
                    )}
                </>
            )}

            {/* ══════════════ TAB COMPRAS ══════════════ */}
            {activeTab === TABS.PURCHASES && (
                <>
                    {/* Stats */}
                    <div className='grid grid-cols-2 sm:grid-cols-4 gap-3'>
                        {[
                            { label: 'Total',      value: purchaseCounts.total,      color: 'rgba(255,255,255,0.8)' },
                            { label: 'Completado', value: purchaseCounts.completado, color: '#41D2F2' },
                            { label: 'Pendiente',  value: purchaseCounts.pendiente,  color: '#FFE968' },
                            { label: 'Fallido',    value: purchaseCounts.fallido,    color: '#fca5a5' },
                        ].map(({ label, value, color }) => (
                            <div key={label} className='rounded-2xl p-4 text-center'
                                style={{ backgroundColor: '#162C5F', border: '1px solid rgba(65,210,242,0.1)' }}>
                                <p className='text-2xl font-bold' style={{ color }}>{value}</p>
                                <p className='text-xs mt-0.5' style={{ color: 'rgba(255,255,255,0.45)' }}>{label}</p>
                            </div>
                        ))}
                    </div>

                    {/* Búsqueda + filtro status */}
                    <div className='flex flex-col sm:flex-row gap-3'>
                        <div className='flex items-center gap-2 flex-1 px-3 py-2.5 rounded-xl'
                            style={{ backgroundColor: '#162C5F', border: '1px solid rgba(65,210,242,0.15)' }}>
                            <MagnifyingGlassIcon className='w-4 h-4 flex-shrink-0' style={{ color: 'rgba(255,255,255,0.35)' }} />
                            <input
                                value={purchaseSearch}
                                onChange={(e) => setPurchaseSearch(e.target.value)}
                                placeholder='Buscar por número de cuenta...'
                                className='flex-1 bg-transparent text-sm outline-none'
                                style={{ color: '#FFFFFF' }}
                            />
                        </div>
                        <div className='flex items-center gap-2 flex-wrap'>
                            <FunnelIcon className='w-4 h-4 flex-shrink-0' style={{ color: 'rgba(255,255,255,0.4)' }} />
                            {['ALL', 'COMPLETADO', 'PENDIENTE', 'FALLIDO'].map((s) => (
                                <button key={s} onClick={() => setPurchaseStatusFilter(s)}
                                    className='px-3 py-1.5 rounded-full text-xs font-semibold transition-all'
                                    style={purchaseStatusFilter === s
                                        ? { backgroundColor: '#41D2F2', color: '#0B1830' }
                                        : { backgroundColor: 'rgba(65,210,242,0.08)', color: 'rgba(255,255,255,0.55)', border: '1px solid rgba(65,210,242,0.15)' }}>
                                    {s === 'ALL' ? 'Todos' : s.charAt(0) + s.slice(1).toLowerCase()}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Lista */}
                    {purchasesLoading ? (
                        <div className='flex flex-col items-center justify-center py-20 gap-3'>
                            <div className='w-8 h-8 rounded-full border-2 animate-spin'
                                style={{ borderColor: '#41D2F2', borderTopColor: 'transparent' }} />
                            <p className='text-sm' style={{ color: 'rgba(255,255,255,0.4)' }}>Cargando compras...</p>
                        </div>
                    ) : filteredPurchases.length === 0 ? (
                        <div className='flex flex-col items-center justify-center py-20 gap-3'>
                            <ShoppingBagIcon className='w-12 h-12' style={{ color: 'rgba(65,210,242,0.25)' }} />
                            <p className='text-sm' style={{ color: 'rgba(255,255,255,0.4)' }}>
                                No hay compras registradas
                            </p>
                        </div>
                    ) : (
                        <div className='flex flex-col gap-3'>
                            {filteredPurchases.map((purchase) => (
                                <PurchaseRow
                                    key={purchase._id}
                                    purchase={purchase}
                                    onClick={(p) => setSelectedPurchase(p)}
                                />
                            ))}
                        </div>
                    )}
                </>
            )}

            {/* ── Modals ── */}
            {showCreateModal && (
                <CreateProductModal onClose={() => setShowCreateModal(false)} onSubmit={handleCreate} loading={loading} />
            )}
            {editProduct && (
                <CreateProductModal editProduct={editProduct} onClose={() => setEditProduct(null)} onSubmit={handleEdit} loading={loading} />
            )}
            {confirmAction && (
                <ConfirmModal
                    action={confirmAction.action}
                    productName={confirmAction.product.name}
                    onConfirm={handleConfirm}
                    onCancel={() => setConfirmAction(null)}
                />
            )}
            {buyProduct && (
                <BuyProductModal product={buyProduct} onClose={() => setBuyProduct(null)} onConfirm={handleBuy} loading={loading} />
            )}
            {selectedPurchase && (
                <PurchaseDetailModal purchase={selectedPurchase} onClose={() => setSelectedPurchase(null)} />
            )}
        </div>
    );
};