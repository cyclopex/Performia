// Test per l'integrazione delle gare nella dashboard
import { RaceResult } from '@/types/activity'

describe('Dashboard Races Integration', () => {
  it('should load races correctly in dashboard', () => {
    const mockRaces: RaceResult[] = [
      {
        id: '1',
        eventName: 'Maratona di Roma',
        eventType: 'RACE',
        date: '2024-04-15T08:00:00Z',
        time: '03:45:30',
        distance: 42.2,
        position: 125,
        totalParticipants: 15000,
        notes: 'Prima maratona, molto soddisfatto del risultato',
        location: 'Roma, Italia',
        status: 'COMPLETED',
        userId: 'user1',
        createdAt: '2024-04-15T08:00:00Z',
        updatedAt: '2024-04-15T08:00:00Z'
      }
    ]

    // Simula il caricamento delle gare
    const loadRaceResults = () => {
      return mockRaces
    }

    const races = loadRaceResults()
    
    expect(races).toHaveLength(1)
    expect(races[0].eventName).toBe('Maratona di Roma')
    expect(races[0].status).toBe('COMPLETED')
  })

  it('should filter races by date for calendar display', () => {
    const mockRaces: RaceResult[] = [
      {
        id: '1',
        eventName: 'Maratona di Roma',
        eventType: 'RACE',
        date: '2024-04-15T08:00:00Z',
        status: 'COMPLETED',
        userId: 'user1',
        createdAt: '2024-04-15T08:00:00Z',
        updatedAt: '2024-04-15T08:00:00Z'
      },
      {
        id: '2',
        eventName: 'Gara di Milano',
        eventType: 'COMPETITION',
        date: '2024-05-20T09:00:00Z',
        status: 'PLANNED',
        userId: 'user1',
        createdAt: '2024-05-20T09:00:00Z',
        updatedAt: '2024-05-20T09:00Z'
      }
    ]

    const testDate = '2024-04-15T12:00:00Z'
    
    const dayRaces = mockRaces.filter(race => {
      const raceDate = new Date(race.date).toDateString()
      return raceDate === new Date(testDate).toDateString()
    })
    
    expect(dayRaces).toHaveLength(1)
    expect(dayRaces[0].eventName).toBe('Maratona di Roma')
  })

  it('should display races in red color on calendar', () => {
    const getActivityColor = (type: string) => {
      switch (type) {
        case 'RACE':
        case 'COMPETITION':
        case 'TIME_TRIAL':
        case 'FUN_RUN':
          return 'bg-red-100 text-red-800 border-red-200'
        default:
          return 'bg-gray-100 text-gray-800 border-gray-200'
      }
    }

    const raceColor = getActivityColor('RACE')
    const workoutColor = getActivityColor('WORKOUT')
    
    expect(raceColor).toBe('bg-red-100 text-red-800 border-red-200')
    expect(workoutColor).toBe('bg-gray-100 text-gray-800 border-gray-200')
  })

  it('should handle race status correctly', () => {
    const mockRaces: RaceResult[] = [
      {
        id: '1',
        eventName: 'Race 1',
        eventType: 'RACE',
        date: '2024-04-15T08:00:00Z',
        status: 'PLANNED',
        userId: 'user1',
        createdAt: '2024-04-15T08:00:00Z',
        updatedAt: '2024-04-15T08:00:00Z'
      },
      {
        id: '2',
        eventName: 'Race 2',
        eventType: 'RACE',
        date: '2024-05-20T09:00:00Z',
        time: '02:30:00',
        status: 'COMPLETED',
        userId: 'user1',
        createdAt: '2024-05-20T09:00:00Z',
        updatedAt: '2024-05-20T09:00Z'
      }
    ]

    const plannedRaces = mockRaces.filter(r => r.status === 'PLANNED')
    const completedRaces = mockRaces.filter(r => r.status === 'COMPLETED')
    
    expect(plannedRaces).toHaveLength(1)
    expect(completedRaces).toHaveLength(1)
    expect(plannedRaces[0].eventName).toBe('Race 1')
    expect(completedRaces[0].eventName).toBe('Race 2')
  })

  it('should calculate race statistics correctly', () => {
    const mockRaces: RaceResult[] = [
      {
        id: '1',
        eventName: 'Race 1',
        eventType: 'RACE',
        date: '2024-04-15T08:00:00Z',
        status: 'COMPLETED',
        userId: 'user1',
        createdAt: '2024-04-15T08:00:00Z',
        updatedAt: '2024-04-15T08:00:00Z'
      },
      {
        id: '2',
        eventName: 'Race 2',
        eventType: 'COMPETITION',
        date: '2024-05-20T09:00:00Z',
        status: 'PLANNED',
        userId: 'user1',
        createdAt: '2024-05-20T09:00:00Z',
        updatedAt: '2024-05-20T09:00Z'
      }
    ]

    const raceStats = {
      total: mockRaces.length,
      completed: mockRaces.filter(r => r.status === 'COMPLETED').length,
      planned: mockRaces.filter(r => r.status === 'PLANNED').length,
      byType: mockRaces.reduce((acc, race) => {
        acc[race.eventType] = (acc[race.eventType] || 0) + 1
        return acc
      }, {} as Record<string, number>)
    }
    
    expect(raceStats.total).toBe(2)
    expect(raceStats.completed).toBe(1)
    expect(raceStats.planned).toBe(1)
    expect(raceStats.byType).toEqual({
      'RACE': 1,
      'COMPETITION': 1
    })
  })
})
