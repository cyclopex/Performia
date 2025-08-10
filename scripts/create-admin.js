const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const readline = require('readline')

const prisma = new PrismaClient()

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

async function createAdmin() {
  try {
    console.log('🏆 Creazione Account Amministratore SportLinkedIn\n')
    
    // Controlla se esiste già un admin
    const existingAdmin = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    })

    if (existingAdmin) {
      console.log('❌ Un amministratore esiste già nel sistema!')
      console.log(`   Email: ${existingAdmin.email}`)
      process.exit(1)
    }

    // Richiedi i dati
    const name = await question('Nome completo: ')
    const email = await question('Email: ')
    const password = await question('Password (min 6 caratteri): ')
    const confirmPassword = await question('Conferma password: ')

    // Validazioni
    if (password.length < 6) {
      console.log('❌ La password deve essere di almeno 6 caratteri')
      process.exit(1)
    }

    if (password !== confirmPassword) {
      console.log('❌ Le password non coincidono')
      process.exit(1)
    }

    // Controlla se l'email è già registrata
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      console.log('❌ Un utente con questa email esiste già')
      process.exit(1)
    }

    // Conferma
    console.log('\n📋 Riepilogo:')
    console.log(`   Nome: ${name}`)
    console.log(`   Email: ${email}`)
    console.log(`   Password: ${'*'.repeat(password.length)}`)
    
    const confirm = await question('\nConfermi la creazione? (y/N): ')
    
    if (confirm.toLowerCase() !== 'y' && confirm.toLowerCase() !== 'yes') {
      console.log('❌ Operazione annullata')
      process.exit(0)
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Crea l'amministratore
    const admin = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'ADMIN',
        isApproved: true,
      }
    })

    // Crea il profilo
    await prisma.profile.create({
      data: {
        userId: admin.id,
        bio: 'Amministratore del sistema',
        specializations: ['Gestione Sistema'],
        experience: 'Amministratore principale',
      }
    })

    console.log('\n✅ Amministratore creato con successo!')
    console.log(`   ID: ${admin.id}`)
    console.log(`   Nome: ${admin.name}`)
    console.log(`   Email: ${admin.email}`)
    console.log(`   Ruolo: ${admin.role}`)
    console.log('\n🔗 Ora puoi accedere su: http://localhost:3000/auth/login')

  } catch (error) {
    console.error('❌ Errore durante la creazione:', error.message)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
    rl.close()
  }
}

function question(query) {
  return new Promise(resolve => rl.question(query, resolve))
}

// Esegui lo script
createAdmin()
