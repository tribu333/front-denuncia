// pages/LoginPage.jsx
import { useNavigate } from 'react-router-dom'; // 👈 IMPORTANTE
import Login from '../components/Login';

const LoginPage = () => {
  const navigate = useNavigate(); // 👈 Hook para navegación

  const handleLoginSuccess = (userData) => {
    console.log('Login exitoso, redirigiendo a gestión...');
    // ✅ REDIRECCIÓN EXPLÍCITA
    navigate('/gestion'); // 👈 AQUÍ ESTÁ LA SOLUCIÓN
  };

  return <Login onLoginSuccess={handleLoginSuccess} />;
};

export default LoginPage;