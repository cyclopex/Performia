'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { 
  Plus, 
  Calendar, 
  Clock, 
  MapPin, 
  Target,
  Trophy,
  Edit,
  Trash2,
  Search,
  TrendingUp,
  BarChart3,
  List,
  Eye,
  Award,
  Users,
  Flag
} from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Button from '@/components/ui/Button'
import AddRaceModal from '@/components/AddRaceModal'
import EditRaceModal from '@/components/EditRaceModal'
import LoadingSkeleton from '@/components/races/LoadingSkeleton'
import { RaceResult } from '@/types/activity'

export default function RacesPage() {
  const { data: session, status } = useSession()
  const [viewMode, setViewMode] = useState<'list' | 'stats'>('list')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingRace, setEditingRace] = useState<RaceResult | null>(null)
  const [races, setRaces] = useState<RaceResult[]>([])
  const [filteredRaces, setFilteredRaces] = useState<RaceResult[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('ALL')
  const [filterStatus, setFilterStatus] = useState('ALL')

  // Carica le gare dal database
  const loadRaces = async () => {
    if (!session?.user?.id) return
    
    try {
      setIsLoading(true)
      const response = await fetch('/api/race-results')
      if (response.ok) {
        const data = await response.json()
        const racesData = data.raceResults || data || []
        setRaces(racesData)
        setFilteredRaces(racesData)
      } else {
        console.error('Errore nel caricamento delle gare:', response.status, response.statusText)
        setError('Errore nel caricamento delle gare')
        setRaces([])
        setFilteredRaces([])
      }
    } catch (error) {
      console.error('Errore nel caricamento delle gare:', error)
      setError('Errore di connessione')
      setRaces([])
      setFilteredRaces([])
    } finally {
      setIsLoading(false)
    }
  }

  // Filtra le gare
  useEffect(() => {
    let filtered = races

    if (searchTerm) {
      filtered = filtered.filter(race => 
        race.eventName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (race.notes && race.notes.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (race.location && race.location.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    if (filterType !== 'ALL') {
      filtered = filtered.filter(race => race.eventType === filterType)
    }

    if (filterStatus !== 'ALL') {
      filtered = filtered.filter(race => race.status === filterStatus)
    }

    setFilteredRaces(filtered)
  }, [races, searchTerm, filterType, filterStatus])

  // Carica gare all'avvio
  useEffect(() => {
    if (session?.user?.id) {
      loadRaces()
    }
  }, [session?.user?.id])

  // Redirect se non autenticato
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  if (!session) {
    redirect('/auth/login')
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'RACE': return <Trophy className="w-4 h-4" />
      case 'COMPETITION': return <Award className="w-4 h-4" />
      case 'TIME_TRIAL': return <Clock className="w-4 h-4" />
      case 'FUN_RUN': return <Flag className="w-4 h-4" />
      default: return <Trophy className="w-4 h-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'RACE': return 'text-red-700 bg-red-100 border border-red-200'
      case 'COMPETITION': return 'text-blue-700 bg-blue-100 border border-blue-200'
      case 'TIME_TRIAL': return 'text-green-700 bg-green-100 border border-green-200'
      case 'FUN_RUN': return 'text-purple-700 bg-purple-100 border border-purple-200'
      default: return 'text-gray-700 bg-gray-100 border border-gray-200'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'text-green-700 bg-green-100 border border-green-200'
      case 'PLANNED': return 'text-blue-700 bg-blue-100 border border-blue-200'
      case 'CANCELLED': return 'text-red-700 bg-red-100 border border-red-200'
      default: return 'text-gray-700 bg-gray-100 border border-gray-200'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatTime = (timeString: string) => {
    if (!timeString) return 'N/A'
    return timeString
  }

  const handleCreateRace = async (raceData: Omit<RaceResult, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response = await fetch('/api/race-results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...raceData,
          userId: session.user.id
        })
      })

      if (response.ok) {
        await loadRaces()
        setShowAddModal(false)
      }
    } catch (error) {
      console.error('Errore nella creazione della gara:', error)
    }
  }

  const handleEditRace = async (id: string, raceData: Partial<RaceResult>) => {
    try {
      const response = await fetch(`/api/race-results/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(raceData)
      })

      if (response.ok) {
        await loadRaces()
        setShowEditModal(false)
        setEditingRace(null)
      }
    } catch (error) {
      console.error('Errore nell\'aggiornamento della gara:', error)
    }
  }

  const handleDeleteRace = async (raceId: string) => {
    if (confirm('Sei sicuro di voler eliminare questa gara?')) {
      try {
        const response = await fetch(`/api/race-results/${raceId}`, {
          method: 'DELETE'
        })

        if (response.ok) {
          await loadRaces()
        }
      } catch (error) {
        console.error('Errore nell\'eliminazione della gara:', error)
      }
    }
  }

  const handleEditRaceModal = (race: RaceResult) => {
    setEditingRace(race)
    setShowEditModal(true)
  }

  if (error) {
    return (
      <div className="min-h-screen gradient-bg">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="text-red-600 text-6xl mb-4">⚠️</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Errore nel caricamento</h3>
            <p className="text-gray-700 mb-4">{error}</p>
            <Button onClick={loadRaces}>
              Riprova
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Calcola statistiche
  const raceStats = {
    total: races.length,
    completed: races.filter(r => r.status === 'COMPLETED').length,
    planned: races.filter(r => r.status === 'PLANNED').length,
    cancelled: races.filter(r => r.status === 'CANCELLED').length,
    byType: races.reduce((acc, race) => {
      acc[race.eventType] = (acc[race.eventType] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  }

  return (
    <div className="min-h-screen gradient-bg">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Gare
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Gestisci le tue gare e competizioni
            </p>
          </div>
          
          <div className="flex items-center space-x-4 mt-4 sm:mt-0">
            {/* Controlli vista */}
            <div className="flex bg-white rounded-lg p-1 shadow-sm">
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <List className="w-4 h-4 inline mr-2" />
                Lista
              </button>
              <button
                onClick={() => setViewMode('stats')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'stats' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <BarChart3 className="w-4 h-4 inline mr-2" />
                Statistiche
              </button>
            </div>
            
            <Button
              onClick={() => setShowAddModal(true)}
              className="mt-4 sm:mt-0"
            >
              <Plus className="w-4 h-4 mr-2" />
              Aggiungi Gara
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card-hover">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-sport rounded-xl flex items-center justify-center mr-4">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-700 font-medium">Gare Totali</p>
                <p className="text-2xl font-bold text-gray-900">{raceStats.total}</p>
              </div>
            </div>
          </div>

          <div className="card-hover">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-sport rounded-xl flex items-center justify-center mr-4">
                <Award className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-700 font-medium">Completate</p>
                <p className="text-2xl font-bold text-gray-900">{raceStats.completed}</p>
              </div>
            </div>
          </div>

          <div className="card-hover">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-sport rounded-xl flex items-center justify-center mr-4">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-700 font-medium">Pianificate</p>
                <p className="text-2xl font-bold text-gray-900">{raceStats.planned}</p>
              </div>
            </div>
          </div>

          <div className="card-hover">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-sport rounded-xl flex items-center justify-center mr-4">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-700 font-medium">Cancellate</p>
                <p className="text-2xl font-bold text-gray-900">{raceStats.cancelled}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contenuto principale basato sulla modalità */}
        {viewMode === 'list' && (
          <>
            {/* Filtri e Ricerca */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Cerca gare..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-field pl-10"
                />
              </div>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="input-field"
              >
                <option value="ALL">Tutti i tipi</option>
                <option value="RACE">Gara</option>
                <option value="COMPETITION">Competizione</option>
                <option value="TIME_TRIAL">Time Trial</option>
                <option value="FUN_RUN">Fun Run</option>
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="input-field"
              >
                <option value="ALL">Tutti gli stati</option>
                <option value="PLANNED">Pianificata</option>
                <option value="COMPLETED">Completata</option>
                <option value="CANCELLED">Cancellata</option>
              </select>
            </div>

            {/* Lista Gare */}
            <div className="space-y-4">
              {isLoading ? (
                <LoadingSkeleton />
              ) : filteredRaces.length === 0 ? (
                <div className="text-center py-12">
                  <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {races.length === 0 
                      ? 'Nessuna gara registrata' 
                      : 'Nessuna gara trovata'
                    }
                  </h3>
                  <p className="text-gray-700">
                    {races.length === 0 
                      ? 'Inizia ad aggiungere le tue prime gare per tracciare i risultati!'
                      : 'Prova a modificare i filtri di ricerca.'
                    }
                  </p>
                  {races.length === 0 && (
                    <Button onClick={() => setShowAddModal(true)} className="mt-4">
                      <Plus className="w-4 h-4 mr-2" />
                      Aggiungi Prima Gara
                    </Button>
                  )}
                </div>
              ) : (
                filteredRaces.map((race) => (
                  <div key={race.id} className="card-hover">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{race.eventName}</h3>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(race.eventType)}`}>
                            {getTypeIcon(race.eventType)}
                            <span className="ml-1">{race.eventType}</span>
                          </span>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(race.status)}`}>
                            {race.status}
                          </span>
                        </div>
                        
                        {race.notes && (
                          <p className="text-gray-700 mb-3">{race.notes}</p>
                        )}
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                          <div className="flex items-center text-sm text-gray-600">
                            <Calendar className="w-4 h-4 mr-2" />
                            {formatDate(race.date)}
                          </div>
                          {race.time && (
                            <div className="flex items-center text-sm text-gray-600">
                              <Clock className="w-4 h-4 mr-2" />
                              {formatTime(race.time)}
                            </div>
                          )}
                          {race.distance && (
                            <div className="flex items-center text-sm text-gray-600">
                              <MapPin className="w-4 h-4 mr-2" />
                              {race.distance} km
                            </div>
                          )}
                          {race.location && (
                            <div className="flex items-center text-sm text-gray-600">
                              <MapPin className="w-4 h-4 mr-2" />
                              {race.location}
                            </div>
                          )}
                        </div>
                        
                        {race.position && race.totalParticipants && (
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span>Posizione: {race.position}/{race.totalParticipants}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex space-x-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditRaceModal(race)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteRace(race.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {viewMode === 'stats' && (
          <div className="bg-white rounded-xl shadow-sport p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Statistiche Dettagliate</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">Tipi più frequenti</h3>
                {Object.entries(raceStats.byType)
                  .sort(([,a], [,b]) => b - a)
                  .slice(0, 3)
                  .map(([type, count]) => (
                    <div key={type} className="text-sm text-gray-700">
                      {type}: {count} ({Math.round((count / raceStats.total) * 100)}%)
                    </div>
                  ))
                }
              </div>
              
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">Stato gare</h3>
                <div className="text-sm text-gray-700">
                  <div>Completate: {raceStats.completed}</div>
                  <div>Pianificate: {raceStats.planned}</div>
                  <div>Cancellate: {raceStats.cancelled}</div>
                </div>
              </div>
              
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">Performance</h3>
                <div className="text-sm text-gray-700">
                  {raceStats.completed > 0 ? (
                    <div>Completamento: {Math.round((raceStats.completed / raceStats.total) * 100)}%</div>
                  ) : (
                    <div>Nessuna gara completata</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modali */}
      <AddRaceModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleCreateRace}
      />

      <EditRaceModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setEditingRace(null)
        }}
        onEdit={handleEditRace}
        race={editingRace}
      />
    </div>
  )
}
