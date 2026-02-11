// services/authService.js
const API_BASE_URL = '/api';

export const authService = {
  login: async (username, password, recordar) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password, recordar }),
      });
      //console.log(response);
      // Manejar errores HTTP
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Credenciales incorrectas');
        } else if (response.status === 400) {
          throw new Error('Datos de login inválidos');
        } else {
          throw new Error(`Error en el servidor: ${response.status}`);
        }
      }
      
      const data = await response.json();
      
      // ✅ Adaptar la respuesta del backend al formato esperado por el frontend
      const authData = {
        token: data.token,
        user: {
          id: data.usuarioId,
          username: data.username,
          nombreCompleto: data.nombreCompleto,
          rol: data.rol
        },
        expiresIn: data.expiresIn,
        tipoToken: data.tipoToken
      };
      
      // Guardar datos en localStorage
      localStorage.setItem('token', authData.token);
      localStorage.setItem('user', JSON.stringify(authData.user));
      localStorage.setItem('loginResponse', JSON.stringify(data));
      
      return authData;
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('loginResponse');
  },

  getCurrentUser: () => {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('Error parsing user from localStorage:', error);
      return null;
    }
  },

  isAuthenticated: () => {
    const token = localStorage.getItem('token');
    if (!token) return false;
    
    // Opcional: Verificar si el token ha expirado
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const exp = payload.exp * 1000; // Convertir a milisegundos
      return Date.now() < exp;
    } catch {
      // Si no podemos decodificar el token, asumimos que es válido
      return true;
    }
  },

  getToken: () => {
    return localStorage.getItem('token');
  },

  // Método para obtener headers con autenticación
  getAuthHeaders: () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    };
  },

  // Método para obtener headers con autenticación para FormData
  getAuthHeadersMultipart: () => {
    const token = localStorage.getItem('token');
    const headers = {
      'Authorization': token ? `Bearer ${token}` : ''
    };
    // No incluir Content-Type para FormData
    return headers;
  }
};