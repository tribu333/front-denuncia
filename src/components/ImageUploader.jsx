// components/ImageUploader.jsx
import { useState, useRef, useEffect } from 'react';
import './ImageUploader.css';

const ImageUploader = ({ onImagesChange, maxImages = 5 }) => {
  const [images, setImages] = useState([]);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  // Notificar al componente padre cuando cambien las imágenes
  useEffect(() => {
    if (onImagesChange) {
      onImagesChange(images);
    }
  }, [images, onImagesChange]);

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    
    // Validar cantidad máxima de imágenes
    if (images.length + selectedFiles.length > maxImages) {
      setError(`Solo puedes seleccionar máximo ${maxImages} imágenes`);
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
      id: Date.now() + Math.random() // ID temporal único
    }));

    setImages(prev => [...prev, ...newImages]);
    
    // Limpiar input
    e.target.value = '';
  };

  const removeImage = (id) => {
    setImages(prev => {
      const imageToRemove = prev.find(img => img.id === id);
      if (imageToRemove?.preview) {
        URL.revokeObjectURL(imageToRemove.preview);
      }
      return prev.filter(img => img.id !== id);
    });
  };

  const reorderImages = (startIndex, endIndex) => {
    setImages(prev => {
      const result = [...prev];
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      return result;
    });
  };

  // Limpiar URLs al desmontar
  useEffect(() => {
    return () => {
      images.forEach(img => {
        if (img.preview) {
          URL.revokeObjectURL(img.preview);
        }
      });
    };
  }, []);

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
          <div key={image.id} className="image-preview-item">
            <div className="preview-container">
              <img src={image.preview} alt={`Preview ${index + 1}`} />
              <span className="image-order">{index + 1}</span>
              <button 
                type="button"
                className="remove-image-btn"
                onClick={() => removeImage(image.id)}
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
            {/* Indicadores de arrastre para reordenar */}
            <div className="image-drag-handle">⋮⋮</div>
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

      {images.length > 0 && (
        <div className="uploader-summary">
          <p className="summary-text">
            ✅ {images.length} {images.length === 1 ? 'imagen seleccionada' : 'imágenes seleccionadas'}
            {images.length === maxImages && ' (máximo alcanzado)'}
          </p>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;