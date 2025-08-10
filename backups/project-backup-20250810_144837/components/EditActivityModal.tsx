'use client'

import { useState, useEffect } from 'react'
import { X, Calendar, Clock, User, Tag } from 'lucide-react'

interface EditActivityModalProps {
  isOpen: boolean
  onClose: () => void
  onEdit: (activity: any) => void
  activity: any
}

interface Activity {
  id: string
  title: string
  description: string
  date: string
  time: string
  duration: number
  type: 'WORKOUT' | 'THERAPY' | 'NUTRITION' | 'MENTAL' | 'ASSESSMENT' | 'CUSTOM'
  assignedTo?: string
  tags: string[]
}

const activityTypes = [
  { value: 'WORKOUT', label: 'Allenamento', icon: '💪' },
  { value: 'THERAPY', label: 'Terapia', icon: '🩺' },
  { value: 'NUTRITION', label: 'Nutrizione', icon: '🥗' },
  { value: 'MENTAL', label: 'Mental Coach', icon: '🧠' },
  { value: 'ASSESSMENT', label: 'Valutazione', icon: '📊' },
  { value: 'CUSTOM', label: 'Personalizzato', icon: '⚙️' }
]

export default function EditActivityModal({ isOpen, onClose, onEdit, activity }: EditActivityModalProps) {
  const [formData, setFormData] = useState<Activity>({
    id: '',
    title: '',
    description: '',
    date: '',
    time: '09:00',
    duration: 60,
    type: 'WORKOUT',
    assignedTo: '',
    tags: []
  })
  const [newTag, setNewTag] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Aggiorna il form quando cambia l'attività
  useEffect(() => {
    if (activity) {
      try {
        setFormData({
          id: activity.id || '',
          title: activity.title || '',
          description: activity.description || '',
          date: activity.date ? new Date(activity.date).toISOString().split('T')[0] : '',
          time: activity.time || '09:00',
          duration: activity.duration || 60,
          type: activity.type || 'WORKOUT',
          assignedTo: activity.assignedTo || '',
          tags: Array.isArray(activity.tags) 
            ? activity.tags 
            : (typeof activity.tags === 'string' 
                ? JSON.parse(activity.tags || '[]') 
                : [])
        })
        setErrors({})
      } catch (error) {
        console.error('Errore nel parsing dei dati attività:', error)
        setErrors({ general: 'Errore nel caricamento dei dati attività' })
      }
    }
  }, [activity])

  if (!isOpen) return null

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Il titolo è obbligatorio'
    }

    if (!formData.date) {
      newErrors.date = 'La data è obbligatoria'
    }

    if (formData.duration < 15 || formData.duration > 480) {
      newErrors.duration = 'La durata deve essere tra 15 e 480 minuti'
    }

    if (formData.tags.length > 10) {
      newErrors.tags = 'Massimo 10 tag consentiti'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    const updatedActivity = {
      ...formData,
      status: 'SCHEDULED' as const
    }
    
    onEdit(updatedActivity)
    onClose()
  }

  const addTag = () => {
    const trimmedTag = newTag.trim()
    if (!trimmedTag) return
    
    if (formData.tags.length >= 10) {
      alert('Massimo 10 tag consentiti')
      return
    }
    
    if (formData.tags.includes(trimmedTag)) {
      alert('Tag già presente')
      return
    }
    
    if (trimmedTag.length > 20) {
      alert('Tag troppo lungo (max 20 caratteri)')
      return
    }
    
    setFormData({
      ...formData,
      tags: [...formData.tags, trimmedTag]
    })
    setNewTag('')
  }

  const removeTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    })
  }

  const handleInputChange = (field: keyof Activity, value: any) => {
    setFormData({ ...formData, [field]: value })
    // Rimuovi errore quando l'utente inizia a correggere
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' })
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Modifica Attività</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Error Display */}
          {errors.general && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{errors.general}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Tipo di attività */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo di Attività
              </label>
              <div className="grid grid-cols-2 gap-2">
                {activityTypes.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => handleInputChange('type', type.value)}
                    className={`p-3 rounded-lg border text-left transition-colors ${
                      formData.type === type.value
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center">
                      <span className="text-lg mr-2">{type.icon}</span>
                      <span className="text-sm font-medium">{type.label}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Titolo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Titolo *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className={`input-field ${errors.title ? 'border-red-500' : ''}`}
                placeholder="Es. Allenamento Forza"
                maxLength={100}
                required
              />
              {errors.title && (
                <p className="text-sm text-red-600 mt-1">{errors.title}</p>
              )}
            </div>

            {/* Descrizione */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descrizione
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="input-field"
                rows={3}
                placeholder="Descrizione dell'attività..."
                maxLength={500}
              />
            </div>

            {/* Data e Ora */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Data *
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  className={`input-field ${errors.date ? 'border-red-500' : ''}`}
                  required
                />
                {errors.date && (
                  <p className="text-sm text-red-600 mt-1">{errors.date}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Ora
                </label>
                <input
                  type="time"
                  value={formData.time}
                  onChange={(e) => handleInputChange('time', e.target.value)}
                  className="input-field"
                  required
                />
              </div>
            </div>

            {/* Durata */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Durata (minuti) *
              </label>
              <input
                type="number"
                value={formData.duration}
                onChange={(e) => handleInputChange('duration', parseInt(e.target.value) || 60)}
                className={`input-field ${errors.duration ? 'border-red-500' : ''}`}
                min="15"
                max="480"
                step="15"
                required
              />
              {errors.duration && (
                <p className="text-sm text-red-600 mt-1">{errors.duration}</p>
              )}
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Tag className="w-4 h-4 inline mr-1" />
                Tags ({formData.tags.length}/10)
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-primary-100 text-primary-800 px-2 py-1 rounded-full text-sm flex items-center"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 text-primary-600 hover:text-primary-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  className="input-field flex-1"
                  placeholder="Aggiungi tag..."
                  maxLength={20}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  disabled={formData.tags.length >= 10}
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={formData.tags.length >= 10}
                >
                  +
                </button>
              </div>
              {errors.tags && (
                <p className="text-sm text-red-600 mt-1">{errors.tags}</p>
              )}
            </div>

            {/* Pulsanti */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Annulla
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
              >
                Salva Modifiche
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
