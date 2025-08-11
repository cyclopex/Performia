import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// PUT - Risponde a una proposta (approva/rifiuta)
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: 'Non autenticato' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      proposalId,
      proposalType, // 'activity' o 'workout'
      response, // 'approve' o 'reject'
      notes
    } = body

    if (!proposalId || !proposalType || !response) {
      return NextResponse.json(
        { error: 'Parametri mancanti' },
        { status: 400 }
      )
    }

    if (!['approve', 'reject'].includes(response)) {
      return NextResponse.json(
        { error: 'Risposta non valida' },
        { status: 400 }
      )
    }

    const newStatus = response === 'approve' ? 'APPROVED' : 'REJECTED'

    if (proposalType === 'activity') {
      // Gestisce proposta di attività
      const proposal = await prisma.activityProposal.findUnique({
        where: { id: proposalId },
        include: {
          proposedFor: true,
          proposedBy: true
        }
      })

      if (!proposal) {
        return NextResponse.json(
          { error: 'Proposta non trovata' },
          { status: 404 }
        )
      }

      // Verifica che l'utente sia il destinatario della proposta
      if (proposal.proposedForId !== session.user.id) {
        return NextResponse.json(
          { error: 'Non autorizzato a rispondere a questa proposta' },
          { status: 403 }
        )
      }

      // Aggiorna lo status della proposta
      await prisma.activityProposal.update({
        where: { id: proposalId },
        data: {
          status: newStatus,
          respondedAt: new Date(),
          responseNotes: notes
        }
      })

      // Se approvata, crea l'attività effettiva
      if (response === 'approve') {
        if (proposal.action === 'CREATE') {
          // Crea nuova attività
          await prisma.scheduledActivity.create({
            data: {
              userId: proposal.proposedForId,
              title: proposal.title,
              description: proposal.description,
              date: proposal.startTime || new Date(),
              time: proposal.startTime ? proposal.startTime.toTimeString().slice(0, 5) : '09:00',
              duration: proposal.startTime && proposal.endTime 
                ? Math.round((proposal.endTime.getTime() - proposal.startTime.getTime()) / (1000 * 60))
                : 60,
              type: proposal.activityType,
              location: proposal.location,
              notes: proposal.notes,
              assignedBy: proposal.proposedById
            }
          })
        } else if (proposal.action === 'UPDATE' && proposal.originalActivityId) {
          // Aggiorna attività esistente
          await prisma.scheduledActivity.update({
            where: { id: proposal.originalActivityId },
            data: {
              title: proposal.title,
              description: proposal.description,
              date: proposal.startTime || new Date(),
              time: proposal.startTime ? proposal.startTime.toTimeString().slice(0, 5) : '09:00',
              duration: proposal.startTime && proposal.endTime 
                ? Math.round((proposal.endTime.getTime() - proposal.startTime.getTime()) / (1000 * 60))
                : 60,
              type: proposal.activityType,
              location: proposal.location,
              notes: proposal.notes
            }
          })
        } else if (proposal.action === 'DELETE' && proposal.originalActivityId) {
          // Elimina attività esistente
          await prisma.scheduledActivity.delete({
            where: { id: proposal.originalActivityId }
          })
        }
      }

    } else if (proposalType === 'workout') {
      // Gestisce proposta di allenamento
      const proposal = await prisma.workoutProposal.findUnique({
        where: { id: proposalId },
        include: {
          proposedFor: true,
          proposedBy: true
        }
      })

      if (!proposal) {
        return NextResponse.json(
          { error: 'Proposta non trovata' },
          { status: 404 }
        )
      }

      // Verifica che l'utente sia il destinatario della proposta
      if (proposal.proposedForId !== session.user.id) {
        return NextResponse.json(
          { error: 'Non autorizzato a rispondere a questa proposta' },
          { status: 403 }
        )
      }

      // Aggiorna lo status della proposta
      await prisma.workoutProposal.update({
        where: { id: proposalId },
        data: {
          status: newStatus,
          respondedAt: new Date(),
          responseNotes: notes
        }
      })

      // Se approvata, crea l'allenamento effettivo
      if (response === 'approve') {
        if (proposal.action === 'CREATE') {
          // Crea nuovo allenamento
          await prisma.workout.create({
            data: {
              userId: proposal.proposedForId,
              title: proposal.title,
              description: proposal.description,
              type: proposal.type,
              duration: proposal.duration || 60,
              intensity: proposal.intensity,
              exercises: proposal.exercises,
              notes: proposal.notes,
              assignedBy: proposal.proposedById
            }
          })
        } else if (proposal.action === 'UPDATE' && proposal.originalWorkoutId) {
          // Aggiorna allenamento esistente
          await prisma.workout.update({
            where: { id: proposal.originalWorkoutId },
            data: {
              title: proposal.title,
              description: proposal.description,
              type: proposal.type,
              duration: proposal.duration || 60,
              intensity: proposal.intensity,
              exercises: proposal.exercises,
              notes: proposal.notes
            }
          })
        } else if (proposal.action === 'DELETE' && proposal.originalWorkoutId) {
          // Elimina allenamento esistente
          await prisma.workout.delete({
            where: { id: proposal.originalWorkoutId }
          })
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Proposta ${response === 'approve' ? 'approvata' : 'rifiutata'} con successo` 
    })

  } catch (error) {
    console.error('Errore nella risposta alla proposta:', error)
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    )
  }
}
