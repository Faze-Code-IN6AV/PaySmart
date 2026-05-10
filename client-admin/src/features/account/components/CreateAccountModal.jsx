import { useForm } from 'react-hook-form';
import { XMarkIcon } from '@heroicons/react/24/outline';

const ACCOUNT_TYPES = [
  { value: 'AHORRO', label: 'Ahorro', minBalance: 100, description: 'Saldo mínimo: Q100.00' },
  { value: 'MONETARIA', label: 'Monetaria', minBalance: 200, description: 'Saldo mínimo: Q200.00' },
  { value: 'EMPRESARIAL', label: 'Empresarial', minBalance: 1000, description: 'Saldo mínimo: Q1,000.00' },
];

export const CreateAccountModal = ({ isOpen, onClose, onSubmit, loading = false }) => {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({ defaultValues: { accountType: '', balance: '' } });

  const watchedType = watch('accountType');
  const currentType = ACCOUNT_TYPES.find((t) => t.value === watchedType);

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleFormSubmit = async (data) => {
    const res = await onSubmit({ accountType: data.accountType, balance: Number(data.balance) });
    if (res?.success) reset();
  };

  if (!isOpen) return null;

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center p-4'
      style={{ backgroundColor: 'rgba(11,24,48,0.85)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div
        className='w-full max-w-md rounded-2xl shadow-2xl'
        style={{ backgroundColor: '#162C5F', border: '1px solid #41D2F2' }}
      >
        {/* Header */}
        <div
          className='flex items-center justify-between px-6 py-4 rounded-t-2xl'
          style={{ borderBottom: '1px solid rgba(65,210,242,0.2)' }}
        >
          <div>
            <h2 className='text-lg font-bold' style={{ color: '#FFFFFF' }}>
              Nueva Cuenta Bancaria
            </h2>
            <p className='text-xs mt-0.5' style={{ color: '#41D2F2' }}>
              Selecciona el tipo y el saldo inicial en Quetzales
            </p>
          </div>
          <button onClick={handleClose} className='p-1.5 rounded-lg hover:opacity-70' style={{ color: '#41D2F2' }}>
            <XMarkIcon className='w-5 h-5' />
          </button>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className='px-6 py-5 space-y-5'>
          {/* Tipo de cuenta */}
          <div>
            <label className='block text-sm font-medium mb-3' style={{ color: '#FFFFFF' }}>
              Tipo de cuenta
            </label>
            <div className='grid grid-cols-3 gap-2'>
              {ACCOUNT_TYPES.map((type) => {
                const isSelected = watchedType === type.value;
                return (
                  <label
                    key={type.value}
                    className='relative cursor-pointer rounded-xl p-3 text-center transition-all'
                    style={{
                      backgroundColor: isSelected ? 'rgba(65,210,242,0.15)' : 'rgba(11,24,48,0.6)',
                      border: isSelected ? '2px solid #41D2F2' : '2px solid rgba(65,210,242,0.2)',
                    }}
                  >
                    <input
                      type='radio'
                      value={type.value}
                      className='sr-only'
                      {...register('accountType', { required: 'Selecciona un tipo de cuenta' })}
                    />
                    <div className='font-semibold text-sm mb-1' style={{ color: isSelected ? '#41D2F2' : '#FFFFFF' }}>
                      {type.label}
                    </div>
                    <div className='text-xs' style={{ color: isSelected ? '#FFE968' : 'rgba(255,255,255,0.5)' }}>
                      {type.description}
                    </div>
                  </label>
                );
              })}
            </div>
            {errors.accountType && (
              <p className='text-red-400 text-xs mt-1.5'>{errors.accountType.message}</p>
            )}
          </div>

          {/* Saldo inicial */}
          <div>
            <label className='block text-sm font-medium mb-1.5' style={{ color: '#FFFFFF' }}>
              Saldo inicial (GTQ)
            </label>
            <div className='relative'>
              <span className='absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold' style={{ color: '#41D2F2' }}>
                Q
              </span>
              <input
                type='number'
                step='0.01'
                placeholder={currentType ? `Mín. ${currentType.minBalance}.00` : '0.00'}
                className='w-full pl-8 pr-3 py-2 text-sm border rounded-lg focus:outline-none'
                style={{ backgroundColor: '#0B1830', borderColor: '#41D2F2', color: '#FFFFFF' }}
                {...register('balance', {
                  required: 'El saldo inicial es requerido',
                  validate: (val) => {
                    const selectedType = ACCOUNT_TYPES.find((t) => t.value === watch('accountType'));
                    const min = selectedType?.minBalance ?? 1;
                    return Number(val) >= min || `El mínimo para este tipo es Q${min}`;
                  },
                })}
              />
            </div>
            {errors.balance && (
              <p className='text-red-400 text-xs mt-1'>{errors.balance.message}</p>
            )}
          </div>

          {/* Chip moneda */}
          <div
            className='flex items-center gap-2 px-3 py-2 rounded-lg text-xs'
            style={{ backgroundColor: 'rgba(255,233,104,0.08)', border: '1px solid rgba(255,233,104,0.25)', color: '#FFE968' }}
          >
            <span>🇬🇹</span>
            <span>La cuenta se abrirá en <strong>Quetzales (GTQ)</strong> — moneda oficial</span>
          </div>

          {/* Acciones */}
          <div className='flex gap-3 pt-1'>
            <button
              type='button'
              onClick={handleClose}
              className='flex-1 py-2.5 rounded-lg text-sm font-medium hover:opacity-70'
              style={{ backgroundColor: 'rgba(65,210,242,0.1)', color: '#41D2F2', border: '1px solid rgba(65,210,242,0.3)' }}
            >
              Cancelar
            </button>
            <button
              type='submit'
              disabled={loading}
              className='flex-1 py-2.5 rounded-lg text-sm font-bold disabled:opacity-60'
              style={{ backgroundColor: '#41D2F2', color: '#0B1830' }}
            >
              {loading ? 'Creando...' : 'Crear Cuenta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};