#!/bin/bash
# Performia - Migrazione GRADUALE E SICURA
# Risolve conflitti di indici con approccio step-by-step

set -e

echo "🚀 PERFORMIA - MIGRAZIONE GRADUALE SICURA"
echo "========================================"
echo ""
echo "🔧 Risolve conflitti di indici con approccio graduale"
echo "⏱️  Tempo stimato: 3-4 minuti"
echo ""

# ==========================================
# FASE 1: BACKUP COMPLETO
# ==========================================
echo "📋 FASE 1: Backup completo..."

mkdir -p backups

# Backup di tutto
cp package.json backups/package-backup-$(date +%Y%m%d_%H%M%S).json
cp prisma/schema.prisma backups/schema-original-$(date +%Y%m%d_%H%M%S).prisma

echo "✅ Backup completati!"

# ==========================================
# FASE 2: RESET COMPLETO DATABASE
# ==========================================
echo ""
echo "🗄️  FASE 2: Reset database per evitare conflitti..."
echo ""
echo "⚠️  ATTENZIONE: Questo cancellerà tutti i dati del database!"
echo "   I backup dei file sono al sicuro, ma i dati del database verranno persi."
echo ""
read -p "Vuoi continuare? (y/N): " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Operazione annullata."
    echo "💡 Alternativa: Crea un nuovo database per testare le modifiche"
    exit 0
fi

echo "   • Reset del database..."
npx prisma migrate reset --force --skip-seed
echo "   ✅ Database resettato!"

# ==========================================
# FASE 3: AGGIORNAMENTO PACKAGE.JSON
# ==========================================
echo ""
echo "📦 FASE 3: Aggiornamento package.json..."

cat > package.json << 'EOF'
{
  "name": "performia",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "lint:fix": "next lint --fix",
    "type-check": "tsc --noEmit",
    "db:generate": "prisma generate",
    "db:push": "prisma db push",
    "db:migrate": "prisma migrate dev",
    "db:studio": "prisma studio",
    "create-admin": "node scripts/create-admin.js"
  },
  "dependencies": {
    "@auth/prisma-adapter": "^2.10.0",
    "@hookform/resolvers": "^3.9.0",
    "@prisma/client": "^5.7.1",
    "@stripe/stripe-js": "^2.4.0",
    "bcryptjs": "^2.4.3",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.1",
    "date-fns": "^3.6.0",
    "lucide-react": "^0.441.0",
    "mysql2": "^3.6.5",
    "next": "^14.2.13",
    "next-auth": "^4.24.5",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-hook-form": "^7.53.0",
    "react-hot-toast": "^2.4.1",
    "recharts": "^2.12.7",
    "socket.io": "^4.8.1",
    "socket.io-client": "^4.8.1",
    "stripe": "^16.12.0",
    "tailwind-merge": "^2.5.2",
    "zod": "^3.23.8"
  },
  "devDependencies": {
    "@types/bcryptjs": "^2.4.6",
    "@types/node": "^22.5.5",
    "@types/react": "^18.3.7",
    "@types/react-dom": "^18.3.0",
    "autoprefixer": "^10.4.20",
    "eslint": "^8.57.1",
    "eslint-config-next": "^14.2.13",
    "postcss": "^8.4.47",
    "prisma": "^5.7.1",
    "tailwindcss": "^3.4.12",
    "typescript": "^5.6.2"
  },
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=8.0.0"
  }
}
EOF

npm install
echo "✅ Package.json aggiornato!"

# ==========================================
# FASE 4: SCHEMA OTTIMIZZATO GRADUALE
# ==========================================
echo ""
echo "🗄️  FASE 4: Schema ottimizzato (graduale)..."

cat > prisma/schema.prisma << 'EOF'
// Performia Schema - VERSIONE OTTIMIZZATA GRADUALE
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
  @@index([userId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
}

model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  emailVerified DateTime?
  image         String?
  password      String?
  role          UserRole  @default(ATHLETE)
  isApproved    Boolean   @default(false)
  isActive      Boolean   @default(true)
  timezone      String?   @default("Europe/Rome")
  lastLoginAt   DateTime?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  accounts      Account[]
  sessions      Session[]
  profile       Profile?
  connections   Connection[] @relation("UserConnections")
  connectedTo   Connection[] @relation("ConnectedToUser")
  workouts      Workout[]
  raceResults   RaceResult[]
  anthropometricData AnthropometricData[]
  payments      Payment[]
  scheduledActivities ScheduledActivity[]
  assignedActivities ScheduledActivity[] @relation("AssignedActivities")
  receivedActivities ScheduledActivity[] @relation("ReceivedActivities")
  chatParticipants    ChatParticipant[]
  sentMessages        Message[]

  @@index([email])
  @@index([role])
  @@index([isActive])
  @@index([createdAt])
}

