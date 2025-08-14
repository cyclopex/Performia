'use client'

import { useState } from 'react'
import { X, Calendar, Clock, MapPin, Target, FileText } from 'lucide-react'
import Button from '@/components/ui/Button'
import { Workout } from '@/types/activity'

interface AddWorkoutModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (workout: Omit<Workout, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => void
}

export default function AddWorkoutModal({ isOpen, onClose, onSave }: AddWorkoutModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    duration: 30,
    distance: '',
    calories: '',
    rpe: '',
    notes: '',
    type: 'RUNNING' as Workout['type'],
    status: 'COMPLETED' as Workout['status']
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.title.trim()) {
      newErrors.title = 'Il titolo è obbligatorio'
    }
    
    if (formData.duration <= 0) {
      newErrors.duration = 'La durata deve essere maggiore di 0'
    }
    
    if (formData.distance && parseFloat(formData.distance) < 0) {
      newErrors.distance = 'La distanza non può essere negativa'
    }
    
    if (formData.calories && parseInt(formData.calories) < 0) {
      newErrors.calories = 'Le calorie non possono essere negative'
    }
    
    if (formData.rpe && (parseInt(formData.rpe) < 1 || parseInt(formData.rpe) > 10)) {
      newErrors.rpe = 'RPE deve essere tra 1 e 10'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    const workoutData = {
      title: formData.title.trim(),
      description: formData.description.trim() || undefined,
      date: new Date(formData.date).toISOString(),
      duration: formData.duration,
      distance: formData.distance ? parseFloat(formData.distance) : undefined,
      calories: formData.calories ? parseInt(formData.calories) : undefined,
      rpe: formData.rpe ? parseInt(formData.rpe) : undefined,
      notes: formData.notes.trim() || undefined,
      type: formData.type,
      status: formData.status
    }
    
    onSave(workoutData)
    handleClose()
  }

  const handleClose = () => {
    setFormData({
      title: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      duration: 30,
      distance: '',
      calories: '',
      rpe: '',
      notes: '',
      type: 'RUNNING',
      status: 'COMPLETED'
    })
    setErrors({})
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Nuovo Allenamento</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Titolo e Tipo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Titolo *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.title ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Es: Corsa mattutina"
              />
              {errors.title && (
                <p className="text-red-500 text-sm mt-1">{errors.title}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo *
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as Workout['type'] })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="RUNNING">Running</option>
                <option value="CYCLING">Cycling</option>
                <option value="SWIMMING">Swimming</option>
                <option value="STRENGTH">Strength</option>
                <option value="CARDIO">Cardio</option>
                <option value="FLEXIBILITY">Flexibility</option>
                <option value="SPORTS">Sports</option>
                <option value="YOGA">Yoga</option>
                <option value="PILATES">Pilates</option>
                <option value="CROSSFIT">Crossfit</option>
                <option value="MARTIAL_ARTS">Martial Arts</option>
                <option value="CLIMBING">Climbing</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stato *
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as Workout['status'] })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="COMPLETED">Completato</option>
                <option value="PLANNED">Pianificato</option>
                <option value="CANCELLED">Cancellato</option>
              </select>
            </div>
          </div>
          
          {/* Data e Durata */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Durata (minuti) *
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
                  min="1"
                  max="300"
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.duration ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
              </div>
              {errors.duration && (
                <p className="text-red-500 text-sm mt-1">{errors.duration}</p>
              )}
            </div>
          </div>
          
          {/* Distanza e Calorie */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Distanza (km)
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="number"
                  value={formData.distance}
                  onChange={(e) => setFormData({ ...formData, distance: e.target.value })}
                  min="0"
                  step="0.1"
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.distance ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="0.0"
                />
              </div>
              {errors.distance && (
                <p className="text-red-500 text-sm mt-1">{errors.distance}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Calorie
              </label>
              <input
                type="number"
                value={formData.calories}
                onChange={(e) => setFormData({ ...formData, calories: e.target.value })}
                min="0"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.calories ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="0"
              />
              {errors.calories && (
                <p className="text-red-500 text-sm mt-1">{errors.calories}</p>
              )}
            </div>
          </div>
          
          {/* RPE e Note */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                RPE (1-10)
              </label>
              <div className="relative">
                <Target className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="number"
                  value={formData.rpe}
                  onChange={(e) => setFormData({ ...formData, rpe: e.target.value })}
                  min="1"
                  max="10"
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.rpe ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="1-10"
                />
              </div>
              {errors.rpe && (
                <p className="text-red-500 text-sm mt-1">{errors.rpe}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descrizione
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Breve descrizione dell'allenamento"
              />
            </div>
          </div>
          
          {/* Note */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Note
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Note aggiuntive, sensazioni, obiettivi raggiunti..."
              />
            </div>
          </div>
          
          {/* Azioni */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
            >
              Annulla
            </Button>
            <Button type="submit">
              Salva Allenamento
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
