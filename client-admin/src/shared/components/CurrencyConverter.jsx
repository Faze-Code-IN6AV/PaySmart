import { useState, useEffect, useCallback } from 'react';
import {
  ArrowsRightLeftIcon,
  GlobeAltIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ClockIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

const API_URL = 'https://open.er-api.com/v6/latest/GTQ';

const CURRENCIES = [
  { code: 'GTQ', flag: '🇬🇹', name: 'Quetzal guatemalteco' },
  { code: 'USD', flag: '🇺🇸', name: 'Dólar estadounidense' },
  { code: 'EUR', flag: '🇪🇺', name: 'Euro' },
  { code: 'MXN', flag: '🇲🇽', name: 'Peso mexicano' },
  { code: 'HNL', flag: '🇭🇳', name: 'Lempira hondureño' },
  { code: 'CRC', flag: '🇨🇷', name: 'Colón costarricense' },
  { code: 'GBP', flag: '🇬🇧', name: 'Libra esterlina' },
  { code: 'JPY', flag: '🇯🇵', name: 'Yen japonés' },
  { code: 'CAD', flag: '🇨🇦', name: 'Dólar canadiense' },
  { code: 'BRL', flag: '🇧🇷', name: 'Real brasileño' },
];

// Currencies to show in the quick-rates grid (excluding GTQ)
const QUICK_RATES = ['USD', 'EUR', 'MXN', 'GBP', 'BRL', 'CAD', 'JPY', 'HNL', 'CRC'];

const fmt = (n, decimals = 4) =>
  Number(n).toLocaleString('es-GT', {
    minimumFractionDigits: 2,
    maximumFractionDigits: decimals,
  });

const fmtCompact = (n) => {
  if (Math.abs(n) >= 1000) return fmt(n, 2);
  if (Math.abs(n) >= 1) return fmt(n, 4);
  return fmt(n, 6);
};

// ─── Skeleton loader ──────────────────────────────────────────────────────────
const Skeleton = ({ className = '', style = {} }) => (
  <div
    className={`animate-pulse rounded-lg ${className}`}
    style={{ backgroundColor: 'rgba(65,210,242,0.08)', ...style }}
  />
);

// ─── Currency select ──────────────────────────────────────────────────────────
const CurrencySelect = ({ label, value, onChange, disabled }) => {
  const selected = CURRENCIES.find((c) => c.code === value);
  return (
    <div className="flex-1 min-w-0">
      <label
        className="block text-xs font-semibold mb-1.5 uppercase tracking-wider"
        style={{ color: 'rgba(255,255,255,0.45)' }}
      >
        {label}
      </label>
      <div className="relative">
        <div
          className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-lg leading-none"
          style={{ top: '50%', transform: 'translateY(-50%)' }}
        >
          {selected?.flag}
        </div>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border focus:outline-none focus:ring-1 appearance-none disabled:opacity-50"
          style={{
            backgroundColor: '#0B1830',
            borderColor: 'rgba(65,210,242,0.3)',
            color: '#FFFFFF',
            focusRingColor: '#41D2F2',
          }}
        >
          {CURRENCIES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.code} — {c.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

// ─── Result display ───────────────────────────────────────────────────────────
const ConversionResult = ({ result, amount, from, to, rates }) => {
  const fromCur = CURRENCIES.find((c) => c.code === from);
  const toCur = CURRENCIES.find((c) => c.code === to);

  // Exchange rate: 1 unit of 'from' in 'to'
  const rate =
    from === to
      ? 1
      : (to === 'GTQ' ? 1 : rates[to]) / (from === 'GTQ' ? 1 : rates[from]);

  const inverseRate = rate > 0 ? 1 / rate : 0;

  // Determine if rate is "good" for GTQ users (subjective: USD < 8 GTQ)
  const isRising = from === 'GTQ' && to === 'USD' && rate > 0.125;

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ border: '1px solid rgba(65,210,242,0.2)' }}
    >
      {/* Main result */}
      <div
        className="px-4 py-4 text-center relative"
        style={{
          background:
            'linear-gradient(135deg, rgba(65,210,242,0.08) 0%, rgba(255,233,104,0.06) 100%)',
        }}
      >
        <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'rgba(255,255,255,0.4)' }}>
          Resultado de conversión
        </p>

        {/* From amount */}
        <p className="text-sm mb-1" style={{ color: 'rgba(255,255,255,0.55)' }}>
          {fromCur?.flag} {fmt(amount, 2)} {from}
        </p>

        {/* Arrow */}
        <div className="flex justify-center my-1.5">
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'rgba(65,210,242,0.15)', color: '#41D2F2' }}
          >
            <svg width="10" height="12" viewBox="0 0 10 12" fill="currentColor">
              <path d="M5 0v10M1 7l4 5 4-5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        {/* To amount — hero number */}
        <p
          className="text-3xl font-bold tracking-tight"
          style={{ color: '#FFE968', letterSpacing: '-0.02em' }}
        >
          {toCur?.flag} {fmt(result, 2)}
        </p>
        <p className="text-sm font-semibold mt-0.5" style={{ color: 'rgba(255,255,255,0.6)' }}>
          {to}
        </p>

        {isRising && (
          <div
            className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-full text-xs font-semibold"
            style={{ backgroundColor: 'rgba(74,222,128,0.12)', color: '#4ADE80' }}
          >
            <ArrowTrendingUpIcon className="w-3 h-3" />
            Tasa favorable
          </div>
        )}
      </div>

      {/* Rate details */}
      <div
        className="grid grid-cols-2 divide-x"
        style={{
          borderTop: '1px solid rgba(65,210,242,0.1)',
          divideColor: 'rgba(65,210,242,0.1)',
        }}
      >
        <div className="px-4 py-3 text-center" style={{ borderRight: '1px solid rgba(65,210,242,0.1)' }}>
          <p className="text-xs mb-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
            1 {from} =
          </p>
          <p className="text-sm font-bold font-mono" style={{ color: '#41D2F2' }}>
            {fmtCompact(rate)} {to}
          </p>
        </div>
        <div className="px-4 py-3 text-center">
          <p className="text-xs mb-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
            1 {to} =
          </p>
          <p className="text-sm font-bold font-mono" style={{ color: '#41D2F2' }}>
            {fmtCompact(inverseRate)} {from}
          </p>
        </div>
      </div>
    </div>
  );
};

