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
  Zap,
  Edit,
  Trash2,
  Search,
  TrendingUp,
  Activity,
  BarChart3,
  List,
  Eye
} from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Button from '@/components/ui/Button'
import WorkoutStats from '@/components/workouts/WorkoutStats'
import AddWorkoutModal from '@/components/workouts/AddWorkoutModal'
import EditWorkoutModal from '@/components/workouts/EditWorkoutModal'
import LoadingSkeleton from '@/components/workouts/LoadingSkeleton'
import { useWorkouts } from '@/lib/hooks/useWorkouts'
import { Workout } from '@/types/activity'

export default function WorkoutsPage() {
  const { data: session, status } = useSession()
  const [viewMode, setViewMode] = useState<'list' | 'stats'>('list')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null)
  
  const {
    workouts,
    filteredWorkouts,
    isLoading,
    error,
    searchTerm,
    filterType,
    workoutStats,
    loadWorkouts,
    createWorkout,
    updateWorkout,
    deleteWorkout,
    setSearchTerm,
    setFilterType,
    resetFilters,
    hasActiveFilters
  } = useWorkouts()

  // Carica allenamenti all'avvio
  useEffect(() => {
    if (session?.user?.id) {
      loadWorkouts()
    }
  }, [session?.user?.id, loadWorkouts])

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
      case 'RUNNING': return <TrendingUp className="w-4 h-4" />
      case 'CYCLING': return <Activity className="w-4 h-4" />
      case 'SWIMMING': return <Activity className="w-4 h-4" />
      case 'STRENGTH': return <Target className="w-4 h-4" />
      case 'CARDIO': return <Zap className="w-4 h-4" />
      case 'FLEXIBILITY': return <Activity className="w-4 h-4" />
      case 'SPORTS': return <Target className="w-4 h-4" />
      case 'YOGA': return <Activity className="w-4 h-4" />
      case 'PILATES': return <Activity className="w-4 h-4" />
      case 'CROSSFIT': return <Target className="w-4 h-4" />
      case 'MARTIAL_ARTS': return <Target className="w-4 h-4" />
      case 'CLIMBING': return <Activity className="w-4 h-4" />
      default: return <Activity className="w-4 h-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'RUNNING': return 'text-blue-600 bg-blue-50'
      case 'CYCLING': return 'text-green-600 bg-green-50'
      case 'SWIMMING': return 'text-cyan-600 bg-cyan-50'
      case 'STRENGTH': return 'text-red-600 bg-red-50'
      case 'CARDIO': return 'text-purple-600 bg-purple-50'
      case 'FLEXIBILITY': return 'text-yellow-600 bg-yellow-50'
      case 'SPORTS': return 'text-orange-600 bg-orange-50'
      case 'YOGA': return 'text-indigo-600 bg-indigo-50'
      case 'PILATES': return 'text-pink-600 bg-pink-50'
      case 'CROSSFIT': return 'text-red-700 bg-red-100'
      case 'MARTIAL_ARTS': return 'text-red-800 bg-red-100'
      case 'CLIMBING': return 'text-amber-600 bg-amber-50'
      default: return 'text-gray-600 bg-gray-50'
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

  const handleDeleteWorkout = async (workoutId: string) => {
    if (confirm('Sei sicuro di voler eliminare questo allenamento?')) {
      try {
        await deleteWorkout(workoutId)
      } catch (error) {
        console.error('Errore nell\'eliminazione:', error)
      }
    }
  }

  const handleEditWorkout = (workout: Workout) => {
    setEditingWorkout(workout)
    setShowEditModal(true)
  }

  const handleCreateWorkout = async (workoutData: Omit<Workout, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    try {
      await createWorkout(workoutData)
    } catch (error) {
      console.error('Errore nella creazione:', error)
    }
  }

  const handleUpdateWorkout = async (id: string, workoutData: Partial<Workout>) => {
    try {
      await updateWorkout(id, workoutData)
      setShowEditModal(false)
      setEditingWorkout(null)
    } catch (error) {
      console.error('Errore nell\'aggiornamento:', error)
    }
  }

  if (error) {
    return (
      <div className="min-h-screen gradient-bg">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="text-red-600 text-6xl mb-4">⚠️</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Errore nel caricamento</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={loadWorkouts}>
              Riprova
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen gradient-bg">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Allenamenti
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Traccia i tuoi allenamenti e monitora i progressi
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
              Aggiungi Allenamento
            </Button>
          </div>
        </div>

        {/* Stats Cards - sempre visibili */}
        <WorkoutStats {...workoutStats} />

        {/* Contenuto principale basato sulla modalità */}
        {viewMode === 'list' && (
          <>
            {/* Filtri e Ricerca */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Cerca allenamenti..."
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

            {/* Workouts List */}
            <div className="space-y-4">
              {isLoading ? (
                <LoadingSkeleton />
              ) : filteredWorkouts.length === 0 ? (
                <div className="text-center py-12">
                  <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {workouts.length === 0 
                      ? 'Nessun allenamento registrato' 
                      : 'Nessun allenamento trovato'
                    }
                  </h3>
                  <p className="text-gray-600">
                    {workouts.length === 0 
                      ? 'Inizia ad aggiungere i tuoi primi allenamenti per tracciare i progressi!'
                      : hasActiveFilters 
                        ? 'Prova a modificare i filtri di ricerca.'
                        : 'Nessun allenamento corrisponde ai criteri selezionati.'
                    }
                  </p>
                  {hasActiveFilters && (
                    <Button onClick={resetFilters} className="mt-4">
                      Reset Filtri
                    </Button>
                  )}
                  {workouts.length === 0 && (
                    <Button onClick={() => setShowAddModal(true)} className="mt-4">
                      <Plus className="w-4 h-4 mr-2" />
                      Aggiungi Primo Allenamento
                    </Button>
                  )}
                </div>
              ) : (
                filteredWorkouts.map((workout) => (
                  <div key={workout.id} className="card-hover">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{workout.title}</h3>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(workout.type)}`}>
                            {getTypeIcon(workout.type)}
                            <span className="ml-1">{workout.type}</span>
                          </span>
                        </div>
                        
                        {workout.description && (
                          <p className="text-gray-600 mb-3">{workout.description}</p>
                        )}
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                          <div className="flex items-center text-sm text-gray-500">
                            <Calendar className="w-4 h-4 mr-2" />
                            {formatDate(workout.date)}
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <Clock className="w-4 h-4 mr-2" />
                            {workout.duration} min
                          </div>
                          {workout.distance && (
                            <div className="flex items-center text-sm text-gray-500">
                              <MapPin className="w-4 h-4 mr-2" />
                              {workout.distance} km
                            </div>
                          )}
                          {workout.rpe && (
                            <div className="flex items-center text-sm text-gray-500">
                              <Target className="w-4 h-4 mr-2" />
                              RPE {workout.rpe}/10
                            </div>
                          )}
                        </div>
                        
                        {workout.notes && (
                          <p className="text-sm text-gray-500 italic">&quot;{workout.notes}&quot;</p>
                        )}
                      </div>
                      
                      <div className="flex space-x-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditWorkout(workout)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteWorkout(workout.id)}
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
              {/* Statistiche aggiuntive qui */}
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">Tipi più frequenti</h3>
                {Object.entries(
                  workouts.reduce((acc, workout) => {
                    acc[workout.type] = (acc[workout.type] || 0) + 1
                    return acc
                  }, {} as Record<string, number>)
                )
                  .sort(([,a], [,b]) => b - a)
                  .slice(0, 3)
                  .map(([type, count]) => (
                    <div key={type} className="text-sm text-gray-600">
                      {type}: {count} ({Math.round((count / workoutStats.total) * 100)}%)
                    </div>
                  ))
                }
              </div>
              
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">Durata media</h3>
                <p className="text-2xl font-bold text-blue-600">
                  {workoutStats.total > 0 ? Math.round(workoutStats.totalDuration / workoutStats.total) : 0} min
                </p>
              </div>
              
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">Distanza media</h3>
                <p className="text-2xl font-bold text-green-600">
                  {workoutStats.total > 0 ? (workoutStats.totalDistance / workoutStats.total).toFixed(1) : 0} km
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modali */}
      <AddWorkoutModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleCreateWorkout}
      />

      <EditWorkoutModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setEditingWorkout(null)
        }}
        onSave={handleUpdateWorkout}
        workout={editingWorkout}
      />
    </div>
  )
}
