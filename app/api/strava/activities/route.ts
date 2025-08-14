import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const accessToken = searchParams.get('access_token')

    if (!accessToken) {
      return NextResponse.json({ error: 'Token mancante' }, { status: 400 })
    }

    // Ottieni le attività degli ultimi 30 giorni
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const after = Math.floor(thirtyDaysAgo.getTime() / 1000)

    const response = await fetch(
      `https://www.strava.com/api/v3/athlete/activities?after=${after}&per_page=200`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    )

    if (!response.ok) {
      throw new Error('Errore nell\'ottenimento delle attività Strava')
    }

    const activities = await response.json()

    return NextResponse.json({
      success: true,
      activities: activities
    })

  } catch (error) {
    console.error('Errore nell\'ottenimento delle attività Strava:', error)
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    )
  }
}

