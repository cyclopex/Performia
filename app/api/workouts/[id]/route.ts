import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const workoutUpdateSchema = z.object({
  title: z.string().min(1, 'Il titolo è obbligatorio').optional(),
  description: z.string().optional(),
  date: z.string().datetime().optional(),
  duration: z.number().min(1, 'La durata deve essere di almeno 1 minuto').optional(),
  distance: z.number().min(0, 'La distanza non può essere negativa').optional(),
  calories: z.number().min(0, 'Le calorie non possono essere negative').optional(),
  rpe: z.number().min(1, 'RPE deve essere tra 1 e 10').max(10, 'RPE deve essere tra 1 e 10').optional(),
  notes: z.string().optional(),
  type: z.enum(['RUNNING', 'CYCLING', 'SWIMMING', 'STRENGTH', 'CARDIO', 'FLEXIBILITY', 'SPORTS', 'OTHER']).optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non autorizzato' },
        { status: 401 }
      )
    }

    const workout = await prisma.workout.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      }
    })

    if (!workout) {
      return NextResponse.json(
        { error: 'Allenamento non trovato' },
        { status: 404 }
      )
    }

    return NextResponse.json(workout)
  } catch (error) {
    console.error('Get workout error:', error)
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non autorizzato' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const updateData = workoutUpdateSchema.parse(body)

    // Check if workout exists and belongs to user
    const existingWorkout = await prisma.workout.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      }
    })

    if (!existingWorkout) {
      return NextResponse.json(
        { error: 'Allenamento non trovato' },
        { status: 404 }
      )
    }

    const workout = await prisma.workout.update({
      where: { id: params.id },
      data: {
        ...updateData,
        ...(updateData.date && { date: new Date(updateData.date) }),
      }
    })

    return NextResponse.json(workout)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('Update workout error:', error)
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non autorizzato' },
        { status: 401 }
      )
    }

    // Check if workout exists and belongs to user
    const existingWorkout = await prisma.workout.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      }
    })

    if (!existingWorkout) {
      return NextResponse.json(
        { error: 'Allenamento non trovato' },
        { status: 404 }
      )
    }

    await prisma.workout.delete({
      where: { id: params.id }
    })

    return NextResponse.json(
      { message: 'Allenamento eliminato con successo' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Delete workout error:', error)
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    )
  }
}
