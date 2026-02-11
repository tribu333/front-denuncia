// components/ComplaintDetailModal.jsx
import { useState, useEffect } from 'react';
import { imageService } from '../services/ImageService';
import './ComplaintDetailModal.css';

const ComplaintDetailModal = ({ complaint, isOpen, onClose }) => {
  const [images, setImages] = useState([]);
  const [loadingImages, setLoadingImages] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [activeTab, setActiveTab] = useState('info'); // 'info' o 'images'

  useEffect(() => {
    if (complaint && isOpen) {
      loadImages();
    }
  }, [complaint, isOpen]);

  const loadImages = async () => {
    if (!complaint?.id) return;
    
    setLoadingImages(true);
    try {
      const imagenes = await imageService.getImagenesByDenuncia(complaint.id);
      setImages(imagenes);
    } catch (error) {
      console.error('Error al cargar imágenes:', error);
    } finally {
      setLoadingImages(false);
    }
  };

  if (!isOpen || !complaint) return null;

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusClass = (status) => {
    switch(status?.toUpperCase()) {
      case 'PENDIENTE': return 'status-pending';
      case 'EN_REVISION': return 'status-review';
      case 'RESUELTO': return 'status-resolved';
      case 'DESESTIMADO': return 'status-rejected';
      default: return 'status-pending';
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        {/* Header del Modal */}
        <div className="modal-header">
          <div className="modal-title">
            <h2>Detalles de la Denuncia</h2>
            <span className="complaint-code-badge">{complaint.complaintCode}</span>
          </div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        {/* Tabs */}
        <div className="modal-tabs">
          <button 
            className={`tab-btn ${activeTab === 'info' ? 'active' : ''}`}
            onClick={() => setActiveTab('info')}
          >
            📋 Información
          </button>
          <button 
            className={`tab-btn ${activeTab === 'images' ? 'active' : ''}`}
            onClick={() => setActiveTab('images')}
          >
            🖼️ Evidencias {images.length > 0 && `(${images.length})`}
          </button>
        </div>

        <div className="modal-body">
          {/* TAB DE INFORMACIÓN */}
          {activeTab === 'info' && (
            <div className="info-tab">
              {/* Estado y Fechas */}
              <div className="info-section status-section">
                <div className="status-badge-large">
                  <span className={`status-dot ${getStatusClass(complaint.status)}`}></span>
                  <span className="status-text">{complaint.status || 'PENDIENTE'}</span>
                </div>
                <div className="dates-info">
                  <div className="date-item">
                    <span className="date-label">📅 Fecha del incidente:</span>
                    <span className="date-value">{formatDate(complaint.incidentDate)}</span>
                  </div>
                  <div className="date-item">
                    <span className="date-label">⏰ Fecha de registro:</span>
                    <span className="date-value">{formatDate(complaint.submittedAt)}</span>
                  </div>
                </div>
              </div>

              {/* Detalles del Incidente */}
              <div className="info-section">
                <h3>🔍 Detalles del Incidente</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">Tipo de Denuncia:</span>
                    <span className="info-value complaint-type">{complaint.complaintType}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Lugar:</span>
                    <span className="info-value">{complaint.location || 'No especificado'}</span>
                  </div>
                  <div className="info-item full-width">
                    <span className="info-label">Descripción:</span>
                    <div className="info-description">
                      {complaint.description || 'Sin descripción'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Información del Trabajador */}
              <div className="info-section">
                <h3>👤 Trabajador Involucrado</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">Nombre:</span>
                    <span className="info-value">{complaint.workerFullName}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Departamento:</span>
                    <span className="info-value">{complaint.department || 'No especificado'}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Cargo:</span>
                    <span className="info-value">{complaint.workerPosition || 'No especificado'}</span>
                  </div>
                  <div className="info-item full-width">
                    <span className="info-label">Descripción adicional:</span>
                    <div className="info-description">
                      {complaint.workerDescription || 'Sin descripción adicional'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB DE IMÁGENES */}
          {activeTab === 'images' && (
            <div className="images-tab">
              {loadingImages ? (
                <div className="images-loading">
                  <div className="spinner"></div>
                  <p>Cargando evidencias...</p>
                </div>
              ) : images.length === 0 ? (
                <div className="no-images">
                  <div className="no-images-icon">🖼️</div>
                  <h3>No hay evidencias</h3>
                  <p>Esta denuncia no tiene imágenes adjuntas</p>
                </div>
              ) : (
                <>
                  {/* Visor de imagen seleccionada */}
                  {selectedImage && (
                    <div className="image-viewer">
                      <div className="viewer-header">
                        <h4>{selectedImage.nombreOriginal}</h4>
                        <button 
                          className="close-viewer"
                          onClick={() => setSelectedImage(null)}
                        >
                          ×
                        </button>
                      </div>
                      <div className="viewer-content">
                        <img 
                          src={selectedImage.urlDescarga} 
                          alt={selectedImage.nombreOriginal}
                          className="viewer-image"
                        />
                        <div className="image-metadata">
                          <span>📅 {formatDate(selectedImage.fechaSubida)}</span>
                          <span>📦 {selectedImage.tamanioFormateado}</span>
                          <span>🖼️ {selectedImage.mimeType}</span>
                          <a 
                            href={selectedImage.urlDescarga} 
                            download={selectedImage.nombreOriginal}
                            className="btn-download"
                          >
                            ⬇️ Descargar
                          </a>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Grid de miniaturas */}
                  <div className="images-grid">
                    {images.map((image) => (
                      <div 
                        key={image.idImagen} 
                        className={`image-thumbnail ${selectedImage?.idImagen === image.idImagen ? 'selected' : ''}`}
                        onClick={() => setSelectedImage(image)}
                      >
                        <div className="thumbnail-container">
                          <img 
                            src={image.urlDescarga} 
                            alt={image.nombreOriginal}
                            className="thumbnail-image"
                            loading="lazy"
                          />
                          <div className="thumbnail-overlay">
                            <span className="thumbnail-size">{image.tamanioFormateado}</span>
                          </div>
                        </div>
                        <div className="thumbnail-info">
                          <span className="thumbnail-name">{image.nombreOriginal}</span>
                          <span className="thumbnail-date">
                            {new Date(image.fechaSubida).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer del Modal */}
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ComplaintDetailModal;