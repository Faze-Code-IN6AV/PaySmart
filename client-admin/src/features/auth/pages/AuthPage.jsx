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
      className='min-h-screen flex items-center justify-center p-4 relative overflow-hidden'
      style={{ backgroundColor: '#0B1830' }}
    >
      {/* Fondo decorativo elegante */}
      <div className='absolute inset-0 pointer-events-none' style={{ zIndex: 0 }}>
        <div style={{
          position: 'absolute', top: '-180px', left: '-160px',
          width: '520px', height: '520px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(65,210,242,0.10) 0%, transparent 70%)',
        }} />
        <div style={{
          position: 'absolute', bottom: '-220px', right: '-180px',
          width: '600px', height: '600px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,233,104,0.06) 0%, transparent 70%)',
        }} />
        <div style={{
          position: 'absolute', top: '20%', right: '8%',
          width: '260px', height: '260px', borderRadius: '50%',
          border: '1px solid rgba(65,210,242,0.1)',
        }} />
        <div style={{
          position: 'absolute', top: '26%', right: '11%',
          width: '160px', height: '160px', borderRadius: '50%',
          border: '1px solid rgba(65,210,242,0.14)',
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
        className='w-full max-w-xl rounded-xl shadow-2xl p-6 md:p-10 animate-fadeIn relative'
        style={{ backgroundColor: '#162C5F', border: '1px solid #41D2F2', zIndex: 1 }}
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