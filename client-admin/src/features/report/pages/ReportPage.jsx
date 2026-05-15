import { useState } from 'react';
import {
    ArrowPathIcon,
    ChartBarIcon,
    CreditCardIcon,
    ArrowTrendingUpIcon,
    ArrowTrendingDownIcon,
    FunnelIcon,
    CalendarDaysIcon,
} from '@heroicons/react/24/outline';
import { useReport } from '../hooks/useReport.js';

// ─── Hardcoded data (visual only — misma forma que devuelve el backend) ────────

const HARDCODED_MOST_MOVEMENTS = [
    { accountNumber: '100200300400500601', totalMovements: 142, totalAmount: 487_320.5 },
    { accountNumber: '100200300400500602', totalMovements: 98, totalAmount: 213_800.0 },
    { accountNumber: '100200300400500603', totalMovements: 74, totalAmount: 95_450.25 },
    { accountNumber: '100200300400500604', totalMovements: 61, totalAmount: 310_000.0 },
    { accountNumber: '100200300400500605', totalMovements: 53, totalAmount: 78_900.75 },
    { accountNumber: '100200300400500606', totalMovements: 47, totalAmount: 42_100.0 },
    { accountNumber: '100200300400500607', totalMovements: 39, totalAmount: 128_560.0 },
    { accountNumber: '100200300400500608', totalMovements: 28, totalAmount: 19_800.5 },
    { accountNumber: '100200300400500609', totalMovements: 21, totalAmount: 55_200.0 },
    { accountNumber: '100200300400500610', totalMovements: 14, totalAmount: 8_740.0 },
];

