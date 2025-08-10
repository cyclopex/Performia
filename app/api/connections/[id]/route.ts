import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

// PUT - Accetta o rifiuta una connessione
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🔐 Controllo autenticazione azione connessione...')
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non autorizzato' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { action } = body // 'accept' o 'reject'

    console.log('📥 Azione connessione:', { connectionId: params.id, action })

    if (!['accept', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Azione non valida' },
        { status: 400 }
      )
    }

    // Trova la connessione
    const connection = await prisma.connection.findUnique({
      where: { id: params.id },
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

    if (!connection) {
      return NextResponse.json(
        { error: 'Connessione non trovata' },
        { status: 404 }
      )
    }

    // Verifica che l'utente sia il destinatario della richiesta
    if (connection.connectedUserId !== session.user.id) {
      return NextResponse.json(
        { error: 'Non autorizzato a gestire questa connessione' },
        { status: 403 }
      )
    }

    // Verifica che la connessione sia in stato PENDING
    if (connection.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Connessione già gestita' },
        { status: 400 }
      )
    }

    // Aggiorna lo stato della connessione
    const newStatus = action === 'accept' ? 'ACCEPTED' : 'REJECTED'
    
    const updatedConnection = await prisma.connection.update({
      where: { id: params.id },
      data: { 
        status: newStatus,
        updatedAt: new Date()
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

    console.log(`✅ Connessione ${action}ata:`, updatedConnection.id)

    return NextResponse.json({
      id: updatedConnection.id,
      status: updatedConnection.status,
      isInitiator: false,
      otherUser: updatedConnection.user,
      createdAt: updatedConnection.createdAt,
      updatedAt: updatedConnection.updatedAt
    })
  } catch (error) {
    console.error('❌ Errore nella gestione della connessione:', error)
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    )
  }
}

// DELETE - Rimuovi una connessione
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🔐 Controllo autenticazione rimozione connessione...')
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non autorizzato' },
        { status: 401 }
      )
    }

    // Trova la connessione
    const connection = await prisma.connection.findUnique({
      where: { id: params.id }
    })

    if (!connection) {
      return NextResponse.json(
        { error: 'Connessione non trovata' },
        { status: 404 }
      )
    }

    // Verifica che l'utente sia uno dei partecipanti
    if (connection.userId !== session.user.id && connection.connectedUserId !== session.user.id) {
      return NextResponse.json(
        { error: 'Non autorizzato a rimuovere questa connessione' },
        { status: 403 }
      )
    }

    // Rimuovi la connessione
    await prisma.connection.delete({
      where: { id: params.id }
    })

    console.log('✅ Connessione rimossa:', params.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('❌ Errore nella rimozione della connessione:', error)
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    )
  }
}
