import { useState, useEffect } from 'react';
import { XMarkIcon, CubeIcon } from '@heroicons/react/24/outline';

const INITIAL_FORM = {
    name: '',
    description: '',
    price: '',
    type: 'SERVICE',
    stock: '',
    exclusive: false,
};

export const CreateProductModal = ({ onClose, onSubmit, loading, editProduct }) => {
    const [form, setForm] = useState(INITIAL_FORM);
    const [errors, setErrors] = useState({});

    const isEditing = !!editProduct;

    useEffect(() => {
        if (editProduct) {
            setForm({
                name: editProduct.name ?? '',
                description: editProduct.description ?? '',
                price: editProduct.price?.toString() ?? '',
                type: editProduct.type ?? 'SERVICE',
                stock: editProduct.stock !== null && editProduct.stock !== undefined
                    ? editProduct.stock.toString()
                    : '',
                exclusive: editProduct.exclusive ?? false,
            });
        }
    }, [editProduct]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
    };

    const validate = () => {
        const newErrors = {};
        if (!form.name.trim()) newErrors.name = 'El nombre es requerido.';
        if (!form.price || isNaN(Number(form.price)) || Number(form.price) < 0)
            newErrors.price = 'Ingresa un precio válido (≥ 0).';
        if (form.stock !== '' && (isNaN(Number(form.stock)) || Number(form.stock) < 0))
            newErrors.stock = 'Stock debe ser un número ≥ 0, o déjalo vacío para ilimitado.';
        return newErrors;
    };

    const handleSubmit = () => {
        const newErrors = validate();
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        const payload = {
            name: form.name.trim(),
            description: form.description.trim() || undefined,
            price: parseFloat(form.price),
            type: form.type,
            stock: form.stock === '' ? null : parseInt(form.stock, 10),
            exclusive: form.exclusive,
        };

        onSubmit(payload);
    };

    const inputStyle = (field) => ({
        backgroundColor: 'rgba(11,24,48,0.6)',
        border: `1px solid ${errors[field] ? 'rgba(239,68,68,0.5)' : 'rgba(65,210,242,0.2)'}`,
        color: '#FFFFFF',
        borderRadius: '0.75rem',
        padding: '0.6rem 0.875rem',
        width: '100%',
        fontSize: '0.875rem',
        outline: 'none',
    });

    const labelStyle = {
        fontSize: '0.75rem',
        color: 'rgba(255,255,255,0.55)',
        marginBottom: '0.35rem',
        display: 'block',
    };

    return (
        <div
            className='fixed inset-0 z-50 flex items-center justify-center p-4'
            style={{ backgroundColor: 'rgba(11,24,48,0.85)', backdropFilter: 'blur(4px)' }}
        >
            <div
                className='w-full max-w-md rounded-2xl p-6 flex flex-col gap-5'
                style={{
                    backgroundColor: '#162C5F',
                    border: '1px solid rgba(65,210,242,0.2)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                    maxHeight: '90vh',
                    overflowY: 'auto',
                }}
            >
                {/* Header */}
                <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-3'>
                        <div
                            className='p-2.5 rounded-xl'
                            style={{ backgroundColor: 'rgba(65,210,242,0.12)' }}
                        >
                            <CubeIcon className='w-5 h-5' style={{ color: '#41D2F2' }} />
                        </div>
                        <div>
                            <h2 className='font-bold text-base' style={{ color: '#FFFFFF' }}>
                                {isEditing ? 'Editar producto' : 'Nuevo producto'}
                            </h2>
                            <p className='text-xs' style={{ color: 'rgba(255,255,255,0.4)' }}>
                                {isEditing ? 'Modifica los campos que desees' : 'Completa los datos del producto'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className='p-1.5 rounded-lg transition-opacity hover:opacity-70'
                        style={{ color: 'rgba(255,255,255,0.4)' }}
                    >
                        <XMarkIcon className='w-5 h-5' />
                    </button>
                </div>

                {/* Form fields */}
                <div className='flex flex-col gap-4'>
                    {/* Nombre */}
                    <div>
                        <label style={labelStyle}>Nombre *</label>
                        <input
                            name='name'
                            value={form.name}
                            onChange={handleChange}
                            placeholder='Ej. Seguro de vida'
                            style={inputStyle('name')}
                        />
                        {errors.name && (
                            <p className='text-xs mt-1' style={{ color: '#fca5a5' }}>{errors.name}</p>
                        )}
                    </div>

                    {/* Descripción */}
                    <div>
                        <label style={labelStyle}>Descripción (opcional)</label>
                        <textarea
                            name='description'
                            value={form.description}
                            onChange={handleChange}
                            placeholder='Describe el producto brevemente...'
                            rows={3}
                            style={{ ...inputStyle('description'), resize: 'none' }}
                        />
                    </div>

                    {/* Precio */}
                    <div>
                        <label style={labelStyle}>Precio (GTQ) *</label>
                        <input
                            name='price'
                            type='number'
                            min='0'
                            step='0.01'
                            value={form.price}
                            onChange={handleChange}
                            placeholder='0.00'
                            style={inputStyle('price')}
                        />
                        {errors.price && (
                            <p className='text-xs mt-1' style={{ color: '#fca5a5' }}>{errors.price}</p>
                        )}
                    </div>

                    {/* Tipo */}
                    <div>
                        <label style={labelStyle}>Tipo *</label>
                        <select
                            name='type'
                            value={form.type}
                            onChange={handleChange}
                            style={inputStyle('type')}
                        >
                            <option value='SERVICE'>Servicio</option>
                            <option value='PRODUCT'>Producto</option>
                        </select>
                    </div>

                    {/* Stock */}
                    <div>
                        <label style={labelStyle}>Stock (vacío = ilimitado)</label>
                        <input
                            name='stock'
                            type='number'
                            min='0'
                            value={form.stock}
                            onChange={handleChange}
                            placeholder='Dejar vacío para ilimitado'
                            style={inputStyle('stock')}
                        />
                        {errors.stock && (
                            <p className='text-xs mt-1' style={{ color: '#fca5a5' }}>{errors.stock}</p>
                        )}
                    </div>

                    {/* Exclusivo */}
                    <label
                        className='flex items-center gap-3 cursor-pointer select-none'
                        style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem' }}
                    >
                        <div className='relative'>
                            <input
                                type='checkbox'
                                name='exclusive'
                                checked={form.exclusive}
                                onChange={handleChange}
                                className='sr-only'
                            />
                            <div
                                className='w-10 h-5 rounded-full transition-colors duration-200'
                                style={{
                                    backgroundColor: form.exclusive
                                        ? '#41D2F2'
                                        : 'rgba(255,255,255,0.15)',
                                }}
                            />
                            <div
                                className='absolute top-0.5 w-4 h-4 rounded-full transition-transform duration-200'
                                style={{
                                    backgroundColor: '#FFFFFF',
                                    transform: form.exclusive ? 'translateX(1.25rem)' : 'translateX(0.125rem)',
                                }}
                            />
                        </div>
                        Producto exclusivo
                    </label>
                </div>

                {/* Buttons */}
                <div className='flex gap-3 pt-1'>
                    <button
                        onClick={onClose}
                        className='flex-1 py-2.5 rounded-xl text-sm font-semibold transition-opacity hover:opacity-80'
                        style={{
                            backgroundColor: 'rgba(255,255,255,0.06)',
                            color: 'rgba(255,255,255,0.6)',
                            border: '1px solid rgba(255,255,255,0.1)',
                        }}
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className='flex-1 py-2.5 rounded-xl text-sm font-bold transition-opacity hover:opacity-90 disabled:opacity-50'
                        style={{ backgroundColor: '#41D2F2', color: '#0B1830' }}
                    >
                        {loading ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Crear producto'}
                    </button>
                </div>
            </div>
        </div>
    );
};