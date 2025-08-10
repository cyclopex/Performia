import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const workoutSchema = z.object({
  title: z.string().min(1, 'Il titolo è obbligatorio'),
  description: z.string().optional(),
  date: z.string().datetime(),
  duration: z.number().min(1, 'La durata deve essere di almeno 1 minuto'),
  distance: z.number().min(0, 'La distanza non può essere negativa').optional(),
  calories: z.number().min(0, 'Le calorie non possono essere negative').optional(),
  rpe: z.number().min(1, 'RPE deve essere tra 1 e 10').max(10, 'RPE deve essere tra 1 e 10'),
  notes: z.string().optional(),
  type: z.enum(['RUNNING', 'CYCLING', 'SWIMMING', 'STRENGTH', 'CARDIO', 'FLEXIBILITY', 'SPORTS', 'OTHER']),
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non autorizzato' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    const workouts = await prisma.workout.findMany({
      where: { userId: session.user.id },
      orderBy: { date: 'desc' },
      skip,
      take: limit,
    })

    const total = await prisma.workout.count({
      where: { userId: session.user.id },
    })

    return NextResponse.json({
      workouts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      }
    })
  } catch (error) {
    console.error('Get workouts error:', error)
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()

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
      }
    })

    return NextResponse.json(workout, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('Create workout error:', error)
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    )
  }
}
