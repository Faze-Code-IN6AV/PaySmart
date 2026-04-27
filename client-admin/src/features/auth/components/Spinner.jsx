export const Spinner = () => {
  return (
    <div className='min-h-screen flex items-center justify-center' style={{ backgroundColor: '#0B1830' }}>
      <div className='flex flex-col items-center gap-4'>
        <div
          className='w-12 h-12 rounded-full border-4 animate-spin'
          style={{ borderColor: '#41D2F2', borderTopColor: 'transparent' }}
        />
        <p className='text-sm font-medium' style={{ color: '#41D2F2' }}>
          Cargando...
        </p>
      </div>
    </div>
  );
};
