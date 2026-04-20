/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Citas } from './pages/Citas';
import { Consultas } from './pages/Consultas';
import { Expedientes } from './pages/Expedientes';
import { Intervenciones } from './pages/Intervenciones';
import { Consultorio } from './pages/Consultorio';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="citas" element={<Citas />} />
            <Route path="consultas" element={<Consultas />} />
            <Route path="expedientes" element={<Expedientes />} />
            <Route path="intervenciones" element={<Intervenciones />} />
            <Route path="consultorio" element={<Consultorio />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
