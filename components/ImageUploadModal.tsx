'use client'

import { useState, useRef } from 'react'
import { X, Upload, Image as ImageIcon, Camera, Trash2, AlertCircle } from 'lucide-react'
import Button from '@/components/ui/Button'
import { validateImage, formatFileSize, getImageTypeLabel, getImageDimensionsLabel } from '@/lib/imageUtils'

interface ImageUploadModalProps {
  isOpen: boolean
  onClose: () => void
  type: 'avatar' | 'cover'
  currentImage?: string
  onImageUpdate: (imageUrl: string) => void
}

export default function ImageUploadModal({
  isOpen,
  onClose,
  type,
  currentImage,
  onImageUpdate
}: ImageUploadModalProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fileInfo, setFileInfo] = useState<{ name: string; size: string } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!isOpen) return null

  const handleFileSelect = (file: File) => {
    setError(null)
    
    // Valida il file
    const validation = validateImage(file)
    if (!validation.isValid) {
      setError(validation.error || 'File non valido')
      return
    }

    // Salva le informazioni del file
    setFileInfo({
      name: file.name,
      size: formatFileSize(file.size)
    })

    const reader = new FileReader()
    reader.onload = (e) => {
      setPreviewImage(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0])
    }
  }

  const handleUpload = async () => {
    if (!previewImage) return

    setIsUploading(true)
    
    try {
      // Converti base64 in file per l'upload
      const response = await fetch(previewImage)
      const blob = await response.blob()
      const file = new File([blob], 'image.jpg', { type: 'image/jpeg' })

      const formData = new FormData()
      formData.append('image', file)
      formData.append('type', type)

      const uploadResponse = await fetch('/api/users/profile/upload-image', {
        method: 'POST',
        body: formData
      })

      if (uploadResponse.ok) {
        const result = await uploadResponse.json()
        onImageUpdate(result.imageUrl)
        onClose()
      } else {
        const error = await uploadResponse.json()
        alert(`Errore nell'upload: ${error.error}`)
      }
    } catch (error) {
      console.error('Errore nell\'upload:', error)
      alert('Errore durante l\'upload dell\'immagine')
    } finally {
      setIsUploading(false)
    }
  }

  const removeImage = () => {
    setPreviewImage(null)
    setFileInfo(null)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const getModalTitle = () => {
    return `Cambia ${getImageTypeLabel(type)}`
  }

  const getModalDescription = () => {
    return `Carica una nuova ${getImageTypeLabel(type).toLowerCase()}. L'immagine verrà automaticamente ridimensionata a ${getImageDimensionsLabel(type)}.`
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{getModalTitle()}</h2>
            <p className="text-sm text-gray-600 mt-1">{getModalDescription()}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Messaggio di errore */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-700">
                <AlertCircle className="w-5 h-5" />
                <span className="font-medium">{error}</span>
              </div>
            </div>
          )}

          {/* Preview immagine corrente */}
          {currentImage && !previewImage && (
            <div className="mb-6">
              <p className="text-sm font-medium text-gray-700 mb-3">Immagine attuale:</p>
              <div className="relative">
                {type === 'avatar' ? (
                  <img
                    src={currentImage}
                    alt="Immagine corrente"
                    className="w-32 h-32 rounded-full object-cover mx-auto border-4 border-gray-200"
                  />
                ) : (
                  <img
                    src={currentImage}
                    alt="Immagine corrente"
                    className="w-full h-32 object-cover rounded-lg border border-gray-200"
                  />
                )}
              </div>
            </div>
          )}

          {/* Preview nuova immagine */}
          {previewImage && (
            <div className="mb-6">
              <p className="text-sm font-medium text-gray-700 mb-3">Anteprima nuova immagine:</p>
              <div className="relative">
                {type === 'avatar' ? (
                  <img
                    src={previewImage}
                    alt="Anteprima"
                    className="w-32 h-32 rounded-full object-cover mx-auto border-4 border-blue-200"
                  />
                ) : (
                  <img
                    src={previewImage}
                    alt="Anteprima"
                    className="w-full h-32 object-cover rounded-lg border border-blue-200"
                  />
                )}
                <button
                  onClick={removeImage}
                  className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Upload area */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive
                ? 'border-blue-400 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
              className="hidden"
            />

            <div className="space-y-4">
              {type === 'avatar' ? (
                <Camera className="w-12 h-12 text-gray-400 mx-auto" />
              ) : (
                <ImageIcon className="w-12 h-12 text-gray-400 mx-auto" />
              )}
              
              <div>
                <p className="text-lg font-medium text-gray-900">
                  {dragActive ? 'Rilascia qui l\'immagine' : 'Trascina qui l\'immagine'}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  oppure clicca per selezionare
                </p>
              </div>

              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                className="mx-auto"
              >
                <Upload className="w-4 h-4 mr-2" />
                Seleziona File
              </Button>
            </div>
          </div>

          {/* Informazioni file */}
          {fileInfo && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-700 mb-1">File selezionato:</p>
                <p className="text-xs text-gray-600">{fileInfo.name}</p>
                <p className="text-xs text-gray-500">{fileInfo.size}</p>
              </div>
            </div>
          )}

          {/* Formati supportati */}
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              Formati supportati: JPG, PNG, GIF, WebP (max 5MB)
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-gray-200">
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1"
          >
            Annulla
          </Button>
          <Button
            onClick={handleUpload}
            disabled={!previewImage || isUploading}
            className="flex-1"
          >
            {isUploading ? 'Caricamento...' : 'Salva'}
          </Button>
        </div>
      </div>
    </div>
  )
}
