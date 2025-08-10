import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

// GET - Recupera le attività per un utente
export async function GET(request: NextRequest) {
  try {
    console.log('🔐 Controllo autenticazione GET...')
    const session = await getServerSession(authOptions)
    
    console.log('👤 Sessione GET:', session?.user)
    
    if (!session?.user?.id) {
      console.log('❌ Utente non autorizzato GET')
      return NextResponse.json(
        { error: 'Non autorizzato' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    let whereClause: any = {
      OR: [
        { userId: session.user.id },
        { assignedTo: session.user.id }
      ]
    }

    if (startDate && endDate) {
      whereClause.date = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    }

    const activities = await prisma.scheduledActivity.findMany({
      where: whereClause,
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
      },
      orderBy: {
        date: 'asc'
      }
    })

    // Trasforma i dati per includere i nomi invece degli ID
    const transformedActivities = activities.map(activity => ({
      ...activity,
      assignedBy: activity.assignedByUser ? {
        id: activity.assignedByUser.id,
        name: activity.assignedByUser.name,
        email: activity.assignedByUser.email
      } : null,
      assignedTo: activity.assignedToUser ? {
        id: activity.assignedToUser.id,
        name: activity.assignedToUser.name,
        email: activity.assignedToUser.email
      } : null
    }))

    return NextResponse.json(transformedActivities)
  } catch (error) {
    console.error('Errore nel recupero delle attività:', error)
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    )
  }
}

// POST - Crea una nuova attività
export async function POST(request: NextRequest) {
  try {
    console.log('🔐 Controllo autenticazione...')
    const session = await getServerSession(authOptions)
    
    console.log('👤 Sessione:', session?.user)
    
    if (!session?.user?.id) {
      console.log('❌ Utente non autorizzato')
      return NextResponse.json(
        { error: 'Non autorizzato' },
        { status: 401 }
      )
    }

    const body = await request.json()
    console.log('📥 Dati ricevuti:', body)
    
    const {
      title,
      description,
      date,
      time,
      duration,
      type,
      assignedTo,
      tags
    } = body

    // Validazione base
    if (!title || !date || !time || !duration || !type) {
      console.log('❌ Campi obbligatori mancanti')
      return NextResponse.json(
        { error: 'Campi obbligatori mancanti' },
        { status: 400 }
      )
    }

    console.log('💾 Creazione attività nel database...')
    
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

    const activity = await prisma.scheduledActivity.create({
      data: {
        userId: session.user.id,
        title,
        description,
        date: new Date(date),
        time,
        duration: parseInt(duration),
        type,
        status: 'SCHEDULED',
        assignedBy: session.user.id,
        assignedTo: assignedToUserId,
        tags: tags ? JSON.stringify(tags) : null
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
      ...activity,
      assignedBy: activity.assignedByUser ? {
        id: activity.assignedByUser.id,
        name: activity.assignedByUser.name,
        email: activity.assignedByUser.email
      } : null,
      assignedTo: activity.assignedToUser ? {
        id: activity.assignedToUser.id,
        name: activity.assignedToUser.name,
        email: activity.assignedToUser.email
      } : null
    }

    console.log('✅ Attività creata:', transformedActivity)
    return NextResponse.json(transformedActivity, { status: 201 })
  } catch (error) {
    console.error('Errore nella creazione dell\'attività:', error)
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    )
  }
}
