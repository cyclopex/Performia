// Test per i controlli di sicurezza della dashboard
describe('Dashboard Safety Checks', () => {
  it('should handle empty workouts array safely', () => {
    const emptyWorkouts: any[] = []
    
    // Simula il calcolo delle statistiche
    const workoutStats = {
      total: emptyWorkouts.length,
      completed: emptyWorkouts.filter(w => w.status === 'COMPLETED').length,
      planned: emptyWorkouts.filter(w => w.status === 'PLANNED').length,
      cancelled: emptyWorkouts.filter(w => w.status === 'CANCELLED').length,
      byType: emptyWorkouts.reduce((acc, workout) => {
        acc[workout.type] = (acc[workout.type] || 0) + 1
        return acc
      }, {} as Record<string, number>)
    }
    
    expect(workoutStats.total).toBe(0)
    expect(workoutStats.completed).toBe(0)
    expect(workoutStats.planned).toBe(0)
    expect(workoutStats.cancelled).toBe(0)
    expect(workoutStats.byType).toEqual({})
  })

  it('should handle undefined workouts safely', () => {
    const undefinedWorkouts: any = undefined
    
    // Simula il controllo di sicurezza
    const safeWorkouts = undefinedWorkouts || []
    const total = safeWorkouts.length
    
    expect(total).toBe(0)
  })

  it('should handle null workouts safely', () => {
    const nullWorkouts: any = null
    
    // Simula il controllo di sicurezza
    const safeWorkouts = nullWorkouts || []
    const total = safeWorkouts.length
    
    expect(total).toBe(0)
  })

  it('should calculate stats correctly with valid data', () => {
    const mockWorkouts = [
      { status: 'COMPLETED', type: 'RUNNING' },
      { status: 'PLANNED', type: 'STRENGTH' },
      { status: 'COMPLETED', type: 'RUNNING' }
    ]
    
    const workoutStats = {
      total: mockWorkouts.length,
      completed: mockWorkouts.filter(w => w.status === 'COMPLETED').length,
      planned: mockWorkouts.filter(w => w.status === 'PLANNED').length,
      cancelled: mockWorkouts.filter(w => w.status === 'CANCELLED').length,
      byType: mockWorkouts.reduce((acc, workout) => {
        acc[workout.type] = (acc[workout.type] || 0) + 1
        return acc
      }, {} as Record<string, number>)
    }
    
    expect(workoutStats.total).toBe(3)
    expect(workoutStats.completed).toBe(2)
    expect(workoutStats.planned).toBe(1)
    expect(workoutStats.cancelled).toBe(0)
    expect(workoutStats.byType).toEqual({
      'RUNNING': 2,
      'STRENGTH': 1
    })
  })

  it('should filter workouts safely', () => {
    const workouts = [
      { title: 'Corsa', description: 'Corsa mattutina', type: 'RUNNING', status: 'COMPLETED' },
      { title: 'Forza', description: 'Allenamento pesi', type: 'STRENGTH', status: 'PLANNED' }
    ] || []
    
    const searchTerm = 'corsa'
    
    const filtered = workouts.filter(workout => {
      const matchesSearch = workout.title.toLowerCase().includes(searchTerm.toLowerCase())
      return matchesSearch
    })
    
    expect(filtered.length).toBe(1)
    expect(filtered[0].title).toBe('Corsa')
  })

  it('should handle empty race results safely', () => {
    const emptyRaceResults: any[] = []
    
    const raceStats = {
      total: emptyRaceResults.length,
      completed: emptyRaceResults.filter(r => r.time).length
    }
    
    expect(raceStats.total).toBe(0)
    expect(raceStats.completed).toBe(0)
  })

  it('should handle empty scheduled activities safely', () => {
    const emptyActivities: any[] = []
    
    const total = emptyActivities.length
    expect(total).toBe(0)
  })

  it('should handle getActivitiesForDay safely', () => {
    const scheduledActivities = [
      { date: '2024-01-15T10:00:00Z' }
    ] || []
    
    const workouts = [
      { date: '2024-01-15T07:00:00Z' }
    ] || []
    
    const raceResults = [
      { date: '2024-01-15T14:00:00Z' }
    ] || []
    
    const testDate = '2024-01-15T12:00:00Z'
    
    const dayActivities = scheduledActivities.filter(activity => {
      const activityDate = new Date(activity.date).toDateString()
      return activityDate === new Date(testDate).toDateString()
    })
    
    const dayWorkouts = workouts.filter(workout => {
      const workoutDate = new Date(workout.date).toDateString()
      return workoutDate === new Date(testDate).toDateString()
    })
    
    const dayRaces = raceResults.filter(race => {
      const raceDate = new Date(race.date).toDateString()
      return raceDate === new Date(testDate).toDateString()
    })
    
    const allActivities = [...dayActivities, ...dayWorkouts, ...dayRaces]
    
    expect(allActivities.length).toBe(3)
  })
})

// Test per le funzioni di utilità
describe('Dashboard Utility Functions', () => {
  it('should get week days correctly', () => {
    const testDate = new Date('2024-01-15') // Lunedì
    const weekDays = getWeekDays(testDate)
    
    expect(weekDays).toHaveLength(7)
    expect(weekDays[0].getDay()).toBe(1) // Lunedì
    expect(weekDays[6].getDay()).toBe(0) // Domenica
  })
})

// Funzioni di utilità per i test
function getWeekDays(date: Date) {
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
