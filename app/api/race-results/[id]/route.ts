import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// PUT /api/race-results/[id] - Update a race result
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
    }

    const body = await request.json()
    const { eventName, eventType, date, distance, time, position, totalParticipants, notes, location, status } = body

    // Verifica che la gara appartenga all'utente
    const existingRace = await prisma.raceResult.findFirst({
      where: {
        id: params.id,
        userId: session.user.id
      }
    })

    if (!existingRace) {
      return NextResponse.json({ error: 'Gara non trovata' }, { status: 404 })
    }

    const updatedRace = await prisma.raceResult.update({
      where: { id: params.id },
      data: {
        raceName: eventName || existingRace.raceName,
        raceType: eventType || existingRace.raceType,
        date: date ? new Date(date) : existingRace.date,
        distance: distance !== undefined ? parseFloat(distance) : existingRace.distance,
        time: time !== undefined ? time : existingRace.time,
        position: position !== undefined ? parseInt(position) : existingRace.position,
        totalParticipants: totalParticipants !== undefined ? parseInt(totalParticipants) : existingRace.totalParticipants,
        location: location !== undefined ? location : existingRace.location,
        notes: notes !== undefined ? notes : existingRace.notes
      }
    })

    // Restituisce il risultato mappato
    const mappedResult = {
      id: updatedRace.id,
      eventName: updatedRace.raceName,
      eventType: updatedRace.raceType || 'RACE',
      date: updatedRace.date.toISOString(),
      time: updatedRace.time,
      distance: updatedRace.distance,
      position: updatedRace.position,
      totalParticipants: updatedRace.totalParticipants,
      notes: updatedRace.notes,
      location: updatedRace.location,
      status: updatedRace.time ? 'COMPLETED' : 'PLANNED',
      userId: updatedRace.userId,
      createdAt: updatedRace.createdAt.toISOString(),
      updatedAt: updatedRace.updatedAt.toISOString()
    }

    return NextResponse.json(mappedResult)
  } catch (error) {
    console.error('Errore nell\'aggiornamento del risultato gara:', error)
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    )
  }
}

// DELETE /api/race-results/[id] - Delete a race result
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
    }

    // Verifica che la gara appartenga all'utente
    const existingRace = await prisma.raceResult.findFirst({
      where: {
        id: params.id,
        userId: session.user.id
      }
    })

    if (!existingRace) {
      return NextResponse.json({ error: 'Gara non trovata' }, { status: 404 })
    }

    await prisma.raceResult.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Gara eliminata con successo' })
  } catch (error) {
    console.error('Errore nell\'eliminazione del risultato gara:', error)
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    )
  }
}
