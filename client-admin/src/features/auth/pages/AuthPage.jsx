import { useState } from 'react';
import { LoginForm } from '../components/LoginForm.jsx';
import { ForgotPassword } from '../components/ForgotPassword.jsx';
import logo from '../../../assets/img/paysmart_logo.png';

const VIEWS = {
  login: {
    title: 'Iniciar Sesión',
    subtitle: 'Ingresa tus credenciales para acceder a PaySmart',
  },
  forgot: {
    title: 'Recuperar Contraseña',
    subtitle: 'Ingresa tu correo para recuperar tu contraseña',
  },
};

export const AuthPage = () => {
  const [view, setView] = useState('login');
  const { title, subtitle } = VIEWS[view] ?? VIEWS.login;

  return (
    <div
      className='min-h-screen flex items-center justify-center p-4'
      style={{ backgroundColor: '#0B1830' }}
    >
      <div
        className='w-full max-w-xl rounded-xl shadow-2xl p-6 md:p-10 animate-fadeIn'
        style={{ backgroundColor: '#162C5F', border: '1px solid #41D2F2' }}
      >
        <div className='flex justify-center mb-6'>
          <img src={logo} alt='PaySmart Logo' className='h-20 w-auto object-contain' />
        </div>

        <div className='text-center mb-6'>
          <h1 className='text-2xl lg:text-3xl font-bold mb-2' style={{ color: '#FFFFFF' }}>
            {title}
          </h1>
          <p className='text-base max-w-md mx-auto' style={{ color: '#41D2F2' }}>
            {subtitle}
          </p>
        </div>

        {view === 'login' && (
          <LoginForm onForgot={() => setView('forgot')} />
        )}

        {view === 'forgot' && (
          <ForgotPassword onSwitch={() => setView('login')} />
        )}

        {view === 'login' && (
          <p className='text-center text-xs mt-4' style={{ color: 'rgba(255,255,255,0.3)' }}>
            Las cuentas son creadas únicamente por el administrador del banco.
          </p>
        )}
      </div>
    </div>
  );
};