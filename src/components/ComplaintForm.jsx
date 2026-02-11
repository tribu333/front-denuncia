// ComplaintForm.jsx (versión final)
import { useState } from 'react';
import { complaintService } from '../services/ComplaintService';
import { imageService } from '../services/ImageService';
import ImageUploader from '../components/ImageUploader';
import { useNavigate } from 'react-router-dom';
import './ComplaintForm.css';

const ComplaintForm = () => {
  const navigate = useNavigate(); // 👈 HOOK DE NAVEGACIÓN
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

  const [selectedImages, setSelectedImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [complaintCode, setComplaintCode] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);

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

  const handleImagesChange = (images) => {
    setSelectedImages(images);
  };

  const validateForm = () => {
    if (!formData.complaintType) return 'Debe seleccionar un tipo de denuncia';
    if (!formData.incidentDate) return 'Debe seleccionar la fecha del incidente';
    if (!formData.description) return 'Debe proporcionar una descripción del incidente';
    if (!formData.workerFullName) return 'Debe proporcionar el nombre del trabajador involucrado';
    return null;
  };

  const uploadImages = async (denunciaId) => {
    if (selectedImages.length === 0) return [];
    
    try {
      const files = selectedImages.map(img => img.file);
      const response = await imageService.uploadMultipleImages(files, denunciaId);
      return response.imagenes || [];
    } catch (error) {
      console.error('Error al subir imágenes:', error);
      throw new Error('Error al subir las imágenes: ' + error.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validar formulario
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);
    setUploadProgress(0);

    try {
      // 1. Crear la denuncia
      setUploadProgress(20);
      const complaintResponse = await complaintService.createComplaint(formData);
      const denunciaId = complaintResponse.id;
      
      setUploadProgress(50);
      
      // 2. Subir imágenes si hay alguna seleccionada
      let imagesUploaded = [];
      if (selectedImages.length > 0) {
        setUploadProgress(60);
        imagesUploaded = await uploadImages(denunciaId);
        setUploadProgress(90);
      }

      // 3. Mostrar éxito
      setSuccess(true);
      setComplaintCode(complaintResponse.complaintCode);
      setUploadProgress(100);
      
      // 4. Limpiar formulario después de 3 segundos
      setTimeout(() => {
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
        setSelectedImages([]);
        setUploadProgress(0);
      }, 3000);

      // Scroll al inicio para ver el mensaje de éxito
      window.scrollTo({ top: 0, behavior: 'smooth' });

      console.log('Denuncia creada exitosamente:', complaintResponse);
      if (imagesUploaded.length > 0) {
        console.log(`${imagesUploaded.length} imágenes subidas exitosamente`);
      }

    } catch (err) {
      console.error('Error en el proceso:', err);
      setError(err.message || 'Error al enviar la denuncia. Por favor, intente nuevamente.');
      setUploadProgress(0);
    } finally {
      setLoading(false);
    }
  };
  const handleLoginClick = () => {
    navigate('/login'); // 👈 REDIRIGIR AL LOGIN
  };
  return (
    <div className="complaint-form-container">
      <div className="complaint-form-header">
        <div className="header-top">
          <div className="header-title">
            <h1>📋 Sistema de Denuncias Anónimas</h1>
            <p>Complete el formulario para registrar su denuncia de forma confidencial</p>
          </div>
          <button 
            onClick={handleLoginClick}
            className="btn-login-header"
          >
            🔐 Iniciar Sesión
          </button>
        </div>
      </div>

      {success && (
        <div className="alert alert-success">
          <h3>✓ Denuncia registrada exitosamente</h3>
          <p>Su código de seguimiento es: <strong>{complaintCode}</strong></p>
          <p>Guarde este código para consultar el estado de su denuncia.</p>
          {selectedImages.length > 0 && (
            <p className="alert-note">
              📸 Se subieron {selectedImages.length} {selectedImages.length === 1 ? 'imagen' : 'imágenes'} como evidencia
            </p>
          )}
          <p className="alert-note">El formulario se limpiará automáticamente...</p>
        </div>
      )}

      {error && (
        <div className="alert alert-error">
          <p>{error}</p>
        </div>
      )}

      {uploadProgress > 0 && uploadProgress < 100 && (
        <div className="progress-bar-container">
          <div 
            className="progress-bar" 
            style={{ width: `${uploadProgress}%` }}
          >
            {uploadProgress}%
          </div>
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

        {/* Sección de imágenes integrada en el formulario */}
        <div className="form-section images-section">
          <ImageUploader 
            onImagesChange={handleImagesChange}
            maxImages={5}
          />
        </div>

        <div className="form-actions">
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Procesando...
              </>
            ) : (
              `Enviar Denuncia ${selectedImages.length > 0 ? `con ${selectedImages.length} ${selectedImages.length === 1 ? 'imagen' : 'imágenes'}` : ''}`
            )}
          </button>
        </div>

        <div className="form-footer">
          <p>* Campos obligatorios</p>
          <p>Su identidad permanecerá anónima y confidencial</p>
          <p className="footer-note">
            Las imágenes se subirán automáticamente al enviar la denuncia
          </p>
        </div>
      </form>
    </div>
  );
};

export default ComplaintForm;