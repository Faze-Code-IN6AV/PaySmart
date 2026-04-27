import { useForm } from 'react-hook-form';
import { useAuthStore } from '../store/authStore.js';
import { useNavigate } from 'react-router-dom';
import { showSuccess, showError } from '../../../shared/utils/toast.js';

export const LoginForm = ({ onForgot, onRegister }) => {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const loading = useAuthStore((state) => state.loading);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    const res = await login(data);
    if (res.success) {
      // Ambos roles van al dashboard; las vistas internas se diferencian por rol
      navigate('/dashboard');
      showSuccess('¡Bienvenido a PaySmart!');
    } else {
      showError(res.error || 'Error al iniciar sesión');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-5'>
      <div>
        <label htmlFor='emailOrUsername' className='block text-sm font-medium mb-1.5' style={{ color: '#FFFFFF' }}>
          Email o Username
        </label>
        <input
          type='text'
          id='emailOrUsername'
          placeholder='email@example.com o username'
          className='w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2'
          style={{
            backgroundColor: '#0B1830',
            borderColor: '#41D2F2',
            color: '#FFFFFF',
            '--tw-ring-color': '#41D2F2',
          }}
          {...register('emailOrUsername', { required: 'El email o username es obligatorio' })}
        />
        {errors.emailOrUsername && (
          <p className='text-red-400 text-xs mt-1'>{errors.emailOrUsername.message}</p>
        )}
      </div>

      <div>
        <label htmlFor='password' className='block text-sm font-medium mb-1.5' style={{ color: '#FFFFFF' }}>
          Contraseña
        </label>
        <input
          type='password'
          id='password'
          placeholder='••••••••'
          className='w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2'
          style={{
            backgroundColor: '#0B1830',
            borderColor: '#41D2F2',
            color: '#FFFFFF',
          }}
          {...register('password', { required: 'La contraseña es obligatoria' })}
        />
        {errors.password && (
          <p className='text-red-400 text-xs mt-1'>{errors.password.message}</p>
        )}
      </div>

      <button
        type='submit'
        disabled={loading}
        className='w-full font-medium py-2.5 px-4 rounded-lg transition-opacity duration-200 text-sm disabled:opacity-60'
        style={{ backgroundColor: '#41D2F2', color: '#0B1830' }}
      >
        {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
      </button>

      <p className='text-center text-sm' style={{ color: '#FFFFFF' }}>
        <button
          type='button'
          onClick={onForgot}
          className='hover:underline cursor-pointer'
          style={{ color: '#41D2F2' }}
        >
          ¿Olvidaste tu contraseña?
        </button>
      </p>

      <p className='text-center text-sm' style={{ color: '#FFFFFF' }}>
        ¿No tienes cuenta?{' '}
        <button
          type='button'
          onClick={onRegister}
          className='hover:underline cursor-pointer font-semibold'
          style={{ color: '#FFE968' }}
        >
          Regístrate aquí
        </button>
      </p>
    </form>
  );
};
