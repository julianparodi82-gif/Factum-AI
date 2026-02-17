export async function processImage({ imageUrl, imageBytes }) {
  if (!imageUrl && !imageBytes) {
    return {
      image_analysis: ['No se recibió imagen para analizar.'],
      uncertainties: ['Análisis de imagen omitido por falta de datos.'],
      tokens_used: 0
    };
  }

  return {
    image_analysis: ['Análisis básico completado. OCR y verificación de origen pendientes en MVP.'],
    uncertainties: ['No se puede confirmar el origen de la imagen con el módulo actual.'],
    tokens_used: 120
  };
}
