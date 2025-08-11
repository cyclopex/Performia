import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

// GET - Lista tutti gli utenti (solo per debug)
export async function GET() {
  try {
    console.log('🔐 Controllo autenticazione lista utenti...')
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non autorizzato' },
        { status: 401 }
      )
    }

    // Recupera tutti gli utenti
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        profile: {
          select: {
            bio: true,
            location: true,
            specializations: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log(`✅ Utenti trovati nel database: ${users.length}`)
    console.log('📋 Lista utenti:', users.map(u => ({ id: u.id, name: u.name, email: u.email, role: u.role })))

    return NextResponse.json(users)
  } catch (error) {
    console.error('❌ Errore nel recupero degli utenti:', error)
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    )
  }
}
