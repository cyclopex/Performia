'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Calendar, 
  Clock, 
  Target,
  Activity,
  Heart,
  Utensils,
  Stethoscope,
  Trophy,
  Edit,
  Trash2,
  Search,
  TrendingUp,
  MapPin,
  BarChart3,
  List
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell } from 'recharts'
import Navbar from '@/components/layout/Navbar'
import Button from '@/components/ui/Button'
import AddActivityModal from '@/components/AddActivityModal'
import EditActivityModal from '@/components/EditActivityModal'
import AddWorkoutModal from '@/components/AddWorkoutModal'
import AddRaceModal from '@/components/AddRaceModal'
import AddAnthropometricModal from '@/components/AddAnthropometricModal'

interface ScheduledActivity {
  id: string
  title: string
  description?: string
  date: string | Date
  time: string
  duration: number
  type: 'WORKOUT' | 'THERAPY' | 'NUTRITION' | 'MENTAL' | 'ASSESSMENT' | 'CUSTOM'
  assignedBy?: string | { id: string; name: string; email: string }
  assignedTo?: string | { id: string; name: string; email: string }
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED'
  tags?: string[] | string
  userId: string
  createdAt: string | Date
  updatedAt: string | Date
}

interface Workout {
  id: string
  title: string
  description?: string
  date: string
  duration: number
  distance?: number
  calories?: number
  rpe?: number
  notes?: string
  type: 'RUNNING' | 'CYCLING' | 'SWIMMING' | 'STRENGTH' | 'CARDIO' | 'FLEXIBILITY' | 'SPORTS' | 'OTHER'
  status: 'PLANNED' | 'COMPLETED' | 'CANCELLED'
  userId: string
  createdAt: string
  updatedAt: string
}

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

// Mock data per i grafici (mantenuto dal codice originale)
const weeklyLoadData = [
  { week: 'Sett 1', load: 85, rpe: 7.2 },
  { week: 'Sett 2', load: 92, rpe: 7.8 },
  { week: 'Sett 3', load: 78, rpe: 6.9 },
  { week: 'Sett 4', load: 95, rpe: 8.1 },
  { week: 'Sett 5', load: 88, rpe: 7.5 }
]

const performanceData = [
  { attribute: 'Forza', value: 85 },
  { attribute: 'Resistenza', value: 78 },
  { attribute: 'Tecnica', value: 92 },
  { attribute: 'Velocità', value: 88 },
  { attribute: 'Mobilità', value: 75 },
  { attribute: 'Recupero', value: 82 }
]

