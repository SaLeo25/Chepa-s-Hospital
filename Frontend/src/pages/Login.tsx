import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Stethoscope, Lock, User } from 'lucide-react';
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
        // Guardamos el token temporalmente para que el interceptor de Axios lo tome
        localStorage.setItem('jwt_token', token);
        
        // Obtenemos los datos completos del doctor
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
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center shadow-lg">
            <Stethoscope className="w-8 h-8 text-white" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Hospital XYZ
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Portal de Doctores
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleLogin}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}
            <div>
              <label htmlFor="usuario" className="block text-sm font-medium text-gray-700">
                Usuario
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="usuario"
                  name="usuario"
                  type="text"
                  required
                  value={usuario}
                  onChange={(e) => setUsuario(e.target.value)}
                  className="block w-full pl-10 sm:text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 py-2 border"
                  placeholder="Nombre de usuario"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Contraseña
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 sm:text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 py-2 border"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
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
