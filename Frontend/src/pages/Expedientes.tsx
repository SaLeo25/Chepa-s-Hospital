import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Expediente } from '../types';
import { Search, FileText, User, Calendar, Activity, Clock, Stethoscope, Pill, AlertCircle } from 'lucide-react';
import api from '../services/api';

export const Expedientes: React.FC = () => {
  const { doctor } = useAuth();
  const [searchId, setSearchId] = useState('');
  const [expediente, setExpediente] = useState<Expediente | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchId.trim() || parseInt(searchId) <= 0) {
      setError('Por favor, ingrese un ID de paciente válido (mayor a 0).');
      return;
    }

    setLoading(true);
    setError('');
    setExpediente(null);

    try {
      const res = await api.get(`/pacientes/${searchId}/expediente`);
      // BLINDAJE: Verificamos que los datos realmente existan en la respuesta
      if (!res.data || !res.data.paciente) {
        setError('El paciente existe pero su expediente está incompleto.');
      } else {
        setExpediente(res.data);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'No se encontró el paciente o hubo un error en la búsqueda.');
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateString: any) => {
    if (!dateString) return { date: 'N/A', time: 'N/A' };
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return { date: 'Fecha inválida', time: 'N/A' };
      return {
        date: date.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }),
        time: date.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
      };
    } catch {
      return { date: 'Error', time: 'N/A' };
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-2xl font-bold text-gray-900">Expediente Clínico</h2>
        <p className="text-gray-500 mt-1">Busca y visualiza el historial médico completo de los pacientes.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <form onSubmit={handleSearch} className="flex gap-4 max-w-2xl">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="number"
              min="1"
              // BLINDAJE: Evita que escriban el signo '-' o la letra 'e'
              onKeyDown={(e) => ['-', 'e', 'E'].includes(e.key) && e.preventDefault()}
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              placeholder="Ingrese el ID del paciente..."
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Buscando...' : 'Buscar'}
          </button>
        </form>

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}
      </div>

      {/* BLINDAJE: Uso de encadenamiento opcional (?.) para evitar crasheos */}
      {expediente && expediente.paciente && (
        <div className="space-y-6 animate-in fade-in duration-500">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-indigo-50/50 flex items-center">
              <User className="w-5 h-5 mr-2 text-indigo-600" />
              <h3 className="text-lg font-semibold text-indigo-900">Datos del Paciente</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <p className="text-sm font-medium text-gray-500">ID Paciente</p>
                  <p className="mt-1 text-lg font-semibold text-gray-900">{expediente.paciente?.id_paciente || 'S/N'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Nombre Completo</p>
                  <p className="mt-1 text-lg font-semibold text-gray-900">
                    {expediente.paciente?.nombre_paciente || 'Paciente'} {expediente.paciente?.apellido || ''}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Edad</p>
                  <p className="mt-1 text-lg font-semibold text-gray-900">{expediente.paciente?.edad || 'N/A'} años</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Teléfono</p>
                  <p className="mt-1 text-lg font-semibold text-gray-900">{expediente.paciente?.numero_telefono || 'Sin teléfono'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Consultas */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-indigo-500" />
                <h3 className="text-lg font-semibold text-gray-900">Historial de Consultas ({expediente.consultas?.length || 0})</h3>
              </div>
              <div className="p-6 overflow-y-auto max-h-[500px] bg-gray-50/30">
                <div className="space-y-4">
                  {expediente.consultas && expediente.consultas.length > 0 ? (
                    expediente.consultas.map((consulta) => {
                      const { date, time } = formatDateTime(consulta.fecha_hora);
                      return (
                        <div key={consulta.id_consulta} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center text-xs text-gray-500">
                              <Calendar className="w-3.5 h-3.5 mr-1" /> {date} • <Clock className="w-3.5 h-3.5 ml-1 mr-1" /> {time}
                            </div>
                          </div>
                          <p className="text-sm font-semibold text-gray-800">{consulta.motivo_consulta}</p>
                          <div className="mt-2 text-xs text-gray-600 bg-indigo-50 p-2 rounded">
                            <strong>Diag:</strong> {consulta.diagnostico}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-center text-gray-500 py-4 text-sm">No hay consultas registradas.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Intervenciones */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center">
                <Activity className="w-5 h-5 mr-2 text-indigo-500" />
                <h3 className="text-lg font-semibold text-gray-900">Intervenciones ({expediente.intervenciones?.length || 0})</h3>
              </div>
              <div className="p-6 overflow-y-auto max-h-[500px] bg-gray-50/30">
                <div className="space-y-4">
                  {expediente.intervenciones && expediente.intervenciones.length > 0 ? (
                    expediente.intervenciones.map((intervencion) => {
                      const { date } = formatDateTime(intervencion.fecha_hora);
                      return (
                        <div key={intervencion.id_intervencion} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                           <p className="text-xs text-gray-500 mb-1">{date}</p>
                           <p className="text-sm font-bold text-gray-800">{intervencion.tipo_intervencion}</p>
                           <span className="text-[10px] px-2 py-0.5 bg-green-100 text-green-700 rounded-full">{intervencion.estado}</span>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-center text-gray-500 py-4 text-sm">No hay intervenciones.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};