// ─── Quick rates grid ─────────────────────────────────────────────────────────
const QuickRatesGrid = ({ rates, activeTo, onSelect }) => (
  <div>
    <p
      className="text-xs font-semibold mb-2 uppercase tracking-widest flex items-center gap-1.5"
      style={{ color: 'rgba(255,255,255,0.3)' }}
    >
      <GlobeAltIcon className="w-3.5 h-3.5" />
      Tasas vs. Quetzal (GTQ)
    </p>
    <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 gap-1.5">
      {QUICK_RATES.map((code) => {
        const cur = CURRENCIES.find((c) => c.code === code);
        const isActive = code === activeTo;
        return (
          <button
            key={code}
            onClick={() => onSelect(code)}
            className="flex flex-col items-start px-2.5 py-2 rounded-xl text-left transition-all hover:opacity-90"
            style={{
              backgroundColor: isActive
                ? 'rgba(65,210,242,0.12)'
                : 'rgba(11,24,48,0.5)',
              border: `1px solid ${isActive ? 'rgba(65,210,242,0.35)' : 'rgba(65,210,242,0.07)'}`,
            }}
          >
            <span className="text-base leading-none mb-1">{cur?.flag}</span>
            <span className="text-xs font-semibold" style={{ color: isActive ? '#41D2F2' : 'rgba(255,255,255,0.6)' }}>
              {code}
            </span>
            <span className="text-xs font-mono mt-0.5" style={{ color: isActive ? '#FFE968' : 'rgba(255,255,255,0.4)' }}>
              {fmt(rates[code], 2)}
            </span>
          </button>
        );
      })}
    </div>
  </div>
);

