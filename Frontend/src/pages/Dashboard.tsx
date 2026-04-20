import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Cita, Intervencion } from '../types';
import { Clock, User, Activity, MapPin, CheckCircle2, XCircle } from 'lucide-react';
import api from '../services/api';

export const Dashboard: React.FC = () => {
  const { doctor, updateDoctor } = useAuth();
  const [citas, setCitas] = useState<Cita[]>([]);
  const [intervenciones, setIntervenciones] = useState<Intervencion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!doctor?.id_doctor) return;
      try {
        const [citasRes, intervencionesRes] = await Promise.all([
          api.get(`/doctor/${doctor.id_doctor}/citas`),
          api.get(`/doctor/${doctor.id_doctor}/intervenciones`)
        ]);
        setCitas(citasRes.data);
        setIntervenciones(intervencionesRes.data);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [doctor]);

  const toggleDisponibilidad = async () => {
    if (!doctor?.id_consultorio) return;
    try {
      const newDisp = !doctor.disponible;
      await api.put(`/consultorios/${doctor.id_consultorio}/disponible`, { disponible: newDisp });
      updateDoctor({ ...doctor, disponible: newDisp });
    } catch (err) {
      console.error("Error updating disponibilidad:", err);
    }
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return '';
    // timeString from DB might be "09:00:00"
    const [hours, minutes] = timeString.split(':');
    return `${hours}:${minutes}`;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  if (!doctor) return null;

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Bienvenido, {doctor.nombre_doctor}</h2>
            <p className="text-gray-500 mt-1">{doctor.especialidad}</p>
          </div>
          
          {/* Consultorio Asignado */}
          {doctor.id_consultorio ? (
            <div className="flex items-center bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="mr-4">
                <p className="text-sm font-semibold text-gray-900">{doctor.nombre_consultorio}</p>
                <p className="text-xs text-gray-500">Piso {doctor.piso}, {doctor.edificio}</p>
              </div>
              <button
                onClick={toggleDisponibilidad}
                className={`flex items-center px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  doctor.disponible 
                    ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                    : 'bg-red-100 text-red-700 hover:bg-red-200'
                }`}
              >
                {doctor.disponible ? (
                  <><CheckCircle2 className="w-4 h-4 mr-1.5" /> Disponible</>
                ) : (
                  <><XCircle className="w-4 h-4 mr-1.5" /> Ocupado</>
                )}
              </button>
            </div>
          ) : (
            <div className="flex items-center bg-yellow-50 rounded-lg p-4 border border-yellow-200">
              <p className="text-sm font-medium text-yellow-800">No tienes consultorio asignado</p>
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Cargando datos...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Citas del día */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Clock className="w-5 h-5 mr-2 text-indigo-500" />
                Citas Programadas
              </h3>
              <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2.5 py-0.5 rounded-full">
                {citas.length}
              </span>
            </div>
            <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
              {citas.map((cita) => (
                <div key={cita.id_cita} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center">
                      <User className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="font-medium text-gray-900">{cita.nombre_paciente}</span>
                    </div>
                    <span className="text-sm font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                      {formatDate(cita.fecha)} {formatTime(cita.hora)}
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500 mt-2 space-x-4">
                    <span className="capitalize flex items-center">
                      <span className={`w-2 h-2 rounded-full mr-2 ${
                        cita.tipo_cita.toLowerCase() === 'urgencia' ? 'bg-red-500' : 
                        cita.tipo_cita.toLowerCase() === 'intervencion' ? 'bg-orange-500' : 'bg-blue-500'
                      }`}></span>
                      {cita.tipo_cita}
                    </span>
                    <span className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {cita.nombre_consultorio || 'Sin asignar'}
                    </span>
                    <span className="text-gray-400">•</span>
                    <span>{cita.estado}</span>
                  </div>
                </div>
              ))}
              {citas.length === 0 && (
                <div className="p-6 text-center text-gray-500">No hay citas programadas.</div>
              )}
            </div>
          </div>

          {/* Intervenciones Programadas */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Activity className="w-5 h-5 mr-2 text-orange-500" />
                Intervenciones Programadas
              </h3>
              <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2.5 py-0.5 rounded-full">
                {intervenciones.length}
              </span>
            </div>
            <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
              {intervenciones.map((int) => (
                <div key={int.id_intervencion} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-medium text-gray-900">{int.nombre_procedimiento}</span>
                    <span className="text-sm font-semibold text-orange-600 bg-orange-50 px-2 py-1 rounded">
                      {new Date(int.fecha_intervencion).toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' })}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-500 mt-3">
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                      {int.nombre_area}
                    </div>
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-2 text-gray-400" />
                      {int.nombre_paciente}
                    </div>
                  </div>
                  <div className="mt-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                      {int.estado}
                    </span>
                  </div>
                </div>
              ))}
              {intervenciones.length === 0 && (
                <div className="p-6 text-center text-gray-500">No hay intervenciones programadas.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
