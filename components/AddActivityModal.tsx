'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { X, Calendar, Clock, User, Tag } from 'lucide-react'
import Button from '@/components/ui/Button'

interface AddActivityModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (activity: Omit<ScheduledActivity, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<void> | void
}

import { ScheduledActivity } from '@/types/activity'

const activityTypes = [
  { value: 'WORKOUT', label: 'Allenamento', icon: '🏃‍♂️' },
  { value: 'THERAPY', label: 'Fisioterapia', icon: '🩺' },
  { value: 'NUTRITION', label: 'Nutrizione', icon: '🥗' },
  { value: 'MENTAL', label: 'Mental Coaching', icon: '🧠' },
  { value: 'ASSESSMENT', label: 'Valutazione', icon: '📊' },
  { value: 'CUSTOM', label: 'Personalizzato', icon: '📝' }
]

const professionals = [
  { id: '1', name: 'Marco Rossi', role: 'Coach' },
  { id: '2', name: 'Laura Bianchi', role: 'Fisioterapista' },
  { id: '3', name: 'Dr. Verdi', role: 'Nutrizionista' },
  { id: '4', name: 'Dr. Neri', role: 'Mental Coach' }
]

export default function AddActivityModal({ isOpen, onClose, onAdd }: AddActivityModalProps) {
  const { data: session } = useSession()
  const [activity, setActivity] = useState({
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    time: '09:00',
    duration: 60,
    type: 'WORKOUT' as const,
    assignedTo: '',
    tags: [] as string[],
    status: 'SCHEDULED' as const
  })

  const [newTag, setNewTag] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  if (!isOpen) return null

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!activity.title.trim()) {
      newErrors.title = 'Il titolo è obbligatorio'
    }

    if (!activity.date) {
      newErrors.date = 'La data è obbligatoria'
    } else {
      const selectedDate = new Date(activity.date)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      if (selectedDate < today) {
        newErrors.date = 'La data non può essere nel passato'
      }
    }

    if (activity.duration < 15 || activity.duration > 240) {
      newErrors.duration = 'La durata deve essere tra 15 e 240 minuti'
    }

    if (activity.tags.length > 10) {
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
    
    const newActivity = {
      title: activity.title,
      description: activity.description,
      date: activity.date,
      time: activity.time,
      duration: activity.duration,
      type: activity.type,
      status: activity.status,
      tags: activity.tags,
      assignedBy: session?.user?.name || 'Tu',
      ...(activity.assignedTo && { assignedTo: activity.assignedTo })
    }
    
    onAdd(newActivity)
    onClose()
    
    // Reset form
    setActivity({
      title: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      time: '09:00',
      duration: 60,
      type: 'WORKOUT',
      assignedTo: '',
      tags: [],
      status: 'SCHEDULED'
    })
    setNewTag('')
    setErrors({})
  }

  const addTag = () => {
    const trimmedTag = newTag.trim()
    if (!trimmedTag) return
    
    if (activity.tags.length >= 10) {
      alert('Massimo 10 tag consentiti')
      return
    }
    
    if (activity.tags.includes(trimmedTag)) {
      alert('Tag già presente')
      return
    }
    
    if (trimmedTag.length > 20) {
      alert('Tag troppo lungo (max 20 caratteri)')
      return
    }
    
    setActivity({
      ...activity,
      tags: [...activity.tags, trimmedTag]
    })
    setNewTag('')
  }

  const removeTag = (tagToRemove: string) => {
    setActivity({
      ...activity,
      tags: activity.tags.filter(tag => tag !== tagToRemove)
    })
  }

  const handleInputChange = (field: keyof ScheduledActivity, value: string | number) => {
    setActivity({ ...activity, [field]: value })
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
            <h2 className="text-xl font-semibold text-gray-900">Aggiungi Attività</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

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
                      activity.type === type.value
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
                value={activity.title}
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
                value={activity.description}
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
                  value={activity.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  className={`input-field ${errors.date ? 'border-red-500' : ''}`}
                  min={new Date().toISOString().split('T')[0]}
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
                  value={activity.time}
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
                value={activity.duration}
                onChange={(e) => handleInputChange('duration', parseInt(e.target.value) || 60)}
                className={`input-field ${errors.duration ? 'border-red-500' : ''}`}
                min="15"
                max="240"
                step="15"
                required
              />
              {errors.duration && (
                <p className="text-sm text-red-600 mt-1">{errors.duration}</p>
              )}
            </div>

            {/* Assegnato a */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="w-4 h-4 inline mr-1" />
                Assegnato a (opzionale)
              </label>
              <select
                value={activity.assignedTo || ''}
                onChange={(e) => handleInputChange('assignedTo', e.target.value)}
                className="input-field"
              >
                <option value="">Nessuno</option>
                {professionals.map((prof) => (
                  <option key={prof.id} value={prof.id}>
                    {prof.name} ({prof.role})
                  </option>
                ))}
              </select>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Tag className="w-4 h-4 inline mr-1" />
                Tags ({activity.tags.length}/10)
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  className="input-field flex-1"
                  placeholder="Aggiungi tag..."
                  maxLength={20}
                  disabled={activity.tags.length >= 10}
                />
                <Button
                  type="button"
                  onClick={addTag}
                  variant="outline"
                  size="sm"
                  disabled={activity.tags.length >= 10}
                >
                  +
                </Button>
              </div>
              {errors.tags && (
                <p className="text-sm text-red-600 mt-1">{errors.tags}</p>
              )}
              {activity.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {activity.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary-100 text-primary-800"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1 hover:text-primary-600"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Azioni */}
            <div className="flex space-x-3 pt-4">
              <Button
                type="button"
                onClick={onClose}
                variant="outline"
                className="flex-1"
              >
                Annulla
              </Button>
              <Button
                type="submit"
                className="flex-1"
              >
                Aggiungi Attività
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
