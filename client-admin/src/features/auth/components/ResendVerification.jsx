import { useForm } from 'react-hook-form';
import { resendVerification } from '../../../shared/api';
import { showSuccess, showError } from '../../../shared/utils/toast.js';
import { useState } from 'react';

export const ResendVerification = ({ defaultEmail = '', onSwitch }) => {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ defaultValues: { email: defaultEmail } });

  const onSubmit = async ({ email }) => {
    try {
      setLoading(true);
      await resendVerification(email);
      setSent(true);
      showSuccess('Correo de verificación reenviado correctamente.');
    } catch (err) {
      const message = err.response?.data?.message || 'Error al reenviar la verificación';
      showError(message);
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className='space-y-5 text-center'>
        <div
          className='mx-auto w-16 h-16 rounded-full flex items-center justify-center text-3xl'
          style={{ backgroundColor: '#0B1830', border: '2px solid #41D2F2' }}
        >
          ✅
        </div>
        <p className='text-sm' style={{ color: '#FFFFFF' }}>
          Correo de verificación enviado. Revisa tu bandeja de entrada y sigue las instrucciones.
        </p>
        <button
          type='button'
          onClick={onSwitch}
          className='w-full font-medium py-2.5 px-4 rounded-lg text-sm'
          style={{ backgroundColor: '#41D2F2', color: '#0B1830' }}
        >
          Volver al Login
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-5'>
      <p className='text-sm text-center' style={{ color: '#41D2F2' }}>
        Ingresa tu correo y te enviaremos un nuevo enlace de verificación.
      </p>

      <div>
        <label htmlFor='email' className='block text-sm font-medium mb-1.5' style={{ color: '#FFFFFF' }}>
          Email
        </label>
        <input
          type='email'
          id='email'
          placeholder='email@example.com'
          className='w-full px-3 py-2 text-sm border rounded-lg focus:outline-none'
          style={{ backgroundColor: '#0B1830', borderColor: '#41D2F2', color: '#FFFFFF' }}
          {...register('email', {
            required: 'El email es obligatorio',
            pattern: { value: /^\S+@\S+\.\S+$/, message: 'Email inválido' },
          })}
        />
        {errors.email && <p className='text-red-400 text-xs mt-1'>{errors.email.message}</p>}
      </div>

      <button
        type='submit'
        disabled={loading}
        className='w-full font-medium py-2.5 px-4 rounded-lg transition-opacity text-sm disabled:opacity-60'
        style={{ backgroundColor: '#41D2F2', color: '#0B1830' }}
      >
        {loading ? 'Enviando...' : 'Reenviar Verificación'}
      </button>

      <p className='text-center text-sm' style={{ color: '#FFFFFF' }}>
        <button
          type='button'
          onClick={onSwitch}
          className='hover:underline cursor-pointer'
          style={{ color: '#41D2F2' }}
        >
          ← Volver al Login
        </button>
      </p>
    </form>
  );
};