const HARDCODED_OVERVIEW = {
    totalAccounts: 3_421,
    activeAccounts: 3_334,
    suspendedAccounts: 87,
    topAccounts: [
        {
            accountNumber: '100200300400500601',
            balance: 487_320.5,
            status: 'ACTIVA',
            lastMovements: [
                { type: 'DEPOSIT', amount: 15_000, date: '2026-05-14' },
                { type: 'TRANSFER', amount: 3_200, date: '2026-05-13' },
                { type: 'PURCHASE', amount: 450, date: '2026-05-12' },
            ],
        },
        {
            accountNumber: '100200300400500602',
            balance: 213_800.0,
            status: 'ACTIVA',
            lastMovements: [
                { type: 'DEPOSIT', amount: 8_000, date: '2026-05-14' },
                { type: 'TRANSFER', amount: 1_500, date: '2026-05-13' },
            ],
        },
        {
            accountNumber: '100200300400500603',
            balance: 95_450.25,
            status: 'SUSPENDIDA',
            lastMovements: [
                { type: 'TRANSFER', amount: 500, date: '2026-05-10' },
            ],
        },
        {
            accountNumber: '100200300400500604',
            balance: 310_000.0,
            status: 'ACTIVA',
            lastMovements: [
                { type: 'DEPOSIT', amount: 50_000, date: '2026-05-11' },
                { type: 'PURCHASE', amount: 2_100, date: '2026-05-09' },
            ],
        },
        {
            accountNumber: '100200300400500605',
            balance: 78_900.75,
            status: 'ACTIVA',
            lastMovements: [
                { type: 'TRANSFER', amount: 4_000, date: '2026-05-14' },
            ],
        },
    ],
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (n) =>
    new Intl.NumberFormat('es-GT', { style: 'currency', currency: 'GTQ' }).format(n);

const fmtNum = (n) => new Intl.NumberFormat('es-GT').format(n);

const TX_BADGE = {
    DEPOSIT:  { label: 'Depósito',      bg: 'rgba(74,222,128,0.12)',  color: '#4ADE80' },
    TRANSFER: { label: 'Transferencia', bg: 'rgba(65,210,242,0.12)',  color: '#41D2F2' },
    PURCHASE: { label: 'Compra',        bg: 'rgba(251,191,36,0.12)',  color: '#FBBF24' },
};

const ACCT_STATUS = {
    ACTIVA:     { bg: 'rgba(74,222,128,0.12)',  color: '#4ADE80' },
    SUSPENDIDA: { bg: 'rgba(248,113,113,0.12)', color: '#F87171' },
    CERRADA:    { bg: 'rgba(156,163,175,0.12)', color: '#9CA3AF' },
};

const maxMovements = Math.max(...HARDCODED_MOST_MOVEMENTS.map((r) => r.totalMovements));

// ─── Small reusable components ────────────────────────────────────────────────

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

// ─── Main component ───────────────────────────────────────────────────────────

export const ReportPage = () => {
    const {
        isAdmin,
        loading,
        fetchAccountsMostMovements,
        fetchAccountsAdminOverview,
    } = useReport();

    const [movOrder, setMovOrder] = useState('desc');
    const [movLimit, setMovLimit] = useState(10);
    const [overviewLimit, setOverviewLimit] = useState(5);

    // Siempre usar hardcoded por ahora
    const movements = HARDCODED_MOST_MOVEMENTS.slice(0, movLimit);
    const overview  = HARDCODED_OVERVIEW;

    if (!isAdmin) return (
        <div className='flex flex-col items-center justify-center h-64'>
            <p className='text-lg font-semibold' style={{ color: 'rgba(255,255,255,0.5)' }}>
                Bienvenido a PaySmart
            </p>
            <p className='text-sm mt-2' style={{ color: 'rgba(255,255,255,0.3)' }}>
                Selecciona una sección del menú lateral
            </p>
        </div>
    );

    return (
        <div className='flex flex-col gap-8'>

            {/* ── Header ─────────────────────────────────────────────────── */}
            <div>
                <h1 className='text-2xl font-bold' style={{ color: '#FFFFFF' }}>
                    Panel de administración
                </h1>
                <p className='text-sm mt-1' style={{ color: '#41D2F2' }}>
                    Resumen y estadísticas del sistema PaySmart
                </p>
            </div>

            {/* ── KPIs ───────────────────────────────────────────────────── */}
            <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
                <StatCard
                    Icon={CreditCardIcon}
                    label='Cuentas totales'
                    value={fmtNum(overview.totalAccounts)}
                    sub={`${fmtNum(overview.activeAccounts)} activas · ${fmtNum(overview.suspendedAccounts)} suspendidas`}
                    accent='#41D2F2'
                />
                <StatCard
                    Icon={ArrowTrendingUpIcon}
                    label='Cuenta más activa'
                    value={`${movements[0]?.totalMovements ?? '—'} movs.`}
                    sub={movements[0] ? `...${movements[0].accountNumber.slice(-6)}` : ''}
                    accent='#4ADE80'
                />
                <StatCard
                    Icon={ChartBarIcon}
                    label='Mayor monto acumulado'
                    value={fmt(movements[0]?.totalAmount ?? 0)}
                    sub='Cuenta con más movimientos'
                    accent='#FFE968'
                />
            </div>

            {/* ── Cuentas con más movimientos ────────────────────────────── */}
            <section>
                <div className='flex items-center justify-between mb-4 flex-wrap gap-3'>
                    <h2 className='text-base font-bold' style={{ color: '#FFFFFF' }}>
                        Cuentas con más movimientos
                    </h2>
                    <div className='flex items-center gap-2'>
                        {/* Order toggle */}
                        <div className='flex gap-1 p-1 rounded-xl' style={{ backgroundColor: '#162C5F' }}>
                            {['desc', 'asc'].map((o) => (
                                <button
                                    key={o}
                                    onClick={() => setMovOrder(o)}
                                    className='flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all'
                                    style={{
                                        backgroundColor: movOrder === o ? 'rgba(65,210,242,0.15)' : 'transparent',
                                        border: `1px solid ${movOrder === o ? 'rgba(65,210,242,0.3)' : 'transparent'}`,
                                        color: movOrder === o ? '#41D2F2' : 'rgba(255,255,255,0.35)',
                                    }}
                                >
                                    {o === 'desc' ? <ArrowTrendingDownIcon className='w-3.5 h-3.5' /> : <ArrowTrendingUpIcon className='w-3.5 h-3.5' />}
                                    {o === 'desc' ? 'Mayor' : 'Menor'}
                                </button>
                            ))}
                        </div>
                        {/* Limit selector */}
                        <div className='flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs' style={{ backgroundColor: '#162C5F', border: '1px solid rgba(65,210,242,0.1)', color: 'rgba(255,255,255,0.5)' }}>
                            <FunnelIcon className='w-3.5 h-3.5' style={{ color: '#41D2F2' }} />
                            {[5, 10].map((l) => (
                                <button
                                    key={l}
                                    onClick={() => setMovLimit(l)}
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
                        <RefreshBtn onClick={() => fetchAccountsMostMovements({ order: movOrder, limit: movLimit })} loading={loading} />
                    </div>
                </div>

                <div className='rounded-2xl overflow-hidden' style={{ backgroundColor: '#162C5F', border: '1px solid rgba(65,210,242,0.1)' }}>
                    <div className='overflow-x-auto'>
                        <table className='w-full text-sm'>
                            <thead>
                                <tr style={{ borderBottom: '1px solid rgba(65,210,242,0.1)' }}>
                                    {['#', 'N° Cuenta', 'Movimientos', 'Monto total', ''].map((h) => (
                                        <th key={h} className='px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider' style={{ color: 'rgba(255,255,255,0.4)' }}>
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {movements.map((row, i) => {
                                    const barPct = Math.round((row.totalMovements / maxMovements) * 100);
                                    return (
                                        <tr
                                            key={row.accountNumber}
                                            style={{ borderBottom: i < movements.length - 1 ? '1px solid rgba(65,210,242,0.06)' : 'none' }}
                                        >
                                            <td className='px-4 py-3 text-xs font-bold' style={{ color: 'rgba(255,255,255,0.3)' }}>
                                                {i + 1}
                                            </td>
                                            <td className='px-4 py-3 font-mono text-xs' style={{ color: 'rgba(255,255,255,0.6)' }}>
                                                {row.accountNumber.slice(0, 6)}…{row.accountNumber.slice(-4)}
                                            </td>
                                            <td className='px-4 py-3'>
                                                <div className='flex items-center gap-3'>
                                                    <span className='text-sm font-bold w-8' style={{ color: '#FFFFFF' }}>{row.totalMovements}</span>
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
            </section>

            {/* ── Admin overview: top accounts con últimos movimientos ──── */}
            <section>
                <div className='flex items-center justify-between mb-4 flex-wrap gap-3'>
                    <h2 className='text-base font-bold' style={{ color: '#FFFFFF' }}>
                        Resumen de cuentas principales
                    </h2>
                    <div className='flex items-center gap-2'>
                        <div className='flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs' style={{ backgroundColor: '#162C5F', border: '1px solid rgba(65,210,242,0.1)', color: 'rgba(255,255,255,0.5)' }}>
                            <FunnelIcon className='w-3.5 h-3.5' style={{ color: '#41D2F2' }} />
                            {[3, 5, 10].map((l) => (
                                <button
                                    key={l}
                                    onClick={() => setOverviewLimit(l)}
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
                        <RefreshBtn onClick={() => fetchAccountsAdminOverview({ limit: overviewLimit })} loading={loading} />
                    </div>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4'>
                    {overview.topAccounts.slice(0, overviewLimit).map((acc) => {
                        const st = ACCT_STATUS[acc.status] ?? ACCT_STATUS.ACTIVA;
                        return (
                            <div
                                key={acc.accountNumber}
                                className='rounded-2xl p-5 flex flex-col gap-4'
                                style={{ backgroundColor: '#162C5F', border: '1px solid rgba(65,210,242,0.1)' }}
                            >
                                {/* Account header */}
                                <div className='flex items-start justify-between gap-2'>
                                    <div>
                                        <p className='text-xs font-semibold uppercase tracking-wider mb-0.5' style={{ color: 'rgba(255,255,255,0.4)' }}>
                                            N° Cuenta
                                        </p>
                                        <p className='font-mono text-xs' style={{ color: 'rgba(255,255,255,0.7)' }}>
                                            {acc.accountNumber.slice(0, 6)}…{acc.accountNumber.slice(-4)}
                                        </p>
                                    </div>
                                    <span
                                        className='px-2 py-0.5 rounded-full text-xs font-semibold flex-shrink-0'
                                        style={{ backgroundColor: st.bg, color: st.color }}
                                    >
                                        {acc.status}
                                    </span>
                                </div>

                                {/* Balance */}
                                <div>
                                    <p className='text-xs' style={{ color: 'rgba(255,255,255,0.35)' }}>Saldo</p>
                                    <p className='text-xl font-bold' style={{ color: '#FFFFFF' }}>{fmt(acc.balance)}</p>
                                </div>

                                {/* Last movements */}
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
                                                        <span
                                                            className='px-2 py-0.5 rounded-full text-xs font-semibold'
                                                            style={{ backgroundColor: badge.bg, color: badge.color }}
                                                        >
                                                            {badge.label}
                                                        </span>
                                                        <div className='text-right'>
                                                            <p className='text-xs font-semibold' style={{ color: '#FFFFFF' }}>{fmt(mv.amount)}</p>
                                                            <p className='text-xs' style={{ color: 'rgba(255,255,255,0.3)' }}>{mv.date}</p>
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
            </section>
        </div>
    );
};