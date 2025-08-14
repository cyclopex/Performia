import { useState } from 'react'

interface UseImageUploadReturn {
  isUploading: boolean
  uploadImage: (file: File, type: 'avatar' | 'cover') => Promise<string | null>
}

export function useImageUpload(): UseImageUploadReturn {
  const [isUploading, setIsUploading] = useState(false)

  const uploadImage = async (file: File, type: 'avatar' | 'cover'): Promise<string | null> => {
    setIsUploading(true)
    
    try {
      const formData = new FormData()
      formData.append('image', file)
      formData.append('type', type)

      const response = await fetch('/api/users/profile/upload-image', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const result = await response.json()
        return result.imageUrl
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Errore nell\'upload')
      }
    } catch (error) {
      console.error('Errore nell\'upload dell\'immagine:', error)
      throw error
    } finally {
      setIsUploading(false)
    }
  }

  return {
    isUploading,
    uploadImage
  }
}
