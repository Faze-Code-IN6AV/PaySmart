import { useState, useCallback } from 'react';
import { XMarkIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { adminCreateClient } from '../../../shared/api/admin';

const EMPTY = {
  name: '', surname: '', username: '', email: '', password: '',
  phone: '', dpi: '', address: '', workName: '', monthlyIncome: '',
};

export const CreateClientModal = ({ onClose, onCreated }) => {
  const [form, setForm]         = useState(EMPTY);
  const [errors, setErrors]     = useState({});
  const [loading, setLoading]   = useState(false);
  const [serverError, setServerError] = useState('');

  const set = useCallback((field) => (e) =>
    setForm((p) => ({ ...p, [field]: e.target.value })), []);

  const validate = () => {
    const e = {};
    if (!form.name.trim())                        e.name    = 'Nombre requerido';
    if (!form.surname.trim())                     e.surname = 'Apellido requerido';
    if (!form.username.trim())                    e.username = 'Username requerido';
    if (!form.email.match(/^\S+@\S+\.\S+$/))      e.email   = 'Email inválido';
    if (form.password.length < 8)                 e.password = 'Mínimo 8 caracteres';
    if (!form.phone.match(/^\d{8}$/))             e.phone   = 'Debe tener 8 dígitos';
    if (!form.dpi.match(/^\d{13}$/))              e.dpi     = 'Debe tener 13 dígitos';
    if (!form.address.trim())                     e.address = 'Dirección requerida';
    if (!form.workName.trim())                    e.workName = 'Nombre de trabajo requerido';
    if (isNaN(Number(form.monthlyIncome)) || Number(form.monthlyIncome) < 100)
                                                  e.monthlyIncome = 'Mínimo Q100.00';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    setServerError('');
    try {
      await adminCreateClient({ ...form, monthlyIncome: Number(form.monthlyIncome) });
      onCreated();
      onClose();
    } catch (err) {
      setServerError(
        err?.response?.data?.message ||
        err?.message ||
        'Error al crear el cliente'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
      style={{ backgroundColor: 'rgba(11,24,48,0.9)', backdropFilter: 'blur(4px)' }}
    >
      <div
        className="w-full max-w-2xl rounded-2xl shadow-2xl my-8"
        style={{ backgroundColor: '#162C5F', border: '1px solid #41D2F2' }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 rounded-t-2xl"
          style={{ borderBottom: '1px solid rgba(65,210,242,0.2)' }}
        >
          <div>
            <h2 className="text-lg font-bold" style={{ color: '#FFFFFF' }}>Nuevo Cliente Bancario</h2>
            <p className="text-xs mt-0.5" style={{ color: '#41D2F2' }}>
              Solo el administrador puede crear cuentas de cliente
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: 'Nombre *',               field: 'name',     placeholder: 'Juan',              type: 'text' },
              { label: 'Apellido *',             field: 'surname',  placeholder: 'Pérez',             type: 'text' },
              { label: 'Username *',             field: 'username', placeholder: 'jperez01',          type: 'text' },
              { label: 'Correo electrónico *',   field: 'email',    placeholder: 'juan@correo.com',   type: 'email' },
              { label: 'Contraseña *',           field: 'password', placeholder: 'Mínimo 8 caracteres', type: 'password' },
              { label: 'Teléfono * (8 dígitos)', field: 'phone',    placeholder: '55551234',          type: 'text' },
              { label: 'DPI * (13 dígitos)',     field: 'dpi',      placeholder: '1234567890123',     type: 'text' },
              { label: 'Nombre de trabajo *',    field: 'workName', placeholder: 'Empresa XYZ',      type: 'text' },
            ].map(({ label, field, placeholder, type }) => (
              <div key={field}>
                <label className="block text-xs font-medium mb-1" style={{ color: 'rgba(255,255,255,0.7)' }}>
                  {label}
                </label>
                <input
                  type={type}
                  placeholder={placeholder}
                  value={form[field]}
                  onChange={set(field)}
                  className="w-full px-3 py-2 text-sm rounded-lg border focus:outline-none"
                  style={{
                    backgroundColor: '#0B1830',
                    borderColor: errors[field] ? '#ef4444' : '#41D2F2',
                    color: '#FFFFFF',
                  }}
                />
                {errors[field] && <p className="text-red-400 text-xs mt-1">{errors[field]}</p>}
              </div>
            ))}
          </div>

          {/* Dirección (full width) */}
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: 'rgba(255,255,255,0.7)' }}>
              Dirección *
            </label>
            <input
              type="text"
              placeholder="Zona 10, Ciudad de Guatemala"
              value={form.address}
              onChange={set('address')}
              className="w-full px-3 py-2 text-sm rounded-lg border focus:outline-none"
              style={{ backgroundColor: '#0B1830', borderColor: errors.address ? '#ef4444' : '#41D2F2', color: '#FFFFFF' }}
            />
            {errors.address && <p className="text-red-400 text-xs mt-1">{errors.address}</p>}
          </div>

          {/* Ingresos */}
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: 'rgba(255,255,255,0.7)' }}>
              Ingresos mensuales * (mínimo Q100.00)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold" style={{ color: '#41D2F2' }}>Q</span>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={form.monthlyIncome}
                onChange={set('monthlyIncome')}
                className="w-full pl-8 pr-3 py-2 text-sm rounded-lg border focus:outline-none"
                style={{ backgroundColor: '#0B1830', borderColor: errors.monthlyIncome ? '#ef4444' : '#41D2F2', color: '#FFFFFF' }}
              />
            </div>
            {errors.monthlyIncome && <p className="text-red-400 text-xs mt-1">{errors.monthlyIncome}</p>}
          </div>

          {/* Aviso */}
          <div
            className="flex items-start gap-2 px-3 py-2.5 rounded-lg text-xs"
            style={{ backgroundColor: 'rgba(255,233,104,0.07)', border: '1px solid rgba(255,233,104,0.2)', color: '#FFE968' }}
          >
            <ExclamationTriangleIcon className="w-4 h-4 flex-shrink-0 mt-0.5" />
            La cuenta se crea activa. El número de cuenta bancaria se genera automáticamente al crear la primera cuenta bancaria.
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
              {loading ? 'Creando...' : 'Crear Cliente'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};