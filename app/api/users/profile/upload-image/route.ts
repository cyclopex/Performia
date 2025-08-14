import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import sharp from 'sharp'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Inizio upload immagine...')
    
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      console.log('❌ Sessione non valida')
      return NextResponse.json(
        { error: 'Non autorizzato' },
        { status: 401 }
      )
    }

    console.log('✅ Sessione valida per:', session.user.email)

    const formData = await request.formData()
    const image = formData.get('image') as File
    const type = formData.get('type') as string
    
    console.log('📡 Dati ricevuti:', { 
      hasImage: !!image, 
      imageType: image?.type, 
      imageSize: image?.size,
      uploadType: type 
    })
    
    if (!image || !type) {
      console.log('❌ Dati mancanti')
      return NextResponse.json(
        { error: 'Immagine e tipo richiesti' },
        { status: 400 }
      )
    }

    // Verifica tipo di immagine
    if (!['avatar', 'cover'].includes(type)) {
      console.log('❌ Tipo non valido:', type)
      return NextResponse.json(
        { error: 'Tipo non valido' },
        { status: 400 }
      )
    }

    // Verifica formato immagine
    if (!image.type.startsWith('image/')) {
      console.log('❌ File non è un\'immagine:', image.type)
      return NextResponse.json(
        { error: 'File non è un\'immagine' },
        { status: 400 }
      )
    }

    // Verifica dimensione file (max 5MB)
    const maxSize = 5 * 1024 * 1024
    if (image.size > maxSize) {
      console.log('❌ File troppo grande:', image.size, 'bytes')
      return NextResponse.json(
        { error: 'File troppo grande. Dimensione massima: 5MB' },
        { status: 400 }
      )
    }

    console.log('🔄 Convertendo immagine in buffer...')
    
    // Converti l'immagine in buffer
    const imageBuffer = Buffer.from(await image.arrayBuffer())
    console.log('✅ Buffer creato, dimensione:', imageBuffer.length, 'bytes')
    
    console.log('🔄 Avvio resize con Sharp...')
    
    // Resize dell'immagine in base al tipo
    let resizedImage: Buffer
    let fileName: string
    
    try {
      if (type === 'avatar') {
        console.log('🖼️ Resize avatar a 400x400px...')
        // Avatar: 400x400px, formato quadrato
        resizedImage = await sharp(imageBuffer)
          .resize(400, 400, {
            fit: 'cover',
            position: 'center'
          })
          .jpeg({ quality: 85 })
          .toBuffer()
        
        fileName = `avatar_${Date.now()}.jpg`
      } else {
        console.log('🖼️ Resize cover a 1200x400px...')
        // Cover: 1200x400px, formato landscape
        resizedImage = await sharp(imageBuffer)
          .resize(1200, 400, {
            fit: 'cover',
            position: 'center'
          })
          .jpeg({ quality: 85 })
          .toBuffer()
        
        fileName = `cover_${Date.now()}.jpg`
      }
      
      console.log('✅ Resize completato, dimensione finale:', resizedImage.length, 'bytes')
    } catch (sharpError) {
      console.error('❌ Errore Sharp:', sharpError)
      return NextResponse.json(
        { error: `Errore nel processing dell'immagine: ${sharpError.message}` },
        { status: 500 }
      )
    }

    console.log('🔄 Salvataggio su filesystem...')
    
    // Crea la directory per le immagini se non esiste
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'profiles')
    await mkdir(uploadDir, { recursive: true })
    
    // Salva l'immagine su filesystem
    const filePath = join(uploadDir, fileName)
    await writeFile(filePath, resizedImage)
    
    // Crea l'URL pubblico per l'immagine
    const imageUrl = `/uploads/profiles/${fileName}`
    console.log('✅ Immagine salvata su filesystem:', imageUrl)
    
    console.log('🔄 Aggiornamento database...')
    
    // Aggiorna il profilo nel database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { profile: true }
    })

    if (!user) {
      console.log('❌ Utente non trovato nel database')
      return NextResponse.json(
        { error: 'Utente non trovato' },
        { status: 404 }
      )
    }

    console.log('✅ Utente trovato:', user.id)

    try {
      // Se il profilo non esiste, crealo
      if (!user.profile) {
        console.log('🔄 Creazione nuovo profilo...')
        await prisma.profile.create({
          data: {
            userId: user.id,
            [type === 'avatar' ? 'avatar' : 'coverImage']: imageUrl
          }
        })
        console.log('✅ Profilo creato')
      } else {
        console.log('🔄 Aggiornamento profilo esistente...')
        // Aggiorna il profilo esistente
        await prisma.profile.update({
          where: { userId: user.id },
          data: {
            [type === 'avatar' ? 'avatar' : 'coverImage']: imageUrl
          }
        })
        console.log('✅ Profilo aggiornato')
      }
    } catch (dbError) {
      console.error('❌ Errore database:', dbError)
      return NextResponse.json(
        { error: `Errore nel salvataggio: ${dbError.message}` },
        { status: 500 }
      )
    }

    console.log('🎉 Upload completato con successo!')
    
    return NextResponse.json({
      success: true,
      message: `${type === 'avatar' ? 'Avatar' : 'Immagine di copertina'} aggiornato con successo`,
      imageUrl: imageUrl
    })

  } catch (error) {
    console.error('💥 Errore generale nell\'upload dell\'immagine:', error)
    console.error('Stack trace:', error.stack)
    
    // Restituisci un errore più specifico
    let errorMessage = 'Errore interno del server'
    
    if (error instanceof Error) {
      errorMessage = error.message
    } else if (typeof error === 'string') {
      errorMessage = error
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
