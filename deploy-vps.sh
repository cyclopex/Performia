#!/bin/bash

# Script per deployare Performia Database sul VPS
# Assicurati di avere Docker e Docker Compose installati sul VPS

echo "🚀 Deploying Performia Database on VPS..."

# 1. Crea directory per il progetto
mkdir -p /opt/performia
cd /opt/performia

# 2. Copia i file necessari (assumendo che siano già sul VPS)
# docker-compose.yml, init.sql, .env.docker

# 3. Crea file .env per Docker
cat > .env.docker << EOF
# Database Configuration
DB_ROOT_PASSWORD=your_secure_root_password_here
DB_NAME=performia
DB_USER=performia_user
DB_PASSWORD=your_secure_password_here

# Database URL for Prisma
DATABASE_URL="mysql://performia_user:your_secure_password_here@localhost:3306/performia"
EOF

echo "⚠️  IMPORTANTE: Modifica il file .env.docker con password sicure!"

# 4. Avvia i container
echo "🐳 Starting Docker containers..."
docker-compose -f docker-compose.yml --env-file .env.docker up -d

# 5. Aspetta che il database sia pronto
echo "⏳ Waiting for database to be ready..."
sleep 30

# 6. Verifica che tutto funzioni
echo "✅ Checking if containers are running..."
docker-compose ps

echo "🎉 Database deployment completed!"
echo ""
echo "📊 PhpMyAdmin available at: http://your_vps_ip:8080"
echo "🗄️  Database: performia"
echo "👤 User: performia_user"
echo ""
echo "🔧 Next steps:"
echo "1. Update your .env.local with the DATABASE_URL"
echo "2. Run: npx prisma db push"
echo "3. Run: npx prisma generate"
echo "4. Test the application"
