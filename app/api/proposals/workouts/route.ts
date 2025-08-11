import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Recupera le proposte di allenamenti
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: 'Non autenticato' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // 'received' o 'sent'
    const status = searchParams.get('status') // filtro per status

    const whereClause: Record<string, string | undefined> = {}

    if (type === 'received') {
      whereClause.proposedForId = session.user.id
    } else if (type === 'sent') {
      whereClause.proposedById = session.user.id
    }

    if (status) {
      whereClause.status = status
    }

    const proposals = await prisma.workoutProposal.findMany({
      where: whereClause,
      include: {
        proposedBy: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            profile: {
              select: {
                specializations: true,
                experience: true,
                certifications: true
              }
            }
          }
        },
        proposedFor: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(proposals)
  } catch (error) {
    console.error('Errore nel recupero delle proposte di allenamenti:', error)
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    )
  }
}

// POST - Crea una nuova proposta di allenamento
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: 'Non autenticato' },
        { status: 401 }
      )
    }

    // Verifica che l'utente sia Coach, Professional o Admin
    if (!['COACH', 'PROFESSIONAL', 'ADMIN'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Non autorizzato a creare proposte' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const {
      action,
      title,
      description,
      type,
      duration,
      intensity,
      exercises,
      notes,
      proposedForId,
      originalWorkoutId
    } = body

    // Verifica che esista una connessione accettata
    const connection = await prisma.connection.findFirst({
      where: {
        OR: [
          {
            userId: session.user.id,
            connectedUserId: proposedForId,
            status: 'ACCEPTED'
          },
          {
            userId: proposedForId,
            connectedUserId: session.user.id,
            status: 'ACCEPTED'
          }
        ]
      }
    })

    if (!connection) {
      return NextResponse.json(
        { error: 'Devi essere connesso con l\'atleta per creare proposte' },
        { status: 403 }
      )
    }

    const proposal = await prisma.workoutProposal.create({
      data: {
        action,
        title,
        description,
        type,
        duration,
        intensity,
        exercises,
        notes,
        proposedById: session.user.id,
        proposedForId,
        originalWorkoutId
      },
      include: {
        proposedBy: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        },
        proposedFor: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      }
    })

    return NextResponse.json(proposal, { status: 201 })
  } catch (error) {
    console.error('Errore nella creazione della proposta di allenamento:', error)
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    )
  }
}
