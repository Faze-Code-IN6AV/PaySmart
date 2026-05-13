import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { XMarkIcon, PencilSquareIcon } from '@heroicons/react/24/outline';

export const EditFavoriteModal = ({ isOpen, favorite, onClose, onSubmit, loading = false }) => {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm({ defaultValues: { alias: '' } });

    // Pre-llenar cuando cambia el favorito
    useEffect(() => {
        if (favorite) reset({ alias: favorite.alias });
    }, [favorite, reset]);

    const handleClose = () => {
        reset();
        onClose();
    };

    const handleFormSubmit = async (data) => {
        const res = await onSubmit(favorite._id, data.alias.trim());
        if (res?.success) handleClose();
    };

    if (!isOpen || !favorite) return null;

    return (
        <div
            className='fixed inset-0 z-50 flex items-center justify-center p-4'
            style={{ backgroundColor: 'rgba(11,24,48,0.85)', backdropFilter: 'blur(4px)' }}
            onClick={(e) => e.target === e.currentTarget && handleClose()}
        >
            <div
                className='w-full max-w-sm rounded-2xl shadow-2xl'
                style={{ backgroundColor: '#162C5F', border: '1px solid rgba(65,210,242,0.4)' }}
            >
                {/* Header */}
                <div
                    className='flex items-center justify-between px-6 py-4'
                    style={{ borderBottom: '1px solid rgba(65,210,242,0.2)' }}
                >
                    <div className='flex items-center gap-2'>
                        <div className='p-2 rounded-xl' style={{ backgroundColor: 'rgba(65,210,242,0.1)' }}>
                            <PencilSquareIcon className='w-5 h-5' style={{ color: '#41D2F2' }} />
                        </div>
                        <div>
                            <h3 className='font-bold' style={{ color: '#41D2F2' }}>Editar alias</h3>
                            <p className='text-xs' style={{ color: 'rgba(255,255,255,0.5)' }}>
                                Cuenta: <span className='font-mono'>{favorite.accountNumber}</span>
                            </p>
                        </div>
                    </div>
                    <button onClick={handleClose} className='p-1.5 rounded-lg hover:opacity-70' style={{ color: '#41D2F2' }}>
                        <XMarkIcon className='w-5 h-5' />
                    </button>
                </div>

                <form onSubmit={handleSubmit(handleFormSubmit)} className='px-6 py-5 space-y-4'>
                    <div>
                        <label className='block text-sm font-medium mb-1.5' style={{ color: '#FFFFFF' }}>
                            Nuevo alias
                        </label>
                        <input
                            type='text'
                            maxLength={50}
                            placeholder='Ej. Mi cuenta principal'
                            className='w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none'
                            style={{ backgroundColor: '#0B1830', borderColor: '#41D2F2', color: '#FFFFFF' }}
                            {...register('alias', {
                                required: 'El alias es requerido',
                                maxLength: { value: 50, message: 'Máximo 50 caracteres' },
                                minLength: { value: 2, message: 'Mínimo 2 caracteres' },
                            })}
                        />
                        {errors.alias && (
                            <p className='text-red-400 text-xs mt-1'>{errors.alias.message}</p>
                        )}
                    </div>

                    <div className='flex gap-3'>
                        <button
                            type='button'
                            onClick={handleClose}
                            className='flex-1 py-2.5 rounded-lg text-sm font-medium hover:opacity-70'
                            style={{ backgroundColor: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.1)' }}
                        >
                            Cancelar
                        </button>
                        <button
                            type='submit'
                            disabled={loading}
                            className='flex-1 py-2.5 rounded-lg text-sm font-bold disabled:opacity-60'
                            style={{ backgroundColor: '#41D2F2', color: '#0B1830' }}
                        >
                            {loading ? 'Guardando...' : 'Guardar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};