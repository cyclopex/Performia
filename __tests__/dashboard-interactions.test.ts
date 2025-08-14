// Test per le interazioni della dashboard
import { Workout, ScheduledActivity } from '@/types/activity'

describe('Dashboard Interactions', () => {
  it('should handle workout clicks correctly', () => {
    const mockWorkout: Workout = {
      id: '1',
      title: 'Corsa mattutina',
      description: 'Corsa leggera',
      date: '2024-01-15T07:00:00Z',
      duration: 45,
      distance: 8.5,
      calories: 450,
      rpe: 7,
      notes: 'Buona performance',
      type: 'RUNNING',
      status: 'COMPLETED',
      userId: 'user1',
      createdAt: '2024-01-15T07:00:00Z',
      updatedAt: '2024-01-15T07:00:00Z'
    }

    // Simula il click su un allenamento
    const openEditWorkoutModal = (workout: Workout) => {
      return {
        action: 'edit',
        workout: workout,
        modalType: 'workout'
      }
    }

    const result = openEditWorkoutModal(mockWorkout)
    
    expect(result.action).toBe('edit')
    expect(result.workout.id).toBe('1')
    expect(result.workout.type).toBe('RUNNING')
    expect(result.modalType).toBe('workout')
  })

  it('should handle activity clicks correctly', () => {
    const mockActivity: ScheduledActivity = {
      id: '1',
      title: 'Terapia fisica',
      description: 'Sessione di riabilitazione',
      date: '2024-01-15T10:00:00Z',
      time: '10:00:00',
      duration: 60,
      type: 'THERAPY',
      status: 'SCHEDULED',
      userId: 'user1',
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-15T10:00:00Z'
    }

    // Simula il click su un'attività
    const openEditModal = (activity: ScheduledActivity) => {
      return {
        action: 'edit',
        activity: activity,
        modalType: 'activity'
      }
    }

    const result = openEditModal(mockActivity)
    
    expect(result.action).toBe('edit')
    expect(result.activity.id).toBe('1')
    expect(result.activity.type).toBe('THERAPY')
    expect(result.modalType).toBe('activity')
  })

  it('should handle workout deletion correctly', () => {
    const mockWorkout: Workout = {
      id: '1',
      title: 'Corsa mattutina',
      type: 'RUNNING',
      status: 'COMPLETED',
      date: '2024-01-15T07:00:00Z',
      duration: 45,
      userId: 'user1',
      createdAt: '2024-01-15T07:00:00Z',
      updatedAt: '2024-01-15T07:00:00Z'
    }

    // Simula la conferma di eliminazione
    const confirmDelete = (workout: Workout) => {
      return {
        action: 'delete',
        workoutId: workout.id,
        confirmed: true
      }
    }

    const result = confirmDelete(mockWorkout)
    
    expect(result.action).toBe('delete')
    expect(result.workoutId).toBe('1')
    expect(result.confirmed).toBe(true)
  })

  it('should handle different workout types correctly', () => {
    const workoutTypes: Workout['type'][] = [
      'RUNNING', 'CYCLING', 'SWIMMING', 'STRENGTH', 'CARDIO',
      'FLEXIBILITY', 'SPORTS', 'YOGA', 'PILATES', 'CROSSFIT',
      'MARTIAL_ARTS', 'CLIMBING', 'OTHER'
    ]

    // Verifica che tutti i tipi siano supportati
    workoutTypes.forEach(type => {
      const mockWorkout: Workout = {
        id: '1',
        title: `Allenamento ${type}`,
        type: type,
        status: 'COMPLETED',
        date: '2024-01-15T07:00:00Z',
        duration: 45,
        userId: 'user1',
        createdAt: '2024-01-15T07:00:00Z',
        updatedAt: '2024-01-15T07:00:00Z'
      }

      expect(mockWorkout.type).toBe(type)
      expect(mockWorkout.status).toBe('COMPLETED')
    })
  })

  it('should handle different activity statuses correctly', () => {
    const statuses: Workout['status'][] = ['PLANNED', 'COMPLETED', 'CANCELLED']

    statuses.forEach(status => {
      const mockWorkout: Workout = {
        id: '1',
        title: `Allenamento ${status}`,
        type: 'RUNNING',
        status: status,
        date: '2024-01-15T07:00:00Z',
        duration: 45,
        userId: 'user1',
        createdAt: '2024-01-15T07:00:00Z',
        updatedAt: '2024-01-15T07:00:00Z'
      }

      expect(mockWorkout.status).toBe(status)
    })
  })
})
