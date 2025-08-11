import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Verifica autenticazione
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Non autorizzato' },
        { status: 401 }
      )
    }

    // Recupera l'utente con il profilo
    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email
      },
      include: {
        profile: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Utente non trovato' },
        { status: 404 }
      )
    }

    // Restituisce i dati dell'utente (esclusi email e password)
    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isApproved: user.isApproved,
      createdAt: user.createdAt,
      profile: user.profile || {}
    }

    return NextResponse.json(userData)
  } catch (error) {
    console.error('Errore nel recupero del profilo:', error)
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    )
  }
}