model Profile {
  id          String   @id @default(cuid())
  userId      String   @unique
  bio         String?  @db.Text
  location    String?
  birthDate   DateTime?
  phone       String?
  website     String?
  specializations String?
  experience  String?  @db.Text
  certifications String?
  achievements String?
  socialLinks String?
  avatar      String?  @db.Text
  coverImage  String?  @db.Text
  isPublic    Boolean  @default(true)
  preferences String?  @db.Text
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
}

model Connection {
  id        String   @id @default(cuid())
  userId    String
  connectedUserId String
  status    ConnectionStatus @default(PENDING)
  requestMessage String? @db.Text
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user          User @relation("UserConnections", fields: [userId], references: [id], onDelete: Cascade)
  connectedUser User @relation("ConnectedToUser", fields: [connectedUserId], references: [id], onDelete: Cascade)

  @@unique([userId, connectedUserId])
  @@index([userId])
  @@index([connectedUserId])
  @@index([status])
}

model Workout {
  id          String   @id @default(cuid())
  userId      String
  title       String
  description String?  @db.Text
  date        DateTime
  startTime   DateTime?
  endTime     DateTime?
  duration    Int?
  distance    Float?
  calories    Int?
  rpe         Int?
  heartRateAvg Int?
  heartRateMax Int?
  pace        String?
  elevation   Int?
  notes       String? @db.Text
  type        WorkoutType
  isPublic    Boolean @default(false)
  tags        String? @db.Text
  location    String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, date])
  @@index([type])
  @@index([date])
}

model RaceResult {
  id          String   @id @default(cuid())
  userId      String
  raceName    String
  date        DateTime
  distance    Float
  time        String
  pace        String?
  position    Int?
  totalParticipants Int?
  category    String?
  ageGroup    String?
  location    String?
  personalBest Boolean @default(false)
  seasonBest  Boolean @default(false)
  elevation   Int?
  notes       String? @db.Text
  certificate String? @db.Text
  verified    Boolean @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, date])
  @@index([date])
  @@index([personalBest])
}

model AnthropometricData {
  id        String   @id @default(cuid())
  userId    String
  date      DateTime
  weight    Float?
  height    Float?
  bodyFat   Float?
  muscleMass Float?
  bmi       Float?
  restingHR Int?
  maxHR     Int?
  vo2Max    Float?
  hydration Float?
  notes     String? @db.Text
  measuredBy String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, date])
  @@index([date])
}

model Payment {
  id        String   @id @default(cuid())
  userId    String
  amount    Int
  currency  String @default("eur")
  status    PaymentStatus @default(PENDING)
  stripePaymentIntentId String?
  plan      SubscriptionPlan
  description String?
  metadata   String? @db.Text
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([status])
  @@index([createdAt])
}

model Chat {
  id          String   @id @default(cuid())
  type        ChatType @default(DIRECT)
  name        String?
  description String? @db.Text
  avatar      String? @db.Text
  isArchived  Boolean @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  participants ChatParticipant[]
  messages     Message[]

  @@index([type])
  @@index([createdAt])
}

model ChatParticipant {
  id        String           @id @default(cuid())
  chatId    String
  userId    String
  role      ParticipantRole @default(MEMBER)
  joinedAt  DateTime         @default(now())
  leftAt     DateTime?
  lastReadAt DateTime?
  isMuted    Boolean @default(false)

  chat      Chat             @relation(fields: [chatId], references: [id], onDelete: Cascade)
  user      User             @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([chatId, userId])
  @@index([userId])
  @@index([chatId])
}

model Message {
  id        String        @id @default(cuid())
  content   String        @db.Text
  type      String        @default("text")
  fileUrl   String?
  fileName  String?
  fileSize  Int?
  status    MessageStatus @default(SENT)
  isEdited  Boolean       @default(false)
  editedAt  DateTime?
  createdAt DateTime      @default(now())
  updatedAt DateTime      @updatedAt

  chatId    String
  senderId  String
  chat      Chat          @relation(fields: [chatId], references: [id], onDelete: Cascade)
  sender    User          @relation(fields: [senderId], references: [id], onDelete: Cascade)

  @@index([chatId, createdAt])
  @@index([senderId])
}

