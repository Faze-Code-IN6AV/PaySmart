import { useState } from 'react';
import { BanknotesIcon, CreditCardIcon, BuildingLibraryIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

const TYPE_CONFIG = {
  AHORRO: {
    label: 'Ahorro',
    Icon: BanknotesIcon,
    gradient: 'linear-gradient(135deg, #162C5F 0%, #1a3a7a 100%)',
    accent: '#41D2F2',
  },
  MONETARIA: {
    label: 'Monetaria',
    Icon: CreditCardIcon,
    gradient: 'linear-gradient(135deg, #0d2347 0%, #162C5F 100%)',
    accent: '#FFE968',
  },
  EMPRESARIAL: {
    label: 'Empresarial',
    Icon: BuildingLibraryIcon,
    gradient: 'linear-gradient(135deg, #0B1830 0%, #162C5F 100%)',
    accent: '#41D2F2',
  },
};

const STATUS_BADGE = {
  ACTIVO: { label: 'Activo', bg: 'rgba(65,210,242,0.12)', color: '#41D2F2' },
  SUSPENDIDO: { label: 'Suspendido', bg: 'rgba(255,233,104,0.12)', color: '#FFE968' },
  CERRADO: { label: 'Cerrado', bg: 'rgba(239,68,68,0.12)', color: '#fca5a5' },
};

export const AccountCard = ({ account }) => {
  const [showNumber, setShowNumber] = useState(false);

  const config = TYPE_CONFIG[account.accountType] ?? TYPE_CONFIG.AHORRO;
  const { Icon, label, gradient, accent } = config;
  const statusBadge = STATUS_BADGE[account.status] ?? STATUS_BADGE.ACTIVO;

  const num = account.accountNumber ?? '';

  // Oculto: primeros 14 dígitos como •••• •••• •••• y últimos 4 visibles
  const maskedNumber = num
    ? `•••• •••• •••• ${num.slice(-4)}`
    : '—';

  // Visible: grupos de 4
  const visibleNumber = num
    ? num.replace(/(.{4})/g, '$1 ').trim()
    : '—';

  const formattedBalance = Number(account.balance ?? 0).toLocaleString('es-GT', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <div
      className='relative rounded-2xl overflow-hidden shadow-lg transition-transform hover:-translate-y-0.5'
      style={{ background: gradient, border: `1px solid ${accent}30` }}
    >
      {/* Círculo decorativo */}
      <div
        className='absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-10'
        style={{ backgroundColor: accent }}
      />

      <div className='relative p-5 flex flex-col gap-4'>
        {/* Header */}
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <div className='p-2 rounded-xl' style={{ backgroundColor: `${accent}18` }}>
              <Icon className='w-5 h-5' style={{ color: accent }} />
            </div>
            <p className='text-sm font-semibold' style={{ color: '#FFFFFF' }}>
              Cuenta {label}
            </p>
          </div>
          <span
            className='text-xs font-semibold px-2.5 py-1 rounded-full'
            style={{ backgroundColor: statusBadge.bg, color: statusBadge.color }}
          >
            {statusBadge.label}
          </span>
        </div>

        {/* Número de cuenta */}
        <div>
          <p className='text-xs mb-1' style={{ color: 'rgba(255,255,255,0.4)' }}>
            Número de cuenta
          </p>
          <div className='flex items-center gap-2'>
            <p
              className='text-sm font-mono font-semibold tracking-wider'
              style={{ color: '#FFFFFF' }}
            >
              {showNumber ? visibleNumber : maskedNumber}
            </p>
            <button
              onClick={() => setShowNumber((v) => !v)}
              className='p-1 rounded-md hover:opacity-70 transition-opacity flex-shrink-0'
              style={{ color: accent }}
              title={showNumber ? 'Ocultar número' : 'Mostrar número completo'}
            >
              {showNumber
                ? <EyeSlashIcon className='w-4 h-4' />
                : <EyeIcon className='w-4 h-4' />
              }
            </button>
          </div>
        </div>

        {/* Saldo */}
        <div>
          <p className='text-xs mb-1' style={{ color: 'rgba(255,255,255,0.4)' }}>
            Saldo disponible
          </p>
          <p className='text-2xl font-bold tracking-tight' style={{ color: '#FFFFFF' }}>
            Q{formattedBalance}
            <span className='text-xs font-normal ml-1.5' style={{ color: 'rgba(255,255,255,0.4)' }}>GTQ</span>
          </p>
        </div>

        {/* Footer */}
        <div
          className='pt-3'
          style={{ borderTop: `1px solid ${accent}18` }}
        >
          <p className='text-xs' style={{ color: 'rgba(255,255,255,0.3)' }}>
            Abierta {account.createdAt ? new Date(account.createdAt).toLocaleDateString('es-GT') : '—'}
          </p>
        </div>
      </div>
    </div>
  );
};