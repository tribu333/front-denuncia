import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/Authservice';
import './Login.css';

const Login = () => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Por ahora, simularemos un login exitoso
      // Cuando tengas el endpoint real, descomenta la línea siguiente:
      // await authService.login(credentials.username, credentials.password);
      
      // Simulación temporal
      if (credentials.username && credentials.password) {
        localStorage.setItem('token', 'dummy-token');
        localStorage.setItem('user', JSON.stringify({
          username: credentials.username,
          role: 'ADMIN'
        }));
        navigate('/gestion');
      } else {
        throw new Error('Credenciales inválidas');
      }
    } catch (err) {
      setError('Usuario o contraseña incorrectos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <h1>🔐 Acceso Administrativo</h1>
          <p>Sistema de Gestión de Denuncias</p>
        </div>

        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">Usuario</label>
            <input
              type="text"
              id="username"
              name="username"
              value={credentials.username}
              onChange={handleChange}
              placeholder="Ingrese su usuario"
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              placeholder="Ingrese su contraseña"
              required
            />
          </div>

          <button type="submit" className="btn btn-login" disabled={loading}>
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>

        <div className="login-footer">
          <a href="/" className="back-link">← Volver al formulario de denuncias</a>
        </div>
      </div>
    </div>
  );
};

export default Login;