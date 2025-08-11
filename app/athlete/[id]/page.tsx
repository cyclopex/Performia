'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useParams, useRouter } from 'next/navigation'
import { 
  
  
  Target,
  Activity,
  Trophy,
  Plus,
  Edit,
  ArrowLeft,
  User,
  MapPin,
  TrendingUp,
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import Navbar from '@/components/layout/Navbar'
import Button from '@/components/ui/Button'
import CreateProposalModal from '@/components/CreateProposalModal'

interface AthleteProfile {
  id: string
  name: string
  email: string
  image?: string
  role: string
  profile?: {
    birthDate?: string
    city?: string
    height?: number
    weight?: number
    gender?: string
    dominantHand?: string
    sports?: string[] | string
    sportLevel?: string
    yearsExperience?: number
    sportGoals?: string[]
    trainingAvailability?: string[] | string
    trainingFrequency?: string
  }
}

interface ScheduledActivity {
  id: string
  title: string
  description?: string
  date: string | Date
  time: string
  duration: number
  type: 'WORKOUT' | 'THERAPY' | 'NUTRITION' | 'MENTAL' | 'ASSESSMENT' | 'CUSTOM'
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

export default function AthleteProfilePage() {
  const { data: session, status } = useSession()
  const params = useParams()
  const router = useRouter()
  const athleteId = params.id as string
  
  const [athleteProfile, setAthleteProfile] = useState<AthleteProfile | null>(null)
  const [activities, setActivities] = useState<ScheduledActivity[]>([])
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [raceResults, setRaceResults] = useState<RaceResult[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'calendar' | 'activities' | 'workouts' | 'races'>('overview')
  const [showCreateProposal, setShowCreateProposal] = useState(false)
  const [selectedItem, setSelectedItem] = useState<ScheduledActivity | Workout | RaceResult | null>(null)

  // Carica il profilo dell'atleta
  const loadAthleteProfile = useCallback(async () => {
    if (!session?.user?.id || !athleteId) return
    
    setLoading(true)
    try {
      const response = await fetch(`/api/users/${athleteId}/profile`)
      if (response.ok) {
        const data = await response.json()
        setAthleteProfile(data.user)
        setActivities(data.scheduledActivities || [])
        setWorkouts(data.workouts || [])
        setRaceResults(data.raceResults || [])
      } else {
        console.error('Errore nel caricamento del profilo atleta')
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Errore nel caricamento del profilo atleta:', error)
      router.push('/dashboard')
    } finally {
      setLoading(false)
    }
  }, [session?.user?.id, athleteId, router])

  // Carica i dati all'avvio
  useEffect(() => {
    if (session?.user?.id && athleteId) {
      loadAthleteProfile()
    }
  }, [session?.user?.id, athleteId, loadAthleteProfile])

  // Redirect se non autenticato
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  if (!session) {
    router.push('/auth/login')
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
        </div>
      </div>
    )
  }

  if (!athleteProfile) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Atleta non trovato</h1>
            <Button onClick={() => router.push('/dashboard')}>
              Torna alla Dashboard
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Calcola statistiche
  const totalActivities = activities.length
  const completedActivities = activities.filter(a => a.status === 'COMPLETED').length
  const totalWorkouts = workouts.length
  const completedWorkouts = workouts.filter(w => w.status === 'COMPLETED').length
  const totalRaces = raceResults.length

  // Dati per i grafici
  const weeklyData = [
    { week: 'Sett 1', activities: 5, workouts: 3 },
    { week: 'Sett 2', activities: 4, workouts: 4 },
    { week: 'Sett 3', activities: 6, workouts: 2 },
    { week: 'Sett 4', activities: 3, workouts: 5 }
  ]

  const workoutTypeData = workouts.reduce((acc, workout) => {
    acc[workout.type] = (acc[workout.type] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'WORKOUT':
        return <Target className="w-4 h-4" />
      case 'THERAPY':
        return <Activity className="w-4 h-4" />
      case 'NUTRITION':
        return <Activity className="w-4 h-4" />
      case 'MENTAL':
        return <Activity className="w-4 h-4" />
      case 'ASSESSMENT':
        return <Target className="w-4 h-4" />
      default:
        return <Activity className="w-4 h-4" />
    }
  }

  const getWorkoutIcon = (type: string) => {
    switch (type) {
      case 'RUNNING':
        return <Target className="w-4 h-4" />
      case 'CYCLING':
        return <Target className="w-4 h-4" />
      case 'SWIMMING':
        return <Target className="w-4 h-4" />
      case 'STRENGTH':
        return <Target className="w-4 h-4" />
      case 'CARDIO':
        return <Target className="w-4 h-4" />
      default:
        return <Target className="w-4 h-4" />
    }
  }

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('it-IT')
  }

  const formatTime = (time: string) => {
    return time.slice(0, 5)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button 
            onClick={() => router.push('/dashboard')} 
            variant="outline" 
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Torna alla Dashboard
          </Button>
          
          <div className="bg-white rounded-xl shadow-sport p-6">
            <div className="flex items-center space-x-6">
              {athleteProfile.image ? (
                <img 
                  src={athleteProfile.image} 
                  alt={athleteProfile.name}
                  className="w-20 h-20 rounded-full object-cover"
                />
              ) : (
                <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {athleteProfile.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                </div>
              )}
              
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{athleteProfile.name}</h1>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span className="flex items-center">
                    <User className="w-4 h-4 mr-1" />
                    {athleteProfile.role}
                  </span>
                  {athleteProfile.profile?.city && (
                    <span className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {athleteProfile.profile.city}
                    </span>
                  )}
                  {athleteProfile.profile?.sports && (
                    <span className="flex items-center">
                      <Activity className="w-4 h-4 mr-1" />
                      {Array.isArray(athleteProfile.profile.sports) 
                        ? athleteProfile.profile.sports.join(', ')
                        : athleteProfile.profile.sports
                      }
                    </span>
                  )}
                </div>
              </div>
              
              <div className="flex space-x-3">
                <Button onClick={() => setShowCreateProposal(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Nuova Proposta
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sport p-6 mb-8">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'overview' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Panoramica
            </button>
            <button
              onClick={() => setActiveTab('calendar')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'calendar' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Calendario
            </button>
            <button
              onClick={() => setActiveTab('activities')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'activities' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Attività
            </button>
            <button
              onClick={() => setActiveTab('workouts')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'workouts' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Allenamenti
            </button>
            <button
              onClick={() => setActiveTab('races')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'races' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Gare
            </button>
          </div>

          {/* Contenuto Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Statistiche */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <Activity className="w-8 h-8 text-blue-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-blue-600">Attività Totali</p>
                      <p className="text-2xl font-bold text-blue-900">{totalActivities}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <Target className="w-8 h-8 text-green-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-green-600">Allenamenti</p>
                      <p className="text-2xl font-bold text-green-900">{totalWorkouts}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-orange-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <Trophy className="w-8 h-8 text-orange-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-orange-600">Gare</p>
                      <p className="text-2xl font-bold text-orange-900">{totalRaces}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <TrendingUp className="w-8 h-8 text-purple-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-purple-600">Completati</p>
                      <p className="text-2xl font-bold text-purple-900">{completedActivities + completedWorkouts}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Grafici */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Attività Settimanali</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={weeklyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="week" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="activities" stroke="#3B82F6" strokeWidth={2} />
                      <Line type="monotone" dataKey="workouts" stroke="#10B981" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Tipi di Allenamento</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={Object.entries(workoutTypeData).map(([, ]) => ({
                          name: type,
                          value: count
                        }))}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {Object.entries(workoutTypeData).map(([, ], index) => (
                          <Cell key={`cell-${index}`} fill={['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'][index % 5]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'calendar' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Calendario Attività</h3>
              <div className="grid grid-cols-7 gap-4">
                {['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'].map((day) => (
                  <div key={day} className="text-center">
                    <div className="font-medium text-gray-900 mb-2">{day}</div>
                    <div className="min-h-24 p-2 border border-gray-200 rounded-lg">
                      {/* Qui andrebbero le attività del giorno */}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'activities' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Attività Programmate</h3>
                <Button onClick={() => setShowCreateProposal(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Proponi Attività
                </Button>
              </div>
              
              <div className="space-y-4">
                {activities.length > 0 ? (
                  activities.map((activity) => (
                    <div key={activity.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          {getActivityIcon(activity.type)}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{activity.title}</h4>
                          <p className="text-sm text-gray-600">{activity.description}</p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                            <span>{formatDate(activity.date)}</span>
                            <span>{formatTime(activity.time)}</span>
                            <span>{activity.duration} min</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button
                          onClick={() => {
                            setSelectedItem(activity)
                            setShowCreateProposal(true)
                          }}
                          variant="outline"
                          size="sm"
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Proponi Modifica
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Activity className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>Nessuna attività programmata</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'workouts' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Allenamenti</h3>
                <Button onClick={() => setShowCreateProposal(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Proponi Allenamento
                </Button>
              </div>
              
              <div className="space-y-4">
                {workouts.length > 0 ? (
                  workouts.map((workout) => (
                    <div key={workout.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          {getWorkoutIcon(workout.type)}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{workout.title}</h4>
                          <p className="text-sm text-gray-600">{workout.description}</p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                            <span>{formatDate(workout.date)}</span>
                            <span>{workout.duration} min</span>
                            {workout.distance && <span>{workout.distance} km</span>}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button
                          onClick={() => {
                            setSelectedItem(workout)
                            setShowCreateProposal(true)
                          }}
                          variant="outline"
                          size="sm"
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Proponi Modifica
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Target className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>Nessun allenamento programmato</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'races' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Gare e Competizioni</h3>
                <Button onClick={() => setShowCreateProposal(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Proponi Gara
                </Button>
              </div>
              
              <div className="space-y-4">
                {raceResults.length > 0 ? (
                  raceResults.map((race) => (
                    <div key={race.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-orange-100 rounded-lg">
                          <Trophy className="w-4 h-4 text-orange-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{race.eventName}</h4>
                          <p className="text-sm text-gray-600">{race.eventType}</p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                            <span>{formatDate(race.date)}</span>
                            {race.distance && <span>{race.distance} km</span>}
                            {race.position && <span>Posizione: {race.position}</span>}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button
                          onClick={() => {
                            setSelectedItem(race)
                            setShowCreateProposal(true)
                          }}
                          variant="outline"
                          size="sm"
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Proponi Modifica
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Trophy className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>Nessuna gara programmata</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal per creare proposte */}
      {showCreateProposal && (
        <CreateProposalModal
          isOpen={showCreateProposal}
          onClose={() => {
            setShowCreateProposal(false)
            setSelectedItem(null)
          }}
          targetAthleteId={athleteId}
          selectedItem={selectedItem}
        />
      )}
    </div>
  )
}
