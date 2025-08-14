'use client'

import { useState, useEffect } from 'react'
import { Activity, MapPin, Clock, Target, Trophy, ExternalLink, Calendar, Heart, Zap } from 'lucide-react'
import { Workout } from '@/types/activity'

interface StravaWorkoutsListProps {
  userId: string
}

export default function StravaWorkoutsList({ userId }: StravaWorkoutsListProps) {
  const [stravaWorkouts, setStravaWorkouts] = useState<Workout[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    loadStravaWorkouts()
  }, [userId])

  const loadStravaWorkouts = async () => {
    try {
      setIsLoading(true)
      
      const response = await fetch(`/api/workouts?userId=${userId}`)
      if (response.ok) {
        const data = await response.json()
        const workouts = data.workouts || data || []
        
        // Debug: mostra tutti gli allenamenti
        console.log('Tutti gli allenamenti caricati:', workouts)
        
        // Filtra gli allenamenti con tag Strava o con stravaId
        const stravaWorkouts = workouts.filter((w: Workout) => {
          // Se ha stravaId, è un allenamento Strava
          if (w.stravaId) return true
          
          // Se ha tag che contengono "strava", è un allenamento Strava
          if (w.tags) {
            try {
              const tags = typeof w.tags === 'string' ? JSON.parse(w.tags) : w.tags
              if (Array.isArray(tags) && tags.some(tag => tag.toLowerCase().includes('strava'))) {
                return true
              }
            } catch (e) {
              // Ignora errori di parsing JSON
            }
          }
          
          return false
        })
        
        console.log('Allenamenti Strava filtrati:', stravaWorkouts)
        setStravaWorkouts(stravaWorkouts)
      } else {
        console.error('Errore API:', response.status, response.statusText)
      }
    } catch (error) {
      console.error('Errore nel caricamento degli allenamenti Strava:', error)
    } finally {
      setIsLoading(false)
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

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  const getStravaData = (workout: Workout) => {
    if (!workout.stravaData) return null
    
    try {
      return typeof workout.stravaData === 'string' 
        ? JSON.parse(workout.stravaData) 
        : workout.stravaData
    } catch {
      return null
    }
  }

  const openStravaActivity = (stravaId: string) => {
    if (stravaId) {
      window.open(`https://www.strava.com/activities/${stravaId}`, '_blank')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  if (stravaWorkouts.length === 0) {
    return (
      <div className="text-center py-8">
        <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Nessun allenamento Strava
        </h3>
        <p className="text-gray-600">
          Importa i tuoi allenamenti da Strava per visualizzarli qui
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Allenamenti Strava ({stravaWorkouts.length})
        </h3>
        <button
          onClick={loadStravaWorkouts}
          className="text-sm text-primary-600 hover:text-primary-700"
        >
          Aggiorna
        </button>
      </div>

      <div className="grid gap-4">
        {stravaWorkouts.map((workout) => {
          const stravaData = getStravaData(workout)
          
          return (
            <div key={workout.id} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold text-gray-900">{workout.title}</h4>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                      <Activity className="w-3 h-3 mr-1" />
                      Strava
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-2" />
                      {formatDate(workout.date)}
                    </div>
                    {workout.duration && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="w-4 h-4 mr-2" />
                        {formatDuration(workout.duration)}
                      </div>
                    )}
                    {workout.distance && (
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mr-2" />
                        {workout.distance} km
                      </div>
                    )}
                    {workout.type && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Target className="w-4 h-4 mr-2" />
                        {workout.type}
                      </div>
                    )}
                  </div>

                  {/* Dati Strava aggiuntivi */}
                  {stravaData && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                      {stravaData.average_speed && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Zap className="w-4 h-4 mr-2" />
                          {(stravaData.average_speed * 3.6).toFixed(1)} km/h
                        </div>
                      )}
                      {stravaData.max_speed && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Zap className="w-4 h-4 mr-2" />
                          Max: {(stravaData.max_speed * 3.6).toFixed(1)} km/h
                        </div>
                      )}
                      {stravaData.total_elevation_gain && (
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="w-4 h-4 mr-2" />
                          +{stravaData.total_elevation_gain}m
                        </div>
                      )}
                      {stravaData.average_heartrate && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Heart className="w-4 h-4 mr-2" />
                          {stravaData.average_heartrate} bpm
                        </div>
                      )}
                    </div>
                  )}

                  {workout.notes && (
                    <p className="text-sm text-gray-600 italic">"{workout.notes}"</p>
                  )}
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => {
                      setSelectedWorkout(workout)
                      setShowDetails(true)
                    }}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Vedi dettagli"
                  >
                    <Target className="w-4 h-4" />
                  </button>
                  {workout.stravaId && (
                    <button
                      onClick={() => openStravaActivity(workout.stravaId!)}
                      className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                      title="Apri su Strava"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Modal dettagli completi */}
      {showDetails && selectedWorkout && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">Dettagli Allenamento Strava</h2>
              <button 
                onClick={() => setShowDetails(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{selectedWorkout.title}</h3>
              
              {selectedWorkout.stravaData && (
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Dati Completi Strava</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <pre className="text-xs text-gray-700 overflow-auto">
                      {JSON.stringify(JSON.parse(selectedWorkout.stravaData as string), null, 2)}
                    </pre>
                  </div>
                </div>
              )}

              <div className="mt-6 flex space-x-3">
                {selectedWorkout.stravaId && (
                  <button
                    onClick={() => openStravaActivity(selectedWorkout.stravaId!)}
                    className="flex-1 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Apri su Strava
                  </button>
                )}
                <button
                  onClick={() => setShowDetails(false)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Chiudi
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
