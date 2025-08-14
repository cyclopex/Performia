import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Schema per l'aggiornamento di un allenamento
const workoutUpdateSchema = z.object({
  title: z.string().min(1, 'Il titolo è obbligatorio').max(100, 'Il titolo è troppo lungo'),
  description: z.string().max(500, 'La descrizione è troppo lunga').optional(),
  date: z.string().datetime('Data non valida'),
  duration: z.number().min(1, 'La durata deve essere maggiore di 0').max(300, 'La durata non può superare 5 ore'),
  distance: z.number().min(0, 'La distanza non può essere negativa').max(1000, 'Distanza non realistica').optional(),
  calories: z.number().min(0, 'Le calorie non possono essere negative').max(10000, 'Calorie non realistiche').optional(),
  rpe: z.number().min(1, 'RPE deve essere tra 1 e 10').max(10, 'RPE deve essere tra 1 e 10').optional(),
  notes: z.string().max(1000, 'Le note sono troppo lunghe').optional(),
  type: z.enum(['RUNNING', 'CYCLING', 'SWIMMING', 'STRENGTH', 'CARDIO', 'FLEXIBILITY', 'SPORTS', 'YOGA', 'PILATES', 'CROSSFIT', 'MARTIAL_ARTS', 'CLIMBING', 'OTHER']),
  location: z.string().max(200, 'La località è troppo lunga').optional(),
  tags: z.array(z.string()).max(10, 'Troppi tag').optional()
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

// PUT - Aggiorna un allenamento esistente
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verifica autenticazione
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
    }

    const { id } = params
    const body = await request.json()

    // Valida i dati in ingresso
    const validatedData = workoutUpdateSchema.parse(body)

    // Verifica che l'allenamento esista e appartenga all'utente
    const existingWorkout = await prisma.workout.findUnique({
      where: { id },
      include: { user: true }
    })

    if (!existingWorkout) {
      return NextResponse.json({ error: 'Allenamento non trovato' }, { status: 404 })
    }

    if (existingWorkout.userId !== session.user.id) {
      return NextResponse.json({ error: 'Non autorizzato a modificare questo allenamento' }, { status: 403 })
    }

    // Aggiorna l'allenamento
    const updatedWorkout = await prisma.workout.update({
      where: { id },
      data: {
        ...validatedData,
        // Converti l'array di tags in JSON string per il database
        tags: validatedData.tags ? JSON.stringify(validatedData.tags) : undefined,
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

    return NextResponse.json(updatedWorkout)
  } catch (error) {
    console.error('Errore nell\'aggiornamento dell\'allenamento:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dati non validi', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    )
  }
}

// DELETE - Elimina un allenamento
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verifica autenticazione
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
    }

    const { id } = params

    // Verifica che l'allenamento esista e appartenga all'utente
    const existingWorkout = await prisma.workout.findUnique({
      where: { id },
      select: { userId: true }
    })

    if (!existingWorkout) {
      return NextResponse.json({ error: 'Allenamento non trovato' }, { status: 404 })
    }

    if (existingWorkout.userId !== session.user.id) {
      return NextResponse.json({ error: 'Non autorizzato a eliminare questo allenamento' }, { status: 403 })
    }

    // Elimina l'allenamento
    await prisma.workout.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Allenamento eliminato con successo' })
  } catch (error) {
    console.error('Errore nell\'eliminazione dell\'allenamento:', error)
    
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    )
  }
}
