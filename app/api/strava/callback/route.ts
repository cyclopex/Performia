import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const error = searchParams.get('error')

    if (error) {
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/profile?error=strava_auth_failed`)
    }

    if (!code) {
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/profile?error=no_code`)
    }

    // Scambia il codice con un access token
    const tokenResponse = await fetch('https://www.strava.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: process.env.STRAVA_CLIENT_ID,
        client_secret: process.env.STRAVA_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code'
      })
    })

    if (!tokenResponse.ok) {
      throw new Error('Errore nell\'ottenimento del token')
    }

    const tokenData = await tokenResponse.json()
    const { access_token, refresh_token, expires_at } = tokenData

    // Reindirizza alla pagina del profilo con i token
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}/profile?strava_token=${access_token}&strava_refresh=${refresh_token}&strava_expires=${expires_at}`
    )

  } catch (error) {
    console.error('Errore nel callback Strava:', error)
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/profile?error=strava_error`)
  }
}

