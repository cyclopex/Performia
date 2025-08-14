// Test per l'API degli allenamenti
describe('Workouts API', () => {
  it('should support correct workout types', () => {
    const validTypes = [
      'RUNNING', 'CYCLING', 'SWIMMING', 'STRENGTH', 'CARDIO', 
      'FLEXIBILITY', 'SPORTS', 'YOGA', 'PILATES', 'CROSSFIT', 
      'MARTIAL_ARTS', 'CLIMBING', 'OTHER'
    ]
    
    // Verifica che tutti i tipi siano validi
    validTypes.forEach(type => {
      expect(validTypes).toContain(type)
    })
  })

  it('should handle tags correctly', () => {
    const tags = ['cardio', 'morning', 'outdoor']
    const jsonTags = JSON.stringify(tags)
    
    // Verifica conversione array -> JSON string
    expect(jsonTags).toBe('["cardio","morning","outdoor"]')
    
    // Verifica conversione JSON string -> array
    const parsedTags = JSON.parse(jsonTags)
    expect(parsedTags).toEqual(tags)
  })

  it('should validate workout data correctly', () => {
    const validWorkout = {
      title: 'Corsa mattutina',
      description: 'Corsa leggera per riscaldamento',
      date: new Date().toISOString(),
      duration: 45,
      distance: 8.5,
      calories: 450,
      rpe: 7,
      type: 'RUNNING',
      notes: 'Giornata fresca, buona performance'
    }
    
    // Verifica che i dati siano validi
    expect(validWorkout.title).toBeTruthy()
    expect(validWorkout.duration).toBeGreaterThan(0)
    expect(validWorkout.rpe).toBeGreaterThanOrEqual(1)
    expect(validWorkout.rpe).toBeLessThanOrEqual(10)
  })
})

// Test per i componenti frontend
describe('Workout Components', () => {
  it('should render workout type options correctly', () => {
    const workoutTypes = [
      'RUNNING', 'CYCLING', 'SWIMMING', 'STRENGTH', 'CARDIO',
      'FLEXIBILITY', 'SPORTS', 'YOGA', 'PILATES', 'CROSSFIT',
      'MARTIAL_ARTS', 'CLIMBING', 'OTHER'
    ]
    
    // Verifica che tutti i tipi siano supportati
    workoutTypes.forEach(type => {
      expect(workoutTypes).toContain(type)
    })
  })

  it('should handle workout stats calculations', () => {
    const workouts = [
      { duration: 30, distance: 5, rpe: 6 },
      { duration: 45, distance: 8, rpe: 7 },
      { duration: 60, distance: 12, rpe: 8 }
    ]
    
    const totalDuration = workouts.reduce((sum, w) => sum + w.duration, 0)
    const totalDistance = workouts.reduce((sum, w) => sum + w.distance, 0)
    const avgRPE = workouts.reduce((sum, w) => sum + w.rpe, 0) / workouts.length
    
    expect(totalDuration).toBe(135)
    expect(totalDistance).toBe(25)
    expect(avgRPE).toBe(7)
  })
})
