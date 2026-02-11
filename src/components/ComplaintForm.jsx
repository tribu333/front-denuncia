import { useState } from 'react';
import { complaintService } from '../services/ComplaintService';
import './ComplaintForm.css';

const ComplaintForm = () => {
  const [formData, setFormData] = useState({
    complaintType: '',
    incidentDate: '',
    description: '',
    workerFullName: '',
    workerDescription: '',
    location: '',
    department: '',
    workerPosition: ''
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [complaintCode, setComplaintCode] = useState('');

  const complaintTypes = [
    'Acoso Laboral',
    'Discriminación',
    'Incumplimiento de Normas',
    'Conducta Inapropiada',
    'Abuso de Autoridad',
    'Intento de Soborno',
    'Otro'
  ];

  const departments = [
    'Recursos Humanos',
    'Tecnologias',
    'SIFDE',
    'Secretaria de camara',
    'Sereci',
    'Otro'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const response = await complaintService.createComplaint(formData);
      setSuccess(true);
      setComplaintCode(response.complaintCode);
      
      // Limpiar formulario
      setFormData({
        complaintType: '',
        incidentDate: '',
        description: '',
        workerFullName: '',
        workerDescription: '',
        location: '',
        department: '',
        workerPosition: ''
      });

      // Scroll al inicio para ver el mensaje de éxito
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError('Error al enviar la denuncia. Por favor, intente nuevamente.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="complaint-form-container">
      <div className="complaint-form-header">
        <h1>📋 Sistema de Denuncias Anónimas</h1>
        <p>Complete el formulario para registrar su denuncia de forma confidencial</p>
      </div>

      {success && (
        <div className="alert alert-success">
          <h3>✓ Denuncia registrada exitosamente</h3>
          <p>Su código de seguimiento es: <strong>{complaintCode}</strong></p>
          <p>Guarde este código para consultar el estado de su denuncia.</p>
        </div>
      )}

      {error && (
        <div className="alert alert-error">
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="complaint-form">
        <div className="form-section">
          <h2>Información del Incidente</h2>
          
          <div className="form-group">
            <label htmlFor="complaintType">Tipo de Denuncia *</label>
            <select
              id="complaintType"
              name="complaintType"
              value={formData.complaintType}
              onChange={handleChange}
              required
            >
              <option value="">Seleccione un tipo</option>
              {complaintTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="incidentDate">Fecha del Incidente *</label>
            <input
              type="date"
              id="incidentDate"
              name="incidentDate"
              value={formData.incidentDate}
              onChange={handleChange}
              max={new Date().toISOString().split('T')[0]}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Descripción del Incidente *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="5"
              placeholder="Describa detalladamente lo sucedido..."
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="location">Lugar del Incidente</label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Ej: Oficina 301, Pasillo principal, etc."
            />
          </div>
        </div>

        <div className="form-section">
          <h2>Información del Trabajador Involucrado</h2>
          
          <div className="form-group">
            <label htmlFor="workerFullName">Nombre Completo del Trabajador *</label>
            <input
              type="text"
              id="workerFullName"
              name="workerFullName"
              value={formData.workerFullName}
              onChange={handleChange}
              placeholder="Nombre y apellidos"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="department">Departamento</label>
            <select
              id="department"
              name="department"
              value={formData.department}
              onChange={handleChange}
            >
              <option value="">Seleccione un departamento</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="workerPosition">Cargo del Trabajador</label>
            <input
              type="text"
              id="workerPosition"
              name="workerPosition"
              value={formData.workerPosition}
              onChange={handleChange}
              placeholder="Ej: Supervisor, Gerente, etc."
            />
          </div>

          <div className="form-group">
            <label htmlFor="workerDescription">Descripción Adicional del Trabajador</label>
            <textarea
              id="workerDescription"
              name="workerDescription"
              value={formData.workerDescription}
              onChange={handleChange}
              rows="3"
              placeholder="Características distintivas, comportamiento habitual, etc."
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Enviando...' : 'Enviar Denuncia'}
          </button>
        </div>

        <div className="form-footer">
          <p>* Campos obligatorios</p>
          <p>Su identidad permanecerá anónima y confidencial</p>
        </div>
      </form>
    </div>
  );
};

export default ComplaintForm;