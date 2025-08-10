import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non autorizzato' },
        { status: 401 }
      )
    }

    const userId = session.user.id

    // Get user's workouts
    const workouts = await prisma.workout.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      take: 10,
    })

    // Get user's connections
    const connections = await prisma.connection.findMany({
      where: {
        OR: [
          { userId },
          { connectedUserId: userId }
        ],
        status: 'ACCEPTED'
      }
    })

    // Calculate statistics
    const totalWorkouts = await prisma.workout.count({
      where: { userId }
    })

    const totalConnections = connections.length

    const averageRPE = workouts.length > 0
      ? workouts.reduce((sum, workout) => sum + (workout.rpe || 0), 0) / workouts.length
      : 0

    const totalDistance = workouts.reduce((sum, workout) => sum + (workout.distance || 0), 0)

    // Generate weekly data (mock for now)
    const weeklyData = [
      { day: 'Lun', workouts: 2, distance: 12.5, rpe: 7.5 },
      { day: 'Mar', workouts: 1, distance: 8.0, rpe: 8.0 },
      { day: 'Mer', workouts: 0, distance: 0, rpe: 0 },
      { day: 'Gio', workouts: 3, distance: 15.2, rpe: 7.0 },
      { day: 'Ven', workouts: 1, distance: 5.5, rpe: 6.5 },
      { day: 'Sab', workouts: 2, distance: 18.0, rpe: 8.5 },
      { day: 'Dom', workouts: 1, distance: 10.0, rpe: 7.0 },
    ]

    // Generate performance data (mock for now)
    const performanceData = [
      { metric: 'Resistenza', value: 85 },
      { metric: 'Forza', value: 70 },
      { metric: 'Velocità', value: 90 },
      { metric: 'Flessibilità', value: 65 },
      { metric: 'Coordinazione', value: 80 },
    ]

    return NextResponse.json({
      totalWorkouts,
      totalConnections,
      averageRPE: Math.round(averageRPE * 10) / 10,
      totalDistance: Math.round(totalDistance * 10) / 10,
      recentWorkouts: workouts.slice(0, 5),
      weeklyData,
      performanceData,
    })
  } catch (error) {
    console.error('Dashboard API error:', error)
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    )
  }
}
