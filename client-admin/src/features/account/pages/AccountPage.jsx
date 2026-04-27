import { useState } from 'react';
import {
  PlusCircleIcon,
  CreditCardIcon,
  MagnifyingGlassIcon,
  ShieldCheckIcon,
  ArrowsRightLeftIcon,
  BanknotesIcon,
} from '@heroicons/react/24/outline';

import { useAuthStore } from '../../auth/store/authStore.js';
import { AccountCard } from '../components/AccountCard.jsx';
import { CreateAccountModal } from '../components/CreateAccountModal.jsx';
import { AccountBalanceModal } from '../components/AccountBalanceModal.jsx';
import { UpdateBalanceModal } from '../components/UpdateBalanceModal.jsx';

const ADMIN_STATS = [
  { label: 'Total cuentas', value: '—', color: '#41D2F2', Icon: CreditCardIcon },
  { label: 'Cuentas activas', value: '—', color: '#41D2F2', Icon: BanknotesIcon },
  { label: 'Suspendidas', value: '—', color: '#FFE968', Icon: ShieldCheckIcon },
  { label: 'Operaciones hoy', value: '—', color: '#41D2F2', Icon: ArrowsRightLeftIcon },
];

const TABS_USER = [{ id: 'mis-cuentas', label: 'Mis Cuentas', Icon: CreditCardIcon }];
const TABS_ADMIN = [
  { id: 'mis-cuentas', label: 'Mis Cuentas', Icon: CreditCardIcon },
  { id: 'consultar-saldo', label: 'Consultar Saldo', Icon: MagnifyingGlassIcon, adminOnly: true },
  { id: 'actualizar-saldo', label: 'Actualizar Saldo', Icon: ArrowsRightLeftIcon, adminOnly: true },
];

