import React, { useState } from 'react';
import { Cita } from '../types';
import { CalendarPlus, Eye, X, Calendar as CalendarIcon, Clock, User, MapPin, Activity } from 'lucide-react';

const initialCitas: Cita[] = [
  { id_cita: 1, tipo_cita: 'consulta', nombre_paciente: 'María García', fecha: '2026-03-19', hora: '09:00:00', nombre_consultorio: '101', estado: 'Pendiente', id_paciente: 1, num_expediente: 123, sexo: 'F', edad: 30, id_consultorio: 1, piso: 1, edificio: 'A' },
  { id_cita: 2, tipo_cita: 'urgencia', nombre_paciente: 'Juan Pérez', fecha: '2026-03-19', hora: '10:30:00', nombre_consultorio: '101', estado: 'Atendida', id_paciente: 2, num_expediente: 124, sexo: 'M', edad: 45, id_consultorio: 1, piso: 1, edificio: 'A' },
  { id_cita: 3, tipo_cita: 'intervención', nombre_paciente: 'Ana Martínez', fecha: '2026-03-19', hora: '12:00:00', nombre_consultorio: 'Quirófano 2', estado: 'Pendiente', id_paciente: 3, num_expediente: 125, sexo: 'F', edad: 28, id_consultorio: 2, piso: 2, edificio: 'B' },
  { id_cita: 4, tipo_cita: 'consulta', nombre_paciente: 'Carlos López', fecha: '2026-03-20', hora: '16:00:00', nombre_consultorio: '101', estado: 'Programada', id_paciente: 4, num_expediente: 126, sexo: 'M', edad: 50, id_consultorio: 1, piso: 1, edificio: 'A' },
];

