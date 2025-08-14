// Test per le gare
import { RaceResult } from '@/types/activity'

describe('Races Functionality', () => {
  it('should create a race with all required fields', () => {
    const mockRace: Omit<RaceResult, 'id' | 'userId' | 'createdAt' | 'updatedAt'> = {
      eventName: 'Maratona di Roma',
      eventType: 'RACE',
      date: '2024-04-15T08:00:00Z',
      time: '03:45:30',
      distance: 42.2,
      position: 125,
      totalParticipants: 15000,
      notes: 'Prima maratona, molto soddisfatto del risultato',
      location: 'Roma, Italia',
      status: 'COMPLETED'
    }

    expect(mockRace.eventName).toBe('Maratona di Roma')
    expect(mockRace.eventType).toBe('RACE')
    expect(mockRace.status).toBe('COMPLETED')
    expect(mockRace.location).toBe('Roma, Italia')
  })

  it('should handle different race types correctly', () => {
    const raceTypes: RaceResult['eventType'][] = ['RACE', 'COMPETITION', 'TIME_TRIAL', 'FUN_RUN']
    
    raceTypes.forEach(type => {
      const mockRace: Partial<RaceResult> = {
        eventName: `Evento ${type}`,
        eventType: type,
        status: 'PLANNED'
      }

      expect(mockRace.eventType).toBe(type)
      expect(mockRace.status).toBe('PLANNED')
    })
  })

  it('should handle different race statuses correctly', () => {
    const statuses: RaceResult['status'][] = ['PLANNED', 'COMPLETED', 'CANCELLED']
    
    statuses.forEach(status => {
      const mockRace: Partial<RaceResult> = {
        eventName: 'Test Race',
        eventType: 'RACE',
        status: status
      }

      expect(mockRace.status).toBe(status)
    })
  })

  it('should calculate race statistics correctly', () => {
    const mockRaces: RaceResult[] = [
      {
        id: '1',
        eventName: 'Race 1',
        eventType: 'RACE',
        date: '2024-01-15T08:00:00Z',
        status: 'COMPLETED',
        userId: 'user1',
        createdAt: '2024-01-15T08:00:00Z',
        updatedAt: '2024-01-15T08:00:00Z'
      },
      {
        id: '2',
        eventName: 'Race 2',
        eventType: 'COMPETITION',
        date: '2024-02-15T08:00:00Z',
        status: 'PLANNED',
        userId: 'user1',
        createdAt: '2024-02-15T08:00:00Z',
        updatedAt: '2024-02-15T08:00:00Z'
      },
      {
        id: '3',
        eventName: 'Race 3',
        eventType: 'RACE',
        date: '2024-03-15T08:00:00Z',
        status: 'CANCELLED',
        userId: 'user1',
        createdAt: '2024-03-15T08:00:00Z',
        updatedAt: '2024-03-15T08:00:00Z'
      }
    ]

    const stats = {
      total: mockRaces.length,
      completed: mockRaces.filter(r => r.status === 'COMPLETED').length,
      planned: mockRaces.filter(r => r.status === 'PLANNED').length,
      cancelled: mockRaces.filter(r => r.status === 'CANCELLED').length,
      byType: mockRaces.reduce((acc, race) => {
        acc[race.eventType] = (acc[race.eventType] || 0) + 1
        return acc
      }, {} as Record<string, number>)
    }

    expect(stats.total).toBe(3)
    expect(stats.completed).toBe(1)
    expect(stats.planned).toBe(1)
    expect(stats.cancelled).toBe(1)
    expect(stats.byType).toEqual({
      'RACE': 2,
      'COMPETITION': 1
    })
  })

  it('should filter races by search term', () => {
    const mockRaces: RaceResult[] = [
      {
        id: '1',
        eventName: 'Maratona di Roma',
        eventType: 'RACE',
        date: '2024-01-15T08:00:00Z',
        status: 'COMPLETED',
        notes: 'Bellissima esperienza',
        location: 'Roma, Italia',
        userId: 'user1',
        createdAt: '2024-01-15T08:00:00Z',
        updatedAt: '2024-01-15T08:00:00Z'
      },
      {
        id: '2',
        eventName: 'Gara di Milano',
        eventType: 'COMPETITION',
        date: '2024-02-15T08:00:00Z',
        status: 'PLANNED',
        notes: 'Prossima sfida',
        location: 'Milano, Italia',
        userId: 'user1',
        createdAt: '2024-02-15T08:00:00Z',
        updatedAt: '2024-02-15T08:00:00Z'
      }
    ]

    const searchTerm = 'Roma'
    const filtered = mockRaces.filter(race => 
      race.eventName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (race.notes && race.notes.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (race.location && race.location.toLowerCase().includes(searchTerm.toLowerCase()))
    )

    expect(filtered.length).toBe(1)
    expect(filtered[0].eventName).toBe('Maratona di Roma')
  })

  it('should filter races by type', () => {
    const mockRaces: RaceResult[] = [
      {
        id: '1',
        eventName: 'Race 1',
        eventType: 'RACE',
        date: '2024-01-15T08:00:00Z',
        status: 'COMPLETED',
        userId: 'user1',
        createdAt: '2024-01-15T08:00:00Z',
        updatedAt: '2024-01-15T08:00:00Z'
      },
      {
        id: '2',
        eventName: 'Competition 1',
        eventType: 'COMPETITION',
        date: '2024-02-15T08:00:00Z',
        status: 'PLANNED',
        userId: 'user1',
        createdAt: '2024-02-15T08:00:00Z',
        updatedAt: '2024-02-15T08:00:00Z'
      }
    ]

    const filterType = 'RACE'
    const filtered = mockRaces.filter(race => race.eventType === filterType)

    expect(filtered.length).toBe(1)
    expect(filtered[0].eventType).toBe('RACE')
  })

  it('should filter races by status', () => {
    const mockRaces: RaceResult[] = [
      {
        id: '1',
        eventName: 'Race 1',
        eventType: 'RACE',
        date: '2024-01-15T08:00:00Z',
        status: 'COMPLETED',
        userId: 'user1',
        createdAt: '2024-01-15T08:00:00Z',
        updatedAt: '2024-01-15T08:00:00Z'
      },
      {
        id: '2',
        eventName: 'Race 2',
        eventType: 'RACE',
        date: '2024-02-15T08:00:00Z',
        status: 'PLANNED',
        userId: 'user1',
        createdAt: '2024-02-15T08:00:00Z',
        updatedAt: '2024-02-15T08:00:00Z'
      }
    ]

    const filterStatus = 'PLANNED'
    const filtered = mockRaces.filter(race => race.status === filterStatus)

    expect(filtered.length).toBe(1)
    expect(filtered[0].status).toBe('PLANNED')
  })
})
