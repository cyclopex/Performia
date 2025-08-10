'use client'

import { useState } from 'react'
import { X, Calendar, MapPin, Target, Trophy, Users } from 'lucide-react'
import Button from '@/components/ui/Button'

interface RaceResult {
  id: string
  eventName: string
  eventType: 'RACE' | 'COMPETITION' | 'TIME_TRIAL' | 'FUN_RUN'
  date: string
  distance?: number
  time?: string
  position?: number
  totalParticipants?: number
  notes?: string
  userId: string
  createdAt: string
  updatedAt: string
}

interface AddRaceModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (race: Omit<RaceResult, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => void
}

export default function AddRaceModal({ isOpen, onClose, onAdd }: AddRaceModalProps) {
  const [formData, setFormData] = useState({
    eventName: '',
    eventType: 'RACE' as RaceResult['eventType'],
    date: new Date().toISOString().split('T')[0],
    distance: undefined as number | undefined,
    time: '',
    position: undefined as number | undefined,
    totalParticipants: undefined as number | undefined,
    notes: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onAdd(formData)
    onClose()
    // Reset form
    setFormData({
      eventName: '',
      eventType: 'RACE',
      date: new Date().toISOString().split('T')[0],
      distance: undefined,
      time: '',
      position: undefined,
      totalParticipants: undefined,
      notes: ''
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Aggiungi Gara</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Nome Evento */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome Evento *
            </label>
            <input
              type="text"
              required
              value={formData.eventName}
              onChange={(e) => setFormData({ ...formData, eventName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Es: Maratona di Roma"
            />
          </div>

          {/* Tipo Evento e Data */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo Evento *
              </label>
              <select
                required
                value={formData.eventType}
                onChange={(e) => setFormData({ ...formData, eventType: e.target.value as RaceResult['eventType'] })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="RACE">Gara</option>
                <option value="COMPETITION">Competizione</option>
                <option value="TIME_TRIAL">Cronometro</option>
                <option value="FUN_RUN">Corsa amatoriale</option>
              </select>
            </div>
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
          </div>

          {/* Distanza e Tempo */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Distanza (km)
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={formData.distance || ''}
                  onChange={(e) => setFormData({ ...formData, distance: e.target.value ? parseFloat(e.target.value) : undefined })}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.0"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tempo (HH:MM:SS)
              </label>
              <div className="relative">
                <Target className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="00:00:00"
                />
              </div>
            </div>
          </div>

          {/* Posizione e Partecipanti */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Posizione
              </label>
              <div className="relative">
                <Trophy className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="number"
                  min="1"
                  value={formData.position || ''}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value ? parseInt(e.target.value) : undefined })}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Totale Partecipanti
              </label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="number"
                  min="1"
                  value={formData.totalParticipants || ''}
                  onChange={(e) => setFormData({ ...formData, totalParticipants: e.target.value ? parseInt(e.target.value) : undefined })}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>
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
              placeholder="Note sulla gara..."
            />
          </div>

          {/* Pulsanti */}
          <div className="flex space-x-3 pt-4">
            <Button type="submit" className="flex-1">
              Aggiungi Gara
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
