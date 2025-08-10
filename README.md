# 🏃‍♂️ Atletic - Piattaforma di Gestione Sportiva

**Atletic** è un'applicazione web moderna per la gestione completa delle attività sportive, allenamenti e connessioni tra atleti e coach.

## ✨ Caratteristiche Principali

### 🎯 Dashboard Completa
- **Panoramica Performance**: Visualizzazione grafici e statistiche personali
- **Calendario Attività**: Pianificazione e gestione allenamenti
- **Metriche Antropometriche**: Monitoraggio progressi fisici
- **Sistema di Connessioni**: Networking tra atleti e coach

### 🏋️‍♂️ Gestione Allenamenti
- **Pianificazione**: Creazione programmi di allenamento personalizzati
- **Tracking**: Monitoraggio durata, distanza, calorie e RPE
- **Tipologie**: Supporto per running, cycling, swimming, strength training
- **Stato**: Gestione allenamenti pianificati, completati o cancellati

### 🏆 Sistema Gare
- **Registrazione Risultati**: Tracking performance competitive
- **Tipologie Eventi**: Race, competition, time trial, fun run
- **Statistiche**: Posizionamento e confronto con altri partecipanti
- **Note Personali**: Documentazione esperienze competitive

### 📊 Dati Antropometrici
- **Monitoraggio Fisico**: Peso, massa muscolare, grasso corporeo
- **Misure**: Torace, vita, fianchi, braccia, gambe
- **BMI**: Calcolo automatico indice massa corporea
- **Trend**: Visualizzazione progressi nel tempo

### 💬 Sistema Chat
- **Comunicazione Diretta**: Chat private tra utenti
- **Gestione Connessioni**: Richieste e accettazioni
- **Ricerca Utenti**: Trovare e connettersi con altri atleti
- **Supporto File**: Condivisione immagini e documenti

## 🚀 Tecnologie Utilizzate

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Database**: Prisma ORM con database relazionale
- **Autenticazione**: NextAuth.js
- **Icons**: Lucide React
- **Deployment**: Docker, VPS

## 📋 Prerequisiti

- Node.js 18+ 
- npm o yarn
- Database (PostgreSQL/MySQL)
- Docker (opzionale per deployment)

## 🛠️ Installazione

### 1. Clona il Repository
```bash
git clone <repository-url>
cd Atletic
```

### 2. Installa Dipendenze
```bash
npm install
```

### 3. Configurazione Ambiente
```bash
cp env.example .env.local
# Modifica .env.local con le tue configurazioni
```

### 4. Setup Database
```bash
npx prisma generate
npx prisma db push
```

### 5. Avvia l'Applicazione
```bash
npm run dev
```

L'applicazione sarà disponibile su `http://localhost:3000`

## 🔧 Script Disponibili

- `npm run dev` - Avvia server di sviluppo
- `npm run build` - Build per produzione
- `npm run start` - Avvia server di produzione
- `npm run lint` - Controllo codice
- `npm run type-check` - Verifica TypeScript

## 📁 Struttura Progetto

```
Atletic/
├── app/                    # App Router Next.js
│   ├── api/               # API Routes
│   ├── auth/              # Pagine autenticazione
│   ├── dashboard/         # Dashboard principale
│   ├── workouts/          # Gestione allenamenti
│   └── chat/              # Sistema chat
├── components/            # Componenti React riutilizzabili
│   ├── ui/               # Componenti UI base
│   ├── layout/           # Componenti layout
│   └── modals/           # Modali applicazione
├── lib/                   # Utility e configurazioni
├── prisma/               # Schema database
├── types/                # Definizioni TypeScript
└── public/               # Asset statici
```

## 🔐 Autenticazione

L'applicazione supporta diversi ruoli:
- **ADMIN**: Accesso completo a tutte le funzionalità
- **COACH**: Gestione atleti e programmi di allenamento
- **USER**: Atleta con accesso alle proprie attività

## 🚢 Deployment

### VPS con Docker
```bash
# Build e deploy
./deploy-vps.sh

# Oppure manualmente
docker-compose up -d
```

### Vercel
```bash
npm run build
vercel --prod
```

## 🤝 Contribuire

1. Fork del repository
2. Crea un branch per la feature (`git checkout -b feature/nuova-feature`)
3. Commit delle modifiche (`git commit -am 'Aggiunge nuova feature'`)
4. Push del branch (`git push origin feature/nuova-feature`)
5. Crea una Pull Request

## 📝 Licenza

Questo progetto è sotto licenza MIT. Vedi il file `LICENSE` per i dettagli.

## 📞 Supporto

Per supporto o domande:
- Apri una issue su GitHub
- Contatta il team di sviluppo

---

**Atletic** - Trasforma la tua passione sportiva in risultati concreti! 🎯 