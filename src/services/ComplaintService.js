const API_BASE_URL = '/api';

export const complaintService = {
  // Crear nueva denuncia
  createComplaint: async (complaintData) => {
    const response = await fetch(`${API_BASE_URL}/complaints/nueva`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(complaintData),
    });
    
    if (!response.ok) {
      throw new Error('Error al crear la denuncia');
    }
    
    return response.json();
  },

  // Obtener todas las denuncias con paginación
  getComplaints: async (page = 0, size = 10, sortBy = 'submittedAt', direction = 'desc') => {
    const response = await fetch(
      `${API_BASE_URL}/complaints/paginacion?page=${page}&size=${size}&sortBy=${sortBy}&direction=${direction}`
    );
    
    if (!response.ok) {
      throw new Error('Error al obtener las denuncias');
    }
    
    return response.json();
  },

  // Búsqueda en tiempo real
  searchRealTime: async (searchTerm) => {
    const response = await fetch(
      `${API_BASE_URL}/complaints/search/real-time?q=${encodeURIComponent(searchTerm)}`
    );
    
    if (!response.ok) {
      throw new Error('Error en la búsqueda');
    }
    
    return response.json();
  },

  // Búsqueda por nombre de trabajador
  searchByWorkerName: async (name, page = 0, size = 10) => {
    const response = await fetch(
      `${API_BASE_URL}/complaints/search/by-worker?name=${encodeURIComponent(name)}&page=${page}&size=${size}`
    );
    
    if (!response.ok) {
      throw new Error('Error al buscar por trabajador');
    }
    
    return response.json();
  },

  // Búsqueda avanzada
  advancedSearch: async (filters, page = 0, size = 10) => {
    const params = new URLSearchParams();
    
    if (filters.department) params.append('department', filters.department);
    if (filters.complaintType) params.append('complaintType', filters.complaintType);
    if (filters.workerName) params.append('workerName', filters.workerName);
    if (filters.status) params.append('status', filters.status);
    
    params.append('page', page);
    params.append('size', size);
    
    const response = await fetch(
      `${API_BASE_URL}/complaints/search/advanced/quick?${params.toString()}`
    );
    
    if (!response.ok) {
      throw new Error('Error en la búsqueda avanzada');
    }
    
    return response.json();
  },

  // Obtener denuncia por código
  getComplaintByCode: async (code) => {
    const response = await fetch(`${API_BASE_URL}/complaints/${code}`);
    
    if (!response.ok) {
      throw new Error('Error al obtener la denuncia');
    }
    
    return response.json();
  },

  // Obtener estadísticas
  getStats: async () => {
    const response = await fetch(`${API_BASE_URL}/complaints/stats`);
    
    if (!response.ok) {
      throw new Error('Error al obtener estadísticas');
    }
    
    return response.json();
  }
};