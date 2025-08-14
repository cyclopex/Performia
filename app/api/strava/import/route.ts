import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
    }

    const { accessToken, activities } = await request.json()

    if (!accessToken || !activities || !Array.isArray(activities)) {
      return NextResponse.json({ error: 'Dati mancanti' }, { status: 400 })
    }

    const importedActivities = []

    for (const stravaActivity of activities) {
      try {
        // Mappa i tipi di attività Strava ai nostri tipi
        const mapStravaType = (stravaType: string) => {
          const typeMap: Record<string, string> = {
            'Run': 'RUNNING',
            'Ride': 'CYCLING',
            'Swim': 'SWIMMING',
            'WeightTraining': 'STRENGTH',
            'Workout': 'WORKOUT',
            'Yoga': 'YOGA',
            'Pilates': 'PILATES',
            'Crossfit': 'CROSSFIT',
            'MartialArts': 'MARTIAL_ARTS',
            'Climbing': 'CLIMBING'
          }
          return typeMap[stravaType] || 'OTHER'
        }

        // Crea l'allenamento nel database
        const workout = await prisma.workout.create({
          data: {
            title: stravaActivity.name || `Allenamento Strava - ${stravaActivity.type}`,
            description: `Importato da Strava - ${stravaActivity.description || 'Nessuna descrizione'}`,
            type: mapStravaType(stravaActivity.type),
            date: new Date(stravaActivity.start_date),
            duration: Math.round(stravaActivity.moving_time / 60), // Converti secondi in minuti
            distance: stravaActivity.distance ? stravaActivity.distance / 1000 : null, // Converti metri in km
            calories: stravaActivity.calories || null,
            rpe: null, // Strava non ha RPE
            notes: `Importato da Strava il ${new Date().toLocaleDateString('it-IT')}`,
            status: 'COMPLETED',
            location: stravaActivity.location_city || null,
            tags: ['strava-import'],
            userId: session.user.id,
            stravaId: stravaActivity.id.toString(), // Salva l'ID Strava per evitare duplicati
            stravaData: stravaActivity // Salva tutti i dati originali
          }
        })

        importedActivities.push(workout)
      } catch (error) {
        console.error('Errore nell\'importazione dell\'attività:', error)
        // Continua con le altre attività anche se una fallisce
      }
    }

    return NextResponse.json({
      success: true,
      imported: importedActivities.length,
      activities: importedActivities
    })

  } catch (error) {
    console.error('Errore nell\'importazione da Strava:', error)
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    )
  }
}

