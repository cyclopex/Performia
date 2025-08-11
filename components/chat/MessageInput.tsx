'use client'

import { useState, useRef } from 'react'
import { Send, Paperclip, Image, Smile } from 'lucide-react'

interface MessageInputProps {
  onSendMessage: (content: string, type: string, file?: File) => void
  disabled?: boolean
}

export default function MessageInput({ onSendMessage, disabled = false }: MessageInputProps) {
  const [message, setMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)

  const handleSend = () => {
    if (!message.trim() || disabled || isUploading) return
    
    onSendMessage(message.trim(), 'text')
    setMessage('')
    setIsTyping(false)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const validateFile = (file: File, maxSize: number = 10 * 1024 * 1024): boolean => {
    if (file.size > maxSize) {
      alert(`File troppo grande. Dimensione massima: ${(maxSize / 1024 / 1024).toFixed(1)} MB`)
      return false
    }
    return true
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    if (!validateFile(file)) {
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      return
    }

    setIsUploading(true)
    try {
      await onSendMessage('', 'file', file)
    } catch (error) {
      console.error('Errore nell\'upload del file:', error)
      alert('Errore nell\'upload del file')
    } finally {
      setIsUploading(false)
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    if (!file.type.startsWith('image/')) {
      alert('Seleziona un file immagine valido')
      if (imageInputRef.current) {
        imageInputRef.current.value = ''
      }
      return
    }

    if (!validateFile(file, 5 * 1024 * 1024)) { // 5MB per le immagini
      if (imageInputRef.current) {
        imageInputRef.current.value = ''
      }
      return
    }

    setIsUploading(true)
    try {
      await onSendMessage('', 'image', file)
    } catch (error) {
      console.error('Errore nell\'upload dell\'immagine:', error)
      alert('Errore nell\'upload dell\'immagine')
    } finally {
      setIsUploading(false)
      // Reset input
      if (imageInputRef.current) {
        imageInputRef.current.value = ''
      }
    }
  }

  const handleTyping = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value)
    setIsTyping(e.target.value.length > 0)
  }

  return (
    <div className="bg-white border-t border-gray-200 p-4">
      <div className="flex items-end space-x-2">
        {/* File Upload */}
        <div className="flex space-x-1">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || isUploading}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Allega file"
          >
            <Paperclip className="w-5 h-5" />
          </button>
          <button
            onClick={() => imageInputRef.current?.click()}
            disabled={disabled || isUploading}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Allega immagine"
          >
            <Image className="w-5 h-5" alt="Allega immagine" />
          </button>
          <button
            disabled={disabled}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Emoji (presto disponibile)"
          >
            <Smile className="w-5 h-5" />
          </button>
        </div>

        {/* Message Input */}
        <div className="flex-1">
          <textarea
            value={message}
            onChange={handleTyping}
            onKeyPress={handleKeyPress}
            placeholder="Scrivi un messaggio..."
            disabled={disabled || isUploading}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none disabled:opacity-50 disabled:cursor-not-allowed"
            rows={1}
            style={{ minHeight: '40px', maxHeight: '120px' }}
          />
        </div>

        {/* Send Button */}
        <button
          onClick={handleSend}
          disabled={!message.trim() || disabled || isUploading}
          className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Invia messaggio"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>

      {/* Hidden File Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileSelect}
        className="hidden"
        accept=".pdf,.doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx"
      />
      <input
        ref={imageInputRef}
        type="file"
        onChange={handleImageSelect}
        className="hidden"
        accept="image/*"
      />

      {/* Status Indicators */}
      {isUploading && (
        <div className="mt-2 text-xs text-blue-500">
          Caricamento in corso...
        </div>
      )}
      {isTyping && !isUploading && (
        <div className="mt-2 text-xs text-gray-500">
          Premi Invio per inviare, Shift+Invio per nuova riga
        </div>
      )}
    </div>
  )
}
