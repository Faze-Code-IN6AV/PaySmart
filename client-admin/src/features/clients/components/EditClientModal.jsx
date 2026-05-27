import { useState, useCallback } from 'react';
import { XMarkIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { updateClient } from '../../../shared/api/admin';

export const EditClientModal = ({ client, onClose, onUpdated }) => {
  const [form, setForm] = useState({
    name:          client.name    || '',
    surname:       client.surname || '',
    phone:         client.phone   || '',
    address:       client.address || '',
    workName:      client.workName || '',
    monthlyIncome: client.monthlyIncome || '',
  });
  const [errors, setErrors]           = useState({});
  const [loading, setLoading]         = useState(false);
  const [serverError, setServerError] = useState('');

  const set = useCallback((field) => (e) =>
    setForm((p) => ({ ...p, [field]: e.target.value })), []);

  const validate = () => {
    const e = {};

    if (!form.name.trim())
      e.name = 'El nombre no puede estar vacío';

    if (!form.surname.trim())
      e.surname = 'El apellido no puede estar vacío';

    if (!form.phone.trim())
      e.phone = 'El teléfono no puede estar vacío';
    else if (!form.phone.match(/^\d{8}$/))
      e.phone = 'Debe tener exactamente 8 dígitos';

    if (!form.workName.trim())
      e.workName = 'El nombre de trabajo no puede estar vacío';

    if (!form.address.trim())
      e.address = 'La dirección no puede estar vacía';

    if (!form.monthlyIncome)
      e.monthlyIncome = 'Los ingresos mensuales no pueden estar vacíos';
    else if (Number(form.monthlyIncome) < 100)
      e.monthlyIncome = 'Mínimo Q100.00';

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    setServerError('');
    try {
      const payload = { ...form };
      if (payload.monthlyIncome) payload.monthlyIncome = Number(payload.monthlyIncome);
      await updateClient(client.id, payload);
      onUpdated();
      onClose();
    } catch (err) {
      setServerError(err?.response?.data?.message || 'Error al actualizar el cliente');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(11,24,48,0.9)', backdropFilter: 'blur(4px)' }}
    >
      <div
        className="w-full max-w-lg rounded-2xl shadow-2xl"
        style={{ backgroundColor: '#162C5F', border: '1px solid #41D2F2' }}
      >
        <div
          className="flex items-center justify-between px-6 py-4 rounded-t-2xl"
          style={{ borderBottom: '1px solid rgba(65,210,242,0.2)' }}
        >
          <div>
            <h2 className="text-lg font-bold" style={{ color: '#FFFFFF' }}>Editar Cliente</h2>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.45)' }}>
              DPI y contraseña no pueden modificarse
            </p>
          </div>
          <button onClick={onClose} style={{ color: '#41D2F2' }}>
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {serverError && (
            <div
              className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm"
              style={{ backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5' }}
            >
              <ExclamationTriangleIcon className="w-4 h-4 flex-shrink-0" />
              {serverError}
            </div>
          )}

          {/* Info no editable */}
          <div
            className="grid grid-cols-2 gap-3 p-3 rounded-lg"
            style={{ backgroundColor: 'rgba(11,24,48,0.4)', border: '1px solid rgba(65,210,242,0.1)' }}
          >
            <div>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Username</p>
              <p className="text-sm font-mono font-semibold" style={{ color: '#41D2F2' }}>{client.username}</p>
            </div>
            <div>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>DPI (no editable)</p>
              <p className="text-sm font-mono font-semibold" style={{ color: '#FFE968' }}>{client.dpi || '—'}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: 'Nombre *',          field: 'name' },
              { label: 'Apellido *',        field: 'surname' },
              { label: 'Teléfono (8 díg.)', field: 'phone' },
              { label: 'Nombre de trabajo', field: 'workName' },
            ].map(({ label, field }) => (
              <div key={field}>
                <label className="block text-xs font-medium mb-1" style={{ color: 'rgba(255,255,255,0.7)' }}>
                  {label}
                </label>
                <input
                  type="text"
                  value={form[field]}
                  onChange={set(field)}
                  className="w-full px-3 py-2 text-sm rounded-lg border focus:outline-none"
                  style={{ backgroundColor: '#0B1830', borderColor: errors[field] ? '#ef4444' : '#41D2F2', color: '#FFFFFF' }}
                />
                {errors[field] && <p className="text-red-400 text-xs mt-1">{errors[field]}</p>}
              </div>
            ))}
          </div>

          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: 'rgba(255,255,255,0.7)' }}>Dirección</label>
            <input
              type="text"
              value={form.address}
              onChange={set('address')}
              className="w-full px-3 py-2 text-sm rounded-lg border focus:outline-none"
              style={{ backgroundColor: '#0B1830', borderColor: errors.address ? '#ef4444' : '#41D2F2', color: '#FFFFFF' }}
            />
            {errors.address && <p className="text-red-400 text-xs mt-1">{errors.address}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: 'rgba(255,255,255,0.7)' }}>Ingresos mensuales</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold" style={{ color: '#41D2F2' }}>Q</span>
              <input
                type="number"
                step="0.01"
                value={form.monthlyIncome}
                onChange={set('monthlyIncome')}
                className="w-full pl-8 pr-3 py-2 text-sm rounded-lg border focus:outline-none"
                style={{ backgroundColor: '#0B1830', borderColor: errors.monthlyIncome ? '#ef4444' : '#41D2F2', color: '#FFFFFF' }}
              />
            </div>
            {errors.monthlyIncome && <p className="text-red-400 text-xs mt-1">{errors.monthlyIncome}</p>}
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-lg text-sm font-medium hover:opacity-70"
              style={{ backgroundColor: 'rgba(65,210,242,0.1)', color: '#41D2F2', border: '1px solid rgba(65,210,242,0.3)' }}
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 py-2.5 rounded-lg text-sm font-bold disabled:opacity-60"
              style={{ backgroundColor: '#41D2F2', color: '#0B1830' }}
            >
              {loading ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};