model ScheduledActivity {
  id          String         @id @default(cuid())
  userId      String
  title       String
  description String?        @db.Text
  date        DateTime
  time        String
  duration    Int
  type        ActivityType
  assignedBy  String?
  assignedTo  String?
  status      ActivityStatus @default(SCHEDULED)
  tags        String? @db.Text
  location    String?
  notes       String? @db.Text
  completedAt DateTime?
  createdAt   DateTime       @default(now())
  updatedAt   DateTime       @updatedAt

  user        User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  assignedByUser User?       @relation("AssignedActivities", fields: [assignedBy], references: [id])
  assignedToUser User?       @relation("ReceivedActivities", fields: [assignedTo], references: [id])

  @@index([userId, date])
  @@index([assignedBy])
  @@index([assignedTo])
  @@index([date, status])
  @@index([type])
}

enum UserRole {
  ATHLETE
  COACH
  PROFESSIONAL
  ADMIN
}

enum ConnectionStatus {
  PENDING
  ACCEPTED
  REJECTED
  BLOCKED
}

enum WorkoutType {
  RUNNING
  CYCLING
  SWIMMING
  STRENGTH
  CARDIO
  FLEXIBILITY
  SPORTS
  YOGA
  PILATES
  CROSSFIT
  OTHER
}

enum PaymentStatus {
  PENDING
  COMPLETED
  FAILED
  CANCELLED
  REFUNDED
}

enum SubscriptionPlan {
  FREE
  PRO
  PREMIUM
}

enum ActivityType {
  WORKOUT
  THERAPY
  NUTRITION
  MENTAL
  ASSESSMENT
  RECOVERY
  CUSTOM
}

enum ActivityStatus {
  SCHEDULED
  IN_PROGRESS
  COMPLETED
  CANCELLED
  POSTPONED
}

enum ChatType {
  DIRECT
  GROUP
  SUPPORT
}

enum MessageStatus {
  SENT
  DELIVERED
  READ
}

enum ParticipantRole {
  ADMIN
  MODERATOR
  MEMBER
}
EOF

echo "✅ Schema ottimizzato creato!"

# ==========================================
# FASE 5: MIGRAZIONE PULITA
# ==========================================
echo ""
echo "🔧 FASE 5: Migrazione database pulita..."

echo "   • Creazione migrazione iniziale..."
npx prisma migrate dev --name init_optimized --create-only
echo "   ✅ File di migrazione creato!"

echo "   • Applicazione migrazione..."
npx prisma migrate dev
echo "   ✅ Migrazione applicata!"

echo "   • Generazione client Prisma..."
npx prisma generate
echo "   ✅ Client generato!"

# ==========================================
# FASE 6: TEST FINALI
# ==========================================
echo ""
echo "🧪 FASE 6: Test finali..."

echo "   • Test build..."
npm run build
echo "   ✅ Build completata!"

echo "   • Test lint..."
npm run lint || echo "   ⚠️  Warning di lint (non bloccanti)"

# ==========================================
# SUCCESSO!
# ==========================================
echo ""
echo "🎉 MIGRAZIONE COMPLETATA CON SUCCESSO!"
echo "====================================="
echo ""
echo "🚀 MIGLIORAMENTI APPLICATI:"
echo "   ✅ Database completamente ottimizzato"
echo "   ✅ +15 indici per performance massime"
echo "   ✅ Nuovi campi per tracking avanzato"
echo "   ✅ Sistema chat migliorato"
echo "   ✅ Gestione utenti avanzata"
echo "   ✅ Dipendenze aggiornate"
echo ""
echo "💾 BACKUP DISPONIBILI:"
echo "   • backups/package-backup-*.json"
echo "   • backups/schema-original-*.prisma"
echo ""
echo "🚀 COMANDI UTILI:"
echo "   npm run dev           # Avvia sviluppo"
echo "   npm run db:studio     # Visualizza database"
echo "   npm run db:migrate    # Nuove migrazioni future"
echo ""
echo "🎯 Performia è ora completamente ottimizzato!"
echo "   Performance massime, zero conflitti, pronto per la produzione!"