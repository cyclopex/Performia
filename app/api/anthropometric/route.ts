import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/anthropometric - Get all anthropometric data for the authenticated user
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
    }

    const anthropometricData = await prisma.anthropometricData.findMany({
      where: {
        userId: session.user.id
      },
      orderBy: {
        date: 'desc'
      }
    })

    return NextResponse.json(anthropometricData)
  } catch (error) {
    console.error('Errore nel recupero dei dati antropometrici:', error)
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    )
  }
}

// POST /api/anthropometric - Create new anthropometric data
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
    }

    const body = await request.json()
    const { 
      date, 
      weight, 
      height,
      bodyFat, 
      muscleMass, 
      bmi, 
      restingHR,
      maxHR,
      vo2Max,
      hydration,
      bloodPressure,
      bodyTemp,
      notes,
      measuredBy
    } = body

    if (!date) {
      return NextResponse.json(
        { error: 'La data è obbligatoria' },
        { status: 400 }
      )
    }

    const anthropometricData = await prisma.anthropometricData.create({
      data: {
        date: new Date(date),
        weight: weight ? parseFloat(weight) : null,
        height: height ? parseFloat(height) : null,
        bodyFat: bodyFat ? parseFloat(bodyFat) : null,
        muscleMass: muscleMass ? parseFloat(muscleMass) : null,
        bmi: bmi ? parseFloat(bmi) : null,
        restingHR: restingHR ? parseInt(restingHR) : null,
        maxHR: maxHR ? parseInt(maxHR) : null,
        vo2Max: vo2Max ? parseFloat(vo2Max) : null,
        hydration: hydration ? parseFloat(hydration) : null,
        bloodPressure: bloodPressure || null,
        bodyTemp: bodyTemp ? parseFloat(bodyTemp) : null,
        notes: notes || null,
        measuredBy: measuredBy || null,
        userId: session.user.id
      }
    })

    return NextResponse.json(anthropometricData, { status: 201 })
  } catch (error) {
    console.error('Errore nella creazione dei dati antropometrici:', error)
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    )
  }
}
