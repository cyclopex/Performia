import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    // Test di connessione base
    await prisma.$connect()
    
    // Prova a vedere le tabelle esistenti
    const tables = await prisma.$queryRaw`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = 'performia'
    `
    
    // Prova a contare gli utenti se la tabella esiste
    let userCount = 0
    try {
      userCount = await prisma.user.count()
    } catch {
      console.log('Tabella users non trovata o non accessibile')
    }
    
    // Prova a contare i workout se la tabella esiste
    let workoutCount = 0
    try {
      workoutCount = await prisma.workout.count()
    } catch {
      console.log('Tabella workouts non trovata o non accessibile')
    }
    
    return NextResponse.json({
      success: true,
      message: 'Connessione al database riuscita',
      tables: tables,
      userCount,
      workoutCount,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Errore connessione database:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Errore sconosciuto',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

