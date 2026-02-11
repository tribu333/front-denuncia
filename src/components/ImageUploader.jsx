// components/ImageUploader.jsx
import { useState, useRef } from 'react';
import { imageService } from '../services/ImageService';
import './ImageUploader.css';

const ImageUploader = ({ denunciaId, onUploadSuccess, onUploadError, maxImages = 5 }) => {
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    
    // Validar cantidad máxima de imágenes
    if (images.length + selectedFiles.length > maxImages) {
      setError(`Solo puedes subir máximo ${maxImages} imágenes`);
      return;
    }

    // Validar tipos de archivo
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg'];
    const invalidFiles = selectedFiles.filter(file => !validTypes.includes(file.type));
    
    if (invalidFiles.length > 0) {
      setError('Solo se permiten archivos de imagen (JPEG, PNG, GIF)');
      return;
    }

    // Validar tamaño (máximo 5MB por imagen)
    const maxSize = 5 * 1024 * 1024; // 5MB
    const oversizedFiles = selectedFiles.filter(file => file.size > maxSize);
    
    if (oversizedFiles.length > 0) {
      setError('Las imágenes no deben exceder los 5MB');
      return;
    }

    setError('');
    
    // Crear previews
    const newImages = selectedFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      name: file.name,
      size: file.size,
      uploading: false,
      uploaded: false,
      error: false
    }));

    setImages(prev => [...prev, ...newImages]);
    
    // Limpiar input
    e.target.value = '';
  };

  const removeImage = (index) => {
    setImages(prev => {
      const newImages = [...prev];
      // Liberar el objeto URL para evitar memory leaks
      if (newImages[index].preview) {
        URL.revokeObjectURL(newImages[index].preview);
      }
      newImages.splice(index, 1);
      return newImages;
    });
  };

  const uploadImages = async () => {
    if (!denunciaId) {
      setError('No se ha creado la denuncia aún');
      return;
    }

    if (images.length === 0) {
      setError('No hay imágenes para subir');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const filesToUpload = images.map(img => img.file);
      const response = await imageService.uploadMultipleImages(filesToUpload, denunciaId);
      
      // Marcar imágenes como subidas exitosamente
      setImages(prev => prev.map(img => ({
        ...img,
        uploaded: true,
        uploading: false
      })));

      if (onUploadSuccess) {
        onUploadSuccess(response);
      }
    } catch (err) {
      setError('Error al subir las imágenes. Por favor, intente nuevamente.');
      console.error('Error uploading images:', err);
      
      if (onUploadError) {
        onUploadError(err);
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="image-uploader">
      <div className="uploader-header">
        <h3>📸 Adjuntar Evidencias (Máximo {maxImages} imágenes)</h3>
        <p className="uploader-info">
          Formatos permitidos: JPG, PNG, GIF | Tamaño máximo: 5MB por imagen
        </p>
      </div>

      <div className="image-grid">
        {images.map((image, index) => (
          <div key={index} className="image-preview-item">
            <div className="preview-container">
              <img src={image.preview} alt={`Preview ${index + 1}`} />
              {image.uploaded && (
                <span className="upload-status success">✓</span>
              )}
              <button 
                type="button"
                className="remove-image-btn"
                onClick={() => removeImage(index)}
                disabled={uploading || image.uploaded}
              >
                ×
              </button>
            </div>
            <div className="image-info">
              <span className="image-name">{image.name}</span>
              <span className="image-size">
                {(image.size / 1024).toFixed(1)} KB
              </span>
            </div>
          </div>
        ))}

        {images.length < maxImages && (
          <div 
            className="image-upload-placeholder"
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="image/jpeg,image/png,image/gif,image/jpg"
              multiple
              style={{ display: 'none' }}
            />
            <div className="placeholder-content">
              <span className="plus-icon">+</span>
              <span>Agregar imágenes</span>
              <small>{images.length}/{maxImages} imágenes</small>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="uploader-error">
          ⚠️ {error}
        </div>
      )}

      {images.length > 0 && denunciaId && (
        <div className="uploader-actions">
          <button
            type="button"
            className="btn btn-primary"
            onClick={uploadImages}
            disabled={uploading || images.every(img => img.uploaded)}
          >
            {uploading ? 'Subiendo imágenes...' : 'Subir imágenes'}
          </button>
        </div>
      )}

      {!denunciaId && images.length > 0 && (
        <div className="uploader-info-message">
          ℹ️ Primero debe crear la denuncia para poder subir las imágenes
        </div>
      )}
    </div>
  );
};

export default ImageUploader;