import { useState, useCallback, useMemo } from 'react'
import { useSession } from 'next-auth/react'
import { Workout } from '@/types/activity'

export function useWorkouts() {
  const { data: session } = useSession()
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('ALL')

  // Carica allenamenti dal database
  const loadWorkouts = useCallback(async () => {
    if (!session?.user?.id) return
    
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/workouts')
      if (response.ok) {
        const data = await response.json()
        // L'API restituisce { workouts: [...], pagination: {...} }
        setWorkouts(data.workouts || data || [])
      } else {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Errore ${response.status}: ${response.statusText}`)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore sconosciuto')
      console.error('Errore nel caricamento allenamenti:', err)
      // In caso di errore, imposta un array vuoto per evitare crash
      setWorkouts([])
    } finally {
      setIsLoading(false)
    }
  }, [session?.user?.id])

  // Crea nuovo allenamento
  const createWorkout = useCallback(async (workoutData: Omit<Workout, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!session?.user?.id) throw new Error('Utente non autenticato')
    
    try {
      const response = await fetch('/api/workouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(workoutData)
      })

      if (response.ok) {
        const newWorkout = await response.json()
        setWorkouts(prev => [newWorkout, ...prev])
        return newWorkout
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Errore nella creazione dell\'allenamento')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore sconosciuto')
      throw err
    }
  }, [session?.user?.id])

  // Aggiorna allenamento esistente
  const updateWorkout = useCallback(async (id: string, workoutData: Partial<Workout>) => {
    try {
      const response = await fetch(`/api/workouts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(workoutData)
      })

      if (response.ok) {
        const updatedWorkout = await response.json()
        setWorkouts(prev => prev.map(w => w.id === id ? updatedWorkout : w))
        return updatedWorkout
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Errore nell\'aggiornamento dell\'allenamento')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore sconosciuto')
      throw err
    }
  }, [])

  // Elimina allenamento
  const deleteWorkout = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/workouts/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setWorkouts(prev => prev.filter(w => w.id !== id))
        return true
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Errore nell\'eliminazione dell\'allenamento')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore sconosciuto')
      throw err
    }
  }, [])

  // Filtra allenamenti con ricerca e filtri
  const filteredWorkouts = useMemo(() => {
    if (!workouts || workouts.length === 0) return []
    
    return workouts.filter(workout => {
      // Ricerca testuale
      const matchesSearch = !searchTerm || 
        workout.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (workout.description && workout.description.toLowerCase().includes(searchTerm.toLowerCase()))

      // Filtro tipo
      const matchesType = filterType === 'ALL' || workout.type === filterType

      return matchesSearch && matchesType
    })
  }, [workouts, searchTerm, filterType])

  // Calcola statistiche con valori di default sicuri
  const workoutStats = useMemo(() => {
    if (!workouts || workouts.length === 0) {
      return {
        total: 0,
        totalDuration: 0,
        totalDistance: 0,
        totalCalories: 0,
        avgRPE: 0
      }
    }
    
    const total = workouts.length
    const totalDuration = workouts.reduce((sum, w) => sum + (w.duration || 0), 0)
    const totalDistance = workouts.reduce((sum, w) => sum + (w.distance || 0), 0)
    const totalCalories = workouts.reduce((sum, w) => sum + (w.calories || 0), 0)
    const avgRPE = workouts.length > 0 
      ? workouts.reduce((sum, w) => sum + (w.rpe || 0), 0) / workouts.length 
      : 0
    
    return {
      total,
      totalDuration,
      totalDistance,
      totalCalories,
      avgRPE: Math.round(avgRPE * 10) / 10
    }
  }, [workouts])

  // Reset filtri
  const resetFilters = useCallback(() => {
    setSearchTerm('')
    setFilterType('ALL')
  }, [])

  return {
    // Stato
    workouts,
    filteredWorkouts,
    isLoading,
    error,
    searchTerm,
    filterType,
    workoutStats,
    
    // Azioni
    loadWorkouts,
    createWorkout,
    updateWorkout,
    deleteWorkout,
    setSearchTerm,
    setFilterType,
    resetFilters,
    
    // Utility
    hasActiveFilters: searchTerm || filterType !== 'ALL'
  }
}