// ─── Main component ───────────────────────────────────────────────────────────
export const CurrencyConverter = ({ initialAmount = 0 }) => {
  const [rates, setRates] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [amount, setAmount] = useState(initialAmount || '');
  const [from, setFrom] = useState('GTQ');
  const [to, setTo] = useState('USD');
  const [lastUpdated, setLastUpdated] = useState('');
  const [copied, setCopied] = useState(false);

  const fetchRates = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error('No se pudo obtener las tasas');
      const data = await res.json();
      setRates(data.rates);
      const apiDate = data.time_last_update_utc
        ? new Date(data.time_last_update_utc).toLocaleDateString('es-GT', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          })
        : new Date().toLocaleDateString('es-GT');
      setLastUpdated(apiDate);
    } catch {
      setError('No se pudo cargar el conversor. Verifique su conexión.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRates();
  }, [fetchRates]);

  const convert = () => {
    if (!rates || !amount || isNaN(Number(amount))) return null;
    const inGTQ = Number(amount) / (from === 'GTQ' ? 1 : rates[from]);
    return inGTQ * (to === 'GTQ' ? 1 : rates[to]);
  };

  const swap = () => {
    setFrom(to);
    setTo(from);
  };

  const copyResult = () => {
    if (result === null) return;
    navigator.clipboard.writeText(fmt(result, 2)).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };

  const result = convert();

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ backgroundColor: '#162C5F', border: '1px solid rgba(65,210,242,0.15)' }}
    >
      {/* ── Header bar ─────────────────────────────────────────────────── */}
      <div
        className="flex items-center gap-2 px-5 py-3.5"
        style={{ borderBottom: '1px solid rgba(65,210,242,0.1)', backgroundColor: 'rgba(11,24,48,0.4)' }}
      >
        <GlobeAltIcon className="w-4 h-4 flex-shrink-0" style={{ color: '#41D2F2' }} />
        <h3 className="text-sm font-bold tracking-tight" style={{ color: '#FFFFFF' }}>
          Conversor de Divisas
        </h3>
        <div className="ml-auto flex items-center gap-2">
          {lastUpdated && (
            <span className="flex items-center gap-1 text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
              <ClockIcon className="w-3 h-3" />
              {lastUpdated}
            </span>
          )}
          <button
            onClick={fetchRates}
            disabled={loading}
            className="text-xs px-2.5 py-1 rounded-lg font-semibold hover:opacity-80 disabled:opacity-40 transition-opacity"
            style={{ backgroundColor: 'rgba(65,210,242,0.1)', color: '#41D2F2' }}
          >
            {loading ? '…' : 'Actualizar'}
          </button>
        </div>
      </div>

      {/* ── Body ───────────────────────────────────────────────────────── */}
      <div className="p-5 space-y-5">

        {/* Error */}
        {error && (
          <div
            className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-sm"
            style={{ backgroundColor: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)', color: '#F87171' }}
          >
            <span>{error}</span>
            <button
              onClick={fetchRates}
              className="text-xs font-semibold px-2.5 py-1 rounded-lg hover:opacity-80"
              style={{ backgroundColor: 'rgba(248,113,113,0.15)', color: '#F87171' }}
            >
              Reintentar
            </button>
          </div>
        )}

        {/* ── Input section ─────────────────────────────────────────── */}
        {loading && !rates ? (
          <div className="space-y-3">
            <Skeleton className="h-12 w-full" />
            <div className="flex items-end gap-3">
              <Skeleton className="h-12 flex-1" />
              <Skeleton className="h-10 w-10" />
              <Skeleton className="h-12 flex-1" />
            </div>
          </div>
        ) : rates ? (
          <>
            {/* Amount input */}
            <div>
              <label
                className="block text-xs font-semibold mb-1.5 uppercase tracking-wider"
                style={{ color: 'rgba(255,255,255,0.45)' }}
              >
                Monto a convertir
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-4 py-3 text-lg font-semibold rounded-xl border focus:outline-none focus:ring-2 transition-colors"
                style={{
                  backgroundColor: '#0B1830',
                  borderColor: amount ? '#41D2F2' : 'rgba(65,210,242,0.25)',
                  color: '#FFFFFF',
                  outline: 'none',
                }}
              />
            </div>

            {/* Currency selectors + swap */}
            <div className="flex items-end gap-2">
              <CurrencySelect label="De" value={from} onChange={setFrom} />

              <button
                onClick={swap}
                className="flex-shrink-0 mb-0.5 p-2.5 rounded-xl hover:opacity-75 transition-all active:scale-95"
                style={{
                  backgroundColor: 'rgba(65,210,242,0.1)',
                  color: '#41D2F2',
                  border: '1px solid rgba(65,210,242,0.2)',
                }}
                title="Intercambiar monedas"
              >
                <ArrowsRightLeftIcon className="w-5 h-5" />
              </button>

              <CurrencySelect label="A" value={to} onChange={setTo} />
            </div>

            {/* ── Result ──────────────────────────────────────────────── */}
            {amount && result !== null ? (
              <div className="space-y-2">
                <ConversionResult
                  result={result}
                  amount={amount}
                  from={from}
                  to={to}
                  rates={rates}
                />
                {/* Copy button */}
                <button
                  onClick={copyResult}
                  className="w-full py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 hover:opacity-80 transition-all"
                  style={{
                    backgroundColor: copied ? 'rgba(74,222,128,0.1)' : 'rgba(65,210,242,0.07)',
                    border: `1px solid ${copied ? 'rgba(74,222,128,0.25)' : 'rgba(65,210,242,0.15)'}`,
                    color: copied ? '#4ADE80' : 'rgba(255,255,255,0.45)',
                  }}
                >
                  {copied ? (
                    <>
                      <CheckCircleIcon className="w-3.5 h-3.5" />
                      Copiado al portapapeles
                    </>
                  ) : (
                    'Copiar resultado'
                  )}
                </button>
              </div>
            ) : amount && result === null ? (
              <div
                className="px-4 py-3 rounded-xl text-sm text-center"
                style={{ backgroundColor: 'rgba(251,191,36,0.08)', color: 'rgba(251,191,36,0.7)', border: '1px solid rgba(251,191,36,0.15)' }}
              >
                Ingresa un monto válido para ver la conversión
              </div>
            ) : null}

            {/* ── Quick rates grid ────────────────────────────────────── */}
            <QuickRatesGrid
              rates={rates}
              activeTo={to}
              onSelect={(code) => setTo(code)}
            />
          </>
        ) : null}
      </div>
    </div>
  );
};