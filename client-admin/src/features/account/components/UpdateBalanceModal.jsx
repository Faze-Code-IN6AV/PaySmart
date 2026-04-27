import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { XMarkIcon, ArrowUpCircleIcon, ArrowDownCircleIcon } from '@heroicons/react/24/outline';

/**
 * UpdateBalanceModal — Solo ADMIN_ROLE
 * Props:
 *   isOpen: boolean
 *   onClose: () => void
 *   onSubmit: (accountNumber, { amount, type }) => Promise<void>
 *   loading: boolean
 */
export const UpdateBalanceModal = ({ isOpen, onClose, onSubmit, loading = false }) => {
  const [opType, setOpType] = useState('DEPOSIT');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const handleClose = () => {
    reset();
    setSuccessMsg('');
    setErrorMsg('');
    setOpType('DEPOSIT');
    onClose();
  };

  const handleFormSubmit = async (data) => {
    setSuccessMsg('');
    setErrorMsg('');
    try {
      await onSubmit(data.accountNumber.trim(), { amount: Number(data.amount), type: opType });
      setSuccessMsg(`Operación ${opType === 'DEPOSIT' ? 'de depósito' : 'de retiro'} realizada exitosamente.`);
      reset();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Error al actualizar el saldo');
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
        style={{ backgroundColor: '#162C5F', border: '1px solid #FFE968' }}
      >
        {/* Header — amarillo para indicar acción de admin */}
        <div
          className='flex items-center justify-between px-6 py-4 rounded-t-2xl'
          style={{ borderBottom: '1px solid rgba(255,233,104,0.2)' }}
        >
          <div>
            <h2 className='text-lg font-bold' style={{ color: '#FFE968' }}>
              Actualizar Saldo
            </h2>
            <p className='text-xs mt-0.5' style={{ color: 'rgba(255,255,255,0.6)' }}>
              Acción exclusiva de administrador
            </p>
          </div>
          <button onClick={handleClose} className='p-1.5 rounded-lg hover:opacity-70' style={{ color: '#FFE968' }}>
            <XMarkIcon className='w-5 h-5' />
          </button>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className='px-6 py-5 space-y-5'>
          {/* Tipo de operación */}
          <div>
            <label className='block text-sm font-medium mb-2' style={{ color: '#FFFFFF' }}>
              Tipo de operación
            </label>
            <div className='grid grid-cols-2 gap-2'>
              {[
                { value: 'DEPOSIT', label: 'Depósito', Icon: ArrowUpCircleIcon, color: '#41D2F2' },
                { value: 'WITHDRAW', label: 'Retiro', Icon: ArrowDownCircleIcon, color: '#FFE968' },
              ].map(({ value, label, Icon, color }) => {
                const isSelected = opType === value;
                return (
                  <button
                    key={value}
                    type='button'
                    onClick={() => setOpType(value)}
                    className='flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all'
                    style={{
                      backgroundColor: isSelected ? `${color}22` : 'rgba(11,24,48,0.6)',
                      border: `2px solid ${isSelected ? color : 'rgba(255,255,255,0.1)'}`,
                      color: isSelected ? color : 'rgba(255,255,255,0.5)',
                    }}
                  >
                    <Icon className='w-4 h-4' />
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Número de cuenta */}
          <div>
            <label className='block text-sm font-medium mb-1.5' style={{ color: '#FFFFFF' }}>
              Número de cuenta
            </label>
            <input
              type='text'
              maxLength={18}
              placeholder='Ej. 123456789012345678'
              className='w-full px-3 py-2 text-sm border rounded-lg focus:outline-none font-mono'
              style={{ backgroundColor: '#0B1830', borderColor: '#FFE968', color: '#FFFFFF' }}
              {...register('accountNumber', { required: 'El número de cuenta es requerido' })}
            />
            {errors.accountNumber && (
              <p className='text-red-400 text-xs mt-1'>{errors.accountNumber.message}</p>
            )}
          </div>

          {/* Monto */}
          <div>
            <label className='block text-sm font-medium mb-1.5' style={{ color: '#FFFFFF' }}>
              Monto (GTQ)
            </label>
            <div className='relative'>
              <span
                className='absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold'
                style={{ color: '#FFE968' }}
              >
                Q
              </span>
              <input
                type='number'
                step='0.01'
                min='0.01'
                placeholder='0.00'
                className='w-full pl-8 pr-3 py-2 text-sm border rounded-lg focus:outline-none'
                style={{ backgroundColor: '#0B1830', borderColor: '#FFE968', color: '#FFFFFF' }}
                {...register('amount', {
                  required: 'El monto es requerido',
                  min: { value: 0.01, message: 'El monto debe ser mayor a 0' },
                })}
              />
            </div>
            {errors.amount && (
              <p className='text-red-400 text-xs mt-1'>{errors.amount.message}</p>
            )}
          </div>

          {/* Feedback */}
          {successMsg && (
            <div className='rounded-lg px-3 py-2 text-xs text-center animate-fadeIn'
              style={{ backgroundColor: 'rgba(65,210,242,0.1)', border: '1px solid rgba(65,210,242,0.3)', color: '#41D2F2' }}>
              ✓ {successMsg}
            </div>
          )}
          {errorMsg && (
            <div className='rounded-lg px-3 py-2 text-xs text-center animate-fadeIn'
              style={{ backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5' }}>
              {errorMsg}
            </div>
          )}

          <div className='flex gap-3'>
            <button type='button' onClick={handleClose}
              className='flex-1 py-2.5 rounded-lg text-sm font-medium hover:opacity-70'
              style={{ backgroundColor: 'rgba(255,233,104,0.08)', color: '#FFE968', border: '1px solid rgba(255,233,104,0.25)' }}>
              Cancelar
            </button>
            <button type='submit' disabled={loading}
              className='flex-1 py-2.5 rounded-lg text-sm font-bold disabled:opacity-60'
              style={{ backgroundColor: '#FFE968', color: '#0B1830' }}>
              {loading ? 'Procesando...' : 'Confirmar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};