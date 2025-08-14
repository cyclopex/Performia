# 📸 Sistema di Upload Immagini Profilo - Performia

## 🎯 Panoramica

Il sistema di upload delle immagini per il profilo permette agli utenti di:
- **Cambiare la foto del profilo** (avatar)
- **Cambiare l'immagine di copertina** (cover image)
- **Resize automatico** delle immagini per ottimizzare le prestazioni
- **Validazione file** con controlli di sicurezza

## 🚀 Funzionalità

### ✨ Caratteristiche Principali
- **Drag & Drop**: Trascina immagini direttamente nell'area di upload
- **Preview**: Anteprima immediata prima del salvataggio
- **Resize Automatico**: 
  - Avatar: 400x400px (quadrato)
  - Cover: 1200x400px (landscape)
- **Validazione**: Controllo tipo, dimensione e formato file
- **Responsive**: Design ottimizzato per mobile e desktop

### 🔒 Sicurezza
- **Autenticazione**: Solo utenti loggati possono modificare il proprio profilo
- **Validazione File**: Controllo tipo MIME e dimensione massima (5MB)
- **Sanitizzazione**: Resize automatico per prevenire file troppo grandi
- **Formati Supportati**: JPG, PNG, GIF, WebP

## 🛠️ Installazione

### 1. Dipendenze
```bash
npm install sharp
```

### 2. Configurazione Next.js
Il file `next.config.js` è già configurato per supportare le immagini base64.

### 3. Variabili d'Ambiente
Aggiungi al file `.env.local`:
```env
# Image Upload (opzionale)
MAX_FILE_SIZE="5242880" # 5MB in bytes
ALLOWED_IMAGE_TYPES="image/jpeg,image/png,image/gif,image/webp"
```

## 📁 Struttura File

```
├── app/api/users/profile/upload-image/
│   └── route.ts                 # API per l'upload
├── components/
│   └── ImageUploadModal.tsx     # Modale di upload
├── lib/
│   ├── imageUtils.ts            # Utilità per le immagini
│   └── hooks/
│       └── useImageUpload.ts    # Hook personalizzato
└── app/profile/
    └── page.tsx                 # Pagina profilo aggiornata
```

## 🔧 Utilizzo

### 1. Nel Componente Profilo
```tsx
import ImageUploadModal from '@/components/ImageUploadModal'

// Stati per i modali
const [showAvatarModal, setShowAvatarModal] = useState(false)
const [showCoverModal, setShowCoverModal] = useState(false)

// Funzione per aggiornare le immagini
const handleImageUpdate = (imageUrl: string, type: 'avatar' | 'cover') => {
  // Aggiorna lo stato locale
  setUserData(prev => ({
    ...prev,
    profile: {
      ...prev.profile,
      [type === 'avatar' ? 'avatar' : 'coverImage']: imageUrl
    }
  }))
}

// Pulsanti di modifica
<button onClick={() => setShowAvatarModal(true)}>
  <Edit className="w-4 h-4" />
</button>

// Modali
{showAvatarModal && (
  <ImageUploadModal
    isOpen={showAvatarModal}
    onClose={() => setShowAvatarModal(false)}
    type="avatar"
    currentImage={userData?.profile?.avatar}
    onImageUpdate={(imageUrl) => handleImageUpdate(imageUrl, 'avatar')}
  />
)}
```

### 2. Hook Personalizzato
```tsx
import { useImageUpload } from '@/lib/hooks/useImageUpload'

const { isUploading, uploadImage } = useImageUpload()

const handleUpload = async (file: File) => {
  try {
    const imageUrl = await uploadImage(file, 'avatar')
    // Gestisci il successo
  } catch (error) {
    // Gestisci l'errore
  }
}
```

## 🎨 Personalizzazione

### Stili CSS
Il componente utilizza Tailwind CSS e può essere personalizzato modificando le classi:

```tsx
// Esempio personalizzazione colori
className="bg-custom-primary hover:bg-custom-primary-dark"
```

### Dimensioni Immagini
Per modificare le dimensioni di resize, aggiorna l'API:

```tsx
// app/api/users/profile/upload-image/route.ts
if (type === 'avatar') {
  resizedImage = await sharp(imageBuffer)
    .resize(500, 500, { // Modifica qui
      fit: 'cover',
      position: 'center'
    })
    .jpeg({ quality: 90 }) // Modifica qualità
    .toBuffer()
}
```

## 🔍 Debug e Troubleshooting

### Log API
L'API registra errori nella console del server:
```bash
# Controlla i log del server
npm run dev
```

### Validazione Client
Il componente mostra errori di validazione:
- Dimensione file > 5MB
- Tipo file non supportato
- Errori di upload

### Problemi Comuni
1. **Sharp non installato**: `npm install sharp`
2. **Permessi file**: Verifica che la cartella `uploads` sia scrivibile
3. **Formato immagine**: Assicurati che sia JPG, PNG, GIF o WebP

## 📱 Responsive Design

Il sistema è ottimizzato per:
- **Desktop**: Modale a schermo intero con preview grandi
- **Tablet**: Modale adattivo con dimensioni intermedie
- **Mobile**: Modale ottimizzato per touch con pulsanti grandi

## 🚀 Performance

### Ottimizzazioni
- **Resize automatico**: Immagini ridimensionate prima del salvataggio
- **Formato JPEG**: Qualità 85% per bilanciare qualità e dimensione
- **Lazy loading**: Immagini caricate solo quando necessario
- **Caching**: Aggiornamento stato locale per UI reattiva

### Metriche
- **Avatar**: 400x400px, ~50-100KB
- **Cover**: 1200x400px, ~100-200KB
- **Tempo upload**: < 2 secondi per immagini < 1MB

## 🔮 Roadmap

### Funzionalità Future
- [ ] **CDN Integration**: Salvataggio su servizi cloud (AWS S3, Cloudinary)
- [ ] **Compressione Avanzata**: Algoritmi di compressione intelligenti
- [ ] **Crop Interattivo**: Selezione area di ritaglio personalizzata
- [ ] **Filtri Immagine**: Applicazione filtri e effetti
- [ ] **Batch Upload**: Upload multiplo di immagini

### Miglioramenti
- [ ] **WebP Support**: Conversione automatica in WebP per browser moderni
- [ ] **Progressive JPEG**: Caricamento progressivo per grandi immagini
- [ ] **Lazy Loading**: Caricamento differito per migliorare performance

## 📞 Supporto

Per problemi o domande:
1. **Controlla i log** del server e del browser
2. **Verifica le dipendenze** con `npm list sharp`
3. **Testa con file diversi** per isolare il problema
4. **Controlla la console** per errori JavaScript

---

**Sistema pronto per la produzione! 🎉**
