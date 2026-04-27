import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { XMarkIcon, MagnifyingGlassIcon, BanknotesIcon } from '@heroicons/react/24/outline';

/**
 * AccountBalanceModal
 * Props:
 *   isOpen: boolean
 *   onClose: () => void
 *   onQuery: (accountNumber: string) => Promise<{ accountNumber, balance }>
 *   isAdmin: boolean — si es admin muestra el endpoint interno (sin restricción de owner)
 */
export const AccountBalanceModal = ({ isOpen, onClose, onQuery, isAdmin = false }) => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [queryError, setQueryError] = useState('');

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const handleClose = () => {
    reset();
    setResult(null);
    setQueryError('');
    onClose();
  };

  const onSubmit = async ({ accountNumber }) => {
    setLoading(true);
    setResult(null);
    setQueryError('');
    try {
      const data = await onQuery(accountNumber.trim());
      setResult(data);
    } catch (err) {
      setQueryError(err.response?.data?.message || 'No se pudo obtener el saldo');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center p-4'
      style={{ backgroundColor: 'rgba(11,24,48,0.85)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div
        className='w-full max-w-sm rounded-2xl shadow-2xl animate-fadeIn'
        style={{ backgroundColor: '#162C5F', border: '1px solid #41D2F2' }}
      >
        {/* Header */}
        <div
          className='flex items-center justify-between px-6 py-4 rounded-t-2xl'
          style={{ borderBottom: '1px solid rgba(65,210,242,0.2)' }}
        >
          <div>
            <h2 className='text-lg font-bold' style={{ color: '#FFFFFF' }}>
              Consultar Saldo
            </h2>
            <p className='text-xs mt-0.5' style={{ color: '#41D2F2' }}>
              {isAdmin ? 'Consulta interna — acceso de administrador' : 'Ingresa el número de cuenta'}
            </p>
          </div>
          <button onClick={handleClose} className='p-1.5 rounded-lg hover:opacity-70' style={{ color: '#41D2F2' }}>
            <XMarkIcon className='w-5 h-5' />
          </button>
        </div>

        <div className='px-6 py-5 space-y-4'>
          {/* Formulario */}
          <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
            <div>
              <label className='block text-sm font-medium mb-1.5' style={{ color: '#FFFFFF' }}>
                Número de cuenta
              </label>
              <input
                type='text'
                placeholder='Ej. 123456789012345678'
                maxLength={18}
                className='w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 font-mono'
                style={{ backgroundColor: '#0B1830', borderColor: '#41D2F2', color: '#FFFFFF' }}
                {...register('accountNumber', {
                  required: 'El número de cuenta es requerido',
                  minLength: { value: 10, message: 'Número de cuenta inválido' },
                })}
              />
              {errors.accountNumber && (
                <p className='text-red-400 text-xs mt-1'>{errors.accountNumber.message}</p>
              )}
            </div>

            <button
              type='submit'
              disabled={loading}
              className='w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-opacity disabled:opacity-60'
              style={{ backgroundColor: '#41D2F2', color: '#0B1830' }}
            >
              <MagnifyingGlassIcon className='w-4 h-4' />
              {loading ? 'Consultando...' : 'Consultar'}
            </button>
          </form>

          {/* Resultado */}
          {result && (
            <div
              className='rounded-xl p-4 space-y-3 animate-fadeIn'
              style={{ backgroundColor: 'rgba(65,210,242,0.08)', border: '1px solid rgba(65,210,242,0.3)' }}
            >
              <div className='flex items-center gap-2'>
                <BanknotesIcon className='w-5 h-5' style={{ color: '#41D2F2' }} />
                <span className='text-sm font-semibold' style={{ color: '#41D2F2' }}>
                  Resultado
                </span>
              </div>
              <div className='space-y-2'>
                <div className='flex justify-between items-center'>
                  <span className='text-xs' style={{ color: 'rgba(255,255,255,0.6)' }}>N° Cuenta</span>
                  <span className='text-xs font-mono font-semibold' style={{ color: '#FFFFFF' }}>
                    {result.accountNumber}
                  </span>
                </div>
                <div
                  className='flex justify-between items-center pt-2'
                  style={{ borderTop: '1px solid rgba(65,210,242,0.15)' }}
                >
                  <span className='text-sm font-medium' style={{ color: 'rgba(255,255,255,0.8)' }}>Saldo disponible</span>
                  <span className='text-xl font-bold' style={{ color: '#FFE968' }}>
                    Q{Number(result.balance).toLocaleString('es-GT', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Error */}
          {queryError && (
            <div
              className='rounded-lg px-4 py-3 text-sm text-center animate-fadeIn'
              style={{ backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5' }}
            >
              {queryError}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};