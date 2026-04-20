import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Intervencion } from '../types';
import { Activity, Calendar, Clock, User, CheckCircle2, AlertCircle, Edit3 } from 'lucide-react';
import api from '../services/api';

export const Intervenciones: React.FC = () => {
  const { doctor } = useAuth();
  const [intervenciones, setIntervenciones] = useState<Intervencion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedIntervencion, setSelectedIntervencion] = useState<Intervencion | null>(null);
  const [updateData, setUpdateData] = useState({
    estado: '',
    observaciones: ''
  });

  useEffect(() => {
    const fetchIntervenciones = async () => {
      if (!doctor?.id_doctor) return;
      try {
        const res = await api.get(`/doctor/${doctor.id_doctor}/intervenciones`);
        setIntervenciones(res.data);
      } catch (err: any) {
        console.error(err);
        setError('Error al cargar las intervenciones.');
      } finally {
        setLoading(false);
      }
    };

    fetchIntervenciones();
  }, [doctor]);

  const handleOpenModal = (intervencion: Intervencion) => {
    setSelectedIntervencion(intervencion);
    setUpdateData({
      estado: intervencion.estado || 'Programada',
      observaciones: intervencion.observaciones || ''
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedIntervencion(null);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIntervencion) return;

    try {
      const res = await api.put(`/intervenciones/${selectedIntervencion.id_intervencion}`, updateData);
      
      // Update local state
      setIntervenciones(prev => 
        prev.map(i => 
          i.id_intervencion === selectedIntervencion.id_intervencion 
            ? { ...i, estado: updateData.estado, observaciones: updateData.observaciones } 
            : i
        )
      );
      
      handleCloseModal();
      alert('Intervención actualizada exitosamente');
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || 'Error al actualizar la intervención');
    }
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return { date: '', time: '' };
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }),
      time: date.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
    };
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestión de Intervenciones</h2>
          <p className="text-gray-500 mt-1">Administra y actualiza el estado de tus procedimientos quirúrgicos.</p>
        </div>
        <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-100 flex items-center">
          <Activity className="w-6 h-6 text-indigo-600 mr-3" />
          <div>
            <p className="text-xs font-medium text-indigo-600 uppercase tracking-wider">Total Asignadas</p>
            <p className="text-xl font-bold text-indigo-900">{intervenciones.length}</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
          <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Lista de Intervenciones */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {intervenciones.length > 0 ? (
          intervenciones.map((intervencion) => {
            const { date, time } = formatDateTime(intervencion.fecha_hora);
            const isCompleted = intervencion.estado === 'Finalizada';
            const isInProgress = intervencion.estado === 'En proceso';
            
            return (
              <div key={intervencion.id_intervencion} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
                <div className={`px-5 py-3 border-b flex justify-between items-center ${
                  isCompleted ? 'bg-green-50 border-green-100' : 
                  isInProgress ? 'bg-blue-50 border-blue-100' : 
                  'bg-yellow-50 border-yellow-100'
                }`}>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                    isCompleted ? 'bg-green-100 text-green-800 border-green-200' : 
                    isInProgress ? 'bg-blue-100 text-blue-800 border-blue-200' : 
                    'bg-yellow-100 text-yellow-800 border-yellow-200'
                  }`}>
                    {intervencion.estado || 'Programada'}
                  </span>
                  <span className="text-xs font-medium text-gray-500">ID: {intervencion.id_intervencion}</span>
                </div>
                
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">{intervencion.tipo_intervencion}</h3>
                  
                  <div className="space-y-3 mb-6 flex-1">
                    <div className="flex items-center text-sm text-gray-600">
                      <User className="w-4 h-4 mr-2 text-gray-400" />
                      <span className="font-medium mr-1">Paciente ID:</span> {intervencion.id_paciente}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                      <span className="font-medium mr-1">Fecha:</span> {date}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="w-4 h-4 mr-2 text-gray-400" />
                      <span className="font-medium mr-1">Hora:</span> {time}
                    </div>
                    {intervencion.observaciones && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Observaciones</p>
                        <p className="text-sm text-gray-700 italic line-clamp-2">{intervencion.observaciones}</p>
                      </div>
                    )}
                  </div>
                  
                  <button
                    onClick={() => handleOpenModal(intervencion)}
                    className="w-full flex justify-center items-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                  >
                    <Edit3 className="w-4 h-4 mr-2 text-gray-500" />
                    Actualizar Estado
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <Activity className="mx-auto h-12 w-12 text-gray-300" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay intervenciones</h3>
            <p className="mt-1 text-sm text-gray-500">
              No tienes intervenciones quirúrgicas programadas en este momento.
            </p>
          </div>
        )}
      </div>

      {/* Modal de Actualización */}
      {isModalOpen && selectedIntervencion && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={handleCloseModal}></div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 sm:mx-0 sm:h-10 sm:w-10">
                    <Activity className="h-6 w-6 text-indigo-600" aria-hidden="true" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                      Actualizar Intervención
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500 mb-4">
                        Actualiza el estado y las observaciones para: <span className="font-semibold text-gray-900">{selectedIntervencion.tipo_intervencion}</span>
                      </p>
                      
                      <form id="update-form" onSubmit={handleUpdate} className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                          <select
                            value={updateData.estado}
                            onChange={(e) => setUpdateData({...updateData, estado: e.target.value})}
                            className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          >
                            <option value="Programada">Programada</option>
                            <option value="En proceso">En proceso</option>
                            <option value="Finalizada">Finalizada</option>
                            <option value="Cancelada">Cancelada</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones</label>
                          <textarea
                            rows={4}
                            value={updateData.observaciones}
                            onChange={(e) => setUpdateData({...updateData, observaciones: e.target.value})}
                            className="block w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            placeholder="Notas de la cirugía, complicaciones, resultados..."
                          />
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="submit"
                  form="update-form"
                  className="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Guardar Cambios
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="mt-3 w-full inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
