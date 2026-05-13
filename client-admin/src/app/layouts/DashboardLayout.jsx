import { useState } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { CreditCardIcon, ArrowRightStartOnRectangleIcon, Bars3Icon, XMarkIcon, ShieldCheckIcon, HomeIcon, CubeIcon } from '@heroicons/react/24/outline';
import { useAuthStore } from '../../features/auth/store/authStore.js';
import logo from '../../assets/img/paysmart_logo.png';
import { StarIcon } from '@heroicons/react/24/outline';

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Inicio', Icon: HomeIcon, exact: true },
  { path: '/dashboard/accounts', label: 'Cuentas', Icon: CreditCardIcon },
  { path: '/dashboard/transactions', label: 'Transacciones', Icon: CreditCardIcon },
  { path: '/dashboard/products', label: 'Productos', Icon: CubeIcon },
  { path: '/dashboard/favorites', label: 'Favoritas', Icon: StarIcon },
];

export const DashboardLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const isAdmin = user?.role === 'ADMIN_ROLE';

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path, exact) =>
    exact ? location.pathname === path : location.pathname.startsWith(path);

  return (
    <div className='min-h-screen flex' style={{ backgroundColor: '#0B1830' }}>

      {/* ——— Sidebar — desktop ——— */}
      <aside
        className='hidden lg:flex flex-col w-64 min-h-screen flex-shrink-0'
        style={{ backgroundColor: '#162C5F', borderRight: '1px solid rgba(65,210,242,0.12)' }}
      >
        <SidebarContent
          user={user}
          isAdmin={isAdmin}
          navItems={NAV_ITEMS}
          isActive={isActive}
          navigate={navigate}
          onLogout={handleLogout}
        />
      </aside>

      {/* ——— Sidebar — mobile overlay ——— */}
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
              user={user}
              isAdmin={isAdmin}
              navItems={NAV_ITEMS}
              isActive={isActive}
              navigate={(path) => { navigate(path); setSidebarOpen(false); }}
              onLogout={handleLogout}
            />
          </aside>
        </div>
      )}

      {/* ——— Main content ——— */}
      <div className='flex-1 flex flex-col min-h-screen'>

        {/* Top bar */}
        <header
          className='sticky top-0 z-30 flex items-center justify-between px-4 lg:px-8 py-3.5'
          style={{ backgroundColor: '#162C5F', borderBottom: '1px solid rgba(65,210,242,0.1)' }}
        >
          {/* Hamburger — mobile */}
          <button
            className='lg:hidden p-2 rounded-lg'
            style={{ color: '#41D2F2' }}
            onClick={() => setSidebarOpen(true)}
          >
            <Bars3Icon className='w-5 h-5' />
          </button>

          {/* Page title area */}
          <div className='flex-1 px-4 lg:px-0'>
            <span className='text-sm font-medium' style={{ color: 'rgba(255,255,255,0.5)' }}>
              PaySmart
            </span>
          </div>

          {/* Role chip */}
          {isAdmin ? (
            <div
              className='flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold'
              style={{ backgroundColor: 'rgba(255,233,104,0.12)', color: '#FFE968', border: '1px solid rgba(255,233,104,0.3)' }}
            >
              <ShieldCheckIcon className='w-3.5 h-3.5' />
              Cuenta Admin
            </div>
          ) : (
            <div
              className='flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold'
              style={{ backgroundColor: 'rgba(65,210,242,0.1)', color: '#41D2F2', border: '1px solid rgba(65,210,242,0.25)' }}
            >
              Mi Cuenta
            </div>
          )}
        </header>

        {/* Content */}
        <main className='flex-1 px-4 lg:px-8 py-6'>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

// ——— Sidebar content (shared between desktop + mobile) ———
const SidebarContent = ({ user, isAdmin, navItems, isActive, navigate, onLogout }) => (
  <div className='flex flex-col h-full'>
    {/* Logo */}
    <div className='px-5 py-5 flex justify-center items-center gap-3' style={{ borderBottom: '1px solid rgba(65,210,242,0.1)' }}>
      <img src={logo} alt='PaySmart' className='h-20 w-auto object-contain' />
    </div>

    {/* User card */}
    <div className='px-4 py-4' style={{ borderBottom: '1px solid rgba(65,210,242,0.08)' }}>
      <div
        className='rounded-xl px-3 py-3 flex items-center gap-3'
        style={{ backgroundColor: isAdmin ? 'rgba(255,233,104,0.08)' : 'rgba(65,210,242,0.08)' }}
      >
        {/* Avatar */}
        <div
          className='w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0'
          style={{
            backgroundColor: isAdmin ? 'rgba(255,233,104,0.2)' : 'rgba(65,210,242,0.2)',
            color: isAdmin ? '#FFE968' : '#41D2F2',
          }}
        >
          {(user?.firstName?.[0] ?? user?.username?.[0] ?? 'U').toUpperCase()}
        </div>
        <div className='min-w-0'>
          <p className='text-sm font-semibold truncate' style={{ color: '#FFFFFF' }}>
            {user?.firstName ?? user?.username ?? 'Usuario'}
          </p>
          {isAdmin ? (
            <div className='flex items-center gap-1 mt-0.5'>
              <ShieldCheckIcon className='w-3 h-3 flex-shrink-0' style={{ color: '#FFE968' }} />
              <span className='text-xs font-semibold' style={{ color: '#FFE968' }}>
                Cuenta Admin
              </span>
            </div>
          ) : (
            <span className='text-xs' style={{ color: 'rgba(65,210,242,0.7)' }}>
              Usuario
            </span>
          )}
        </div>
      </div>
    </div>

    {/* Nav */}
    <nav className='flex-1 px-3 py-4 space-y-1'>
      {navItems.map(({ path, label, Icon, exact }) => {
        const active = isActive(path, exact);
        return (
          <button
            key={path}
            onClick={() => navigate(path)}
            className='w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left'
            style={{
              backgroundColor: active ? 'rgba(65,210,242,0.12)' : 'transparent',
              color: active ? '#41D2F2' : 'rgba(255,255,255,0.55)',
              border: active ? '1px solid rgba(65,210,242,0.2)' : '1px solid transparent',
            }}
          >
            <Icon className='w-5 h-5 flex-shrink-0' />
            {label}
          </button>
        );
      })}
    </nav>

    {/* Logout */}
    <div className='px-3 pb-5' style={{ borderTop: '1px solid rgba(65,210,242,0.08)', paddingTop: '1rem' }}>
      <button
        onClick={onLogout}
        className='w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-opacity hover:opacity-70'
        style={{ color: 'rgba(255,255,255,0.4)' }}
      >
        <ArrowRightStartOnRectangleIcon className='w-5 h-5' />
        Cerrar sesión
      </button>
    </div>
  </div>
);