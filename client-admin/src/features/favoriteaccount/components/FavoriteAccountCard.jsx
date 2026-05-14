import { useState } from 'react';
import {
    StarIcon,
    PencilSquareIcon,
    CheckCircleIcon,
    NoSymbolIcon,
    EyeIcon,
    EyeSlashIcon,
    ArrowsRightLeftIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';

export const FavoriteAccountCard = ({ favorite, onEdit, onActivate, onDeactivate, onTransfer }) => {
    const [showNumber, setShowNumber] = useState(false);

    const { _id, accountNumber = '', alias = '', isActive = true } = favorite;

    const maskedNumber = accountNumber
        ? `•••• •••• •••• ${accountNumber.slice(-4)}`
        : '—';

    const accentColor = isActive ? '#41D2F2' : 'rgba(255,255,255,0.3)';
    const borderColor = isActive
        ? 'rgba(65,210,242,0.2)'
        : 'rgba(255,255,255,0.08)';

    return (
        <div
            className='relative rounded-2xl overflow-hidden shadow-lg transition-transform hover:-translate-y-0.5'
            style={{
                background: isActive
                    ? 'linear-gradient(135deg, #162C5F 0%, #1a3a7a 100%)'
                    : 'linear-gradient(135deg, #0d1f3c 0%, #162C5F 100%)',
                border: `1px solid ${borderColor}`,
                opacity: isActive ? 1 : 0.7,
            }}
        >
            {/* Círculo decorativo */}
            <div
                className='absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-10'
                style={{ backgroundColor: accentColor }}
            />

            <div className='relative p-5 flex flex-col gap-4'>
                {/* Header */}
                <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-2'>
                        <div className='p-2 rounded-xl' style={{ backgroundColor: `${accentColor}18` }}>
                            {isActive
                                ? <StarSolid className='w-5 h-5' style={{ color: '#FFE968' }} />
                                : <StarIcon className='w-5 h-5' style={{ color: 'rgba(255,255,255,0.3)' }} />
                            }
                        </div>
                        <p className='text-sm font-semibold truncate max-w-[140px]' style={{ color: '#FFFFFF' }}>
                            {alias}
                        </p>
                    </div>

                    {/* Badge estado — solo badge, sin botón transferir aquí */}
                    <div className='flex flex-col items-end gap-1.5 flex-shrink-0'>
                        <span
                            className='text-xs font-semibold px-2.5 py-1 rounded-full'
                            style={{
                                backgroundColor: isActive ? 'rgba(65,210,242,0.12)' : 'rgba(255,255,255,0.06)',
                                color: isActive ? '#41D2F2' : 'rgba(255,255,255,0.35)',
                            }}
                        >
                            {isActive ? 'Activa' : 'Inactiva'}
                        </span>
                    </div>
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
                            {showNumber ? accountNumber : maskedNumber}
                        </p>
                        <button
                            onClick={() => setShowNumber((v) => !v)}
                            className='p-1 rounded-md hover:opacity-70 transition-opacity flex-shrink-0'
                            style={{ color: accentColor }}
                            title={showNumber ? 'Ocultar número' : 'Mostrar número completo'}
                        >
                            {showNumber
                                ? <EyeSlashIcon className='w-4 h-4' />
                                : <EyeIcon className='w-4 h-4' />
                            }
                        </button>
                    </div>
                </div>

                {/* Acciones */}
                <div
                    className='flex items-center justify-between gap-2 pt-2'
                    style={{ borderTop: '1px solid rgba(65,210,242,0.1)' }}
                >
                    {/* Izquierda: Editar + Activar/Desactivar */}
                    <div className='flex gap-2 flex-wrap'>
                    {/* Editar alias */}
                    <button
                        onClick={() => onEdit(favorite)}
                        className='flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-opacity hover:opacity-70'
                        style={{
                            backgroundColor: 'rgba(65,210,242,0.08)',
                            color: '#41D2F2',
                            border: '1px solid rgba(65,210,242,0.2)',
                        }}
                    >
                        <PencilSquareIcon className='w-3.5 h-3.5' />
                        Editar
                    </button>

                    {/* Activar / Desactivar */}
                    {isActive ? (
                        <button
                            onClick={() => onDeactivate(_id)}
                            className='flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-opacity hover:opacity-70'
                            style={{
                                backgroundColor: 'rgba(255,233,104,0.08)',
                                color: '#FFE968',
                                border: '1px solid rgba(255,233,104,0.2)',
                            }}
                        >
                            <NoSymbolIcon className='w-3.5 h-3.5' />
                            Desactivar
                        </button>
                    ) : (
                        <button
                            onClick={() => onActivate(_id)}
                            className='flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-opacity hover:opacity-70'
                            style={{
                                backgroundColor: 'rgba(65,210,242,0.08)',
                                color: '#41D2F2',
                                border: '1px solid rgba(65,210,242,0.2)',
                            }}
                        >
                            <CheckCircleIcon className='w-3.5 h-3.5' />
                            Activar
                        </button>
                    )}
                    </div>

                    {/* Derecha: Transferir (solo activa) */}
                    {isActive && (
                        <button
                            onClick={() => onTransfer(favorite)}
                            className='flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-opacity hover:opacity-70 flex-shrink-0'
                            style={{
                                backgroundColor: 'rgba(74,222,128,0.1)',
                                color: '#4ADE80',
                                border: '1px solid rgba(74,222,128,0.3)',
                            }}
                        >
                            <ArrowsRightLeftIcon className='w-3.5 h-3.5' />
                            Transferir
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};