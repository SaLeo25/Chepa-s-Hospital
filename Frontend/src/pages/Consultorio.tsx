import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Building2, MapPin, Phone, Info, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import api from '../services/api';

interface ConsultorioData {
  id_consultorio: number;
  numero: string;
  piso: string;
  edificio: string;
  telefono_extension: string;
  disponible: boolean;
  equipamiento_especial: string;
}

export const Consultorio: React.FC = () => {
  const { doctor, updateDoctor } = useAuth();
  const [consultorio, setConsultorio] = useState<ConsultorioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const fetchConsultorio = async () => {
      if (!doctor?.id_doctor) return;
      try {
        const res = await api.get(`/doctor/${doctor.id_doctor}/consultorio`);
        setConsultorio(res.data);
      } catch (err: any) {
        console.error(err);
        setError('Error al cargar la información del consultorio.');
      } finally {
        setLoading(false);
      }
    };

    fetchConsultorio();
  }, [doctor]);

  const toggleDisponibilidad = async () => {
    if (!consultorio) return;
    setIsUpdating(true);
    try {
      const newStatus = !consultorio.disponible;
      await api.put(`/consultorios/${consultorio.id_consultorio}/disponible`, {
        disponible: newStatus
      });
      
      setConsultorio(prev => prev ? { ...prev, disponible: newStatus } : null);
      
      // Update the doctor context as well to keep dashboard in sync
      if (doctor) {
        updateDoctor({
          ...doctor,
          consultorio_disponible: newStatus
        });
      }
    } catch (err: any) {
      console.error(err);
      alert('Error al actualizar la disponibilidad');
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !consultorio) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-xl flex flex-col items-center justify-center text-center h-64">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h3 className="text-lg font-bold text-red-800">No se pudo cargar el consultorio</h3>
        <p className="text-sm text-red-600 mt-2">{error || 'El doctor no tiene un consultorio asignado.'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Building2 className="w-6 h-6 mr-2 text-indigo-600" />
            Mi Consultorio
          </h2>
          <p className="text-gray-500 mt-1">Información y estado de tu espacio de trabajo.</p>
        </div>
        
        {/* Toggle Disponibilidad */}
        <div className="flex items-center bg-gray-50 p-2 rounded-lg border border-gray-200">
          <span className="text-sm font-medium text-gray-700 mr-3">Estado actual:</span>
          <button
            onClick={toggleDisponibilidad}
            disabled={isUpdating}
            className={`relative inline-flex h-8 w-14 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 ${
              consultorio.disponible ? 'bg-green-500' : 'bg-gray-300'
            } ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
            role="switch"
            aria-checked={consultorio.disponible}
          >
            <span className="sr-only">Cambiar disponibilidad</span>
            <span
              aria-hidden="true"
              className={`pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                consultorio.disponible ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
          <span className={`ml-3 text-sm font-bold ${consultorio.disponible ? 'text-green-600' : 'text-gray-500'}`}>
            {consultorio.disponible ? 'Disponible' : 'Ocupado'}
          </span>
        </div>
      </div>

      {/* Detalles del Consultorio */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-indigo-50/50">
          <h3 className="text-lg font-semibold text-indigo-900">Detalles de Ubicación</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            <div className="flex items-start">
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                <MapPin className="h-5 w-5 text-indigo-600" />
              </div>
              <div className="ml-4">
                <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Ubicación Física</h4>
                <div className="mt-2 space-y-1">
                  <p className="text-lg font-bold text-gray-900">Consultorio {consultorio.numero}</p>
                  <p className="text-md text-gray-700">Piso {consultorio.piso}</p>
                  <p className="text-md text-gray-700">Edificio {consultorio.edificio}</p>
                </div>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                <Phone className="h-5 w-5 text-indigo-600" />
              </div>
              <div className="ml-4">
                <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Contacto Interno</h4>
                <div className="mt-2">
                  <p className="text-lg font-bold text-gray-900">Ext. {consultorio.telefono_extension}</p>
                  <p className="text-sm text-gray-500 mt-1">Para uso exclusivo del personal del hospital.</p>
                </div>
              </div>
            </div>

            <div className="md:col-span-2 flex items-start pt-6 border-t border-gray-100">
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                <Info className="h-5 w-5 text-indigo-600" />
              </div>
              <div className="ml-4 w-full">
                <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Equipamiento Especial</h4>
                <div className="mt-2 bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <p className="text-md text-gray-800">
                    {consultorio.equipamiento_especial || 'Sin equipamiento especial registrado.'}
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 flex items-start">
        <Info className="w-6 h-6 text-blue-500 mr-3 flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="text-md font-bold text-blue-900">Importante sobre la disponibilidad</h4>
          <p className="text-sm text-blue-800 mt-1">
            Recuerda cambiar el estado de tu consultorio a "Ocupado" cuando estés atendiendo a un paciente o realizando una intervención. Esto ayuda al personal de recepción a gestionar el flujo de pacientes de manera eficiente.
          </p>
        </div>
      </div>
    </div>
  );
};
