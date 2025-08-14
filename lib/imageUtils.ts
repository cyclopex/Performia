export interface ImageValidationResult {
  isValid: boolean
  error?: string
}

export const validateImage = (file: File): ImageValidationResult => {
  // Verifica dimensione file (max 5MB)
  const maxSize = 5 * 1024 * 1024 // 5MB
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: 'Il file è troppo grande. Dimensione massima: 5MB'
    }
  }

  // Verifica tipo file
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: 'Tipo di file non supportato. Usa JPG, PNG, GIF o WebP'
    }
  }

  return { isValid: true }
}

export const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      resolve({ width: img.width, height: img.height })
    }
    img.onerror = () => {
      reject(new Error('Impossibile leggere le dimensioni dell\'immagine'))
    }
    img.src = URL.createObjectURL(file)
  })
}

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export const getImageTypeLabel = (type: 'avatar' | 'cover'): string => {
  return type === 'avatar' ? 'Foto Profilo' : 'Immagine di Copertina'
}

export const getImageDimensionsLabel = (type: 'avatar' | 'cover'): string => {
  return type === 'avatar' ? '400x400px' : '1200x400px'
}
