import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

const adminRegisterSchema = z.object({
  name: z.string().min(2, 'Il nome deve essere di almeno 2 caratteri'),
  email: z.string().email('Email non valida'),
  password: z.string().min(6, 'La password deve essere di almeno 6 caratteri'),
  secretKey: z.string().min(1, 'Chiave segreta richiesta'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, password, secretKey } = adminRegisterSchema.parse(body)

    // Verifica la chiave segreta
    const expectedSecretKey = process.env.ADMIN_SECRET_KEY || 'admin-secret-2024'
    if (secretKey !== expectedSecretKey) {
      return NextResponse.json(
        { error: 'Chiave segreta non valida' },
        { status: 401 }
      )
    }

    // Verifica se esiste già un utente con questa email
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Un utente con questa email esiste già' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Crea l'amministratore nel database
    const admin = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'ADMIN',
        isApproved: true,
        profile: {
          create: {
            bio: 'Amministratore di Performia',
            specializations: 'Amministrazione, Gestione Piattaforma',
            experience: 'Amministratore di sistema'
          }
        }
      },
      include: {
        profile: true
      }
    })

    console.log('✅ Admin creato nel database:', { name, email, role: 'ADMIN' })

    return NextResponse.json(
      { 
        message: 'Amministratore creato con successo',
        admin: {
          id: admin.id,
          name: admin.name,
          email: admin.email,
          role: admin.role
        }
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('Admin registration error:', error)
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    )
  }
}

// Endpoint per verificare se esiste un admin
export async function GET() {
  try {
    const admin = await prisma.user.findFirst({
      where: { role: 'ADMIN' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    })

    return NextResponse.json({
      hasAdmin: !!admin,
      admin
    })
  } catch (error) {
    console.error('Error checking admin:', error)
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    )
  }
}
