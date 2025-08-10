import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

// GET - Cerca utenti per nome o email
export async function GET(request: NextRequest) {
  try {
    console.log('🔐 Controllo autenticazione ricerca utenti...')
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non autorizzato' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    const limit = parseInt(searchParams.get('limit') || '10')

    // Se non c'è query, mostra tutti gli utenti (per la pagina connessioni)
    if (!query.trim()) {
      const allUsers = await prisma.user.findMany({
        where: {
          id: {
            not: session.user.id // Escludi l'utente corrente
          },
          isApproved: true // Solo utenti approvati
        },
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
        },
        take: limit,
        orderBy: [
          {
            name: 'asc'
          }
        ]
      })

      // Recupera le connessioni dell'utente per determinare lo stato
      const userConnections = await prisma.connection.findMany({
        where: {
          OR: [
            { userId: session.user.id },
            { connectedUserId: session.user.id }
          ]
        },
        select: {
          id: true,
          userId: true,
          connectedUserId: true,
          status: true
        }
      })

      // Aggiungi lo stato della connessione a ogni utente
      const usersWithConnectionStatus = allUsers.map(user => {
        const connection = userConnections.find(conn => 
          (conn.userId === session.user.id && conn.connectedUserId === user.id) ||
          (conn.connectedUserId === session.user.id && conn.userId === user.id)
        )

        return {
          ...user,
          connectionStatus: connection ? connection.status : null,
          connectionId: connection ? connection.id : null,
          isInitiator: connection ? connection.userId === session.user.id : null
        }
      })

      console.log(`✅ Tutti gli utenti: ${usersWithConnectionStatus.length}`)
      return NextResponse.json(usersWithConnectionStatus)
    }

    // Cerca utenti per nome o email
    const users = await prisma.user.findMany({
      where: {
        OR: [
          {
            name: {
              contains: query
            }
          },
          {
            email: {
              contains: query
            }
          }
        ],
        AND: {
          id: {
            not: session.user.id // Escludi l'utente corrente
          },
          isApproved: true // Solo utenti approvati
        }
      },
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
      },
      take: limit,
      orderBy: [
        {
          name: 'asc'
        }
      ]
    })

    // Recupera le connessioni dell'utente per determinare lo stato
    const userConnections = await prisma.connection.findMany({
      where: {
        OR: [
          { userId: session.user.id },
          { connectedUserId: session.user.id }
        ]
      },
      select: {
        id: true,
        userId: true,
        connectedUserId: true,
        status: true
      }
    })

    // Aggiungi lo stato della connessione a ogni utente
    const usersWithConnectionStatus = users.map(user => {
      const connection = userConnections.find(conn => 
        (conn.userId === session.user.id && conn.connectedUserId === user.id) ||
        (conn.connectedUserId === session.user.id && conn.userId === user.id)
      )

      return {
        ...user,
        connectionStatus: connection ? connection.status : null,
        connectionId: connection ? connection.id : null,
        isInitiator: connection ? connection.userId === session.user.id : null
      }
    })

    console.log(`✅ Utenti trovati: ${usersWithConnectionStatus.length}`)

    return NextResponse.json(usersWithConnectionStatus)
  } catch (error) {
    console.error('❌ Errore nella ricerca utenti:', error)
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    )
  }
}
