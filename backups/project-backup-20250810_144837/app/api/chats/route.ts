import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

// GET - Recupera le chat dell'utente
export async function GET(request: NextRequest) {
  try {
    console.log('🔐 Controllo autenticazione chat...')
    const session = await getServerSession(authOptions)
    
    console.log('👤 Sessione chat:', session?.user)
    
    if (!session?.user?.id) {
      console.log('❌ Utente non autorizzato chat')
      return NextResponse.json(
        { error: 'Non autorizzato' },
        { status: 401 }
      )
    }

    // Recupera tutte le chat dell'utente
    const userChats = await prisma.chatParticipant.findMany({
      where: {
        userId: session.user.id
      },
      include: {
        chat: {
          include: {
            participants: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    image: true
                  }
                }
              }
            },
            messages: {
              orderBy: {
                createdAt: 'desc'
              },
              take: 1,
              include: {
                sender: {
                  select: {
                    id: true,
                    name: true,
                    email: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: {
        chat: {
          updatedAt: 'desc'
        }
      }
    })

    // Trasforma i dati per il frontend
    const transformedChats = userChats.map(participant => {
      const chat = participant.chat
      const otherParticipants = chat.participants.filter(p => p.userId !== session.user.id)
      
      return {
        id: chat.id,
        type: chat.type,
        name: chat.name || (chat.type === 'DIRECT' && otherParticipants[0] ? otherParticipants[0].user.name : 'Chat'),
        lastMessage: chat.messages[0] ? {
          id: chat.messages[0].id,
          content: chat.messages[0].content,
          type: chat.messages[0].type,
          createdAt: chat.messages[0].createdAt,
          sender: chat.messages[0].sender
        } : null,
        participants: chat.participants.map(p => ({
          id: p.user.id,
          name: p.user.name,
          email: p.user.email,
          image: p.user.image,
          role: p.role
        })),
        unreadCount: 0, // TODO: Implementare conteggio messaggi non letti
        updatedAt: chat.updatedAt
      }
    })

    console.log('✅ Chat recuperate:', transformedChats.length)
    return NextResponse.json(transformedChats)
  } catch (error) {
    console.error('❌ Errore nel recupero delle chat:', error)
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    )
  }
}

// POST - Crea una nuova chat
export async function POST(request: NextRequest) {
  try {
    console.log('🔐 Controllo autenticazione creazione chat...')
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non autorizzato' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { type = 'DIRECT', participantIds, name } = body

    console.log('📥 Dati creazione chat:', { type, participantIds, name })

    // Validazione
    if (!participantIds || !Array.isArray(participantIds) || participantIds.length === 0) {
      return NextResponse.json(
        { error: 'Partecipanti richiesti' },
        { status: 400 }
      )
    }

    // Aggiungi l'utente corrente ai partecipanti
    const allParticipantIds = Array.from(new Set([session.user.id, ...participantIds]))

    // Verifica che tutti i partecipanti esistano
    const participants = await prisma.user.findMany({
      where: {
        id: {
          in: allParticipantIds
        }
      },
      select: {
        id: true,
        name: true,
        email: true
      }
    })

    if (participants.length !== allParticipantIds.length) {
      return NextResponse.json(
        { error: 'Uno o più partecipanti non trovati' },
        { status: 400 }
      )
    }

    // Verifica che tutti i partecipanti siano connessi tra loro
    for (const participantId of participantIds) {
      const connection = await prisma.connection.findFirst({
        where: {
          OR: [
            {
              userId: session.user.id,
              connectedUserId: participantId,
              status: 'ACCEPTED'
            },
            {
              userId: participantId,
              connectedUserId: session.user.id,
              status: 'ACCEPTED'
            }
          ]
        }
      })

      if (!connection) {
        return NextResponse.json(
          { error: `Devi essere connesso con ${participants.find(p => p.id === participantId)?.name || 'questo utente'} per iniziare una chat` },
          { status: 403 }
        )
      }
    }

    // Per chat dirette, verifica se esiste già una chat tra i due utenti
    if (type === 'DIRECT' && allParticipantIds.length === 2) {
      const existingChat = await prisma.chat.findFirst({
        where: {
          type: 'DIRECT',
          participants: {
            every: {
              userId: {
                in: allParticipantIds
              }
            }
          }
        },
        include: {
          participants: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true
                }
              }
            }
          }
        }
      })

      if (existingChat) {
        console.log('✅ Chat diretta esistente trovata')
        return NextResponse.json({
          id: existingChat.id,
          type: existingChat.type,
          name: existingChat.name || participants.find(p => p.id !== session.user.id)?.name,
          participants: existingChat.participants.map(p => ({
            id: p.user.id,
            name: p.user.name,
            email: p.user.email,
            role: p.role
          })),
          lastMessage: null,
          unreadCount: 0,
          updatedAt: existingChat.updatedAt
        })
      }
    }

    // Crea la nuova chat
    const newChat = await prisma.chat.create({
      data: {
        type,
        name: type === 'GROUP' ? name : null,
        participants: {
          create: allParticipantIds.map(userId => ({
            userId,
            role: userId === session.user.id ? 'ADMIN' : 'MEMBER'
          }))
        }
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    })

    console.log('✅ Chat creata:', newChat.id)

    const transformedChat = {
      id: newChat.id,
      type: newChat.type,
      name: newChat.name || (newChat.type === 'DIRECT' ? 
        participants.find(p => p.id !== session.user.id)?.name : 'Chat'),
      participants: newChat.participants.map(p => ({
        id: p.user.id,
        name: p.user.name,
        email: p.user.email,
        role: p.role
      })),
      lastMessage: null,
      unreadCount: 0,
      updatedAt: newChat.updatedAt
    }

    return NextResponse.json(transformedChat, { status: 201 })
  } catch (error) {
    console.error('❌ Errore nella creazione della chat:', error)
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    )
  }
}