export const Citas: React.FC = () => {
  const [citas, setCitas] = useState<Cita[]>(initialCitas);
  const [selectedCita, setSelectedCita] = useState<Cita | null>(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);

  // Form state for new appointment
  const [newCita, setNewCita] = useState<Partial<Cita>>({
    tipo_cita: 'consulta',
    estado: 'Programada',
    nombre_consultorio: '101' // Defaulting to doctor's office
  });

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }),
      time: date.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
    };
  };

  const handleCreateCita = (e: React.FormEvent) => {
    e.preventDefault();
    const citaToCreate: Cita = {
      id_cita: Math.floor(Math.random() * 10000),
      id_paciente: 1,
      tipo_cita: newCita.tipo_cita as 'consulta' | 'intervención' | 'urgencia',
      nombre_paciente: newCita.nombre_paciente || '',
      fecha: newCita.fecha || new Date().toISOString().split('T')[0],
      hora: newCita.hora || new Date().toTimeString().split(' ')[0],
      nombre_consultorio: newCita.nombre_consultorio || '',
      estado: newCita.estado || 'Programada',
      num_expediente: 0,
      sexo: '',
      edad: 0,
      id_consultorio: 1,
      piso: 1,
      edificio: ''
    };
    
    setCitas([...citas, citaToCreate].sort((a, b) => new Date(`${a.fecha}T${a.hora}`).getTime() - new Date(`${b.fecha}T${b.hora}`).getTime()));
    setIsNewModalOpen(false);
    setNewCita({ tipo_cita: 'consulta', estado: 'Programada', nombre_consultorio: '101' });
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'urgencia': return 'bg-red-100 text-red-800';
      case 'intervención': return 'bg-orange-100 text-orange-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado.toLowerCase()) {
      case 'atendida': return 'bg-green-100 text-green-800';
      case 'cancelada': return 'bg-gray-100 text-gray-800';
      default: return 'bg-indigo-100 text-indigo-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestión de Citas</h2>
          <p className="text-gray-500 mt-1">Administra tus consultas, intervenciones y urgencias.</p>
        </div>
        <button
          onClick={() => setIsNewModalOpen(true)}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium shadow-sm"
        >
          <CalendarPlus className="w-5 h-5 mr-2" />
          Nueva Cita
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Paciente</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Fecha y Hora</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Tipo</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Consultorio</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Estado</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {citas.map((cita) => {
                const { date, time } = formatDateTime(`${cita.fecha}T${cita.hora}`);
                return (
                  <tr key={cita.id_cita} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold mr-3">
                          {cita.nombre_paciente.charAt(0)}
                        </div>
                        <span className="font-medium text-gray-900">{cita.nombre_paciente}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 font-medium">{date}</div>
                      <div className="text-sm text-gray-500">{time}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getTipoColor(cita.tipo_cita)}`}>
                        {cita.tipo_cita}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {cita.nombre_consultorio}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getEstadoColor(cita.estado)}`}>
                        {cita.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => setSelectedCita(cita)}
                        className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Ver detalles"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {citas.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    No hay citas programadas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Detalles de Cita */}
      {selectedCita && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-lg font-bold text-gray-900">Detalles de la Cita</h3>
              <button onClick={() => setSelectedCita(null)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center p-4 bg-indigo-50 rounded-xl">
                <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xl mr-4">
                  {selectedCita.nombre_paciente.charAt(0)}
                </div>
                <div>
                  <p className="text-sm text-indigo-600 font-semibold uppercase tracking-wider">Paciente</p>
                  <p className="text-lg font-bold text-gray-900">{selectedCita.nombre_paciente}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 border border-gray-100 rounded-xl">
                  <div className="flex items-center text-gray-500 mb-1">
                    <CalendarIcon className="w-4 h-4 mr-2" />
                    <span className="text-xs font-semibold uppercase">Fecha</span>
                  </div>
                  <p className="font-medium text-gray-900">{formatDateTime(`${selectedCita.fecha}T${selectedCita.hora}`).date}</p>
                </div>
                <div className="p-4 border border-gray-100 rounded-xl">
                  <div className="flex items-center text-gray-500 mb-1">
                    <Clock className="w-4 h-4 mr-2" />
                    <span className="text-xs font-semibold uppercase">Hora</span>
                  </div>
                  <p className="font-medium text-gray-900">{formatDateTime(`${selectedCita.fecha}T${selectedCita.hora}`).time}</p>
                </div>
                <div className="p-4 border border-gray-100 rounded-xl">
                  <div className="flex items-center text-gray-500 mb-1">
                    <Activity className="w-4 h-4 mr-2" />
                    <span className="text-xs font-semibold uppercase">Tipo</span>
                  </div>
                  <p className="font-medium text-gray-900 capitalize">{selectedCita.tipo_cita}</p>
                </div>
                <div className="p-4 border border-gray-100 rounded-xl">
                  <div className="flex items-center text-gray-500 mb-1">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span className="text-xs font-semibold uppercase">Lugar</span>
                  </div>
                  <p className="font-medium text-gray-900">{selectedCita.nombre_consultorio}</p>
                </div>
              </div>

              <div className="pt-2">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium capitalize ${getEstadoColor(selectedCita.estado)}`}>
                  Estado: {selectedCita.estado}
                </span>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end">
              <button 
                onClick={() => setSelectedCita(null)}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Nueva Cita */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-lg font-bold text-gray-900">Agendar Nueva Cita</h3>
              <button onClick={() => setIsNewModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateCita}>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Paciente</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      required
                      value={newCita.nombre_paciente || ''}
                      onChange={(e) => setNewCita({...newCita, nombre_paciente: e.target.value})}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="Ej. Juan Pérez"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Cita</label>
                    <select
                      value={newCita.tipo_cita}
                      onChange={(e) => setNewCita({...newCita, tipo_cita: e.target.value as any})}
                      className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    >
                      <option value="consulta">Consulta</option>
                      <option value="intervención">Intervención</option>
                      <option value="urgencia">Urgencia</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Consultorio/Área</label>
                    <input
                      type="text"
                      required
                      value={newCita.nombre_consultorio || ''}
                      onChange={(e) => setNewCita({...newCita, nombre_consultorio: e.target.value})}
                      className="block w-full py-2 px-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="Ej. 101"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
                    <input
                      type="date"
                      required
                      value={newCita.fecha || ''}
                      onChange={(e) => setNewCita({...newCita, fecha: e.target.value})}
                      className="block w-full py-2 px-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Hora</label>
                    <input
                      type="time"
                      required
                      value={newCita.hora || ''}
                      onChange={(e) => setNewCita({...newCita, hora: e.target.value})}
                      className="block w-full py-2 px-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>
              </div>
              <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end space-x-3">
                <button 
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 border border-transparent rounded-lg text-white font-medium hover:bg-indigo-700 transition-colors shadow-sm"
                >
                  Guardar Cita
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
