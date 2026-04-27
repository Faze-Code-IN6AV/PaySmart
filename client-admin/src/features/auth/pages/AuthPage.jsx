import { useState } from 'react';
import { LoginForm } from '../components/LoginForm.jsx';
import { ForgotPassword } from '../components/ForgotPassword.jsx';
import { RegisterForm } from '../components/Register.jsx';
import { ResendVerification } from '../components/ResendVerification.jsx';
import logo from '../../../assets/img/paysmart_logo.png';

const VIEWS = {
  login: {
    title: 'Iniciar Sesión',
    subtitle: 'Ingresa tus credenciales para acceder a PaySmart',
  },
  register: {
    title: 'Crear Cuenta',
    subtitle: 'Completa los datos para registrarte en PaySmart',
  },
  forgot: {
    title: 'Recuperar Contraseña',
    subtitle: 'Ingresa tu correo para recuperar tu contraseña',
  },
  resend: {
    title: 'Reenviar Verificación',
    subtitle: 'Solicita un nuevo enlace de verificación',
  },
};

export const AuthPage = () => {
  const [view, setView] = useState('login');
  // Guarda el email tras el registro para pre-llenar el resend
  const [registeredEmail, setRegisteredEmail] = useState('');

  const { title, subtitle } = VIEWS[view] ?? VIEWS.login;

  const handleVerificationSent = (email) => {
    setRegisteredEmail(email);
    setView('resend');
  };

  return (
    <div
      className='min-h-screen flex items-center justify-center p-4'
      style={{ backgroundColor: '#0B1830' }}
    >
      <div
        className='w-full max-w-xl rounded-xl shadow-2xl p-6 md:p-10 animate-fadeIn'
        style={{ backgroundColor: '#162C5F', border: '1px solid #41D2F2' }}
      >
        {/* Logo */}
        <div className='flex justify-center mb-6'>
          <img src={logo} alt='PaySmart Logo' className='h-20 w-auto object-contain' />
        </div>

        {/* Encabezado */}
        <div className='text-center mb-6'>
          <h1 className='text-2xl lg:text-3xl font-bold mb-2' style={{ color: '#FFFFFF' }}>
            {title}
          </h1>
          <p className='text-base max-w-md mx-auto' style={{ color: '#41D2F2' }}>
            {subtitle}
          </p>
        </div>

        {/* Vistas */}
        {view === 'login' && (
          <LoginForm
            onForgot={() => setView('forgot')}
            onRegister={() => setView('register')}
          />
        )}

        {view === 'register' && (
          <RegisterForm
            onSwitch={() => setView('login')}
            onVerificationSent={handleVerificationSent}
          />
        )}

        {view === 'forgot' && (
          <ForgotPassword onSwitch={() => setView('login')} />
        )}

        {view === 'resend' && (
          <ResendVerification
            defaultEmail={registeredEmail}
            onSwitch={() => setView('login')}
          />
        )}

        {/* Link de reenvío desde login */}
        {view === 'login' && (
          <p className='text-center text-xs mt-4' style={{ color: '#FFFFFF' }}>
            ¿No recibiste el correo de verificación?{' '}
            <button
              type='button'
              onClick={() => setView('resend')}
              className='hover:underline cursor-pointer'
              style={{ color: '#FFE968' }}
            >
              Reenviar verificación
            </button>
          </p>
        )}
      </div>
    </div>
  );
};
