import crypto from 'crypto';

// Genera un número de cuenta aleatorio de N dígitos usando crypto
// Se usa rejection sampling para garantizar exactamente N dígitos
export function generateAccountNumber(length = 18) {
    const digits = [];

    while (digits.length < length) {
        const byte = crypto.randomBytes(1)[0];
        // Se descartan valores >= 250 para evitar sesgo estadístico
        if (byte < 250) {
            digits.push(byte % 10);
        }
    }

    return digits.join('');
}