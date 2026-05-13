import { useForm } from 'react-hook-form';
import { XMarkIcon, StarIcon } from '@heroicons/react/24/outline';

export const CreateFavoriteModal = ({ isOpen, onClose, onSubmit, loading = false }) => {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm({ defaultValues: { accountNumber: '', alias: '' } });

    const handleClose = () => {
        reset();
        onClose();
    };

    const handleFormSubmit = async (data) => {
        const res = await onSubmit({ accountNumber: data.accountNumber.trim(), alias: data.alias.trim() });
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
                            Agregar Cuenta Favorita
                        </h2>
                        <p className='text-xs mt-0.5' style={{ color: '#41D2F2' }}>
                            Registra un número de cuenta y asígnale un alias
                        </p>
                    </div>
                    <button onClick={handleClose} className='p-1.5 rounded-lg hover:opacity-70' style={{ color: '#41D2F2' }}>
                        <XMarkIcon className='w-5 h-5' />
                    </button>
                </div>

                <form onSubmit={handleSubmit(handleFormSubmit)} className='px-6 py-5 space-y-5'>
                    {/* Número de cuenta */}
                    <div>
                        <label className='block text-sm font-medium mb-1.5' style={{ color: '#FFFFFF' }}>
                            Número de cuenta
                        </label>
                        <input
                            type='text'
                            placeholder='Ej. ACC-000123'
                            className='w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none'
                            style={{ backgroundColor: '#0B1830', borderColor: '#41D2F2', color: '#FFFFFF' }}
                            {...register('accountNumber', {
                                required: 'El número de cuenta es requerido',
                                minLength: { value: 3, message: 'Ingresa un número válido' },
                            })}
                        />
                        {errors.accountNumber && (
                            <p className='text-red-400 text-xs mt-1'>{errors.accountNumber.message}</p>
                        )}
                    </div>

                    {/* Alias */}
                    <div>
                        <label className='block text-sm font-medium mb-1.5' style={{ color: '#FFFFFF' }}>
                            Alias
                        </label>
                        <input
                            type='text'
                            placeholder='Ej. Cuenta de Juan'
                            maxLength={50}
                            className='w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none'
                            style={{ backgroundColor: '#0B1830', borderColor: '#41D2F2', color: '#FFFFFF' }}
                            {...register('alias', {
                                required: 'El alias es requerido',
                                maxLength: { value: 50, message: 'Máximo 50 caracteres' },
                                minLength: { value: 2, message: 'El alias debe tener al menos 2 caracteres' },
                            })}
                        />
                        {errors.alias && (
                            <p className='text-red-400 text-xs mt-1'>{errors.alias.message}</p>
                        )}
                    </div>

                    {/* Chip info */}
                    <div
                        className='flex items-center gap-2 px-3 py-2 rounded-lg text-xs'
                        style={{ backgroundColor: 'rgba(65,210,242,0.08)', border: '1px solid rgba(65,210,242,0.2)', color: '#41D2F2' }}
                    >
                        <StarIcon className='w-4 h-4 flex-shrink-0' />
                        <span>La cuenta debe existir en el sistema para ser registrada como favorita</span>
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
                            {loading ? 'Guardando...' : 'Agregar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};