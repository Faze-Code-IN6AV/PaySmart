import { useState } from 'react';
import {
    ArrowPathIcon,
    ChartBarIcon,
    CreditCardIcon,
    ArrowTrendingUpIcon,
    ArrowTrendingDownIcon,
    FunnelIcon,
    CalendarDaysIcon,
    ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import { useReport } from '../hooks/useReport.js';
import { CurrencyConverter } from '../../../shared/components/CurrencyConverter.jsx';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (n) =>
    new Intl.NumberFormat('es-GT', { style: 'currency', currency: 'GTQ' }).format(n ?? 0);

const fmtNum = (n) => new Intl.NumberFormat('es-GT').format(n ?? 0);

const fmtDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('es-GT', { day: '2-digit', month: 'short', year: 'numeric' });
};

const TX_BADGE = {
    DEPOSIT:  { label: 'Depósito',      bg: 'rgba(74,222,128,0.12)',  color: '#4ADE80' },
    TRANSFER: { label: 'Transferencia', bg: 'rgba(65,210,242,0.12)',  color: '#41D2F2' },
    WITHDRAW: { label: 'Compra',        bg: 'rgba(251,191,36,0.12)',  color: '#FBBF24' },
};

const ACCT_STATUS = {
    ACTIVO:     { bg: 'rgba(74,222,128,0.12)',  color: '#4ADE80',  label: 'Activa' },
    SUSPENDIDO: { bg: 'rgba(248,113,113,0.12)', color: '#F87171',  label: 'Suspendida' },
    CERRADO:    { bg: 'rgba(156,163,175,0.12)', color: '#9CA3AF',  label: 'Cerrada' },
};

// ─── Small reusable pieces ────────────────────────────────────────────────────

const StatCard = ({ label, value, sub, accent = '#41D2F2', Icon }) => (
    <div
        className='rounded-2xl p-5 flex flex-col gap-3'
        style={{ backgroundColor: '#162C5F', border: '1px solid rgba(65,210,242,0.1)' }}
    >
        <div className='flex items-center justify-between'>
            <span className='text-xs font-semibold uppercase tracking-wider' style={{ color: 'rgba(255,255,255,0.4)' }}>
                {label}
            </span>
            <div className='w-8 h-8 rounded-xl flex items-center justify-center' style={{ backgroundColor: `${accent}20` }}>
                <Icon className='w-4 h-4' style={{ color: accent }} />
            </div>
        </div>
        <p className='text-2xl font-bold' style={{ color: '#FFFFFF' }}>{value}</p>
        {sub && <p className='text-xs' style={{ color: 'rgba(255,255,255,0.4)' }}>{sub}</p>}
    </div>
);

const RefreshBtn = ({ onClick, loading }) => (
    <button
        onClick={onClick}
        disabled={loading}
        className='p-2 rounded-lg transition-opacity hover:opacity-70 disabled:opacity-40'
        style={{ backgroundColor: 'rgba(65,210,242,0.08)', color: '#41D2F2' }}
        title='Recargar'
    >
        <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
    </button>
);

const LoadingSkeleton = ({ rows = 5 }) => (
    <div className='space-y-2'>
        {[...Array(rows)].map((_, i) => (
            <div key={i} className='h-12 rounded-xl animate-pulse' style={{ backgroundColor: 'rgba(65,210,242,0.06)' }} />
        ))}
    </div>
);

const EmptyState = ({ message = 'Sin datos disponibles' }) => (
    <div
        className='flex flex-col items-center justify-center py-14 rounded-2xl'
        style={{ backgroundColor: '#162C5F', border: '1px dashed rgba(65,210,242,0.2)' }}
    >
        <ChartBarIcon className='w-10 h-10 mb-3' style={{ color: 'rgba(65,210,242,0.3)' }} />
        <p className='text-sm font-semibold' style={{ color: 'rgba(255,255,255,0.4)' }}>{message}</p>
    </div>
);

