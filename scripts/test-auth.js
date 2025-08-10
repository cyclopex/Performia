// scripts/test-auth.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function testAuth() {
  try {
    const email = 'cyclopex@gmail.com'; // O l'email che hai usato
    const password = 'Judo_.ka73'; // O la password che hai usato
    
    console.log('🔍 Testando autenticazione...');
    console.log(`📧 Email: ${email}`);
    
    // Trova l'utente
    const user = await prisma.user.findUnique({
      where: { email }
    });
    
    if (!user) {
      console.log('❌ Utente non trovato nel database');
      return;
    }
    
    console.log('✅ Utente trovato nel database');
    console.log(`👤 Nome: ${user.name}`);
    console.log(`🔑 Role: ${user.role}`);
    console.log(`✔️ Approvato: ${user.isApproved}`);
    console.log(`🟢 Attivo: ${user.isActive}`);
    console.log(`📅 Email verificata: ${user.emailVerified ? 'Sì' : 'No'}`);
    
    if (!user.password) {
      console.log('❌ PROBLEMA: Campo password vuoto nel database');
      return;
    }
    
    console.log(`🔐 Hash password: ${user.password.substring(0, 20)}...`);
    
    // Testa la password
    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (isValidPassword) {
      console.log('✅ PASSWORD CORRETTA - Il problema è altrove');
    } else {
      console.log('❌ PASSWORD INCORRETTA - Problema nell\'hash');
      
      // Rigenera hash e aggiorna
      console.log('🔧 Rigenerando hash password...');
      const newHashedPassword = await bcrypt.hash(password, 12);
      
      await prisma.user.update({
        where: { id: user.id },
        data: { password: newHashedPassword }
      });
      
      console.log('✅ Password aggiornata nel database');
    }
    
  } catch (error) {
    console.error('❌ Errore nel test:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAuth();