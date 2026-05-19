import { useState, useEffect, useCallback } from 'react';
import {
  UserGroupIcon, PlusIcon, PencilSquareIcon, TrashIcon,
  MagnifyingGlassIcon, EyeIcon, CheckCircleIcon,
  ExclamationTriangleIcon, XMarkIcon,
} from '@heroicons/react/24/outline';
import { getAllClients, deleteClient } from '../../../shared/api/admin';
import { CreateClientModal } from '../components/CreateClientModal.jsx';
import { EditClientModal }   from '../components/EditClientModal.jsx';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n) =>
  new Intl.NumberFormat('es-GT', { style: 'currency', currency: 'GTQ' }).format(n ?? 0);

// ─── Toast ────────────────────────────────────────────────────────────────────
const Toast = ({ msg, type, onDone }) => {
  useEffect(() => { const t = setTimeout(onDone, 3500); return () => clearTimeout(t); }, [onDone]);
  return (
    <div
      className="fixed top-4 right-4 z-[200] flex items-center gap-2 px-4 py-3 rounded-xl shadow-xl text-sm font-semibold"
      style={{ backgroundColor: type === 'ok' ? '#41D2F2' : '#ef4444', color: '#0B1830', maxWidth: 340 }}
    >
      {type === 'ok'
        ? <CheckCircleIcon className="w-5 h-5" />
        : <ExclamationTriangleIcon className="w-5 h-5" />}
      {msg}
    </div>
  );
};

// ─── Modal ver detalle ────────────────────────────────────────────────────────
const ViewClientModal = ({ client, onClose }) => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
    style={{ backgroundColor: 'rgba(11,24,48,0.9)', backdropFilter: 'blur(4px)' }}
  >
    <div
      className="w-full max-w-md rounded-2xl shadow-2xl my-8"
      style={{ backgroundColor: '#162C5F', border: '1px solid rgba(65,210,242,0.35)' }}
    >
      <div
        className="flex items-center justify-between px-6 py-4"
        style={{ borderBottom: '1px solid rgba(65,210,242,0.2)' }}
      >
        <h2 className="text-lg font-bold" style={{ color: '#FFFFFF' }}>Detalle de Cliente</h2>
        <button onClick={onClose} style={{ color: '#41D2F2' }}>
          <XMarkIcon className="w-5 h-5" />
        </button>
      </div>
      <div className="px-6 py-5 space-y-1">
        {[
          ['Nombre completo', `${client.name} ${client.surname}`],
          ['Username',        client.username],
          ['Email',           client.email],
          ['Teléfono',        client.phone],
          ['DPI',             client.dpi],
          ['Dirección',       client.address],
          ['Nombre de trabajo', client.workName],
          ['Ingresos mensuales', fmt(client.monthlyIncome)],
          ['Estado',          client.status ? 'Activo' : 'Inactivo'],
          ['Email verificado', client.isEmailVerified ? 'Sí' : 'No'],
          ['Creado',          new Date(client.createdAt).toLocaleDateString('es-GT')],
        ].map(([label, value]) => (
          <div
            key={label}
            className="flex justify-between items-start gap-4 py-2"
            style={{ borderBottom: '1px solid rgba(65,210,242,0.06)' }}
          >
            <span className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{label}</span>
            <span className="text-sm font-medium text-right" style={{ color: '#FFFFFF' }}>{value || '—'}</span>
          </div>
        ))}
        <button
          onClick={onClose}
          className="w-full mt-4 py-2.5 rounded-lg text-sm font-semibold"
          style={{ backgroundColor: '#41D2F2', color: '#0B1830' }}
        >
          Cerrar
        </button>
      </div>
    </div>
  </div>
);

// ─── Confirm eliminar ─────────────────────────────────────────────────────────
const DeleteConfirm = ({ client, onConfirm, onCancel, loading }) => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center p-4"
    style={{ backgroundColor: 'rgba(11,24,48,0.9)', backdropFilter: 'blur(4px)' }}
  >
    <div
      className="w-full max-w-sm rounded-2xl p-6 space-y-4"
      style={{ backgroundColor: '#162C5F', border: '1px solid rgba(239,68,68,0.4)' }}
    >
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl" style={{ backgroundColor: 'rgba(239,68,68,0.12)' }}>
          <TrashIcon className="w-6 h-6" style={{ color: '#fca5a5' }} />
        </div>
        <div>
          <h3 className="font-bold" style={{ color: '#fca5a5' }}>Dar de baja al cliente</h3>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>{client.username}</p>
        </div>
      </div>
      <p className="text-sm" style={{ color: 'rgba(255,255,255,0.65)' }}>
        El cliente quedará <span className="font-semibold" style={{ color: '#FFE968' }}>inactivo</span> y no podrá iniciar sesión. Sus datos y movimientos se conservan por cumplimiento legal y auditoría bancaria.
      </p>
      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="flex-1 py-2.5 rounded-lg text-sm font-medium"
          style={{ backgroundColor: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.1)' }}
        >
          Cancelar
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className="flex-1 py-2.5 rounded-lg text-sm font-bold disabled:opacity-60"
          style={{ backgroundColor: '#ef4444', color: '#FFFFFF' }}
        >
          {loading ? 'Procesando...' : 'Dar de baja'}
        </button>
      </div>
    </div>
  </div>
);

