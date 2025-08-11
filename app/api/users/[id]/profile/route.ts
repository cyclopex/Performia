import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Recupera il profilo di un utente specifico
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: 'Non autenticato' },
        { status: 401 }
      )
    }

    const targetUserId = params.id

    // Verifica che esista una connessione accettata
    const connection = await prisma.connection.findFirst({
      where: {
        OR: [
          {
            userId: session.user.id,
            connectedUserId: targetUserId,
            status: 'ACCEPTED'
          },
          {
            userId: targetUserId,
            connectedUserId: session.user.id,
            status: 'ACCEPTED'
          }
        ]
      }
    })

    if (!connection) {
      return NextResponse.json(
        { error: 'Devi essere connesso con questo utente per visualizzare il profilo' },
        { status: 403 }
      )
    }

    // Recupera i dati dell'utente target
    const user = await prisma.user.findUnique({
      where: { id: targetUserId },
      include: {
        profile: true,
        workouts: {
          take: 10,
          orderBy: { date: 'desc' },
          select: {
            id: true,
            title: true,
            date: true,
            type: true,
            duration: true,
            distance: true,
            calories: true
          }
        },
        raceResults: {
          take: 10,
          orderBy: { date: 'desc' },
          select: {
            id: true,
            raceName: true,
            date: true,
            distance: true,
            time: true,
            position: true,
            personalBest: true
          }
        },
        scheduledActivities: {
          take: 10,
          where: {
            date: {
              gte: new Date()
            }
          },
          orderBy: { date: 'asc' },
          select: {
            id: true,
            title: true,
            date: true,
            type: true,
            duration: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Utente non trovato' },
        { status: 404 }
      )
    }

    // Restituisce i dati dell'utente (esclusi dati sensibili)
    const userData = {
      id: user.id,
      name: user.name,
      role: user.role,
      profile: user.profile ? {
        bio: user.profile.bio,
        location: user.profile.location,
        birthDate: user.profile.birthDate,
        specializations: user.profile.specializations,
        experience: user.profile.experience,
        certifications: user.profile.certifications,
        achievements: user.profile.achievements,
        socialLinks: user.profile.socialLinks,
        avatar: user.profile.avatar,
        coverImage: user.profile.coverImage,
        // Dati fisici (solo se l'utente è ATHLETE)
        ...(user.role === 'ATHLETE' && {
          height: user.profile.height,
          weight: user.profile.weight,
          gender: user.profile.gender,
          dominantHand: user.profile.dominantHand,
          sports: user.profile.sports,
          sportLevel: user.profile.sportLevel,
          yearsExperience: user.profile.yearsExperience,
          sportGoals: user.profile.sportGoals,
          trainingAvailability: user.profile.trainingAvailability,
          trainingFrequency: user.profile.trainingFrequency
        })
      } : null,
      // Statistiche recenti
      recentWorkouts: user.workouts,
      recentRaceResults: user.raceResults,
      upcomingActivities: user.scheduledActivities,
      // Metadati
      createdAt: user.createdAt,
      isApproved: user.isApproved
    }

    return NextResponse.json(userData)
  } catch (error) {
    console.error('Errore nel recupero del profilo utente:', error)
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    )
  }
}
