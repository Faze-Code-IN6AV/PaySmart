import { useState, useEffect } from 'react';
import { ArrowsRightLeftIcon, GlobeAltIcon } from '@heroicons/react/24/outline';

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

const fmt = (n, decimals = 4) =>
  Number(n).toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: decimals });

export const CurrencyConverter = ({ initialAmount = 0 }) => {
  const [rates, setRates] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [amount, setAmount] = useState(initialAmount || '');
  const [from, setFrom] = useState('GTQ');
  const [to, setTo] = useState('USD');
  const [lastUpdated, setLastUpdated] = useState('');

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error('No se pudo obtener las tasas');
        const data = await res.json();
        setRates(data.rates);
        // Usamos la fecha que devuelve la API directamente, sin asumir nada
        const apiDate = data.time_last_update_utc
          ? new Date(data.time_last_update_utc).toLocaleDateString('es-GT')
          : new Date().toLocaleDateString('es-GT');
        setLastUpdated(apiDate);
      } catch {
        setError('No se pudo cargar el conversor. Verifique su conexión.');
      } finally {
        setLoading(false);
      }
    };
    fetchRates();
  }, []);

  const convert = () => {
    if (!rates || !amount) return null;
    // rates son relativas a GTQ. Para convertir from -> to:
    // 1. Convertir from a GTQ (dividir entre rates[from])
    // 2. Multiplicar por rates[to]
    const inGTQ = Number(amount) / (from === 'GTQ' ? 1 : rates[from]);
    return inGTQ * (to === 'GTQ' ? 1 : rates[to]);
  };

  const swap = () => { setFrom(to); setTo(from); };

  const result = convert();
  const fromCur = CURRENCIES.find((c) => c.code === from);
  const toCur = CURRENCIES.find((c) => c.code === to);

  return (
    <div className="rounded-2xl p-5 space-y-4"
      style={{ backgroundColor: '#162C5F', border: '1px solid rgba(65,210,242,0.2)' }}>
      {/* Header */}
      <div className="flex items-center gap-2">
        <GlobeAltIcon className="w-5 h-5" style={{ color: '#41D2F2' }} />
        <h3 className="text-base font-bold" style={{ color: '#FFFFFF' }}>Conversor de Divisas</h3>
        {lastUpdated && (
          <span className="ml-auto text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
            Actualizado: {lastUpdated}
          </span>
        )}
      </div>

      {loading && (
        <p className="text-sm text-center py-4" style={{ color: 'rgba(65,210,242,0.6)' }}>Cargando tasas de cambio…</p>
      )}

      {error && (
        <p className="text-sm text-center py-4" style={{ color: '#fca5a5' }}>{error}</p>
      )}

      {!loading && !error && rates && (
        <>
          {/* Monto */}
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.6)' }}>
              Monto a convertir
            </label>
            <input
              type="number" step="0.01" placeholder="0.00" value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3 py-2.5 text-sm rounded-xl border focus:outline-none"
              style={{ backgroundColor: '#0B1830', borderColor: '#41D2F2', color: '#FFFFFF' }}
            />
          </div>

          {/* Selector de monedas */}
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <label className="block text-xs font-medium mb-1" style={{ color: 'rgba(255,255,255,0.6)' }}>De</label>
              <select value={from} onChange={(e) => setFrom(e.target.value)}
                className="w-full px-3 py-2.5 text-sm rounded-xl border focus:outline-none"
                style={{ backgroundColor: '#0B1830', borderColor: '#41D2F2', color: '#FFFFFF' }}>
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>{c.flag} {c.code} — {c.name}</option>
                ))}
              </select>
            </div>

            <button onClick={swap} className="mt-5 p-2.5 rounded-xl hover:opacity-70 flex-shrink-0"
              style={{ backgroundColor: 'rgba(65,210,242,0.1)', color: '#41D2F2', border: '1px solid rgba(65,210,242,0.3)' }}>
              <ArrowsRightLeftIcon className="w-5 h-5" />
            </button>

            <div className="flex-1">
              <label className="block text-xs font-medium mb-1" style={{ color: 'rgba(255,255,255,0.6)' }}>A</label>
              <select value={to} onChange={(e) => setTo(e.target.value)}
                className="w-full px-3 py-2.5 text-sm rounded-xl border focus:outline-none"
                style={{ backgroundColor: '#0B1830', borderColor: '#41D2F2', color: '#FFFFFF' }}>
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>{c.flag} {c.code} — {c.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Resultado */}
          {amount && result !== null && (
            <div className="rounded-xl p-4 text-center"
              style={{ backgroundColor: 'rgba(65,210,242,0.06)', border: '1px solid rgba(65,210,242,0.2)' }}>
              <p className="text-xs mb-1" style={{ color: 'rgba(255,255,255,0.45)' }}>Resultado</p>
              <p className="text-2xl font-bold" style={{ color: '#FFE968' }}>
                {toCur?.flag} {fmt(result, 2)} {to}
              </p>
              <p className="text-xs mt-1.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
                {fromCur?.flag} 1 {from} = {toCur?.flag} {fmt(to === 'GTQ' ? 1 / rates[from] : rates[to] / (from === 'GTQ' ? 1 : rates[from]), 4)} {to}
              </p>
            </div>
          )}

          {/* Grid de tasas principales vs GTQ */}
          <div>
            <p className="text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.35)' }}>
              Tasas principales respecto al Quetzal
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
              {CURRENCIES.filter((c) => c.code !== 'GTQ').map((c) => (
                <div key={c.code} className="flex items-center justify-between px-3 py-2 rounded-lg"
                  style={{ backgroundColor: 'rgba(11,24,48,0.4)', border: '1px solid rgba(65,210,242,0.08)' }}>
                  <span className="text-xs" style={{ color: 'rgba(255,255,255,0.55)' }}>
                    {c.flag} {c.code}
                  </span>
                  <span className="text-xs font-semibold font-mono" style={{ color: '#41D2F2' }}>
                    {fmt(rates[c.code], 4)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
