import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/race-results - Get all race results for the authenticated user
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
    }

    const raceResults = await prisma.raceResult.findMany({
      where: {
        userId: session.user.id
      },
      orderBy: {
        date: 'desc'
      }
    })

    // Mappa i campi dello schema Prisma ai campi dell'interfaccia
    const mappedResults = raceResults.map(race => ({
      id: race.id,
      eventName: race.raceName,
      eventType: race.raceType || 'RACE',
      date: race.date.toISOString(),
      time: race.time,
      distance: race.distance,
      position: race.position,
      totalParticipants: race.totalParticipants,
      notes: race.notes,
      location: race.location,
      status: race.time ? 'COMPLETED' : 'PLANNED', // Se c'è un tempo è completata
      userId: race.userId,
      createdAt: race.createdAt.toISOString(),
      updatedAt: race.updatedAt.toISOString()
    }))

    return NextResponse.json(mappedResults)
  } catch (error) {
    console.error('Errore nel recupero dei risultati gara:', error)
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    )
  }
}

// POST /api/race-results - Create a new race result
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
    }

    const body = await request.json()
    const { eventName, eventType, date, distance, time, position, totalParticipants, notes, location, status } = body

    if (!eventName || !date) {
      return NextResponse.json(
        { error: 'Nome evento e data sono obbligatori' },
        { status: 400 }
      )
    }

    const raceResult = await prisma.raceResult.create({
      data: {
        raceName: eventName,
        raceType: eventType || 'RACE',
        date: new Date(date),
        distance: distance ? parseFloat(distance) : 0,
        time: time || null,
        position: position ? parseInt(position) : null,
        totalParticipants: totalParticipants ? parseInt(totalParticipants) : null,
        location: location || null,
        notes: notes || null,
        userId: session.user.id
      }
    })

    // Restituisce il risultato mappato
    const mappedResult = {
      id: raceResult.id,
      eventName: raceResult.raceName,
      eventType: raceResult.raceType || 'RACE',
      date: raceResult.date.toISOString(),
      time: raceResult.time,
      distance: raceResult.distance,
      position: raceResult.position,
      totalParticipants: raceResult.totalParticipants,
      notes: raceResult.notes,
      location: raceResult.location,
      status: raceResult.time ? 'COMPLETED' : 'PLANNED',
      userId: raceResult.userId,
      createdAt: raceResult.createdAt.toISOString(),
      updatedAt: raceResult.updatedAt.toISOString()
    }

    return NextResponse.json(mappedResult, { status: 201 })
  } catch (error) {
    console.error('Errore nella creazione del risultato gara:', error)
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    )
  }
}
