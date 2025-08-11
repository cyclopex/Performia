'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { X, Calendar, Dumbbell, Plus, User, Clock, MapPin, FileText } from 'lucide-react'
import toast from 'react-hot-toast'

interface ScheduledActivity {
  id: string
  title: string
  description?: string
  date: string | Date
  time: string
  duration: number
  type: string
  status: string
  notes?: string
}

interface Workout {
  id: string
  title: string
  description?: string
  date: string
  duration: number
  type: string
  notes?: string
}

interface RaceResult {
  id: string
  eventName: string
  date: string
  notes?: string
}

interface User {
  id: string
  name: string
  email: string
  role: string
}

interface Connection {
  status: string
  otherUser: User
}

interface ProposalData {
  type?: string
  action: string
  title: string
  description: string
  activityType?: string
  workoutType?: string
  startTime?: string | null
  endTime?: string | null
  duration?: number | null
  location: string
  notes: string
  proposedForId: string
  intensity?: string
  exercises?: string
}

interface CreateProposalModalProps {
  isOpen: boolean
  onClose: () => void
  proposalType?: 'activity' | 'workout'
  targetAthleteId?: string
  selectedItem?: ScheduledActivity | Workout | RaceResult | null // Per elementi esistenti da modificare
}

export default function CreateProposalModal({ isOpen, onClose, proposalType, targetAthleteId, selectedItem }: CreateProposalModalProps) {
  const { data: session } = useSession()
  const [connectedUsers, setConnectedUsers] = useState<User[]>([])
  const [selectedUserId, setSelectedUserId] = useState('')
  const [action, setAction] = useState<'CREATE' | 'UPDATE' | 'DELETE'>('CREATE')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [duration, setDuration] = useState('')
  const [location, setLocation] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [localProposalType, setProposalType] = useState<'activity' | 'workout'>(proposalType || 'activity')

  useEffect(() => {
    if (isOpen && session?.user?.id) {
      if (targetAthleteId) {
        // Se abbiamo un targetAthleteId, non serve caricare la lista degli utenti
        setSelectedUserId(targetAthleteId)
        if (selectedItem) {
          // Popola il form con i dati dell'elemento esistente
          populateFormFromItem(selectedItem)
          setAction('UPDATE')
        }
      } else {
        loadConnectedUsers()
      }
    }
  }, [isOpen, session?.user?.id, targetAthleteId, selectedItem])

  // Popola il form con i dati di un elemento esistente
  const populateFormFromItem = (item: ScheduledActivity | Workout | RaceResult) => {
    if (item.title) setTitle(item.title)
    if (item.description) setDescription(item.description)
    if (item.type) setType(item.type)
    if (item.date) {
      const date = new Date(item.date)
      setStartTime(date.toISOString().slice(0, 16))
    }
    if (item.duration) setDuration(item.duration.toString())
    if (item.notes) setNotes(item.notes)
    
    // Determina il tipo di proposta
    if ('eventName' in item) {
      // È una gara
      setProposalType('workout')
    } else if ('time' in item) {
      // È un'attività programmata
      setProposalType('activity')
    } else {
      // È un allenamento
      setProposalType('workout')
    }
  }

  const loadConnectedUsers = async () => {
    try {
      console.log('🔄 Caricamento utenti connessi...')
      const response = await fetch('/api/connections')
      if (response.ok) {
        const connections = await response.json()
        console.log('📡 Connessioni ricevute:', connections)
        
        // Filtra solo gli atleti connessi
        const athletes = connections.filter((conn: Connection) => 
          conn.status === 'ACCEPTED' && 
          conn.otherUser.role === 'ATHLETE'
        ).map((conn: Connection) => conn.otherUser)
        
        console.log('🏃‍♂️ Atleti filtrati:', athletes)
        setConnectedUsers(athletes)
      } else {
        console.error('❌ Errore nella risposta API:', response.status)
      }
    } catch (error) {
      console.error('❌ Errore nel caricamento degli utenti connessi:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedUserId) {
      toast.error('Seleziona un atleta')
      return
    }

    if (!title.trim()) {
      toast.error('Inserisci un titolo')
      return
    }

    setLoading(true)

    try {
      const endpoint = proposalType === 'activity' ? '/api/proposals/activities' : '/api/proposals/workouts'
      
      const proposalData: ProposalData = proposalType === 'activity' ? {
        type: 'ACTIVITY',
        action,
        title: title.trim(),
        description: description.trim(),
        activityType: type,
        startTime: startTime ? new Date(startTime).toISOString() : null,
        endTime: endTime ? new Date(endTime).toISOString() : null,
        location: location.trim(),
        notes: notes.trim(),
        proposedForId: selectedUserId
      } : {
        action,
        title: title.trim(),
        description: description.trim(),
        type,
        duration: duration ? parseInt(duration) : null,
        intensity: '',
        exercises: '',
        notes: notes.trim(),
        proposedForId: selectedUserId
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(proposalData)
      })

      if (response.ok) {
        toast.success('Proposta creata con successo')
        resetForm()
        onClose()
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'Errore nella creazione della proposta')
      }
    } catch (error) {
      console.error('Errore nella creazione della proposta:', error)
      toast.error('Errore nella creazione della proposta')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setSelectedUserId('')
    setAction('CREATE')
    setTitle('')
    setDescription('')
    setType('')
    setStartTime('')
    setEndTime('')
    setDuration('')
    setLocation('')
    setNotes('')
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {localProposalType === 'activity' ? (
                <Calendar className="w-6 h-6" />
              ) : (
                <Dumbbell className="w-6 h-6" />
              )}
              <h2 className="text-2xl font-bold">
                Crea Proposta {localProposalType === 'activity' ? 'Attività' : 'Allenamento'}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="space-y-6">
            {/* Selezione Atleta - Solo se non abbiamo un targetAthleteId */}
            {!targetAthleteId && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="w-4 h-4 inline mr-2" />
                  Seleziona Atleta
                </label>
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                >
                  <option value="">Seleziona un atleta connesso</option>
                  {connectedUsers.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Tipo di Azione */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Plus className="w-4 h-4 inline mr-2" />
                Tipo di Azione
              </label>
              <select
                value={action}
                onChange={(e) => setAction(e.target.value as 'CREATE' | 'UPDATE' | 'DELETE')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                required
              >
                <option value="CREATE">Crea Nuovo</option>
                <option value="UPDATE">Modifica Esistente</option>
                <option value="DELETE">Elimina</option>
              </select>
            </div>

            {/* Titolo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FileText className="w-4 h-4 inline mr-2" />
                Titolo
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder={`Titolo ${localProposalType === 'activity' ? 'dell\'attività' : 'dell\'allenamento'}`}
                required
              />
            </div>

            {/* Descrizione */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FileText className="w-4 h-4 inline mr-2" />
                Descrizione
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Descrizione dettagliata..."
              />
            </div>

            {/* Tipo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Dumbbell className="w-4 h-4 inline mr-2" />
                Tipo
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                required
              >
                <option value="">Seleziona tipo</option>
                {proposalType === 'activity' ? (
                  <>
                    <option value="WORKOUT">Allenamento</option>
                    <option value="THERAPY">Terapia</option>
                    <option value="NUTRITION">Nutrizione</option>
                    <option value="MENTAL">Mentale</option>
                    <option value="ASSESSMENT">Valutazione</option>
                    <option value="RECOVERY">Recupero</option>
                    <option value="MEETING">Incontro</option>
                    <option value="CUSTOM">Personalizzato</option>
                  </>
                ) : (
                  <>
                    <option value="RUNNING">Corsa</option>
                    <option value="CYCLING">Ciclismo</option>
                    <option value="SWIMMING">Nuoto</option>
                    <option value="STRENGTH">Forza</option>
                    <option value="CARDIO">Cardio</option>
                    <option value="FLEXIBILITY">Flessibilità</option>
                    <option value="SPORTS">Sport</option>
                    <option value="YOGA">Yoga</option>
                    <option value="PILATES">Pilates</option>
                    <option value="CROSSFIT">CrossFit</option>
                    <option value="MARTIAL_ARTS">Arti Marziali</option>
                    <option value="CLIMBING">Arrampicata</option>
                    <option value="OTHER">Altro</option>
                  </>
                )}
              </select>
            </div>

            {/* Date e Orari (solo per attività) */}
            {proposalType === 'activity' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Clock className="w-4 h-4 inline mr-2" />
                      Data e Ora Inizio
                    </label>
                    <input
                      type="datetime-local"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Clock className="w-4 h-4 inline mr-2" />
                      Data e Ora Fine
                    </label>
                    <input
                      type="datetime-local"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Durata (solo per allenamenti) */}
            {proposalType === 'workout' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="w-4 h-4 inline mr-2" />
                  Durata (minuti)
                </label>
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="60"
                  min="1"
                />
              </div>
            )}

            {/* Luogo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="w-4 h-4 inline mr-2" />
                Luogo
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Palestra, pista, piscina..."
              />
            </div>

            {/* Note */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FileText className="w-4 h-4 inline mr-2" />
                Note Aggiuntive
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Note, istruzioni speciali, considerazioni..."
              />
            </div>

            {/* Pulsanti */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold py-3 px-4 rounded-lg transition-colors"
              >
                Annulla
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <Plus className="w-5 h-5" />
                )}
                Crea Proposta
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
