import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Consulta } from '../types';
import { FileText, Clock, Calendar, User, Activity, CheckCircle2, Stethoscope, Pill } from 'lucide-react';
import api from '../services/api';

export const Consultas: React.FC = () => {
  const { doctor } = useAuth();
  const [consultas, setConsultas] = useState<Consulta[]>([]);
  const [selectedPaciente, setSelectedPaciente] = useState<string>('');

  // Form state
  const [formData, setFormData] = useState<Partial<Consulta>>({
    id_paciente: 0,
    motivo_consulta: '',
    diagnostico: '',
    tratamiento: '',
    observaciones: '',
    duracion: 30
  });

  // --- NUEVO: EFECTO PARA CARGAR EL HISTORIAL DESDE LA DB AL INICIAR ---
  useEffect(() => {
    const cargarHistorial = async () => {
      if (doctor?.id_doctor) {
        try {
          console.log("📡 Cargando historial desde la base de datos...");
          // Usamos la ruta GET que creamos en el backend
          const res = await api.get(`/consultas/doctor/${doctor.id_doctor}`);
          setConsultas(res.data);
        } catch (err) {
          console.error("Error al obtener el historial:", err);
        }
      }
    };

    cargarHistorial();
  }, [doctor?.id_doctor]); 
  // -------------------------------------------------------------------

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: (name === 'duracion' || name === 'id_paciente') ? parseInt(value) || 0 : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!doctor?.id_doctor || !doctor?.id_consultorio) {
      alert('Error: El doctor no tiene un consultorio asignado o no está autenticado.');
      return;
    }

    try {
      const payload = {
        id_paciente: formData.id_paciente,
        id_doctor: doctor.id_doctor,
        id_consultorio: doctor.id_consultorio,
        motivo_consulta: formData.motivo_consulta,
        diagnostico: formData.diagnostico,
        tratamiento: formData.tratamiento,
        observaciones: formData.observaciones,
        duracion: formData.duracion
      };

      const res = await api.post('/consultas', payload);
      
      // Actualizamos la lista local agregando la nueva consulta al inicio
      setConsultas([res.data.consulta, ...consultas]);
      
      setFormData({
        id_paciente: 0,
        motivo_consulta: '',
        diagnostico: '',
        tratamiento: '',
        observaciones: '',
        duracion: 30
      });
      
      alert('Consulta registrada exitosamente');
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || 'Error al registrar la consulta');
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

  const historialFiltrado = selectedPaciente 
    ? consultas.filter(c => c.id_paciente.toString() === selectedPaciente)
    : consultas;

  const pacientesUnicos = Array.from(new Set(consultas.map(c => c.id_paciente)));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-2xl font-bold text-gray-900">Consultas Médicas</h2>
        <p className="text-gray-500 mt-1">Registra nuevas consultas y revisa el historial clínico de tus pacientes.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Formulario de Registro */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-indigo-50/50">
              <h3 className="text-lg font-semibold text-indigo-900 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-indigo-600" />
                Registrar Consulta
              </h3>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ID del Paciente</label>
                <input
                  type="number"
                  name="id_paciente"
                  min="1"
                  required
                  value={formData.id_paciente || ''}
                  onChange={handleInputChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="ID del paciente"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Motivo</label>
                <textarea
                  name="motivo_consulta"
                  required
                  rows={2}
                  value={formData.motivo_consulta}
                  onChange={handleInputChange}
                  className="block w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Síntomas..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Diagnóstico</label>
                <textarea
                  name="diagnostico"
                  required
                  rows={2}
                  value={formData.diagnostico}
                  onChange={handleInputChange}
                  className="block w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Diagnóstico..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tratamiento</label>
                <textarea
                  name="tratamiento"
                  required
                  rows={2}
                  value={formData.tratamiento}
                  onChange={handleInputChange}
                  className="block w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Medicinas..."
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 transition-colors font-medium"
              >
                Guardar Consulta
              </button>
            </form>
          </div>
        </div>

        {/* Historial (Derecha) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Historial</h3>
              <select
                value={selectedPaciente}
                onChange={(e) => setSelectedPaciente(e.target.value)}
                className="text-sm border-gray-300 rounded-lg"
              >
                <option value="">Todos los pacientes</option>
                {pacientesUnicos.map(id => (
                  <option key={id} value={id}>Paciente ID: {id}</option>
                ))}
              </select>
            </div>

            <div className="p-6 space-y-4 bg-gray-50/30 overflow-y-auto max-h-[600px]">
              {historialFiltrado.length > 0 ? (
                historialFiltrado.map((consulta) => {
                  const { date, time } = formatDateTime(consulta.fecha_hora || '');
                  return (
                    <div key={consulta.id_consulta} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                      <div className="flex justify-between items-center mb-4">
                        <span className="font-bold text-gray-900">Paciente ID: {consulta.id_paciente}</span>
                        <span className="text-xs text-gray-500">{date} - {time}</span>
                      </div>
                      <div className="text-sm space-y-2">
                        <p><strong>Motivo:</strong> {consulta.motivo_consulta}</p>
                        <p className="p-2 bg-indigo-50 rounded"><strong>Diagnóstico:</strong> {consulta.diagnostico}</p>
                        <p className="p-2 bg-green-50 rounded"><strong>Tratamiento:</strong> {consulta.tratamiento}</p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-center text-gray-500 py-10">No hay consultas registradas.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};