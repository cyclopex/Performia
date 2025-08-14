import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const registerSchema = z.object({
  name: z.string().min(2, 'Il nome deve essere di almeno 2 caratteri'),
  email: z.string().email('Email non valida'),
  password: z.string().min(6, 'La password deve essere di almeno 6 caratteri'),
  role: z.enum(['ATHLETE', 'COACH', 'PROFESSIONAL']),
  // Nuovi campi opzionali
  birthDate: z.string().optional(),
  phone: z.string().optional(),
  city: z.string().optional(),
  height: z.string().optional(),
  weight: z.string().optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY']).optional(),
  dominantHand: z.enum(['RIGHT', 'LEFT', 'AMBIDEXTROUS']).optional(),
  sports: z.array(z.string()).optional(),
  sportLevel: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT']).optional(),
  yearsExperience: z.string().optional(),
  sportGoals: z.enum(['RECREATIONAL', 'COMPETITIVE', 'PROFESSIONAL', 'PERFORMANCE', 'FITNESS', 'REHABILITATION', 'COMPETITION', 'RECREATION']).optional(),
  trainingAvailability: z.array(z.string()).optional(),
  trainingFrequency: z.string().optional(), // Form invia stringhe come "1-2", "3-4", "daily"
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('📝 Dati ricevuti per registrazione:', body)
    
    const validatedData = registerSchema.parse(body)
    console.log('✅ Dati validati:', validatedData)
    
    const { 
      name, 
      email, 
      password, 
      role,
      // Nuovi campi
      birthDate,
      phone,
      city,
      height,
      weight,
      gender,
      dominantHand,
      sports,
      sportLevel,
      yearsExperience,
      sportGoals,
      trainingAvailability,
      trainingFrequency
    } = validatedData

    // Check if user already exists
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

    // Create user with transaction to include profile
    const result = await prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role,
          isApproved: true, // Tutti i ruoli sono auto-approvati
        }
      })

      // Create profile with all new fields
      const profile = await tx.profile.create({
        data: {
          userId: user.id,
          birthDate: birthDate ? new Date(birthDate) : null,
          phone: phone || null,
          location: city || null,
          height: height ? parseFloat(height) : null,
          weight: weight ? parseFloat(weight) : null,
          gender: gender || null,
          dominantHand: dominantHand || null,
          sports: sports ? JSON.stringify(sports) : null,
          specializations: sports ? JSON.stringify(sports) : null, // Mantenuto per compatibilità
          experience: yearsExperience ? `${yearsExperience} anni` : null,
          preferences: JSON.stringify({
            sportLevel: sportLevel || null,
            sportGoals: sportGoals || null,
            trainingAvailability: trainingAvailability || [],
            trainingFrequency: trainingFrequency || null
          })
        }
      })

      return { user, profile }
    })

    return NextResponse.json(
      { 
        message: 'Utente creato con successo',
        userId: result.user.id
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Errore validazione Zod:', error.errors)
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    )
  }
}
