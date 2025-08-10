import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

// GET - Recupera i messaggi di una chat
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🔐 Controllo autenticazione messaggi...')
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non autorizzato' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = (page - 1) * limit

    // Verifica che l'utente sia partecipante della chat
    const chatParticipant = await prisma.chatParticipant.findUnique({
      where: {
        chatId_userId: {
          chatId: params.id,
          userId: session.user.id
        }
      }
    })

    if (!chatParticipant) {
      return NextResponse.json(
        { error: 'Chat non trovata o accesso negato' },
        { status: 404 }
      )
    }

    // Recupera i messaggi
    const messages = await prisma.message.findMany({
      where: {
        chatId: params.id
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip: offset,
      take: limit
    })

    // Conta il totale dei messaggi
    const totalMessages = await prisma.message.count({
      where: {
        chatId: params.id
      }
    })

    // Segna i messaggi come letti
    await prisma.message.updateMany({
      where: {
        chatId: params.id,
        senderId: {
          not: session.user.id
        },
        status: {
          not: 'READ'
        }
      },
      data: {
        status: 'READ'
      }
    })

    console.log(`✅ Messaggi recuperati: ${messages.length}/${totalMessages}`)

    return NextResponse.json({
      messages: messages.reverse(), // Inverti per avere ordine cronologico
      pagination: {
        page,
        limit,
        total: totalMessages,
        hasMore: offset + limit < totalMessages
      }
    })
  } catch (error) {
    console.error('❌ Errore nel recupero dei messaggi:', error)
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    )
  }
}

// POST - Invia un nuovo messaggio
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🔐 Controllo autenticazione invio messaggio...')
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non autorizzato' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { content, type = 'text', fileUrl, fileName, fileSize } = body

    console.log('📥 Dati messaggio:', { content, type, fileUrl, fileName, fileSize })

    // Validazione
    if (!content && !fileUrl) {
      return NextResponse.json(
        { error: 'Contenuto o file richiesto' },
        { status: 400 }
      )
    }

    // Verifica che l'utente sia partecipante della chat
    const chatParticipant = await prisma.chatParticipant.findUnique({
      where: {
        chatId_userId: {
          chatId: params.id,
          userId: session.user.id
        }
      }
    })

    if (!chatParticipant) {
      return NextResponse.json(
        { error: 'Chat non trovata o accesso negato' },
        { status: 404 }
      )
    }

    // Crea il messaggio
    const message = await prisma.message.create({
      data: {
        content: content || '',
        type,
        fileUrl,
        fileName,
        fileSize,
        chatId: params.id,
        senderId: session.user.id,
        status: 'SENT'
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        }
      }
    })

    // Aggiorna la data di modifica della chat
    await prisma.chat.update({
      where: { id: params.id },
      data: { updatedAt: new Date() }
    })

    console.log('✅ Messaggio inviato:', message.id)

    return NextResponse.json(message, { status: 201 })
  } catch (error) {
    console.error('❌ Errore nell\'invio del messaggio:', error)
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    )
  }
}
