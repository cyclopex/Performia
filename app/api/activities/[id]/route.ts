import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

// GET - Recupera una singola attività
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non autorizzato' },
        { status: 401 }
      )
    }

    const activity = await prisma.scheduledActivity.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        assignedByUser: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        assignedToUser: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    if (!activity) {
      return NextResponse.json(
        { error: 'Attività non trovata' },
        { status: 404 }
      )
    }

    // Verifica che l'utente possa accedere a questa attività
    if (activity.userId !== session.user.id && activity.assignedTo !== session.user.id) {
      return NextResponse.json(
        { error: 'Non autorizzato' },
        { status: 403 }
      )
    }

    return NextResponse.json(activity)
  } catch (error) {
    console.error('Errore nel recupero dell\'attività:', error)
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    )
  }
}

// PUT - Aggiorna un'attività
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non autorizzato' },
        { status: 401 }
      )
    }

    const body = await request.json()
    console.log('📥 Dati ricevuti per modifica:', body)
    
    const {
      title,
      description,
      date,
      time,
      duration,
      type,
      assignedTo,
      status,
      tags
    } = body

    // Verifica che l'attività esista e che l'utente possa modificarla
    const existingActivity = await prisma.scheduledActivity.findUnique({
      where: { id: params.id }
    })

    if (!existingActivity) {
      return NextResponse.json(
        { error: 'Attività non trovata' },
        { status: 404 }
      )
    }

    if (existingActivity.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Non autorizzato' },
        { status: 403 }
      )
    }

    // Verifica che l'utente assegnato esista (se specificato)
    let assignedToUserId = null
    if (assignedTo && assignedTo !== '') {
      const assignedUser = await prisma.user.findUnique({
        where: { id: assignedTo }
      })
      if (!assignedUser) {
        return NextResponse.json(
          { error: 'Utente assegnato non trovato' },
          { status: 400 }
        )
      }
      assignedToUserId = assignedTo
    }

    console.log('💾 Aggiornamento attività nel database...')
    
    const updatedActivity = await prisma.scheduledActivity.update({
      where: { id: params.id },
      data: {
        title: title || existingActivity.title,
        description: description !== undefined ? description : existingActivity.description,
        date: date ? new Date(date) : existingActivity.date,
        time: time || existingActivity.time,
        duration: duration ? parseInt(duration) : existingActivity.duration,
        type: type || existingActivity.type,
        assignedTo: assignedToUserId !== null ? assignedToUserId : existingActivity.assignedTo,
        status: status || existingActivity.status,
        tags: tags !== undefined ? JSON.stringify(tags) : existingActivity.tags
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        assignedByUser: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        assignedToUser: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    // Trasforma i dati per includere i nomi invece degli ID
    const transformedActivity = {
      ...updatedActivity,
      assignedBy: updatedActivity.assignedByUser ? {
        id: updatedActivity.assignedByUser.id,
        name: updatedActivity.assignedByUser.name,
        email: updatedActivity.assignedByUser.email
      } : null,
      assignedTo: updatedActivity.assignedToUser ? {
        id: updatedActivity.assignedToUser.id,
        name: updatedActivity.assignedToUser.name,
        email: updatedActivity.assignedToUser.email
      } : null
    }

    console.log('✅ Attività aggiornata:', transformedActivity)
    return NextResponse.json(transformedActivity)
  } catch (error) {
    console.error('❌ Errore nell\'aggiornamento dell\'attività:', error)
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    )
  }
}

// DELETE - Elimina un'attività
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non autorizzato' },
        { status: 401 }
      )
    }

    // Verifica che l'attività esista e che l'utente possa eliminarla
    const existingActivity = await prisma.scheduledActivity.findUnique({
      where: { id: params.id }
    })

    if (!existingActivity) {
      return NextResponse.json(
        { error: 'Attività non trovata' },
        { status: 404 }
      )
    }

    if (existingActivity.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Non autorizzato' },
        { status: 403 }
      )
    }

    await prisma.scheduledActivity.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Attività eliminata con successo' })
  } catch (error) {
    console.error('Errore nell\'eliminazione dell\'attività:', error)
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    )
  }
}
