import { useState, useEffect, useCallback } from 'react';
import {
  UserCircleIcon, LockClosedIcon, PencilSquareIcon,
  CheckCircleIcon, ExclamationTriangleIcon,
  CreditCardIcon, ArrowUpCircleIcon, ArrowDownCircleIcon, ArrowsRightLeftIcon,
} from '@heroicons/react/24/outline';
import { useAuthStore } from '../../auth/store/authStore.js';
import { useAccountStore } from '../../account/store/accountStore.js';
import { updateMyProfile, getProfile } from '../../../shared/api/auth.js';

const fmt = (n) =>
  new Intl.NumberFormat('es-GT', { style: 'currency', currency: 'GTQ' }).format(n ?? 0);

const Toast = ({ msg, type, onDone }) => {
  useEffect(() => { const t = setTimeout(onDone, 3500); return () => clearTimeout(t); }, [onDone]);
  return (
    <div className="fixed top-4 right-4 z-[200] flex items-center gap-2 px-4 py-3 rounded-xl shadow-xl text-sm font-semibold"
      style={{ backgroundColor: type === 'ok' ? '#41D2F2' : '#ef4444', color: '#0B1830', maxWidth: 340 }}>
      {type === 'ok' ? <CheckCircleIcon className="w-5 h-5" /> : <ExclamationTriangleIcon className="w-5 h-5" />}
      {msg}
    </div>
  );
};