const ErrorBanner = ({ message, onRetry }) => (
    <div
        className='flex items-center justify-between px-4 py-3 rounded-xl'
        style={{ backgroundColor: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.25)' }}
    >
        <div className='flex items-center gap-2'>
            <ExclamationCircleIcon className='w-4 h-4 flex-shrink-0' style={{ color: '#F87171' }} />
            <span className='text-sm' style={{ color: '#F87171' }}>{message}</span>
        </div>
        {onRetry && (
            <button onClick={onRetry} className='text-xs font-semibold px-3 py-1 rounded-lg hover:opacity-80' style={{ backgroundColor: 'rgba(248,113,113,0.15)', color: '#F87171' }}>
                Reintentar
            </button>
        )}
    </div>
);

// ─── Main component ───────────────────────────────────────────────────────────

export const ReportPage = () => {
    const {
        isAdmin,
        accountsMostMovements,
        accountsAdminOverview,
        loading,
        error,
        fetchAccountsMostMovements,
        fetchAccountsAdminOverview,
    } = useReport();

    const [movOrder, setMovOrder] = useState('desc');
    const [movLimit, setMovLimit] = useState(10);
    const [overviewLimit, setOverviewLimit] = useState(5);

    if (!isAdmin) return (
        <div className='flex flex-col gap-6'>
            <div>
                <h1 className='text-2xl font-bold' style={{ color: '#FFFFFF' }}>Bienvenido a PaySmart</h1>
                <p className='text-sm mt-1' style={{ color: '#41D2F2' }}>
                    Selecciona una sección del menú lateral para continuar
                </p>
            </div>
            <CurrencyConverter />
        </div>
    );

    // KPIs derivados de los datos reales
    const topAccount = accountsMostMovements[0];
    const totalOverviewAccounts = accountsAdminOverview?.length ?? 0;
    const activeCount = accountsAdminOverview?.filter(a => a.status === 'ACTIVO').length ?? 0;
    const suspendedCount = accountsAdminOverview?.filter(a => a.status === 'SUSPENDIDO').length ?? 0;

    const maxMovements = accountsMostMovements.length > 0
        ? Math.max(...accountsMostMovements.map(r => r.totalMovements))
        : 1;

    const handleMovOrderChange = (o) => {
        setMovOrder(o);
        fetchAccountsMostMovements({ order: o, limit: movLimit });
    };

    const handleMovLimitChange = (l) => {
        setMovLimit(l);
        fetchAccountsMostMovements({ order: movOrder, limit: l });
    };

    const handleOverviewLimitChange = (l) => {
        setOverviewLimit(l);
        fetchAccountsAdminOverview({ limit: l });
    };

    return (
        <div className='flex flex-col gap-8'>

            {/* ── Header ───────────────────────────────────────────────── */}
            <div>
                <h1 className='text-2xl font-bold' style={{ color: '#FFFFFF' }}>
                    Panel de administración
                </h1>
                <p className='text-sm mt-1' style={{ color: '#41D2F2' }}>
                    Estadísticas y reportes del sistema PaySmart
                </p>
            </div>

            {/* ── Error banner ─────────────────────────────────────────── */}
            {error && (
                <ErrorBanner
                    message={error}
                    onRetry={() => {
                        fetchAccountsMostMovements({ order: movOrder, limit: movLimit });
                        fetchAccountsAdminOverview({ limit: overviewLimit });
                    }}
                />
            )}

            {/* ── KPI cards ────────────────────────────────────────────── */}
            <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
                <StatCard
                    Icon={CreditCardIcon}
                    label='Cuentas en el sistema'
                    value={fmtNum(totalOverviewAccounts)}
                    sub={`${fmtNum(activeCount)} activas · ${fmtNum(suspendedCount)} suspendidas`}
                    accent='#41D2F2'
                />
                <StatCard
                    Icon={ArrowTrendingUpIcon}
                    label='Cuenta más activa'
                    value={topAccount ? `${fmtNum(topAccount.totalMovements)} movs.` : '—'}
                    sub={topAccount ? `...${topAccount.accountNumber.slice(-6)}` : 'Sin datos'}
                    accent='#4ADE80'
                />
                <StatCard
                    Icon={ChartBarIcon}
                    label='Mayor monto acumulado'
                    value={topAccount ? fmt(topAccount.totalAmount) : '—'}
                    sub='Cuenta con más movimientos'
                    accent='#FFE968'
                />
            </div>

            {/* ── Sección 1: Cuentas con más movimientos ───────────────── */}
            <section>
                <div className='flex items-center justify-between mb-4 flex-wrap gap-3'>
                    <h2 className='text-base font-bold' style={{ color: '#FFFFFF' }}>
                        Cuentas con más movimientos
                    </h2>
                    <div className='flex items-center gap-2 flex-wrap'>
                        {/* Orden */}
                        <div className='flex gap-1 p-1 rounded-xl' style={{ backgroundColor: '#162C5F' }}>
                            {[
                                { key: 'desc', label: 'Mayor', Icon: ArrowTrendingDownIcon },
                                { key: 'asc',  label: 'Menor', Icon: ArrowTrendingUpIcon  },
                            ].map(({ key, label, Icon }) => (
                                <button
                                    key={key}
                                    onClick={() => handleMovOrderChange(key)}
                                    className='flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all'
                                    style={{
                                        backgroundColor: movOrder === key ? 'rgba(65,210,242,0.15)' : 'transparent',
                                        border: `1px solid ${movOrder === key ? 'rgba(65,210,242,0.3)' : 'transparent'}`,
                                        color: movOrder === key ? '#41D2F2' : 'rgba(255,255,255,0.35)',
                                    }}
                                >
                                    <Icon className='w-3.5 h-3.5' />
                                    {label}
                                </button>
                            ))}
                        </div>
                        {/* Límite */}
                        <div className='flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs' style={{ backgroundColor: '#162C5F', border: '1px solid rgba(65,210,242,0.1)' }}>
                            <FunnelIcon className='w-3.5 h-3.5 mr-1' style={{ color: '#41D2F2' }} />
                            {[5, 10, 20].map((l) => (
                                <button
                                    key={l}
                                    onClick={() => handleMovLimitChange(l)}
                                    className='px-2 py-0.5 rounded-md font-semibold transition-all'
                                    style={{
                                        backgroundColor: movLimit === l ? 'rgba(65,210,242,0.15)' : 'transparent',
                                        color: movLimit === l ? '#41D2F2' : 'rgba(255,255,255,0.35)',
                                    }}
                                >
                                    {l}
                                </button>
                            ))}
                        </div>
                        <RefreshBtn
                            onClick={() => fetchAccountsMostMovements({ order: movOrder, limit: movLimit })}
                            loading={loading}
                        />
                    </div>
                </div>

                {loading && accountsMostMovements.length === 0 ? (
                    <div className='rounded-2xl p-5' style={{ backgroundColor: '#162C5F', border: '1px solid rgba(65,210,242,0.1)' }}>
                        <LoadingSkeleton rows={5} />
                    </div>
                ) : accountsMostMovements.length === 0 ? (
                    <EmptyState message='No hay datos de movimientos aún' />
                ) : (
                    <div
                        className='rounded-2xl overflow-hidden'
                        style={{ backgroundColor: '#162C5F', border: '1px solid rgba(65,210,242,0.1)' }}
                    >
                        <div className='overflow-x-auto'>
                            <table className='w-full text-sm'>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid rgba(65,210,242,0.1)' }}>
                                        {['#', 'N° Cuenta', 'Movimientos', 'Monto total', 'Último mov.', ''].map((h) => (
                                            <th key={h} className='px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider' style={{ color: 'rgba(255,255,255,0.4)' }}>
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {accountsMostMovements.map((row, i) => {
                                        const barPct = Math.round((row.totalMovements / maxMovements) * 100);
                                        return (
                                            <tr
                                                key={row.accountNumber}
                                                style={{ borderBottom: i < accountsMostMovements.length - 1 ? '1px solid rgba(65,210,242,0.06)' : 'none' }}
                                            >
                                                <td className='px-4 py-3 text-xs font-bold' style={{ color: 'rgba(255,255,255,0.3)' }}>
                                                    {i + 1}
                                                </td>
                                                <td className='px-4 py-3 font-mono text-xs' style={{ color: 'rgba(255,255,255,0.6)' }}>
                                                    {row.accountNumber.slice(0, 6)}…{row.accountNumber.slice(-4)}
                                                </td>
                                                <td className='px-4 py-3'>
                                                    <div className='flex items-center gap-3'>
                                                        <span className='text-sm font-bold w-8' style={{ color: '#FFFFFF' }}>
                                                            {fmtNum(row.totalMovements)}
                                                        </span>
                                                        <div className='flex-1 h-1.5 rounded-full' style={{ backgroundColor: 'rgba(255,255,255,0.06)', minWidth: 60 }}>
                                                            <div
                                                                className='h-1.5 rounded-full'
                                                                style={{ width: `${barPct}%`, backgroundColor: '#41D2F2' }}
                                                            />
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className='px-4 py-3 font-semibold' style={{ color: '#FFFFFF' }}>
                                                    {fmt(row.totalAmount)}
                                                </td>
                                                <td className='px-4 py-3 text-xs' style={{ color: 'rgba(255,255,255,0.4)' }}>
                                                    {fmtDate(row.lastMovementAt)}
                                                </td>
                                                <td className='px-4 py-3'>
                                                    {i === 0 && (
                                                        <span className='px-2 py-0.5 rounded-full text-xs font-bold' style={{ backgroundColor: 'rgba(255,233,104,0.12)', color: '#FFE968' }}>
                                                            Top 1
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </section>

            {/* ── Sección 2: Overview de cuentas ───────────────────────── */}
            <section>
                <div className='flex items-center justify-between mb-4 flex-wrap gap-3'>
                    <h2 className='text-base font-bold' style={{ color: '#FFFFFF' }}>
                        Resumen de cuentas principales
                    </h2>
                    <div className='flex items-center gap-2'>
                        <div className='flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs' style={{ backgroundColor: '#162C5F', border: '1px solid rgba(65,210,242,0.1)' }}>
                            <FunnelIcon className='w-3.5 h-3.5 mr-1' style={{ color: '#41D2F2' }} />
                            {[3, 5, 10].map((l) => (
                                <button
                                    key={l}
                                    onClick={() => handleOverviewLimitChange(l)}
                                    className='px-2 py-0.5 rounded-md font-semibold transition-all'
                                    style={{
                                        backgroundColor: overviewLimit === l ? 'rgba(65,210,242,0.15)' : 'transparent',
                                        color: overviewLimit === l ? '#41D2F2' : 'rgba(255,255,255,0.35)',
                                    }}
                                >
                                    {l}
                                </button>
                            ))}
                        </div>
                        <RefreshBtn
                            onClick={() => fetchAccountsAdminOverview({ limit: overviewLimit })}
                            loading={loading}
                        />
                    </div>
                </div>

                {loading && (!accountsAdminOverview || accountsAdminOverview.length === 0) ? (
                    <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4'>
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className='h-52 rounded-2xl animate-pulse' style={{ backgroundColor: '#162C5F' }} />
                        ))}
                    </div>
                ) : !accountsAdminOverview || accountsAdminOverview.length === 0 ? (
                    <EmptyState message='No hay cuentas con movimientos aún' />
                ) : (
                    <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4'>
                        {accountsAdminOverview.slice(0, overviewLimit).map((acc) => {
                            const st = ACCT_STATUS[acc.status] ?? { bg: 'rgba(65,210,242,0.12)', color: '#41D2F2', label: acc.status ?? 'Activa' };
                            return (
                                <div
                                    key={acc.accountNumber}
                                    className='rounded-2xl p-5 flex flex-col gap-4'
                                    style={{ backgroundColor: '#162C5F', border: '1px solid rgba(65,210,242,0.1)' }}
                                >
                                    {/* Header */}
                                    <div className='flex items-start justify-between gap-2'>
                                        <div>
                                            <p className='text-xs font-semibold uppercase tracking-wider mb-0.5' style={{ color: 'rgba(255,255,255,0.4)' }}>
                                                N° Cuenta
                                            </p>
                                            <p className='font-mono text-xs' style={{ color: 'rgba(255,255,255,0.7)' }}>
                                                {acc.accountNumber.slice(0, 6)}…{acc.accountNumber.slice(-4)}
                                            </p>
                                        </div>
                                        {acc.status && (
                                            <span className='px-2 py-0.5 rounded-full text-xs font-semibold flex-shrink-0' style={{ backgroundColor: st.bg, color: st.color }}>
                                                {st.label}
                                            </span>
                                        )}
                                    </div>

                                    {/* Balance */}
                                    <div>
                                        <p className='text-xs mb-0.5' style={{ color: 'rgba(255,255,255,0.35)' }}>Saldo actual</p>
                                        <p className='text-xl font-bold' style={{ color: '#FFFFFF' }}>{fmt(acc.balance)}</p>
                                    </div>

                                    {/* Últimos movimientos */}
                                    {acc.lastMovements?.length > 0 && (
                                        <div>
                                            <p className='text-xs font-semibold mb-2 flex items-center gap-1.5' style={{ color: 'rgba(255,255,255,0.4)' }}>
                                                <CalendarDaysIcon className='w-3.5 h-3.5' />
                                                Últimos movimientos
                                            </p>
                                            <div className='space-y-1.5'>
                                                {acc.lastMovements.map((mv, idx) => {
                                                    const badge = TX_BADGE[mv.type] ?? TX_BADGE.DEPOSIT;
                                                    return (
                                                        <div key={idx} className='flex items-center justify-between'>
                                                            <span className='px-2 py-0.5 rounded-full text-xs font-semibold' style={{ backgroundColor: badge.bg, color: badge.color }}>
                                                                {badge.label}
                                                            </span>
                                                            <div className='text-right'>
                                                                <p className='text-xs font-semibold' style={{ color: '#FFFFFF' }}>{fmt(mv.amount)}</p>
                                                                <p className='text-xs' style={{ color: 'rgba(255,255,255,0.3)' }}>{fmtDate(mv.createdAt)}</p>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>

        </div>
    );
};
