// services/ImageService.js
const API_BASE_URL = '/api/imagenes';

class ImageService {
  async uploadImage(file, denunciaId) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('denunciaId', denunciaId);

    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error('Error al subir la imagen');
    }

    return response.json();
  }

  async uploadMultipleImages(files, denunciaId) {
    const formData = new FormData();
    
    // Agregar todos los archivos
    files.forEach(file => {
      formData.append('files', file);
    });
    formData.append('idComplaint', denunciaId);

    const response = await fetch(`${API_BASE_URL}/subir-multiples`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al subir las imágenes');
    }

    return response.json();
  }

  async getImagenesByDenuncia(denunciaId) {
    const response = await fetch(`${API_BASE_URL}/denuncia/${denunciaId}`);
    
    if (!response.ok) {
      throw new Error('Error al obtener las imágenes');
    }

    return response.json();
  }

  getImageUrl(nombreArchivo) {
    return `${API_BASE_URL}/descargar/${nombreArchivo}`;
  }
}

export const imageService = new ImageService();