// ─── Estadísticas ────────────────────────────────────────────────────────────
const AccountStats = ({ accounts }) => {
  if (!accounts?.length) return null;

  const totalBalance = accounts.reduce((sum, a) => sum + (Number(a.balance) || 0), 0);
  const activeCount  = accounts.filter(a => a.status === 'ACTIVO').length;

  const stats = [
    {
      label: 'Saldo total',
      value: fmt(totalBalance),
      Icon: CreditCardIcon,
      color: '#41D2F2',
      bg: 'rgba(65,210,242,0.08)',
    },
    {
      label: 'Cuentas activas',
      value: `${activeCount} de ${accounts.length}`,
      Icon: CheckCircleIcon,
      color: '#FFE968',
      bg: 'rgba(255,233,104,0.08)',
    },
  ];

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.35)' }}>
        Resumen de cuentas
      </p>
      <div className="grid grid-cols-2 gap-3">
        {stats.map(({ label, value, Icon, color, bg }) => (
          <div key={label} className="rounded-xl p-4 flex items-center gap-3"
            style={{ backgroundColor: bg, border: `1px solid ${color}22` }}>
            <Icon className="w-5 h-5 flex-shrink-0" style={{ color }} />
            <div>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>{label}</p>
              <p className="text-sm font-bold mt-0.5" style={{ color: '#FFFFFF' }}>{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Detalle por cuenta */}
      <div className="space-y-2">
        {accounts.map((acc) => (
          <div key={acc._id} className="flex items-center justify-between px-3 py-2.5 rounded-xl"
            style={{ backgroundColor: 'rgba(11,24,48,0.4)', border: '1px solid rgba(65,210,242,0.08)' }}>
            <div className="flex items-center gap-2">
              <CreditCardIcon className="w-4 h-4" style={{ color: '#41D2F2' }} />
              <div>
                <p className="text-xs font-semibold" style={{ color: '#FFFFFF' }}>{acc.accountType}</p>
                <p className="text-xs font-mono" style={{ color: 'rgba(255,255,255,0.35)' }}>
                  {acc.accountNumber}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold" style={{ color: '#FFE968' }}>{fmt(acc.balance)}</p>
              <span className="text-xs px-1.5 py-0.5 rounded-full"
                style={{
                  backgroundColor: acc.status === 'ACTIVO' ? 'rgba(65,210,242,0.12)' : 'rgba(239,68,68,0.12)',
                  color: acc.status === 'ACTIVO' ? '#41D2F2' : '#fca5a5',
                }}>
                {acc.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Página principal ─────────────────────────────────────────────────────────
export const EditMyProfilePage = () => {
  const user    = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);

  const accounts       = useAccountStore((s) => s.accounts);
  const fetchAccounts  = useAccountStore((s) => s.fetchAccounts);

  const [profile,  setProfile]  = useState(null);
  const [editing,  setEditing]  = useState(false);
  const [form,     setForm]     = useState({});
  const [errors,   setErrors]   = useState({});
  const [loading,  setLoading]  = useState(false);
  const [fetching, setFetching] = useState(true);
  const [toast,    setToast]    = useState(null);

  const set = useCallback((field) => (e) =>
    setForm((p) => ({ ...p, [field]: e.target.value })), []);

  useEffect(() => {
    fetchAccounts();
    const load = async () => {
      try {
        const res = await getProfile();
        const data = res.data?.data ?? res.data;
        setProfile(data);
        setForm({
          name:          data?.name          ?? user?.name    ?? '',
          surname:       data?.surname       ?? user?.surname ?? '',
          address:       data?.address       ?? '',
          workName:      data?.workName      ?? '',
          monthlyIncome: data?.monthlyIncome ?? '',
        });
      } catch {
        setForm({
          name:          user?.name          ?? '',
          surname:       user?.surname       ?? '',
          address:       user?.address       ?? '',
          workName:      user?.workName      ?? '',
          monthlyIncome: user?.monthlyIncome ?? '',
        });
      } finally {
        setFetching(false);
      }
    };
    load();
  }, []);

  const validate = () => {
    const e = {};
    if (!form.name?.trim())    e.name    = 'El nombre es requerido';
    if (!form.surname?.trim()) e.surname = 'El apellido es requerido';
    if (form.monthlyIncome && Number(form.monthlyIncome) < 100)
      e.monthlyIncome = 'Mínimo Q100.00';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const payload = { ...form, monthlyIncome: form.monthlyIncome ? Number(form.monthlyIncome) : undefined };
      const res = await updateMyProfile(payload);
      const updated = res.data?.data ?? res.data;
      if (updated && setUser) setUser({ ...user, ...updated });
      setProfile((p) => ({ ...p, ...updated }));
      setEditing(false);
      setToast({ msg: 'Perfil actualizado exitosamente', type: 'ok' });
    } catch (err) {
      setToast({ msg: err?.response?.data?.message || err?.message || 'Error al actualizar', type: 'err' });
    } finally {
      setLoading(false);
    }
  };

  const src = profile ?? user ?? {};

  const fixedFields = [
    { label: 'Username',  value: src.username },
    { label: 'Correo',    value: src.email    },
    { label: 'DPI',       value: src.dpi      },
    { label: 'Teléfono',  value: src.phone    },
  ];

  const editableFields = [
    { label: 'Nombre',            key: 'name',     type: 'text' },
    { label: 'Apellido',          key: 'surname',  type: 'text' },
    { label: 'Dirección',         key: 'address',  type: 'text' },
    { label: 'Nombre de trabajo', key: 'workName', type: 'text' },
  ];

  return (
    <div className="flex flex-col gap-6">
      {toast && <Toast msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />}

      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: '#FFFFFF' }}>
          <UserCircleIcon className="w-6 h-6" style={{ color: '#41D2F2' }} />
          Mi Perfil
        </h1>
      </div>

      {/* Layout lado a lado */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Izquierda: datos fijos */}
        <div className="rounded-2xl p-5 space-y-4"
          style={{ backgroundColor: '#162C5F', border: '1px solid rgba(65,210,242,0.1)' }}>
          <div className="flex items-center gap-2">
            <LockClosedIcon className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.3)' }} />
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.3)' }}>
              Información fija
            </p>
          </div>
          {fixedFields.map(({ label, value }) => (
            <div key={label}>
              <p className="text-xs mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>{label}</p>
              <div className="px-3 py-2.5 rounded-lg text-sm"
                style={{ backgroundColor: 'rgba(11,24,48,0.4)', color: value ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.2)', border: '1px solid rgba(65,210,242,0.06)' }}>
                {value || '—'}
              </div>
            </div>
          ))}
          <p className="text-xs pt-2" style={{ color: 'rgba(255,255,255,0.3)', borderTop: '1px solid rgba(65,210,242,0.06)', paddingTop: '0.75rem' }}>
            Para cambiar estos datos, comunícate con el banco.
          </p>
        </div>

        {/* Derecha: datos editables */}
        <div className="rounded-2xl p-5 space-y-4"
          style={{ backgroundColor: '#162C5F', border: '1px solid rgba(65,210,242,0.2)' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PencilSquareIcon className="w-4 h-4" style={{ color: '#41D2F2' }} />
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#41D2F2' }}>
                Datos editables
              </p>
            </div>
            {!editing && (
              <button onClick={() => setEditing(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold hover:opacity-80"
                style={{ backgroundColor: 'rgba(65,210,242,0.1)', color: '#41D2F2', border: '1px solid rgba(65,210,242,0.3)' }}>
                <PencilSquareIcon className="w-3.5 h-3.5" />
                Editar
              </button>
            )}
          </div>

          {fetching ? (
            <p className="text-sm" style={{ color: 'rgba(65,210,242,0.5)' }}>Cargando...</p>
          ) : (
            <>
              {editableFields.map(({ label, key }) => (
                <div key={key}>
                  <p className="text-xs mb-1" style={{ color: 'rgba(255,255,255,0.5)' }}>{label}</p>
                  {editing ? (
                    <>
                      <input type="text" value={form[key] ?? ''} onChange={set(key)}
                        className="w-full px-3 py-2.5 text-sm rounded-lg border focus:outline-none"
                        style={{ backgroundColor: '#0B1830', borderColor: errors[key] ? '#ef4444' : 'rgba(65,210,242,0.4)', color: '#FFFFFF' }} />
                      {errors[key] && <p className="text-red-400 text-xs mt-1">{errors[key]}</p>}
                    </>
                  ) : (
                    <div className="px-3 py-2.5 rounded-lg text-sm"
                      style={{ backgroundColor: 'rgba(11,24,48,0.3)', color: form[key] ? '#FFFFFF' : 'rgba(255,255,255,0.25)', border: '1px solid rgba(65,210,242,0.1)' }}>
                      {form[key] || '—'}
                    </div>
                  )}
                </div>
              ))}

              {/* Ingresos */}
              <div>
                <p className="text-xs mb-1" style={{ color: 'rgba(255,255,255,0.5)' }}>Ingresos mensuales</p>
                {editing ? (
                  <>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold" style={{ color: '#41D2F2' }}>Q</span>
                      <input type="number" step="0.01" value={form.monthlyIncome ?? ''}
                        onChange={set('monthlyIncome')}
                        className="w-full pl-8 pr-3 py-2.5 text-sm rounded-lg border focus:outline-none"
                        style={{ backgroundColor: '#0B1830', borderColor: errors.monthlyIncome ? '#ef4444' : 'rgba(65,210,242,0.4)', color: '#FFFFFF' }} />
                    </div>
                    {errors.monthlyIncome && <p className="text-red-400 text-xs mt-1">{errors.monthlyIncome}</p>}
                  </>
                ) : (
                  <div className="px-3 py-2.5 rounded-lg text-sm"
                    style={{ backgroundColor: 'rgba(11,24,48,0.3)', color: form.monthlyIncome ? '#FFE968' : 'rgba(255,255,255,0.25)', border: '1px solid rgba(65,210,242,0.1)' }}>
                    {form.monthlyIncome ? fmt(form.monthlyIncome) : '—'}
                  </div>
                )}
              </div>

              {editing && (
                <div className="flex gap-3 pt-1">
                  <button onClick={() => { setEditing(false); setErrors({}); }} className="flex-1 py-2.5 rounded-lg text-sm font-medium"
                    style={{ backgroundColor: 'rgba(65,210,242,0.08)', color: '#41D2F2', border: '1px solid rgba(65,210,242,0.2)' }}>
                    Cancelar
                  </button>
                  <button onClick={handleSave} disabled={loading} className="flex-1 py-2.5 rounded-lg text-sm font-bold disabled:opacity-60"
                    style={{ backgroundColor: '#41D2F2', color: '#0B1830' }}>
                    {loading ? 'Guardando...' : 'Guardar'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Estadísticas de cuentas abajo */}
      {accounts?.length > 0 && (
        <div className="rounded-2xl p-5"
          style={{ backgroundColor: '#162C5F', border: '1px solid rgba(65,210,242,0.15)' }}>
          <AccountStats accounts={accounts} />
        </div>
      )}
    </div>
  );
};