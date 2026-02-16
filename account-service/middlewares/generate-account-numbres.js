import crypto from 'crypto';

export function generateAccountNumber(length = 18) {
  const bytes = crypto.randomBytes(length);
  const numbers = bytes.toString('hex').replace(/\D/g, '');

  return numbers.slice(0, length);
}