// ─── Página principal ─────────────────────────────────────────────────────────
export const AdminClientsPage = () => {
  const [clients,       setClients]       = useState([]);
  const [filtered,      setFiltered]      = useState([]);
  const [search,        setSearch]        = useState('');
  const [loading,       setLoading]       = useState(true);
  const [modal,         setModal]         = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [toast,         setToast]         = useState(null);

  const showToast = useCallback((msg, type = 'ok') => setToast({ msg, type }), []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await getAllClients();
      const data = res.data?.data ?? res.data ?? [];
      setClients(data);
      setFiltered(data);
    } catch {
      showToast('Error al cargar clientes', 'err');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      q
        ? clients.filter((c) =>
            `${c.name} ${c.surname} ${c.username} ${c.email} ${c.dpi}`
              .toLowerCase().includes(q))
        : clients
    );
  }, [search, clients]);

  const handleDeleteConfirm = async () => {
    if (!modal?.client) return;
    setDeleteLoading(true);
    try {
      await deleteClient(modal.client.id);
      showToast('Cliente dado de baja exitosamente');
      setModal(null);
      load();
    } catch (err) {
      showToast(err?.response?.data?.message || 'Error al eliminar', 'err');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {toast && (
        <Toast msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />
      )}

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: '#FFFFFF' }}>
            <UserGroupIcon className="w-6 h-6" style={{ color: '#41D2F2' }} />
            Gestión de Clientes
          </h1>
          <p className="text-sm mt-1" style={{ color: '#41D2F2' }}>
            {clients.length} cliente{clients.length !== 1 ? 's' : ''} registrado{clients.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => setModal('create')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold hover:opacity-80 transition-opacity"
          style={{ backgroundColor: '#41D2F2', color: '#0B1830' }}
        >
          <PlusIcon className="w-5 h-5" />
          Nuevo Cliente
        </button>
      </div>

      {/* Buscador */}
      <div className="relative max-w-md">
        <MagnifyingGlassIcon
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
          style={{ color: '#41D2F2' }}
        />
        <input
          type="text"
          placeholder="Buscar por nombre, username, email o DPI…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border focus:outline-none"
          style={{ backgroundColor: '#162C5F', borderColor: 'rgba(65,210,242,0.3)', color: '#FFFFFF' }}
        />
      </div>

      {/* Tabla */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <p className="text-sm" style={{ color: 'rgba(65,210,242,0.6)' }}>Cargando clientes…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-20 rounded-2xl"
          style={{ backgroundColor: '#162C5F', border: '1px dashed rgba(65,210,242,0.2)' }}
        >
          <UserGroupIcon className="w-12 h-12 mb-4" style={{ color: 'rgba(65,210,242,0.3)' }} />
          <p className="text-base font-semibold" style={{ color: 'rgba(255,255,255,0.5)' }}>
            {search ? 'Sin resultados para esa búsqueda' : 'Aún no hay clientes registrados'}
          </p>
        </div>
      ) : (
        <div
          className="overflow-x-auto rounded-2xl"
          style={{ border: '1px solid rgba(65,210,242,0.15)' }}
        >
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: 'rgba(65,210,242,0.08)' }}>
                {['Cliente', 'Username', 'Email', 'DPI', 'Ingresos', 'Estado', 'Acciones'].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-semibold"
                    style={{ color: '#41D2F2' }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((c, i) => (
                <tr
                  key={c.id}
                  style={{
                    backgroundColor: i % 2 === 0 ? '#162C5F' : 'rgba(22,44,95,0.5)',
                    borderTop: '1px solid rgba(65,210,242,0.06)',
                  }}
                >
                  <td className="px-4 py-3">
                    <div className="font-semibold" style={{ color: '#FFFFFF' }}>
                      {c.name} {c.surname}
                    </div>
                    <div className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                      {c.phone || '—'}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs" style={{ color: '#41D2F2' }}>
                    {c.username}
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: 'rgba(255,255,255,0.7)' }}>
                    {c.email}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs" style={{ color: '#FFE968' }}>
                    {c.dpi || '—'}
                  </td>
                  <td className="px-4 py-3 text-xs font-semibold" style={{ color: '#FFE968' }}>
                    {fmt(c.monthlyIncome)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="px-2 py-1 rounded-full text-xs font-semibold"
                      style={{
                        backgroundColor: c.status ? 'rgba(65,210,242,0.12)' : 'rgba(239,68,68,0.12)',
                        color: c.status ? '#41D2F2' : '#fca5a5',
                      }}
                    >
                      {c.status ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        title="Ver detalle"
                        onClick={() => setModal({ type: 'view', client: c })}
                        className="p-1.5 rounded-lg hover:opacity-70"
                        style={{ color: '#41D2F2', backgroundColor: 'rgba(65,210,242,0.08)' }}
                      >
                        <EyeIcon className="w-4 h-4" />
                      </button>
                      <button
                        title="Editar"
                        onClick={() => setModal({ type: 'edit', client: c })}
                        className="p-1.5 rounded-lg hover:opacity-70"
                        style={{ color: '#FFE968', backgroundColor: 'rgba(255,233,104,0.08)' }}
                      >
                        <PencilSquareIcon className="w-4 h-4" />
                      </button>
                      <button
                        title="Dar de baja"
                        onClick={() => setModal({ type: 'delete', client: c })}
                        className="p-1.5 rounded-lg hover:opacity-70"
                        style={{ color: '#fca5a5', backgroundColor: 'rgba(239,68,68,0.08)' }}
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modals — definidos FUERA del render tree para evitar re-mount */}
      {modal === 'create' && (
        <CreateClientModal
          onClose={() => setModal(null)}
          onCreated={() => { showToast('Cliente creado exitosamente'); load(); }}
        />
      )}
      {modal?.type === 'view' && (
        <ViewClientModal client={modal.client} onClose={() => setModal(null)} />
      )}
      {modal?.type === 'edit' && (
        <EditClientModal
          client={modal.client}
          onClose={() => setModal(null)}
          onUpdated={() => { showToast('Cliente actualizado'); load(); }}
        />
      )}
      {modal?.type === 'delete' && (
        <DeleteConfirm
          client={modal.client}
          loading={deleteLoading}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setModal(null)}
        />
      )}
    </div>
  );
};