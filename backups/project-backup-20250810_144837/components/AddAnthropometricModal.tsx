'use client'

import { useState } from 'react'
import { X, Calendar, Target, Ruler, Weight } from 'lucide-react'
import Button from '@/components/ui/Button'

interface AnthropometricData {
  id: string
  date: string
  weight?: number
  bodyFat?: number
  muscleMass?: number
  bmi?: number
  chest?: number
  waist?: number
  hips?: number
  biceps?: number
  thighs?: number
  notes?: string
  userId: string
  createdAt: string
  updatedAt: string
}

interface AddAnthropometricModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (data: Omit<AnthropometricData, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => void
}

export default function AddAnthropometricModal({ isOpen, onClose, onAdd }: AddAnthropometricModalProps) {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    weight: undefined as number | undefined,
    bodyFat: undefined as number | undefined,
    muscleMass: undefined as number | undefined,
    bmi: undefined as number | undefined,
    chest: undefined as number | undefined,
    waist: undefined as number | undefined,
    hips: undefined as number | undefined,
    biceps: undefined as number | undefined,
    thighs: undefined as number | undefined,
    notes: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onAdd(formData)
    onClose()
    // Reset form
    setFormData({
      date: new Date().toISOString().split('T')[0],
      weight: undefined,
      bodyFat: undefined,
      muscleMass: undefined,
      bmi: undefined,
      chest: undefined,
      waist: undefined,
      hips: undefined,
      biceps: undefined,
      thighs: undefined,
      notes: ''
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Aggiungi Dati Antropometrici</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Data */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Data *
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Peso e Grasso Corporeo */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Peso (kg)
              </label>
              <div className="relative">
                <Weight className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={formData.weight || ''}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value ? parseFloat(e.target.value) : undefined })}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.0"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Grasso Corporeo (%)
              </label>
              <div className="relative">
                <Target className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={formData.bodyFat || ''}
                  onChange={(e) => setFormData({ ...formData, bodyFat: e.target.value ? parseFloat(e.target.value) : undefined })}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.0"
                />
              </div>
            </div>
          </div>

          {/* Massa Muscolare e BMI */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Massa Muscolare (kg)
              </label>
              <div className="relative">
                <Target className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={formData.muscleMass || ''}
                  onChange={(e) => setFormData({ ...formData, muscleMass: e.target.value ? parseFloat(e.target.value) : undefined })}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.0"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                BMI
              </label>
              <div className="relative">
                <Target className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={formData.bmi || ''}
                  onChange={(e) => setFormData({ ...formData, bmi: e.target.value ? parseFloat(e.target.value) : undefined })}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.0"
                />
              </div>
            </div>
          </div>

          {/* Torace e Vita */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Torace (cm)
              </label>
              <div className="relative">
                <Ruler className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={formData.chest || ''}
                  onChange={(e) => setFormData({ ...formData, chest: e.target.value ? parseFloat(e.target.value) : undefined })}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.0"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vita (cm)
              </label>
              <div className="relative">
                <Ruler className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={formData.waist || ''}
                  onChange={(e) => setFormData({ ...formData, waist: e.target.value ? parseFloat(e.target.value) : undefined })}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.0"
                />
              </div>
            </div>
          </div>

          {/* Fianchi e Bicipiti */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fianchi (cm)
              </label>
              <div className="relative">
                <Ruler className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={formData.hips || ''}
                  onChange={(e) => setFormData({ ...formData, hips: e.target.value ? parseFloat(e.target.value) : undefined })}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.0"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bicipiti (cm)
              </label>
              <div className="relative">
                <Ruler className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={formData.biceps || ''}
                  onChange={(e) => setFormData({ ...formData, biceps: e.target.value ? parseFloat(e.target.value) : undefined })}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.0"
                />
              </div>
            </div>
          </div>

          {/* Cosce */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cosce (cm)
            </label>
            <div className="relative">
              <Ruler className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="number"
                step="0.1"
                min="0"
                value={formData.thighs || ''}
                onChange={(e) => setFormData({ ...formData, thighs: e.target.value ? parseFloat(e.target.value) : undefined })}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.0"
              />
            </div>
          </div>

          {/* Note */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Note
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Note sui dati antropometrici..."
            />
          </div>

          {/* Pulsanti */}
          <div className="flex space-x-3 pt-4">
            <Button type="submit" className="flex-1">
              Aggiungi Dati
            </Button>
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Annulla
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
