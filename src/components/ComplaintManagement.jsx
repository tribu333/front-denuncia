import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { complaintService } from '../services/ComplaintService';
import { authService } from '../services/Authservice';
import './ComplaintManagement.css';

const ComplaintManagement = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({ total: 0, pending: 0, resolved: 0 });
  
  // Paginación
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [pageSize] = useState(10);

  // Búsqueda y filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  
  const [filters, setFilters] = useState({
    department: '',
    complaintType: '',
    status: ''
  });

  const navigate = useNavigate();

  const departments = [
    'Recursos Humanos',
    'Tecnologias',
    'SIFDE',
    'Secretaria de camara',
    'Sereci',
    'Otro'
  ];

  const complaintTypes = [
    'Acoso Laboral',
    'Discriminación',
    'Incumplimiento de Normas',
    'Conducta Inapropiada',
    'Abuso de Autoridad',
    'Intento de Soborno',
    'Otro'
  ];

  const statuses = ['PENDIENTE', 'EN_REVISION', 'RESUELTO', 'DESESTIMADO'];

  useEffect(() => {
    loadComplaints();
    loadStats();
  }, [currentPage, filters]);

  const loadComplaints = async () => {
    setLoading(true);
    setError('');
    
    try {
      let response;
      const hasFilters = filters.department || filters.complaintType || filters.status;
      
      if (hasFilters) {
        response = await complaintService.advancedSearch(filters, currentPage, pageSize);
      } else {
        response = await complaintService.getComplaints(currentPage, pageSize);
      }
      
      setComplaints(response.content);
      setTotalPages(response.totalPages);
    } catch (err) {
      setError('Error al cargar las denuncias');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await complaintService.getStats();
      setStats(statsData);
    } catch (err) {
      console.error('Error al cargar estadísticas:', err);
    }
  };

  const handleSearch = async (value) => {
    setSearchTerm(value);
    
    if (value.trim().length < 2) {
      setShowSearchResults(false);
      return;
    }

    try {
      const results = await complaintService.searchRealTime(value);
      setSearchResults(results);
      setShowSearchResults(true);
    } catch (err) {
      console.error('Error en búsqueda:', err);
    }
  };

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
    setCurrentPage(0);
  };

  const clearFilters = () => {
    setFilters({
      department: '',
      complaintType: '',
      status: ''
    });
    setSearchTerm('');
    setShowSearchResults(false);
    setCurrentPage(0);
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const selectSearchResult = (complaint) => {
    setSearchTerm(complaint.complaintCode);
    setShowSearchResults(false);
     // ✅ CREAR UN ARRAY CON LA DENUNCIA SELECCIONADA Y MOSTRARLO EN LA TABLA
    setComplaints([complaint]);
    
    // Opcional: Resetear la paginación
    setTotalPages(1);
    setCurrentPage(0);
    
    // Cargar detalles si es necesario
    loadComplaintDetails(complaint.id);
    // Cargar detalles de la denuncia seleccionada
    loadComplaintDetails(complaint.id);
  };

  const loadComplaintDetails = async (id) => {
    // Aquí podrías mostrar un modal o navegar a una vista de detalle
    console.log('Cargar detalles de denuncia:', id);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return '-';
    const date = new Date(dateTimeString);
    return date.toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="management-container">
      {/* Header */}
      <div className="management-header">
        <div>
          <h1>📊 Gestión de Denuncias</h1>
          <p>Panel de administración</p>
        </div>
        <button onClick={handleLogout} className="btn btn-logout">
          Cerrar Sesión
        </button>
      </div>

      {/* Estadísticas */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📝</div>
          <div className="stat-content">
            <h3>{stats.total}</h3>
            <p>Total Denuncias</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <h3>{stats.pending}</h3>
            <p>Pendientes</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✓</div>
          <div className="stat-content">
            <h3>{stats.resolved}</h3>
            <p>Resueltas</p>
          </div>
        </div>
      </div>

      {/* Búsqueda y Filtros */}
      <div className="search-filter-section">
        <div className="search-box">
          <input
            type="text"
            placeholder="🔍 Buscar por código o nombre del trabajador..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="search-input"
          />
          
          {showSearchResults && searchResults.length > 0 && (
            <div className="search-results-dropdown">
              {searchResults.map((result) => (
                <div
                  key={result.id}
                  className="search-result-item"
                  onClick={() => selectSearchResult(result)}
                >
                  <div className="result-code">{result.complaintCode}</div>
                  <div className="result-name">{result.workerFullName}</div>
                  <div className="result-type">{result.complaintType}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="filters-row">
          <select
            value={filters.department}
            onChange={(e) => handleFilterChange('department', e.target.value)}
            className="filter-select"
          >
            <option value="">Todos los departamentos</option>
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>

          <select
            value={filters.complaintType}
            onChange={(e) => handleFilterChange('complaintType', e.target.value)}
            className="filter-select"
          >
            <option value="">Todos los tipos</option>
            {complaintTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>

          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="filter-select"
          >
            <option value="">Todos los estados</option>
            {statuses.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>

          <button onClick={clearFilters} className="btn btn-clear">
            Limpiar Filtros
          </button>
        </div>
      </div>

      {/* Tabla de denuncias */}
      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Cargando denuncias...</p>
        </div>
      ) : complaints.length === 0 ? (
        <div className="no-data">
          <p>No se encontraron denuncias</p>
        </div>
      ) : (
        <>
          <div className="table-container">
            <table className="complaints-table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Trabajador</th>
                  <th>Tipo</th>
                  <th>Departamento</th>
                  <th>Fecha Incidente</th>
                  <th>Fecha Registro</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {complaints.map((complaint) => (
                  <tr key={complaint.id}>
                    <td>
                      <span className="complaint-code">{complaint.complaintCode}</span>
                    </td>
                    <td>{complaint.workerFullName}</td>
                    <td>
                      <span className="complaint-type-badge">
                        {complaint.complaintType}
                      </span>
                    </td>
                    <td>{complaint.department || '-'}</td>
                    <td>{formatDate(complaint.incidentDate)}</td>
                    <td>{formatDateTime(complaint.submittedAt)}</td>
                    <td>
                      <span className={`status-badge status-${complaint.status?.toLowerCase() || 'pendiente'}`}>
                        {complaint.status || 'PENDIENTE'}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn btn-view"
                        onClick={() => loadComplaintDetails(complaint.id)}
                      >
                        Ver
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="btn btn-page"
                onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                disabled={currentPage === 0}
              >
                ← Anterior
              </button>
              
              <span className="page-info">
                Página {currentPage + 1} de {totalPages}
              </span>
              
              <button
                className="btn btn-page"
                onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                disabled={currentPage >= totalPages - 1}
              >
                Siguiente →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ComplaintManagement;