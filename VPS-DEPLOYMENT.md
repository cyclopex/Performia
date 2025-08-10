# 🚀 Deployment Performia Database su VPS

## 📋 Prerequisiti

- VPS con Docker e Docker Compose installati
- Accesso SSH al VPS
- Porta 3306 (MySQL) e 8080 (PhpMyAdmin) aperte

## 🐳 Setup Database con Docker

### 1. Copia i file sul VPS

```bash
# Sul tuo computer locale
scp docker-compose.yml init.sql deploy-vps.sh user@your_vps_ip:/tmp/

# Sul VPS
ssh user@your_vps_ip
```

### 2. Esegui lo script di deployment

```bash
cd /tmp
chmod +x deploy-vps.sh
./deploy-vps.sh
```

### 3. Configura le password

Modifica il file `.env.docker` con password sicure:

```bash
nano /opt/sportlinkedin/.env.docker
```

### 4. Riavvia i container

```bash
cd /opt/sportlinkedin
docker-compose down
docker-compose up -d
```

## 🔧 Configurazione Locale

### 1. Aggiorna .env.local

```bash
# Nel tuo progetto locale
DATABASE_URL="mysql://sportlinkedin_user:your_password@your_vps_ip:3306/sportlinkedin"
```

### 2. Installa mysql2

```bash
npm install mysql2
```

### 3. Genera e push del database

```bash
npx prisma generate
npx prisma db push
```

## 📊 Accesso PhpMyAdmin

- **URL**: `http://your_vps_ip:8080`
- **Database**: `performia`
- **User**: `performia_user`
- **Password**: `your_password`

## 🔒 Sicurezza

### Firewall (UFW)

```bash
# Sul VPS
sudo ufw allow 3306/tcp
sudo ufw allow 8080/tcp
sudo ufw enable
```

### Password Sicure

- Usa password complesse (minimo 12 caratteri)
- Cambia le password di default
- Usa password diverse per root e user

## 🐛 Troubleshooting

### Container non si avvia

```bash
# Controlla i log
docker-compose logs mariadb

# Riavvia i container
docker-compose restart
```

### Connessione rifiutata

```bash
# Verifica che le porte siano aperte
sudo netstat -tlnp | grep :3306
sudo netstat -tlnp | grep :8080
```

### Database non trovato

```bash
# Entra nel container
docker exec -it sportlinkedin_db mysql -u root -p

# Crea il database manualmente
CREATE DATABASE sportlinkedin;
```

## 📈 Monitoraggio

### Comandi utili

```bash
# Stato container
docker-compose ps

# Log in tempo reale
docker-compose logs -f

# Backup database
docker exec sportlinkedin_db mysqldump -u root -p sportlinkedin > backup.sql

# Restore database
docker exec -i sportlinkedin_db mysql -u root -p sportlinkedin < backup.sql
```

## 🎯 Prossimi Passi

1. ✅ Database configurato
2. 🔄 Testa la connessione
3. 📊 Popola con dati di test
4. 🚀 Deploy dell'applicazione
