// scripts/create-admin.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    console.log('🔐 Creazione utente amministratore...');
    
    // Richiedi i dati dell'admin
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const question = (query) => new Promise((resolve) => rl.question(query, resolve));

    const name = await question('Nome: ');
    const email = await question('Email: ');
    const password = await question('Password: ');

    // Verifica se l'utente esiste già
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      console.log('❌ Utente con questa email già esistente!');
      rl.close();
      return;
    }

    // Hash della password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Crea l'utente admin
    const admin = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'ADMIN',
        isApproved: true,
        isActive: true,
        emailVerified: new Date(),
      }
    });

    // Crea il profilo
    await prisma.profile.create({
      data: {
        userId: admin.id,
        bio: 'Amministratore del sistema',
        specializations: 'Gestione Sistema',
        experience: 'Amministratore principale',
        isPublic: false,
      }
    });

    console.log('✅ Utente amministratore creato con successo!');
    console.log(`📧 Email: ${email}`);
    console.log(`👤 Nome: ${name}`);
    console.log(`🔑 ID: ${admin.id}`);
    
    rl.close();
  } catch (error) {
    console.error('❌ Errore nella creazione dell\'admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();