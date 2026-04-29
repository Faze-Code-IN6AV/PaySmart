import toast from 'react-hot-toast';

const baseStyle = {
  borderRadius: '8px',
  fontWeight: 600,
  fontFamily: 'inherit',
  fontSize: '1rem',
  padding: '16px 24px',
  boxShadow: '0 2px 16px 0 rgba(0, 0, 0, 0.18)',
};

export const showSuccess = (message) => {
  toast.success(message, {
    style: {
      ...baseStyle,
      background: 'linear-gradient(90deg, #22c55e 0%, #16a34a 100%)',
      color: '#fff',
      border: '2px solid #22c55e',
    },
    iconTheme: { primary: '#fff', secondary: '#16a34a' },
  });
};

export const showError = (message) => {
  toast.error(message, {
    style: {
      ...baseStyle,
      background: 'linear-gradient(90deg, #ef4444 0%, #b91c1c 100%)',
      color: '#fff',
      border: '2px solid #ef4444',
    },
    iconTheme: { primary: '#fff', secondary: '#b91c1c' },
  });
};

export const showInfo = (message) => {
  toast(message, {
    style: {
      ...baseStyle,
      background: 'linear-gradient(90deg, #41D2F2 0%, #162C5F 100%)',
      color: '#fff',
      border: '2px solid #41D2F2',
    },
    iconTheme: { primary: '#fff', secondary: '#162C5F' },
  });
};

export const showWarning = (message) => {
  toast(message, {
    icon: '⚠️',
    style: {
      ...baseStyle,
      background: 'linear-gradient(90deg, #FFE968 0%, #f59e0b 100%)',
      color: '#0B1830',
      border: '2px solid #FFE968',
    },
  });
};