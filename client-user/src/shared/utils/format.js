// /Users/diego/Tareas/Taller/PaySmart/client-user/src/shared/utils/format.js

export function formatCurrency(amount) {
  return new Intl.NumberFormat("es-GT", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(amount) || 0);
}

// Igual que AccountCard.jsx / FavoriteAccountCard.jsx en client-admin:
// oculta todo excepto los últimos 4 dígitos.
export function maskAccountNumber(accountNumber) {
  const num = String(accountNumber || "");
  if (!num) return "—";
  return `•••• •••• •••• ${num.slice(-4)}`;
}

export function formatDate(date) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("es-GT", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(date) {
  if (!date) return "—";
  return new Date(date).toLocaleString("es-GT");
}