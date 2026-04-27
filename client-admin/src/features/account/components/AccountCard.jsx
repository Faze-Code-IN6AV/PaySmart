import { BanknotesIcon, CreditCardIcon, BuildingLibraryIcon } from '@heroicons/react/24/outline';

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

/**
 * AccountCard
 * Props:
 *   account: { accountNumber, accountType, balance, currency, status, createdAt }
 *   onQueryBalance: (accountNumber) => void
 */
export const AccountCard = ({ account, onQueryBalance }) => {
  const config = TYPE_CONFIG[account.accountType] ?? TYPE_CONFIG.AHORRO;
  const { Icon, label, gradient, accent } = config;
  const statusBadge = STATUS_BADGE[account.status] ?? STATUS_BADGE.ACTIVO;

  // Formatear número de cuenta para visualización: grupos de 4
  const maskedNumber = account.accountNumber
    ? account.accountNumber.replace(/(.{4})/g, '$1 ').trim()
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
      {/* Decorative circle */}
      <div
        className='absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-10'
        style={{ backgroundColor: accent }}
      />

      <div className='relative p-5 flex flex-col gap-4'>
        {/* Header */}
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <div
              className='p-2 rounded-xl'
              style={{ backgroundColor: `${accent}18` }}
            >
              <Icon className='w-5 h-5' style={{ color: accent }} />
            </div>
            <div>
              <p className='text-xs font-medium' style={{ color: 'rgba(255,255,255,0.5)' }}>
                Cuenta {label}
              </p>
              <p className='text-xs font-mono' style={{ color: 'rgba(255,255,255,0.35)' }}>
                {maskedNumber}
              </p>
            </div>
          </div>
          <span
            className='text-xs font-semibold px-2.5 py-1 rounded-full'
            style={{ backgroundColor: statusBadge.bg, color: statusBadge.color }}
          >
            {statusBadge.label}
          </span>
        </div>

        {/* Balance */}
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
          className='flex items-center justify-between pt-3'
          style={{ borderTop: `1px solid ${accent}18` }}
        >
          <p className='text-xs' style={{ color: 'rgba(255,255,255,0.3)' }}>
            Abierta {account.createdAt ? new Date(account.createdAt).toLocaleDateString('es-GT') : '—'}
          </p>
          <button
            onClick={() => onQueryBalance(account.accountNumber)}
            className='text-xs font-semibold px-3 py-1.5 rounded-lg transition-opacity hover:opacity-70'
            style={{ backgroundColor: `${accent}18`, color: accent, border: `1px solid ${accent}30` }}
          >
            Ver saldo
          </button>
        </div>
      </div>
    </div>
  );
};