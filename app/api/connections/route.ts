import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

// GET - Recupera le connessioni dell'utente
export async function GET(request: NextRequest) {
  try {
    console.log('🔐 Controllo autenticazione connessioni...')
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non autorizzato' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') // PENDING, ACCEPTED, REJECTED

    // Query per le connessioni
    const whereClause = {
      OR: [
        { userId: session.user.id },
        { connectedUserId: session.user.id }
      ]
    }

    if (status) {
      whereClause.status = status
    }

    const connections = await prisma.connection.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            role: true,
            profile: {
              select: {
                bio: true,
                location: true,
                specializations: true
              }
            }
          }
        },
        connectedUser: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            role: true,
            profile: {
              select: {
                bio: true,
                location: true,
                specializations: true
              }
            }
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })

    // Trasforma i dati per il frontend
    const transformedConnections = connections.map(connection => {
      const isInitiator = connection.userId === session.user.id
      const otherUser = isInitiator ? connection.connectedUser : connection.user
      
      return {
        id: connection.id,
        status: connection.status,
        isInitiator,
        otherUser,
        createdAt: connection.createdAt,
        updatedAt: connection.updatedAt
      }
    })

    console.log(`✅ Connessioni recuperate: ${transformedConnections.length}`)
    return NextResponse.json(transformedConnections)
  } catch (error) {
    console.error('❌ Errore nel recupero delle connessioni:', error)
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    )
  }
}

// POST - Invia una richiesta di connessione
export async function POST(request: NextRequest) {
  try {
    console.log('🔐 Controllo autenticazione invio connessione...')
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non autorizzato' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { connectedUserId } = body

    console.log('📥 Dati connessione:', { connectedUserId })

    // Validazione
    if (!connectedUserId) {
      return NextResponse.json(
        { error: 'ID utente richiesto' },
        { status: 400 }
      )
    }

    if (connectedUserId === session.user.id) {
      return NextResponse.json(
        { error: 'Non puoi connetterti a te stesso' },
        { status: 400 }
      )
    }

    // Verifica che l'utente esista
    const targetUser = await prisma.user.findUnique({
      where: { id: connectedUserId },
      select: { id: true, name: true, email: true }
    })

    if (!targetUser) {
      return NextResponse.json(
        { error: 'Utente non trovato' },
        { status: 404 }
      )
    }

    // Verifica se esiste già una connessione
    const existingConnection = await prisma.connection.findFirst({
      where: {
        OR: [
          {
            userId: session.user.id,
            connectedUserId: connectedUserId
          },
          {
            userId: connectedUserId,
            connectedUserId: session.user.id
          }
        ]
      }
    })

    if (existingConnection) {
      if (existingConnection.status === 'PENDING') {
        return NextResponse.json(
          { error: 'Richiesta di connessione già inviata' },
          { status: 400 }
        )
      } else if (existingConnection.status === 'ACCEPTED') {
        return NextResponse.json(
          { error: 'Sei già connesso con questo utente' },
          { status: 400 }
        )
      }
    }

    // Crea la connessione
    const connection = await prisma.connection.create({
      data: {
        userId: session.user.id,
        connectedUserId: connectedUserId,
        status: 'PENDING'
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            role: true
          }
        },
        connectedUser: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            role: true
          }
        }
      }
    })

    console.log('✅ Richiesta di connessione inviata:', connection.id)

    return NextResponse.json({
      id: connection.id,
      status: connection.status,
      isInitiator: true,
      otherUser: connection.connectedUser,
      createdAt: connection.createdAt,
      updatedAt: connection.updatedAt
    }, { status: 201 })
  } catch (error) {
    console.error('❌ Errore nell\'invio della connessione:', error)
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    )
  }
}
