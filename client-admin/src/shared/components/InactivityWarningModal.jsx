import { ExclamationTriangleIcon, ClockIcon } from '@heroicons/react/24/outline';

/**
 * Modal que advierte al usuario que su sesión cerrará por inactividad.
 * Props:
 *   secondsLeft  — segundos restantes (número)
 *   onContinue   — callback al hacer clic en "Continuar"
 */
export function InactivityWarningModal({ secondsLeft, onContinue }) {
  const minutes = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const timeStr = minutes > 0
    ? `${minutes}:${String(secs).padStart(2, '0')} min`
    : `${secs} s`;

  const urgency = secondsLeft <= 15;

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center'
      style={{ backgroundColor: 'rgba(11,24,48,0.85)', backdropFilter: 'blur(4px)' }}
    >
      <div
        className='relative w-full max-w-sm mx-4 rounded-2xl p-6 flex flex-col items-center gap-4'
        style={{
          backgroundColor: '#162C5F',
          border: `1px solid ${urgency ? 'rgba(255,80,80,0.5)' : 'rgba(65,210,242,0.25)'}`,
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
        }}
      >
        {/* Ícono */}
        <div
          className='w-14 h-14 rounded-full flex items-center justify-center'
          style={{
            backgroundColor: urgency ? 'rgba(255,80,80,0.15)' : 'rgba(255,193,7,0.12)',
          }}
        >
          {urgency
            ? <ExclamationTriangleIcon className='w-7 h-7' style={{ color: '#ff5050' }} />
            : <ClockIcon className='w-7 h-7' style={{ color: '#FFE968' }} />
          }
        </div>

        {/* Texto */}
        <div className='text-center'>
          <h2 className='text-lg font-bold mb-1' style={{ color: '#FFFFFF' }}>
            ¿Sigues ahí?
          </h2>
          <p className='text-sm' style={{ color: 'rgba(255,255,255,0.6)' }}>
            Tu sesión se cerrará por inactividad en
          </p>

          {/* Contador */}
          <p
            className='text-4xl font-mono font-bold mt-2'
            style={{ color: urgency ? '#ff5050' : '#41D2F2' }}
          >
            {timeStr}
          </p>
        </div>

        {/* Botón */}
        <button
          onClick={onContinue}
          className='w-full py-3 rounded-xl text-sm font-semibold transition-opacity hover:opacity-80 active:scale-95'
          style={{
            backgroundColor: '#41D2F2',
            color: '#0B1830',
          }}
        >
          Continuar sesión
        </button>
      </div>
    </div>
  );
}