export const AccountPage = () => {
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === 'ADMIN_ROLE';

  const tabs = isAdmin ? TABS_ADMIN : TABS_USER;
  const [activeTab, setActiveTab] = useState('mis-cuentas');
  const [accounts] = useState([]);

  // Modales
  const [showCreate, setShowCreate] = useState(false);
  const [showBalance, setShowBalance] = useState(false);
  const [showUpdate, setShowUpdate] = useState(false);
  const [prefilledAccount, setPrefilledAccount] = useState('');

  const openBalanceFromCard = (accountNumber) => {
    setPrefilledAccount(accountNumber);
    setShowBalance(true);
  };

  return (
    <div className='flex flex-col h-full'>
      {/* Header */}
      <div className='flex items-start justify-between mb-6 flex-wrap gap-4'>
        <div>
          <h1 className='text-2xl font-bold' style={{ color: '#FFFFFF' }}>
            Cuentas Bancarias
          </h1>
          <p className='text-sm mt-1' style={{ color: '#41D2F2' }}>
            {isAdmin
              ? 'Panel de administración — todas las operaciones disponibles'
              : 'Administra tus cuentas en Quetzales'}
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className='flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-opacity hover:opacity-80'
          style={{ backgroundColor: '#41D2F2', color: '#0B1830' }}
        >
          <PlusCircleIcon className='w-5 h-5' />
          Nueva Cuenta
        </button>
      </div>

      {/* Stats admin */}
      {isAdmin && (
        <div className='grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6'>
          {ADMIN_STATS.map(({ label, value, color, Icon }) => (
            <div
              key={label}
              className='rounded-xl p-4 flex items-center gap-3'
              style={{ backgroundColor: '#162C5F', border: '1px solid rgba(65,210,242,0.15)' }}
            >
              <div className='p-2 rounded-lg' style={{ backgroundColor: `${color}15` }}>
                <Icon className='w-5 h-5' style={{ color }} />
              </div>
              <div>
                <p className='text-xl font-bold' style={{ color: '#FFFFFF' }}>{value}</p>
                <p className='text-xs' style={{ color: 'rgba(255,255,255,0.5)' }}>{label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div
        className='flex gap-1 mb-6 p-1 rounded-xl w-fit'
        style={{ backgroundColor: '#0B1830' }}
      >
        {tabs.map(({ id, label, Icon, adminOnly }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className='flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all'
              style={{
                backgroundColor: isActive ? '#162C5F' : 'transparent',
                color: isActive ? (adminOnly ? '#FFE968' : '#41D2F2') : 'rgba(255,255,255,0.45)',
                border: isActive ? `1px solid ${adminOnly ? 'rgba(255,233,104,0.3)' : 'rgba(65,210,242,0.3)'}` : '1px solid transparent',
              }}
            >
              <Icon className='w-4 h-4' />
              {label}
              {adminOnly && (
                <span
                  className='text-xs px-1.5 py-0.5 rounded-full font-semibold'
                  style={{ backgroundColor: 'rgba(255,233,104,0.12)', color: '#FFE968' }}
                >
                  Admin
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab: Mis Cuentas */}
      {activeTab === 'mis-cuentas' && (
        <div className='flex-1'>
          {accounts.length === 0 ? (
            <div
              className='flex flex-col items-center justify-center py-20 rounded-2xl'
              style={{ backgroundColor: '#162C5F', border: '1px dashed rgba(65,210,242,0.25)' }}
            >
              <CreditCardIcon className='w-12 h-12 mb-4' style={{ color: 'rgba(65,210,242,0.35)' }} />
              <p className='text-base font-semibold mb-1' style={{ color: 'rgba(255,255,255,0.6)' }}>
                Sin cuentas registradas
              </p>
              <p className='text-sm mb-4' style={{ color: 'rgba(255,255,255,0.35)' }}>
                Crea tu primera cuenta bancaria
              </p>
              <button
                onClick={() => setShowCreate(true)}
                className='flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold'
                style={{ backgroundColor: '#41D2F2', color: '#0B1830' }}
              >
                <PlusCircleIcon className='w-5 h-5' />
                Crear cuenta
              </button>
            </div>
          ) : (
            <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4'>
              {accounts.map((account) => (
                <AccountCard
                  key={account._id}
                  account={account}
                  onQueryBalance={openBalanceFromCard}
                />
              ))}
              <button
                onClick={() => setShowCreate(true)}
                className='rounded-2xl flex flex-col items-center justify-center gap-2 py-10 transition-opacity hover:opacity-70'
                style={{
                  backgroundColor: 'rgba(65,210,242,0.04)',
                  border: '2px dashed rgba(65,210,242,0.2)',
                  color: 'rgba(65,210,242,0.5)',
                  minHeight: 160,
                }}
              >
                <PlusCircleIcon className='w-8 h-8' />
                <span className='text-sm font-medium'>Agregar cuenta</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tab: Consultar Saldo (admin) */}
      {activeTab === 'consultar-saldo' && isAdmin && (
        <div className='flex-1'>
          <div
            className='rounded-2xl p-6 max-w-lg'
            style={{ backgroundColor: '#162C5F', border: '1px solid rgba(65,210,242,0.2)' }}
          >
            <div className='flex items-center gap-3 mb-4'>
              <div className='p-2.5 rounded-xl' style={{ backgroundColor: 'rgba(65,210,242,0.12)' }}>
                <MagnifyingGlassIcon className='w-6 h-6' style={{ color: '#41D2F2' }} />
              </div>
              <div>
                <h3 className='font-semibold' style={{ color: '#FFFFFF' }}>Consulta de saldo interna</h3>
                <p className='text-xs' style={{ color: 'rgba(255,255,255,0.5)' }}>
                  Endpoint interno — sin restricción de propietario
                </p>
              </div>
            </div>
            <p className='text-sm mb-5' style={{ color: 'rgba(255,255,255,0.6)' }}>
              Como administrador podrás consultar el saldo de cualquier cuenta usando el endpoint
              interno del Account Service (
              <code className='text-xs px-1 py-0.5 rounded' style={{ backgroundColor: '#0B1830', color: '#41D2F2' }}>
                /internal/:accountNumber/balance
              </code>
              ).
            </p>
            <button
              onClick={() => setShowBalance(true)}
              className='flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-opacity hover:opacity-80'
              style={{ backgroundColor: '#41D2F2', color: '#0B1830' }}
            >
              <MagnifyingGlassIcon className='w-4 h-4' />
              Abrir consulta
            </button>
          </div>
        </div>
      )}

      {/* Tab: Actualizar Saldo (admin) */}
      {activeTab === 'actualizar-saldo' && isAdmin && (
        <div className='flex-1'>
          <div
            className='rounded-2xl p-6 max-w-lg'
            style={{ backgroundColor: '#162C5F', border: '1px solid rgba(255,233,104,0.2)' }}
          >
            <div className='flex items-center gap-3 mb-4'>
              <div className='p-2.5 rounded-xl' style={{ backgroundColor: 'rgba(255,233,104,0.1)' }}>
                <ArrowsRightLeftIcon className='w-6 h-6' style={{ color: '#FFE968' }} />
              </div>
              <div>
                <h3 className='font-semibold' style={{ color: '#FFE968' }}>Actualizar saldo de cuenta</h3>
                <p className='text-xs' style={{ color: 'rgba(255,255,255,0.5)' }}>
                  DEPOSIT o WITHDRAW — uso interno entre microservicios
                </p>
              </div>
            </div>
            <p className='text-sm mb-5' style={{ color: 'rgba(255,255,255,0.6)' }}>
              Realiza depósitos o retiros en cualquier cuenta usando el endpoint
              <code className='text-xs px-1 py-0.5 rounded mx-1' style={{ backgroundColor: '#0B1830', color: '#FFE968' }}>
                PATCH /internal/:accountNumber/balance
              </code>
              del Account Service.
            </p>
            <div
              className='flex items-start gap-2 p-3 rounded-xl mb-5 text-xs'
              style={{ backgroundColor: 'rgba(255,233,104,0.07)', border: '1px solid rgba(255,233,104,0.2)', color: '#FFE968' }}
            >
              <ShieldCheckIcon className='w-4 h-4 flex-shrink-0 mt-0.5' />
              <span>Esta acción es reversible pero queda registrada. Verifica los datos antes de confirmar.</span>
            </div>
            <button
              onClick={() => setShowUpdate(true)}
              className='flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-opacity hover:opacity-80'
              style={{ backgroundColor: '#FFE968', color: '#0B1830' }}
            >
              <ArrowsRightLeftIcon className='w-4 h-4' />
              Abrir operación
            </button>
          </div>
        </div>
      )}

      {/* Modales */}
      <CreateAccountModal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        onSubmit={() => setShowCreate(false)}
        loading={false}
      />

      <AccountBalanceModal
        isOpen={showBalance}
        onClose={() => { setShowBalance(false); setPrefilledAccount(''); }}
        onQuery={() => Promise.resolve(null)}
        isAdmin={isAdmin}
        defaultAccountNumber={prefilledAccount}
      />

      <UpdateBalanceModal
        isOpen={showUpdate}
        onClose={() => setShowUpdate(false)}
        onSubmit={() => Promise.resolve()}
        loading={false}
      />
    </div>
  );
};