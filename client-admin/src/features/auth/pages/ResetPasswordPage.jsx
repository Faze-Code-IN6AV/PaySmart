import { useForm } from 'react-hook-form';
import { useLocation, useNavigate } from 'react-router-dom';
import { resetPassword } from '../../../shared/api';
import { showSuccess, showError } from '../../../shared/utils/toast.js';
import { useState } from 'react';
import logo from '../../../assets/img/paysmart_logo.png';

export const ResetPasswordPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const token = new URLSearchParams(location.search).get('token');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const onSubmit = async ({ newPassword }) => {
    if (!token) {
      showError('Token inválido o expirado. Solicita un nuevo enlace.');
      return;
    }

    try {
      setLoading(true);
      await resetPassword(token, newPassword);
      setDone(true);
      showSuccess('¡Contraseña restablecida correctamente!');
      setTimeout(() => navigate('/'), 2500);
    } catch (err) {
      const message = err.response?.data?.message || 'Error al restablecer la contraseña';
      showError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className='min-h-screen flex items-center justify-center p-4 relative overflow-hidden'
      style={{ backgroundColor: '#0B1830' }}
    >
      {/* Fondo decorativo elegante */}
      <div className='absolute inset-0 pointer-events-none' style={{ zIndex: 0 }}>
        <div style={{
          position: 'absolute', top: '-180px', right: '-160px',
          width: '520px', height: '520px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(65,210,242,0.10) 0%, transparent 70%)',
        }} />
        <div style={{
          position: 'absolute', bottom: '-220px', left: '-180px',
          width: '600px', height: '600px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,233,104,0.06) 0%, transparent 70%)',
        }} />
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'radial-gradient(circle, rgba(65,210,242,0.06) 1px, transparent 1px)',
          backgroundSize: '26px 26px',
          maskImage: 'radial-gradient(ellipse at center, black 0%, transparent 70%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, black 0%, transparent 70%)',
        }} />
      </div>

      <div
        className='w-full max-w-md rounded-xl shadow-2xl p-6 md:p-10 animate-fadeIn relative'
        style={{ backgroundColor: '#162C5F', border: '1px solid #41D2F2', zIndex: 1 }}
      >
        <div className='flex justify-center mb-6'>
          <img src={logo} alt='PaySmart Logo' className='h-16 w-auto object-contain' />
        </div>

        <div className='text-center mb-6'>
          <h1 className='text-2xl font-bold mb-2' style={{ color: '#FFFFFF' }}>
            {done ? '¡Listo!' : 'Nueva Contraseña'}
          </h1>
          <p className='text-sm' style={{ color: '#41D2F2' }}>
            {done
              ? 'Tu contraseña fue actualizada. Redirigiendo al login...'
              : 'Ingresa tu nueva contraseña para recuperar el acceso.'}
          </p>
        </div>

        {!done && (
          <form onSubmit={handleSubmit(onSubmit)} className='space-y-5'>
            {!token && (
              <p className='text-center text-sm text-red-400'>
                El enlace es inválido o ha expirado. Por favor solicita uno nuevo.
              </p>
            )}

            <div>
              <label className='block text-sm font-medium mb-1.5' style={{ color: '#FFFFFF' }}>
                Nueva Contraseña
              </label>
              <input
                type='password'
                placeholder='••••••••'
                className='w-full px-3 py-2 text-sm border rounded-lg focus:outline-none'
                style={{ backgroundColor: '#0B1830', borderColor: '#41D2F2', color: '#FFFFFF' }}
                {...register('newPassword', {
                  required: 'La nueva contraseña es obligatoria',
                  minLength: { value: 8, message: 'Mínimo 8 caracteres' },
                })}
              />
              {errors.newPassword && (
                <p className='text-red-400 text-xs mt-1'>{errors.newPassword.message}</p>
              )}
            </div>

            <div>
              <label className='block text-sm font-medium mb-1.5' style={{ color: '#FFFFFF' }}>
                Confirmar Contraseña
              </label>
              <input
                type='password'
                placeholder='••••••••'
                className='w-full px-3 py-2 text-sm border rounded-lg focus:outline-none'
                style={{ backgroundColor: '#0B1830', borderColor: '#41D2F2', color: '#FFFFFF' }}
                {...register('confirmPassword', {
                  required: 'Confirma tu contraseña',
                  validate: (val) =>
                    val === watch('newPassword') || 'Las contraseñas no coinciden',
                })}
              />
              {errors.confirmPassword && (
                <p className='text-red-400 text-xs mt-1'>{errors.confirmPassword.message}</p>
              )}
            </div>

            <button
              type='submit'
              disabled={loading || !token}
              className='w-full font-medium py-2.5 px-4 rounded-lg transition-opacity text-sm disabled:opacity-60'
              style={{ backgroundColor: '#41D2F2', color: '#0B1830' }}
            >
              {loading ? 'Guardando...' : 'Guardar Contraseña'}
            </button>

            <p className='text-center text-sm'>
              <button
                type='button'
                onClick={() => navigate('/')}
                className='hover:underline cursor-pointer'
                style={{ color: '#41D2F2' }}
              >
                ← Volver al Login
              </button>
            </p>
          </form>
        )}

        {done && (
          <div className='text-center'>
            <div className='text-5xl mb-4'>✅</div>
            <button
              onClick={() => navigate('/')}
              className='px-6 py-2.5 rounded-lg font-medium text-sm'
              style={{ backgroundColor: '#41D2F2', color: '#0B1830' }}
            >
              Ir al Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
};