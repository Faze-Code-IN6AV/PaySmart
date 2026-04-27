import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useVerifyEmail } from '../hooks/useVerifyEmail.js';
import logo from '../../../assets/img/paysmart_logo.png';

export const VerifyEmailPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const token = new URLSearchParams(location.search).get('token');

  const handleFinish = useCallback(() => {
    // Redirige al login tras 2 segundos para que el toast sea visible
    setTimeout(() => navigate('/'), 2000);
  }, [navigate]);

  const { status, message } = useVerifyEmail(token, handleFinish);

  const displayMessage =
    status === 'loading' ? 'Verificando correo, por favor espera...' : message;

  const isSuccess = status === 'success';
  const isError = status === 'error';

  return (
    <div
      className='flex flex-col justify-center items-center h-screen px-4 gap-6'
      style={{ backgroundColor: '#0B1830' }}
    >
      <img src={logo} alt='PaySmart' className='w-28 h-28 object-contain' />

      {/* Ícono de estado */}
      {status !== 'loading' && (
        <div
          className='w-16 h-16 rounded-full flex items-center justify-center text-3xl'
          style={{
            backgroundColor: '#162C5F',
            border: `2px solid ${isSuccess ? '#22c55e' : '#ef4444'}`,
          }}
        >
          {isSuccess ? '✅' : '❌'}
        </div>
      )}

      {/* Spinner mientras carga */}
      {status === 'loading' && (
        <div
          className='w-12 h-12 rounded-full border-4 animate-spin'
          style={{ borderColor: '#41D2F2', borderTopColor: 'transparent' }}
        />
      )}

      <p
        className='text-lg font-semibold text-center max-w-md'
        style={{ color: isError ? '#ef4444' : '#FFFFFF' }}
        aria-live='polite'
      >
        {displayMessage}
      </p>

      {isError && (
        <button
          onClick={() => navigate('/')}
          className='mt-2 px-6 py-2.5 rounded-lg font-medium text-sm transition-opacity hover:opacity-90'
          style={{ backgroundColor: '#41D2F2', color: '#0B1830' }}
        >
          Volver al Login
        </button>
      )}
    </div>
  );
};
