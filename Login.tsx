import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, User } from 'lucide-react'; /* Quitamos Stethoscope de aquí */
import api from '../services/api';

export const Login: React.FC = () => {
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const parseJwt = (token: string) => {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
      return null;
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await api.post('/login', { usuario, contrasena: password });
      const { token } = response.data;
      
      const decoded = parseJwt(token);
      if (decoded && decoded.id_doctor) {
        localStorage.setItem('jwt_token', token);
        const docResponse = await api.get(`/doctor/${decoded.id_doctor}`);
        login(token, docResponse.data);
        navigate('/');
      } else {
        setError('Token inválido recibido del servidor.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al iniciar sesión. Verifique sus credenciales.');
      localStorage.removeItem('jwt_token');
    } finally {
      setLoading(false);
    }
  };

  return (
    /* 1. Fondo cambiado a tu color claro */
    <div className="min-h-screen bg-hospital-bg flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        
        {/* --- AQUÍ ESTÁ EL CAMBIO DEL LOGO --- */}
        <div className="flex justify-center mb-2">
          <img 
            src="/logo-hospital.png" 
            alt="Logo Chepa's Hospital" 
            className="w-24 h-24 rounded-full bg-white p-1 shadow-lg border-2 border-hospital-header object-contain"
          />
        </div>
        {/* ------------------------------------ */}

        {/* 3. Título con Hospital Navy */}
        <h2 className="mt-6 text-center text-3xl font-extrabold text-hospital-navy">
          Chepa's Hospital
        </h2>
        <p className="mt-2 text-center text-sm text-hospital-header font-medium">
          Portal de Doctores
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-2xl sm:rounded-2xl sm:px-10 border border-hospital-header/10">
          <form className="space-y-6" onSubmit={handleLogin}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}
            <div>
              <label htmlFor="usuario" className="block text-sm font-medium text-hospital-navy">
                Usuario
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-hospital-header" />
                </div>
                <input
                  id="usuario"
                  type="text"
                  required
                  value={usuario}
                  onChange={(e) => setUsuario(e.target.value)}
                  /* 4. Bordes de los inputs con colores de la paleta */
                  className="block w-full pl-10 sm:text-sm border-gray-300 rounded-lg focus:ring-hospital-accent focus:border-hospital-accent py-2.5 border outline-none transition-all"
                  placeholder="Nombre de usuario"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-hospital-navy">
                Contraseña
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-hospital-header" />
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 sm:text-sm border-gray-300 rounded-lg focus:ring-hospital-accent focus:border-hospital-accent py-2.5 border outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                /* 5. Botón principal con Hospital Navy y hover en Header */
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-md text-sm font-bold text-white bg-hospital-navy hover:bg-hospital-header focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-hospital-accent disabled:opacity-50 transition-colors"
              >
                {loading ? 'Verificando...' : 'Iniciar Sesión'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};