const weightData = [
  { week: 'Sett 1', weight: 72.5 },
  { week: 'Sett 2', weight: 72.3 },
  { week: 'Sett 3', weight: 72.1 },
  { week: 'Sett 4', weight: 71.9 },
  { week: 'Sett 5', weight: 71.8 }
]

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const [activeTab, setActiveTab] = useState<'load' | 'performance' | 'weight'>('load')
  const [currentWeek, setCurrentWeek] = useState(new Date())
  const [showAddActivity, setShowAddActivity] = useState(false)
  const [showEditActivity, setShowEditActivity] = useState(false)
  const [selectedActivity, setSelectedActivity] = useState<ScheduledActivity | null>(null)
  const [scheduledActivities, setScheduledActivities] = useState<ScheduledActivity[]>([])
  
  // Nuovi stati per la gestione completa
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [raceResults, setRaceResults] = useState<RaceResult[]>([])
  const [showAddWorkout, setShowAddWorkout] = useState(false)
  const [showAddRace, setShowAddRace] = useState(false)
  const [showAddAnthropometric, setShowAddAnthropometric] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('ALL')
  const [filterStatus, setFilterStatus] = useState('ALL')
  const [viewMode, setViewMode] = useState<'calendar' | 'list' | 'stats'>('calendar')

  // Carica le attività dal database
  const loadActivities = useCallback(async () => {
    if (!session?.user?.id) return
    
    try {
      const response = await fetch('/api/activities')
      if (response.ok) {
        const data = await response.json()
        setScheduledActivities(data)
      }
    } catch (error) {
      console.error('Errore nel caricamento delle attività:', error)
    } finally {
    }
  }, [session?.user?.id])

  // Carica gli allenamenti dal database
  const loadWorkouts = useCallback(async () => {
    if (!session?.user?.id) return
    
    try {
      const response = await fetch('/api/workouts')
      if (response.ok) {
        const data = await response.json()
        setWorkouts(data)
      }
    } catch (error) {
      console.error('Errore nel caricamento degli allenamenti:', error)
    }
  }, [session?.user?.id])

  // Carica i risultati gara dal database
  const loadRaceResults = useCallback(async () => {
    if (!session?.user?.id) return
    
    try {
      const response = await fetch('/api/race-results')
      if (response.ok) {
        const data = await response.json()
        setRaceResults(data)
      }
    } catch (error) {
      console.error('Errore nel caricamento dei risultati gara:', error)
    }
  }, [session?.user?.id])

  // Calcola le statistiche per i KPI
  const workoutStats = useMemo(() => {
    const total = workouts.length
    const completed = workouts.filter(w => w.status === 'COMPLETED').length
    const planned = workouts.filter(w => w.status === 'PLANNED').length
    const cancelled = workouts.filter(w => w.status === 'CANCELLED').length
    
    return { total, completed, planned, cancelled }
  }, [workouts])

  const raceStats = useMemo(() => {
    const total = raceResults.length
    const completed = raceResults.filter(r => r.time).length
    
    return { total, completed }
  }, [raceResults])

  // Filtra gli allenamenti per la vista lista
  const filteredWorkouts = useMemo(() => {
    return workouts.filter(workout => {
      const matchesSearch = workout.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (workout.description && workout.description.toLowerCase().includes(searchTerm.toLowerCase()))
      const matchesType = filterType === 'ALL' || workout.type === filterType
      const matchesStatus = filterStatus === 'ALL' || workout.status === filterStatus
      
      return matchesSearch && matchesType && matchesStatus
    })
  }, [workouts, searchTerm, filterType, filterStatus])

  // Carica tutti i dati all'avvio
  useEffect(() => {
    if (session?.user?.id) {
      loadActivities()
      loadWorkouts()
      loadRaceResults()
    }
  }, [session?.user?.id, loadActivities, loadWorkouts, loadRaceResults])

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

  // Funzioni per il calendario
  const getWeekDays = (date: Date) => {
    const start = new Date(date)
    start.setDate(start.getDate() - start.getDay() + 1) // Lunedì
    
    const days = []
    for (let i = 0; i < 7; i++) {
      const day = new Date(start)
      day.setDate(start.getDate() + i)
      days.push(day)
    }
    return days
  }

  const getActivitiesForDay = (date: string) => {
    const dayActivities = scheduledActivities.filter(activity => {
      const activityDate = new Date(activity.date).toDateString()
      return activityDate === new Date(date).toDateString()
    })
    
    const dayWorkouts = workouts.filter(workout => {
      const workoutDate = new Date(workout.date).toDateString()
      return workoutDate === new Date(date).toDateString()
    })
    
    const dayRaces = raceResults.filter(race => {
      const raceDate = new Date(race.date).toDateString()
      return raceDate === new Date(date).toDateString()
    })
    
    return [...dayActivities, ...dayWorkouts, ...dayRaces]
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'WORKOUT':
      case 'RUNNING':
      case 'CYCLING':
      case 'SWIMMING':
      case 'STRENGTH':
      case 'CARDIO':
      case 'FLEXIBILITY':
      case 'SPORTS':
      case 'OTHER':
        return <Activity className="w-4 h-4" />
      case 'THERAPY':
        return <Stethoscope className="w-4 h-4" />
      case 'NUTRITION':
        return <Utensils className="w-4 h-4" />
      case 'MENTAL':
        return <Heart className="w-4 h-4" />
      case 'ASSESSMENT':
        return <Target className="w-4 h-4" />
      case 'RACE':
      case 'COMPETITION':
      case 'TIME_TRIAL':
      case 'FUN_RUN':
        return <Trophy className="w-4 h-4" />
      default:
        return <Calendar className="w-4 h-4" />
    }
  }

  const getActivityType = (activity: ScheduledActivity | Workout | RaceResult): string => {
    if ('type' in activity) {
      return activity.type
    } else if ('eventType' in activity) {
      return activity.eventType
    }
    return 'OTHER'
  }

  const getActivityTitle = (activity: ScheduledActivity | Workout | RaceResult): string => {
    if ('title' in activity) {
      return activity.title
    } else if ('eventName' in activity) {
      return activity.eventName
    } else if ('description' in activity) {
      const desc = (activity as ScheduledActivity | Workout).description
      return desc || 'Attività'
    }
    return 'Attività'
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'WORKOUT':
      case 'RUNNING':
      case 'CYCLING':
      case 'SWIMMING':
      case 'STRENGTH':
      case 'CARDIO':
      case 'FLEXIBILITY':
      case 'SPORTS':
      case 'OTHER':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'THERAPY':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'NUTRITION':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'MENTAL':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'ASSESSMENT':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'RACE':
      case 'COMPETITION':
      case 'TIME_TRIAL':
      case 'FUN_RUN':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }



  const formatTime = (time: string) => {
    if (!time) return ''
    
    // Se è già nel formato HH:MM, lo restituisce così com'è
    if (/^\d{1,2}:\d{2}$/.test(time)) {
      return time
    }
    
    // Se è nel formato HH:MM:SS, rimuove i secondi
    if (/^\d{1,2}:\d{2}:\d{2}$/.test(time)) {
      return time.substring(0, 5)
    }
    
    // Se è un numero (minuti), lo converte in formato HH:MM
    const minutes = parseInt(time)
    if (!isNaN(minutes)) {
      const hours = Math.floor(minutes / 60)
      const mins = minutes % 60
      return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
    }
    
    return time
  }

  // Gestione attività
  const handleEditActivity = async (updatedActivity: ScheduledActivity) => {
    try {
      const response = await fetch(`/api/activities/${updatedActivity.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedActivity)
      })

      if (response.ok) {
        await loadActivities()
        setShowEditActivity(false)
        setSelectedActivity(null)
      }
    } catch (error) {
      console.error('Errore nella modifica dell\'attività:', error)
    }
  }

  const openEditModal = (activity: ScheduledActivity) => {
    setSelectedActivity(activity)
    setShowEditActivity(true)
  }

  const handleAddActivity = async (newActivity: ScheduledActivity) => {
    try {
      const response = await fetch('/api/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newActivity)
      })

      if (response.ok) {
        await loadActivities()
        setShowAddActivity(false)
      }
    } catch (error) {
      console.error('Errore nel salvataggio dell\'attività:', error)
    }
  }

  // Gestione allenamenti
  const handleAddWorkout = async (newWorkout: Omit<Workout, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    try {
      const workoutData = {
        ...newWorkout,
        userId: session.user.id
      }
      
      const response = await fetch('/api/workouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(workoutData)
      })

      if (response.ok) {
        await loadWorkouts()
        setShowAddWorkout(false)
      }
    } catch (error) {
      console.error('Errore nel salvataggio dell\'allenamento:', error)
    }
  }

  const handleDeleteWorkout = async (workoutId: string) => {
    if (!confirm('Sei sicuro di voler eliminare questo allenamento?')) return
    
    try {
      const response = await fetch(`/api/workouts/${workoutId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await loadWorkouts()
      }
    } catch (error) {
      console.error('Errore nell\'eliminazione dell\'allenamento:', error)
    }
  }

  // Gestione risultati gara
  const handleAddRace = async (newRace: Omit<RaceResult, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    try {
      const raceData = {
        ...newRace,
        userId: session.user.id
      }
      
      const response = await fetch('/api/race-results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(raceData)
      })

      if (response.ok) {
        await loadRaceResults()
        setShowAddRace(false)
      }
    } catch (error) {
      console.error('Errore nel salvataggio del risultato gara:', error)
    }
  }

  // Gestione dati antropometrici
  const handleAddAnthropometric = async (newData: Omit<AnthropometricData, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response = await fetch('/api/anthropometric', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newData,
          userId: session?.user?.id
        })
      })
      
      if (response.ok) {
        // Ricarica i dati per aggiornare i grafici
        // In una implementazione completa, qui si aggiornerebbe lo stato locale
        console.log('Dati antropometrici aggiunti con successo')
        setShowAddAnthropometric(false)
      } else {
        console.error('Errore nell\'aggiunta dei dati antropometrici')
      }
    } catch (error) {
      console.error('Errore nell\'aggiunta dei dati antropometrici:', error)
    }
  }






  // Navigazione settimanale
  const goToPreviousWeek = () => {
    const newDate = new Date(currentWeek)
    newDate.setDate(currentWeek.getDate() - 7)
    setCurrentWeek(newDate)
  }

  const goToNextWeek = () => {
    const newDate = new Date(currentWeek)
    newDate.setDate(currentWeek.getDate() + 7)
    setCurrentWeek(newDate)
  }

  const goToCurrentWeek = () => {
    setCurrentWeek(new Date())
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header con titolo e controlli */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
            <p className="text-gray-600">Monitora i tuoi progressi e gestisci le attività</p>
          </div>
          
          {/* Controlli vista */}
          <div className="flex items-center space-x-4 mt-4 sm:mt-0">
            <div className="flex bg-white rounded-lg p-1 shadow-sm">
              <button
                onClick={() => setViewMode('calendar')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'calendar' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Calendar className="w-4 h-4 inline mr-2" />
                Calendario
              </button>
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
            
            {/* Pulsanti aggiunta */}
            <div className="flex space-x-2">
              <Button onClick={() => setShowAddActivity(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Attività
              </Button>
              <Button onClick={() => setShowAddWorkout(true)} variant="secondary">
                <Activity className="w-4 h-4 mr-2" />
                Allenamento
              </Button>
              <Button onClick={() => setShowAddRace(true)} variant="secondary">
                <Trophy className="w-4 h-4 mr-2" />
                Gara
              </Button>

            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sport p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Activity className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Allenamenti</p>
                <p className="text-2xl font-bold text-gray-900">{workoutStats.total}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sport p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Trophy className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Gare</p>
                <p className="text-2xl font-bold text-gray-900">{raceStats.total}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sport p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Target className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completati</p>
                <p className="text-2xl font-bold text-gray-900">{workoutStats.completed}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sport p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Attività</p>
                <p className="text-2xl font-bold text-gray-900">{scheduledActivities.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contenuto principale basato sulla modalità */}
        {viewMode === 'calendar' && (
          <>
            {/* Calendario Settimanale */}
            <div className="bg-white rounded-xl shadow-sport p-6 mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Calendario Settimanale</h2>
                <div className="flex items-center space-x-2">
                  <Button onClick={goToPreviousWeek} variant="outline" size="sm">
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button onClick={goToCurrentWeek} variant="outline" size="sm">
                    Oggi
                  </Button>
                  <Button onClick={goToNextWeek} variant="outline" size="sm">
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-7 gap-4">
                {getWeekDays(currentWeek).map((day, index) => {
                  const dayActivities = getActivitiesForDay(day.toISOString())
                  const isToday = day.toDateString() === new Date().toDateString()
                  
                  return (
                    <div key={index} className={`min-h-32 p-3 rounded-lg border ${
                      isToday ? 'border-blue-300 bg-blue-50' : 'border-gray-200'
                    }`}>
                      <div className={`text-center mb-2 ${
                        isToday ? 'text-blue-600 font-semibold' : 'text-gray-600'
                      }`}>
                        <div className="text-sm font-medium">
                          {day.toLocaleDateString('it-IT', { weekday: 'short' })}
                        </div>
                        <div className="text-lg font-bold">
                          {day.getDate()}
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        {dayActivities.length > 0 ? (
                          dayActivities.map((activity, activityIndex) => (
                            <div
                              key={activityIndex}
                              className={`p-2 rounded text-xs border ${getActivityColor(getActivityType(activity))} cursor-pointer hover:opacity-80 transition-opacity`}
                              onClick={() => {
                                if ('duration' in activity && 'type' in activity && 'status' in activity && !('time' in activity)) {
                                  // È un Workout
                                  setEditingWorkout(activity as Workout)
                                  setShowEditActivity(true)
                                } else if ('title' in activity && 'type' in activity && 'status' in activity && 'time' in activity) {
                                  // È una ScheduledActivity
                                  openEditModal(activity as ScheduledActivity)
                                } else if ('eventName' in activity && 'eventType' in activity) {
                                  // È un RaceResult - non modificabile, solo visualizzabile
                                  console.log('RaceResult non modificabile:', activity)
                                }
                              }}
                            >
                              <div className="flex items-center space-x-1">
                                {getActivityIcon(getActivityType(activity))}
                                <span className="font-medium truncate">
                                  {getActivityTitle(activity)}
                                </span>
                              </div>
                              {('time' in activity && activity.time) && (
                                <div className="text-xs opacity-75 mt-1">
                                  {formatTime(activity.time)}
                                </div>
                              )}
                            </div>
                          ))
                        ) : (
                          <div className="text-xs text-gray-400 text-center py-2">
                            Nessuna attività
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Carico Settimanale e RPE */}
            <div className="bg-white rounded-xl shadow-sport p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Carico Settimanale e RPE</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={weeklyLoadData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Line yAxisId="left" type="monotone" dataKey="load" stroke="#3B82F6" strokeWidth={2} name="Carico (AU)" />
                  <Line yAxisId="right" type="monotone" dataKey="rpe" stroke="#10B981" strokeWidth={2} name="RPE" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </>
        )}

        {viewMode === 'list' && (
          <>
            {/* Filtri e ricerca */}
            <div className="bg-white rounded-xl shadow-sport p-6 mb-8">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Cerca allenamenti..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="ALL">Tutti i tipi</option>
                  <option value="RUNNING">Running</option>
                  <option value="CYCLING">Ciclismo</option>
                  <option value="SWIMMING">Nuoto</option>
                  <option value="STRENGTH">Forza</option>
                  <option value="CARDIO">Cardio</option>
                  <option value="FLEXIBILITY">Flessibilità</option>
                  <option value="SPORTS">Sport</option>
                  <option value="OTHER">Altro</option>
                </select>
                
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="ALL">Tutti gli stati</option>
                  <option value="PLANNED">Pianificato</option>
                  <option value="COMPLETED">Completato</option>
                  <option value="CANCELLED">Cancellato</option>
                </select>
              </div>
            </div>

            {/* Lista allenamenti */}
            <div className="bg-white rounded-xl shadow-sport overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Allenamenti</h2>
              </div>
              
              <div className="divide-y divide-gray-200">
                {filteredWorkouts.map((workout) => (
                  <div key={workout.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className={`p-2 rounded-lg ${getActivityColor(workout.type)}`}>
                            {getActivityIcon(workout.type)}
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{workout.title}</h3>
                            <p className="text-sm text-gray-600">{workout.description}</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(workout.date).toLocaleDateString('it-IT')}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4" />
                            <span>{workout.duration} min</span>
                          </div>
                          {workout.distance && (
                            <div className="flex items-center space-x-2">
                              <MapPin className="w-4 h-4" />
                              <span>{workout.distance} km</span>
                            </div>
                          )}
                          {workout.rpe && (
                            <div className="flex items-center space-x-2">
                              <Target className="w-4 h-4" />
                              <span>RPE {workout.rpe}</span>
                            </div>
                          )}
                        </div>
                        
                        {workout.notes && (
                          <p className="text-sm text-gray-600 mt-3 italic">"{workout.notes}"quot;{workout.notes}"{workout.notes}"quot;</p>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() => setEditingWorkout(workout)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteWorkout(workout.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {filteredWorkouts.length === 0 && (
                  <div className="p-6 text-center text-gray-500">
                    <Activity className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>Nessun allenamento trovato</p>
                    <p className="text-sm">Prova a modificare i filtri o aggiungi un nuovo allenamento</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {viewMode === 'stats' && (
          <>
            {/* Statistiche allenamenti */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <div className="bg-white rounded-xl shadow-sport p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribuzione per Tipo</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={Object.entries(workoutStats.byType).map(([type, ]) => ({
                        name: type,
                        value: count
                      }))}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {Object.entries(workoutStats.byType).map(([type, ], index) => (
                        <Cell key={`cell-${index}`} fill={getActivityColor(type).split(' ')[1]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
              
              <div className="bg-white rounded-xl shadow-sport p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Stato Allenamenti</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={[
                    { status: 'Completati', count: workoutStats.completed },
                    { status: 'Pianificati', count: workoutStats.planned },
                    { status: 'Cancellati', count: workoutStats.cancelled }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="status" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Grafici performance esistenti */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <div className="bg-white rounded-xl shadow-sport p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Profilo Performance</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={performanceData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="attribute" />
                    <PolarRadiusAxis />
                    <Radar name="Performance" dataKey="value" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              
              <div className="bg-white rounded-xl shadow-sport p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Trend Peso</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={weightData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="weight" stroke="#10B981" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}

        {/* Tab Performance e Peso (mantenuti dal codice originale) */}
        <div className="bg-white rounded-xl shadow-sport p-6">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6">
            <button
              onClick={() => setActiveTab('load')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'load' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Carico
            </button>
            <button
              onClick={() => setActiveTab('performance')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'performance' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Performance
            </button>
            <button
              onClick={() => setActiveTab('weight')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'weight' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Peso
            </button>
          </div>

          {activeTab === 'load' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Carico Settimanale e RPE</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={weeklyLoadData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Line yAxisId="left" type="monotone" dataKey="load" stroke="#3B82F6" strokeWidth={2} name="Carico (AU)" />
                  <Line yAxisId="right" type="monotone" dataKey="rpe" stroke="#10B981" strokeWidth={2} name="RPE" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {activeTab === 'performance' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Profilo Performance</h3>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={performanceData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="attribute" />
                  <PolarRadiusAxis />
                  <Radar name="Performance" dataKey="value" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          )}

          {activeTab === 'weight' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Trend Peso</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={weightData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="weight" stroke="#10B981" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Modali */}
      {showAddActivity && (
        <AddActivityModal
          isOpen={showAddActivity}
          onClose={() => setShowAddActivity(false)}
          onAdd={handleAddActivity}
        />
      )}

      {showEditActivity && selectedActivity && (
        <EditActivityModal
          isOpen={showEditActivity}
          onClose={() => {
            setShowEditActivity(false)
            setSelectedActivity(null)
          }}
          onEdit={handleEditActivity}
          activity={selectedActivity}
        />
      )}

      {showAddWorkout && (
        <AddWorkoutModal
          isOpen={showAddWorkout}
          onClose={() => setShowAddWorkout(false)}
          onAdd={handleAddWorkout}
        />
      )}

      {showAddRace && (
        <AddRaceModal
          isOpen={showAddRace}
          onClose={() => setShowAddRace(false)}
          onAdd={handleAddRace}
        />
      )}

      {showAddAnthropometric && (
        <AddAnthropometricModal
          isOpen={showAddAnthropometric}
          onClose={() => setShowAddAnthropometric(false)}
          onAdd={handleAddAnthropometric}
        />
      )}
    </div>
  )
}
