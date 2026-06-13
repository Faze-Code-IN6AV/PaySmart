import { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import {
  CreditCardIcon, ArrowRightStartOnRectangleIcon, Bars3Icon, XMarkIcon,
  ShieldCheckIcon, HomeIcon, CubeIcon, UserGroupIcon, UserCircleIcon,
  DocumentChartBarIcon,
} from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/24/outline';
import { useAuthStore } from '../../features/auth/store/authStore.js';
import { useInactivityTimer } from '../../shared/hooks/useInactivityTimer.js';
import { InactivityWarningModal } from '../../shared/components/InactivityWarningModal.jsx';
import logo from '../../assets/img/paysmart_logo.png';

// Ítems de navegación para el ADMIN
const ADMIN_NAV = [
  { path: '/dashboard',          label: 'Inicio',        Icon: HomeIcon,             exact: true },
  { path: '/dashboard/clients',  label: 'Clientes',      Icon: UserGroupIcon },
  { path: '/dashboard/accounts', label: 'Cuentas',       Icon: CreditCardIcon },
  { path: '/dashboard/transactions', label: 'Transacciones', Icon: DocumentChartBarIcon },
  { path: '/dashboard/products', label: 'Productos',     Icon: CubeIcon },
];

// Ítems de navegación para el CLIENTE
const CLIENT_NAV = [
  { path: '/dashboard',              label: 'Inicio',        Icon: HomeIcon,         exact: true },
  { path: '/dashboard/accounts',     label: 'Mis Cuentas',   Icon: CreditCardIcon },
  { path: '/dashboard/transactions', label: 'Transacciones', Icon: DocumentChartBarIcon },
  { path: '/dashboard/products',     label: 'Productos',     Icon: CubeIcon },
  { path: '/dashboard/favorites',    label: 'Favoritas',     Icon: StarIcon },
  { path: '/dashboard/profile',      label: 'Mi Perfil',     Icon: UserCircleIcon },
];

// Mapa de rutas → etiqueta para el navbar
const ROUTE_LABELS = {
  '/dashboard':             { label: 'Inicio',        Icon: HomeIcon },
  '/dashboard/clients':     { label: 'Clientes',       Icon: UserGroupIcon },
  '/dashboard/accounts':    { label: 'Cuentas',        Icon: CreditCardIcon },
  '/dashboard/transactions':{ label: 'Transacciones',  Icon: DocumentChartBarIcon },
  '/dashboard/products':    { label: 'Productos',      Icon: CubeIcon },
  '/dashboard/favorites':   { label: 'Favoritas',      Icon: StarIcon },
  '/dashboard/profile':     { label: 'Mi Perfil',      Icon: UserCircleIcon },
};

// Hook para reloj en vivo
const useClock = () => {
  const [time, setTime] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return time;
};

export const DashboardLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isAdmin = user?.role === 'ADMIN_ROLE';
  const clock = useClock();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  // --- Inactividad ---
  const [warningSeconds, setWarningSeconds] = useState(null); // null = modal oculto

  const handleWarning = useCallback((secs) => {
    setWarningSeconds(secs);
  }, []);

  const handleActive = useCallback(() => {
    setWarningSeconds(null);
  }, []);

  useInactivityTimer({
    enabled: isAuthenticated,
    onWarning: handleWarning,
    onActive: handleActive,
  });

  // "Continuar sesión" desde el modal — basta con cerrar el modal;
  // el propio clic ya dispara handleActivity en el hook.
  const handleContinue = () => setWarningSeconds(null);
  // ------------------

  const handleLogout = () => { logout(); navigate('/'); };

  const isActive = (path, exact) =>
    exact ? location.pathname === path : location.pathname.startsWith(path);

  const navItems = isAdmin ? ADMIN_NAV : CLIENT_NAV;

  return (
    <div className='h-screen flex overflow-hidden' style={{ backgroundColor: '#0B1830' }}>
      {warningSeconds !== null && (
        <InactivityWarningModal
          secondsLeft={warningSeconds}
          onContinue={handleContinue}
        />
      )}

      <aside
        className='hidden lg:flex flex-col w-64 h-full flex-shrink-0'
        style={{ backgroundColor: '#162C5F', borderRight: '1px solid rgba(65,210,242,0.12)' }}
      >
        <SidebarContent
          user={user} isAdmin={isAdmin} navItems={navItems}
          isActive={isActive} navigate={navigate} onLogout={handleLogout}
        />
      </aside>

      {sidebarOpen && (
        <div className='fixed inset-0 z-40 lg:hidden'>
          <div
            className='absolute inset-0'
            style={{ backgroundColor: 'rgba(11,24,48,0.8)', backdropFilter: 'blur(3px)' }}
            onClick={() => setSidebarOpen(false)}
          />
          <aside
            className='absolute left-0 top-0 bottom-0 w-64 flex flex-col animate-fadeIn'
            style={{ backgroundColor: '#162C5F', borderRight: '1px solid rgba(65,210,242,0.15)' }}
          >
            <SidebarContent
              user={user} isAdmin={isAdmin} navItems={navItems}
              isActive={isActive}
              navigate={(path) => { navigate(path); setSidebarOpen(false); }}
              onLogout={handleLogout}
            />
          </aside>
        </div>
      )}

      <div className='flex-1 flex flex-col h-full overflow-y-auto'>
        <header
          style={{
            position: 'sticky', top: 0, zIndex: 30,
            flexShrink: 0,
            height: '56px',
            backgroundColor: '#162C5F',
            borderBottom: '1px solid rgba(65,210,242,0.1)',
            display: 'flex', alignItems: 'center',
          }}
        >

          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: '1px',
            background: 'linear-gradient(90deg, transparent 0%, rgba(65,210,242,0.4) 35%, rgba(65,210,242,0.4) 65%, transparent 100%)',
            pointerEvents: 'none',
          }} />

          <div style={{
            position: 'absolute', top: 0, bottom: 0, right: '8%',
            width: '180px',
            background: 'radial-gradient(ellipse at center, rgba(65,210,242,0.05) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />

          <div style={{ position: 'relative', zIndex: 1, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 28px 0 24px' }}>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button
                className='lg:hidden'
                style={{ color: '#41D2F2', background: 'none', border: 'none', cursor: 'pointer', padding: '6px', borderRadius: '8px', display: 'flex' }}
                onClick={() => setSidebarOpen(true)}
              >
                <Bars3Icon style={{ width: '20px', height: '20px' }} />
              </button>

              {(() => {
                const route = ROUTE_LABELS[location.pathname];
                const PageIcon = route?.Icon;
                return (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.22)', letterSpacing: '0.05em', fontWeight: 400 }}>
                      Dashboard
                    </span>
                    {route && (
                      <>
                        <span style={{ fontSize: '13px', color: 'rgba(65,210,242,0.35)', fontWeight: 300 }}>/</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          {PageIcon && <PageIcon style={{ width: '14px', height: '14px', color: '#41D2F2' }} />}
                          <span style={{ fontSize: '13px', fontWeight: 600, color: '#ffffff' }}>
                            {route.label}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                );
              })()}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'rgba(255,255,255,0.28)', fontSize: '12px', fontVariantNumeric: 'tabular-nums' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
                <span>{clock.toLocaleTimeString('es-GT', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}</span>
              </div>

              <div style={{ width: '1px', height: '20px', background: 'rgba(65,210,242,0.13)', flexShrink: 0 }} />

              {isAdmin ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, backgroundColor: 'rgba(255,233,104,0.1)', color: '#FFE968', border: '1px solid rgba(255,233,104,0.25)', flexShrink: 0 }}>
                  <ShieldCheckIcon style={{ width: '12px', height: '12px' }} />
                  Admin
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 600, backgroundColor: 'rgba(65,210,242,0.08)', color: '#41D2F2', border: '1px solid rgba(65,210,242,0.2)', flexShrink: 0 }}>
                  Cliente
                </div>
              )}

              {/* Nombre del usuario */}
              <span style={{
                fontSize: '13px', fontWeight: 600,
                color: isAdmin ? '#FFE968' : '#ffffff',
                maxWidth: '120px',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                flexShrink: 0,
              }}>
                {user?.firstName ?? user?.username ?? 'Usuario'}
              </span>

              <div style={{
                width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '12px', fontWeight: 700,
                background: isAdmin
                  ? 'linear-gradient(135deg, rgba(255,233,104,0.4), rgba(255,233,104,0.15))'
                  : 'linear-gradient(135deg, rgba(65,210,242,0.4), rgba(65,210,242,0.15))',
                color: isAdmin ? '#FFE968' : '#41D2F2',
                border: `1px solid ${isAdmin ? 'rgba(255,233,104,0.3)' : 'rgba(65,210,242,0.25)'}`,
                boxShadow: isAdmin ? '0 0 10px rgba(255,233,104,0.15)' : '0 0 10px rgba(65,210,242,0.15)',
              }}>
                {(user?.firstName?.[0] ?? user?.username?.[0] ?? 'U').toUpperCase()}
              </div>

            </div>
          </div>
        </header>

        <main className='flex-1 px-4 lg:px-8 py-6'>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

// ——— Sidebar content ———
const SidebarContent = ({ user, isAdmin, navItems, isActive, navigate, onLogout }) => (
  <div className='flex flex-col h-full' style={{ position: 'relative', overflow: 'hidden' }}>
    <div style={{
      position: 'absolute', top: '-60px', right: '-60px',
      width: '200px', height: '200px', borderRadius: '50%',
      border: '1px solid rgba(65,210,242,0.07)',
      pointerEvents: 'none', zIndex: 0,
    }} />

    <div style={{
      position: 'absolute', top: '-20px', right: '-20px',
      width: '110px', height: '110px', borderRadius: '50%',
      border: '1px solid rgba(65,210,242,0.1)',
      pointerEvents: 'none', zIndex: 0,
    }} />

    <div style={{
      position: 'absolute', top: '30px', left: '-30px',
      width: '120px', height: '120px', borderRadius: '50%',
      background: isAdmin
        ? 'radial-gradient(circle, rgba(255,233,104,0.07) 0%, transparent 70%)'
        : 'radial-gradient(circle, rgba(65,210,242,0.07) 0%, transparent 70%)',
      pointerEvents: 'none', zIndex: 0,
    }} />

    <div style={{
      position: 'absolute', top: '220px', left: '12px', right: '12px', bottom: '120px',
      backgroundImage: 'radial-gradient(circle, rgba(65,210,242,0.08) 1px, transparent 1px)',
      backgroundSize: '18px 18px',
      pointerEvents: 'none', zIndex: 0,
    }} />

    <div style={{
      position: 'absolute', bottom: '-80px', left: '-80px',
      width: '220px', height: '220px', borderRadius: '50%',
      border: '1px solid rgba(65,210,242,0.06)',
      pointerEvents: 'none', zIndex: 0,
    }} />

    <div style={{
      position: 'absolute', bottom: '0', left: '0', right: '0', height: '120px',
      background: 'linear-gradient(to top, rgba(65,210,242,0.04) 0%, transparent 100%)',
      pointerEvents: 'none', zIndex: 0,
    }} />

    <div style={{
      position: 'absolute', top: '80px', bottom: '80px', right: '0',
      width: '1px',
      background: 'linear-gradient(to bottom, transparent 0%, rgba(65,210,242,0.12) 30%, rgba(65,210,242,0.12) 70%, transparent 100%)',
      pointerEvents: 'none', zIndex: 0,
    }} />

    <div
      style={{ position: 'relative', zIndex: 1, borderBottom: '1px solid rgba(65,210,242,0.1)', padding: '20px' }}
      className='flex justify-center items-center'
    >
      <img
        src={logo}
        alt='PaySmart'
        className='h-14 w-auto object-contain'
        style={{ filter: 'drop-shadow(0 0 14px rgba(65,210,242,0.3)) drop-shadow(0 0 4px rgba(65,210,242,0.15))' }}
      />
    </div>

    <div style={{ position: 'relative', zIndex: 1, padding: '12px 16px', borderBottom: '1px solid rgba(65,210,242,0.08)' }}>
      <div
        style={{
          borderRadius: '14px',
          padding: '10px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          background: isAdmin
            ? 'linear-gradient(135deg, rgba(255,233,104,0.11) 0%, rgba(255,233,104,0.03) 100%)'
            : 'linear-gradient(135deg, rgba(65,210,242,0.11) 0%, rgba(65,210,242,0.03) 100%)',
          border: `1px solid ${isAdmin ? 'rgba(255,233,104,0.2)' : 'rgba(65,210,242,0.17)'}`,
        }}
      >
        <div
          style={{
            width: '36px', height: '36px', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '13px', fontWeight: 700, flexShrink: 0,
            background: isAdmin
              ? 'linear-gradient(135deg, rgba(255,233,104,0.4), rgba(255,233,104,0.15))'
              : 'linear-gradient(135deg, rgba(65,210,242,0.4), rgba(65,210,242,0.15))',
            color: isAdmin ? '#FFE968' : '#41D2F2',
            boxShadow: isAdmin ? '0 0 12px rgba(255,233,104,0.25)' : '0 0 12px rgba(65,210,242,0.25)',
          }}
        >
          {(user?.firstName?.[0] ?? user?.username?.[0] ?? 'U').toUpperCase()}
        </div>
        <div style={{ minWidth: 0 }}>
          <p style={{ fontSize: '13px', fontWeight: 600, color: '#FFFFFF', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user?.firstName ?? user?.username ?? 'Usuario'}
          </p>
          {isAdmin ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
              <ShieldCheckIcon style={{ width: '11px', height: '11px', color: '#FFE968', flexShrink: 0 }} />
              <span style={{ fontSize: '11px', fontWeight: 600, color: '#FFE968' }}>Administrador</span>
            </div>
          ) : (
            <span style={{ fontSize: '11px', color: 'rgba(65,210,242,0.6)' }}>Cliente</span>
          )}
        </div>
      </div>
    </div>

    <nav style={{ position: 'relative', zIndex: 1, flex: 1, padding: '14px 10px', display: 'flex', flexDirection: 'column', gap: '2px', overflowY: 'auto' }}>
      {navItems.map(({ path, label, Icon, exact }) => {
        const active = isActive(path, exact);
        return (
          <button
            key={path}
            onClick={() => navigate(path)}
            className='w-full text-left'
            style={{
              position: 'relative',
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '9px 12px',
              borderRadius: '12px',
              fontSize: '13px', fontWeight: active ? 600 : 500,
              backgroundColor: active ? 'rgba(65,210,242,0.1)' : 'transparent',
              color: active ? '#41D2F2' : 'rgba(255,255,255,0.48)',
              border: active ? '1px solid rgba(65,210,242,0.22)' : '1px solid transparent',
              transition: 'background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease',
              cursor: 'pointer',
            }}
            onMouseEnter={e => {
              if (!active) {
                e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
                e.currentTarget.style.color = 'rgba(255,255,255,0.8)';
              }
            }}
            onMouseLeave={e => {
              if (!active) {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = 'rgba(255,255,255,0.48)';
              }
            }}
          >

            {active && (
              <span style={{
                position: 'absolute', left: 0, top: '22%', height: '56%',
                width: '3px', borderRadius: '0 3px 3px 0',
                backgroundColor: '#41D2F2',
                boxShadow: '0 0 8px rgba(65,210,242,0.7)',
              }} />
            )}
            <Icon style={{
              width: '17px', height: '17px', flexShrink: 0,
              color: active ? '#41D2F2' : 'inherit',
              filter: active ? 'drop-shadow(0 0 4px rgba(65,210,242,0.55))' : 'none',
            }} />
            {label}
          </button>
        );
      })}
    </nav>

    <div style={{ position: 'relative', zIndex: 1, padding: '10px 10px 18px', borderTop: '1px solid rgba(65,210,242,0.08)' }}>
      <button
        onClick={onLogout}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
          padding: '9px 12px', borderRadius: '12px',
          fontSize: '13px', fontWeight: 500,
          color: 'rgba(255,255,255,0.32)',
          background: 'transparent',
          border: '1px solid transparent',
          transition: 'background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease',
          cursor: 'pointer',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.backgroundColor = 'rgba(255,75,75,0.08)';
          e.currentTarget.style.color = 'rgba(255,100,100,0.85)';
          e.currentTarget.style.borderColor = 'rgba(255,75,75,0.14)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.backgroundColor = 'transparent';
          e.currentTarget.style.color = 'rgba(255,255,255,0.32)';
          e.currentTarget.style.borderColor = 'transparent';
        }}
      >
        <ArrowRightStartOnRectangleIcon style={{ width: '17px', height: '17px', flexShrink: 0 }} />
        Cerrar sesión
      </button>
    </div>
  </div>
);