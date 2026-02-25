import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import './index.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Rutas Protegidas para todos (Admin/Viewer) */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>

        {/* Rutas Protegidas solo para Admin */}
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route path="/users" element={<div className="p-6 text-[var(--text-primary)] text-xl">Gestión de Usuarios (Próximamente)</div>} />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
