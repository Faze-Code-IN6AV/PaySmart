import { useForm } from 'react-hook-form';
import { useAuthStore } from '../store/authStore.js';
import { showSuccess, showError } from '../../../shared/utils/toast.js';

const inputStyle = {
  backgroundColor: '#0B1830',
  borderColor: '#41D2F2',
  color: '#FFFFFF',
};

export const RegisterForm = ({ onSwitch, onVerificationSent }) => {
  const register_ = useAuthStore((state) => state.register);
  const loading = useAuthStore((state) => state.loading);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    // El backend espera multipart/form-data
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('surname', data.surname);
    formData.append('username', data.username);
    formData.append('email', data.email);
    formData.append('password', data.password);
    formData.append('phone', data.phone);

    const res = await register_(formData);

    if (res.success) {
      showSuccess('¡Registro exitoso! Revisa tu correo para verificar tu cuenta.');
      // Notifica al padre para mostrar la vista de verificación pendiente
      onVerificationSent && onVerificationSent(data.email);
    } else {
      showError(res.error || 'Error al registrar usuario');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
      <div className='grid grid-cols-2 gap-4'>
        <div>
          <label className='block text-sm font-medium mb-1.5' style={{ color: '#FFFFFF' }}>
            Nombre
          </label>
          <input
            type='text'
            placeholder='Juan'
            className='w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2'
            style={inputStyle}
            {...register('name', { required: 'El nombre es obligatorio', maxLength: { value: 25, message: 'Máximo 25 caracteres' } })}
          />
          {errors.name && <p className='text-red-400 text-xs mt-1'>{errors.name.message}</p>}
        </div>

        <div>
          <label className='block text-sm font-medium mb-1.5' style={{ color: '#FFFFFF' }}>
            Apellido
          </label>
          <input
            type='text'
            placeholder='Pérez'
            className='w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2'
            style={inputStyle}
            {...register('surname', { required: 'El apellido es obligatorio', maxLength: { value: 25, message: 'Máximo 25 caracteres' } })}
          />
          {errors.surname && <p className='text-red-400 text-xs mt-1'>{errors.surname.message}</p>}
        </div>
      </div>

      <div>
        <label className='block text-sm font-medium mb-1.5' style={{ color: '#FFFFFF' }}>
          Username
        </label>
        <input
          type='text'
          placeholder='juanperez'
          className='w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2'
          style={inputStyle}
          {...register('username', {
            required: 'El username es obligatorio',
            minLength: { value: 3, message: 'Mínimo 3 caracteres' },
            maxLength: { value: 20, message: 'Máximo 20 caracteres' },
            pattern: { value: /^[a-zA-Z0-9_]+$/, message: 'Solo letras, números y guión bajo (_)' },
          })}
        />
        {errors.username && <p className='text-red-400 text-xs mt-1'>{errors.username.message}</p>}
      </div>

      <div>
        <label className='block text-sm font-medium mb-1.5' style={{ color: '#FFFFFF' }}>
          Email
        </label>
        <input
          type='email'
          placeholder='email@example.com'
          className='w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2'
          style={inputStyle}
          {...register('email', {
            required: 'El email es obligatorio',
            pattern: { value: /^\S+@\S+\.\S+$/, message: 'Email inválido' },
          })}
        />
        {errors.email && <p className='text-red-400 text-xs mt-1'>{errors.email.message}</p>}
      </div>

      <div>
        <label className='block text-sm font-medium mb-1.5' style={{ color: '#FFFFFF' }}>
          Contraseña
        </label>
        <input
          type='password'
          placeholder='••••••••'
          className='w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2'
          style={inputStyle}
          {...register('password', {
            required: 'La contraseña es obligatoria',
            minLength: { value: 8, message: 'Mínimo 8 caracteres' },
          })}
        />
        {errors.password && <p className='text-red-400 text-xs mt-1'>{errors.password.message}</p>}
      </div>

      <div>
        <label className='block text-sm font-medium mb-1.5' style={{ color: '#FFFFFF' }}>
          Confirmar Contraseña
        </label>
        <input
          type='password'
          placeholder='••••••••'
          className='w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2'
          style={inputStyle}
          {...register('confirmPassword', {
            required: 'Confirma tu contraseña',
            validate: (val) => val === watch('password') || 'Las contraseñas no coinciden',
          })}
        />
        {errors.confirmPassword && <p className='text-red-400 text-xs mt-1'>{errors.confirmPassword.message}</p>}
      </div>

      <div>
        <label className='block text-sm font-medium mb-1.5' style={{ color: '#FFFFFF' }}>
          Teléfono <span className='text-xs opacity-60'>(8 dígitos)</span>
        </label>
        <input
          type='text'
          placeholder='50201234567'
          className='w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2'
          style={inputStyle}
          {...register('phone', {
            required: 'El teléfono es obligatorio',
            pattern: { value: /^\d{8}$/, message: 'Debe contener exactamente 8 dígitos numéricos' },
          })}
        />
        {errors.phone && <p className='text-red-400 text-xs mt-1'>{errors.phone.message}</p>}
      </div>

      <button
        type='submit'
        disabled={loading}
        className='w-full font-medium py-2.5 px-4 rounded-lg transition-opacity duration-200 text-sm disabled:opacity-60'
        style={{ backgroundColor: '#41D2F2', color: '#0B1830' }}
      >
        {loading ? 'Registrando...' : 'Crear Cuenta'}
      </button>

      <p className='text-center text-sm' style={{ color: '#FFFFFF' }}>
        ¿Ya tienes cuenta?{' '}
        <button
          type='button'
          onClick={onSwitch}
          className='hover:underline cursor-pointer font-semibold'
          style={{ color: '#41D2F2' }}
        >
          Iniciar Sesión
        </button>
      </p>
    </form>
  );
};