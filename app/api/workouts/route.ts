import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const workoutSchema = z.object({
  title: z.string().min(1, 'Il titolo è obbligatorio').max(100, 'Il titolo è troppo lungo'),
  description: z.string().max(500, 'La descrizione è troppo lunga').optional(),
  date: z.string().datetime('Data non valida'),
  duration: z.number().min(1, 'La durata deve essere di almeno 1 minuto').max(300, 'La durata non può superare 5 ore'),
  distance: z.number().min(0, 'La distanza non può essere negativa').max(1000, 'Distanza non realistica').optional(),
  calories: z.number().min(0, 'Le calorie non possono essere negative').max(10000, 'Calorie non realistiche').optional(),
  rpe: z.number().min(1, 'RPE deve essere tra 1 e 10').max(10, 'RPE deve essere tra 1 e 10'),
  notes: z.string().max(1000, 'Le note sono troppo lunghe').optional(),
  type: z.enum(['RUNNING', 'CYCLING', 'SWIMMING', 'STRENGTH', 'CARDIO', 'FLEXIBILITY', 'SPORTS', 'YOGA', 'PILATES', 'CROSSFIT', 'MARTIAL_ARTS', 'CLIMBING', 'OTHER']),
  status: z.enum(['PLANNED', 'COMPLETED', 'CANCELLED']).default('COMPLETED'),
  location: z.string().max(200, 'La località è troppo lunga').optional(),
  tags: z.array(z.string()).max(10, 'Troppi tag').optional()
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non autorizzato' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const type = searchParams.get('type')
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')
    const stravaOnly = searchParams.get('stravaOnly') === 'true'
    const userId = searchParams.get('userId') || session.user.id
    const skip = (page - 1) * limit

    // Costruisci la clausola where per i filtri
    const whereClause: any = { userId }
    
    if (type && type !== 'ALL') {
      whereClause.type = type
    }
    
    if (dateFrom || dateTo) {
      whereClause.date = {}
      if (dateFrom) whereClause.date.gte = new Date(dateFrom)
      if (dateTo) whereClause.date.lte = new Date(dateTo)
    }

    // Filtro per allenamenti Strava
    if (stravaOnly) {
      whereClause.stravaId = { not: null }
    }

    const workouts = await prisma.workout.findMany({
      where: whereClause,
      orderBy: { date: 'desc' },
      skip,
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    const total = await prisma.workout.count({
      where: whereClause,
    })

    const hasNext = skip + limit < total
    const hasPrev = page > 1

    return NextResponse.json({
      workouts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasNext,
        hasPrev
      }
    })
  } catch (error) {
    console.error('Errore nel recupero degli allenamenti:', error)
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non autorizzato' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const workoutData = workoutSchema.parse(body)

    const workout = await prisma.workout.create({
      data: {
        ...workoutData,
        userId: session.user.id,
        date: new Date(workoutData.date),
        // Converti l'array di tags in JSON string per il database
        tags: workoutData.tags ? JSON.stringify(workoutData.tags) : null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json(workout, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dati non validi', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Errore nella creazione dell\'allenamento:', error)
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    )
  }
}
