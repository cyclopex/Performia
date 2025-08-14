# 💪 Performia Allenamenti - Roadmap di Sviluppo

## 📋 Panoramica

Questo documento definisce lo stato attuale, i miglioramenti necessari e la roadmap futura per la pagina Allenamenti di Performia. La pagina gestisce il tracking degli allenamenti, le statistiche di performance e la pianificazione degli esercizi.

---

## 🎯 **STATO ATTUALE - FUNZIONALITÀ IMPLEMENTATE**

### **✅ Gestione Allenamenti Base**
- [x] **CRUD Completo**: Creazione, lettura, aggiornamento e cancellazione allenamenti
- [x] **Tipi Allenamento**: RUNNING, JUDO, KARATE, WRESTLING, CYCLING, SWIMMING, STRENGTH, CARDIO, FLEXIBILITY, SPORTS, OTHE
- [x] **Dati Allenamento**: Titolo, descrizione, data, durata, distanza, calorie, RPE, note
- [x] **Validazione Input**: Schema Zod per validazione dati

### **✅ Interfaccia Utente**
- [x] **Lista Allenamenti**: Visualizzazione allenamenti con filtri
- [x] **Ricerca**: Ricerca testuale per titolo e descrizione
- [x] **Filtri**: Filtri per tipo di allenamento
- [x] **Azioni**: Edit e delete per ogni allenamento
- [x] **Form Aggiunta**: Modal per creare nuovi allenamenti

### **✅ API Endpoints**
- [x] **GET /api/workouts**: Recupera allenamenti con paginazione
- [x] **POST /api/workouts**: Crea nuovo allenamento
- [x] **PUT /api/workouts/[id]**: Aggiorna allenamento esistente
- [x] **DELETE /api/workouts/[id]**: Cancella allenamento

### **✅ Funzionalità Core**
- [x] **Paginazione**: Sistema di paginazione per liste lunghe
- [x] **Autenticazione**: Controllo accessi per utenti autenticati
- [x] **Validazione**: Controlli sui dati inseriti
- [x] **Gestione Errori**: Gestione base degli errori API

---

## 🚧 **MIGLIORAMENTI IMMEDIATI NECESSARI**

### **🔥 ALTA PRIORITÀ**

#### **1. Sostituzione Dati Mock**
- [ ] **Problema**: Pagina utilizza dati mock hardcoded
- [ ] **Soluzione**: Integrare dati reali dal database
- [ ] **File**: `app/workouts/page.tsx` (righe 40-80)
- [ ] **Implementazione**:
  ```typescript
  // Sostituire questi dati mock:
  const mockWorkouts: Workout[] = [/* dati fittizi */]
  
  // Con dati reali dal database:
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [isLoading, setIsLoading] = useState(false)
  
  const loadWorkouts = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/workouts')
      if (response.ok) {
        const data = await response.json()
        setWorkouts(data.workouts)
      }
    } catch (error) {
      console.error('Errore nel caricamento allenamenti:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])
  ```

#### **2. Gestione Stato e Performance**
- [ ] **Problema**: Caricamento dati senza ottimizzazioni
- [ ] **Soluzione**: Implementare React Query e caching
- [ ] **File**: `app/workouts/page.tsx`
- [ ] **Implementazione**:
  ```typescript
  // Hook personalizzato per allenamenti
  const { data: workoutsData, isLoading, error, refetch } = useQuery({
    queryKey: ['workouts', session?.user?.id],
    queryFn: () => fetchWorkouts(),
    staleTime: 5 * 60 * 1000, // 5 minuti
    refetchOnWindowFocus: false
  })
  
  // Mutazione per creare allenamento
  const createWorkoutMutation = useMutation({
    mutationFn: createWorkout,
    onSuccess: () => {
      queryClient.invalidateQueries(['workouts'])
      showFeedback('success', 'Allenamento creato con successo!')
    },
    onError: (error) => {
      showFeedback('error', `Errore: ${error.message}`)
    }
  })
  ```

#### **3. Filtri e Ricerca Avanzati**
- [ ] **Problema**: Filtri limitati e ricerca base
- [ ] **Soluzione**: Sistema filtri avanzati e ricerca intelligente
- [ ] **File**: `app/workouts/page.tsx`
- [ ] **Implementazione**:
  ```typescript
  // Filtri avanzati
  const [advancedFilters, setAdvancedFilters] = useState({
    dateRange: { start: null, end: null },
    duration: { min: 0, max: 300 },
    distance: { min: 0, max: 100 },
    intensity: 'ALL', // RPE range
    location: '',
    tags: []
  })
  
  // Ricerca con filtri
  const filteredWorkouts = useMemo(() => {
    return workouts.filter(workout => {
      const matchesSearch = workout.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (workout.description && workout.description.toLowerCase().includes(searchTerm.toLowerCase()))
      
      const matchesDate = !advancedFilters.dateRange.start || !advancedFilters.dateRange.end ||
                         (new Date(workout.date) >= advancedFilters.dateRange.start &&
                          new Date(workout.date) <= advancedFilters.dateRange.end)
      
      const matchesDuration = workout.duration >= advancedFilters.duration.min &&
                             workout.duration <= advancedFilters.duration.max
      
      const matchesType = filterType === 'ALL' || workout.type === filterType
      
      return matchesSearch && matchesDate && matchesDuration && matchesType
    })
  }, [workouts, searchTerm, filterType, advancedFilters])
  ```

### **🟡 MEDIA PRIORITÀ**

#### **4. Statistiche e Analytics**
- [x] **Problema**: Mancanza statistiche allenamenti
- [x] **Soluzione**: Dashboard con metriche e grafici
- [x] **File**: `app/workouts/page.tsx`
- [x] **Implementazione**:
  ```typescript
  // Statistiche allenamenti
  const workoutStats = useMemo(() => {
    const total = workouts.length
    const byType = workouts.reduce((acc, workout) => {
      acc[workout.type] = (acc[workout.type] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    const totalDuration = workouts.reduce((sum, w) => sum + w.duration, 0)
    const totalDistance = workouts.reduce((sum, w) => sum + (w.distance || 0), 0)
    const totalCalories = workouts.reduce((sum, w) => sum + (w.calories || 0), 0)
    const avgRPE = workouts.reduce((sum, w) => sum + (w.rpe || 0), 0) / workouts.length
    
    return {
      total,
      byType,
      totalDuration,
      totalDistance,
      totalCalories,
      avgRPE: Math.round(avgRPE * 10) / 10
    }
  }, [workouts])
  
  // Componente statistiche
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
    <StatCard title="Totale" value={workoutStats.total} icon={<Activity />} />
    <StatCard title="Durata Totale" value={`${workoutStats.totalDuration}h`} icon={<Clock />} />
    <StatCard title="Distanza Totale" value={`${workoutStats.totalDistance}km`} icon={<MapPin />} />
    <StatCard title="RPE Medio" value={workoutStats.avgRPE} icon={<Target />} />
  </div>
  ```

#### **5. Grafici e Visualizzazioni**
- [ ] **Problema**: Nessuna visualizzazione grafica dei dati
- [ ] **Soluzione**: Grafici per trend e distribuzioni
- [ ] **File**: `app/workouts/page.tsx`
- [ ] **Implementazione**:
  ```typescript
  // Grafici allenamenti
  const chartData = useMemo(() => {
    // Trend settimanale
    const weeklyData = workouts.reduce((acc, workout) => {
      const week = getWeekNumber(new Date(workout.date))
      if (!acc[week]) acc[week] = { week, count: 0, duration: 0, distance: 0 }
      acc[week].count++
      acc[week].duration += workout.duration
      acc[week].distance += workout.distance || 0
      return acc
    }, {} as Record<string, any>)
    
    // Distribuzione per tipo
    const typeData = Object.entries(workoutStats.byType).map(([type, count]) => ({
      type,
      count,
      percentage: Math.round((count / workoutStats.total) * 100)
    }))
    
    return { weeklyData: Object.values(weeklyData), typeData }
  }, [workouts, workoutStats])
  
  // Componente grafici
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
    <div className="bg-white rounded-xl shadow-sport p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Trend Settimanale</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData.weeklyData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="week" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="count" stroke="#3B82F6" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
    
    <div className="bg-white rounded-xl shadow-sport p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribuzione per Tipo</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie data={chartData.typeData} cx="50%" cy="50%" outerRadius={80} dataKey="count">
            {chartData.typeData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getTypeColor(entry.type)} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  </div>
  ```

#### **6. Sistema di Tag e Categorizzazione**
- [ ] **Problema**: Nessun sistema di tag per organizzare allenamenti
- [ ] **Soluzione**: Sistema tag e categorie personalizzabili
- [ ] **File**: `app/workouts/page.tsx`, `app/api/workouts/route.ts`
- [ ] **Implementazione**:
  ```typescript
  // Sistema tag
  const [availableTags, setAvailableTags] = useState<string[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  
  // Gestione tag
  const addTag = (tag: string) => {
    if (!availableTags.includes(tag)) {
      setAvailableTags(prev => [...prev, tag])
    }
    if (!selectedTags.includes(tag)) {
      setSelectedTags(prev => [...prev, tag])
    }
  }
  
  const removeTag = (tag: string) => {
    setSelectedTags(prev => prev.filter(t => t !== tag))
  }
  
  // Filtro per tag
  const workoutsWithTags = useMemo(() => {
    if (selectedTags.length === 0) return filteredWorkouts
    
    return filteredWorkouts.filter(workout => 
      selectedTags.some(tag => 
        workout.tags?.includes(tag) || 
        workout.title.toLowerCase().includes(tag.toLowerCase()) ||
        workout.description?.toLowerCase().includes(tag.toLowerCase())
      )
    )
  }, [filteredWorkouts, selectedTags])
  ```

### **🟢 BASSA PRIORITÀ**

#### **7. Pianificazione Allenamenti**
- [ ] **Problema**: Nessuna pianificazione futura degli allenamenti
- [ ] **Soluzione**: Calendario e pianificazione allenamenti
- [ ] **Implementazione**:
  ```typescript
  // Pianificazione allenamenti
  const [plannedWorkouts, setPlannedWorkouts] = useState<Workout[]>([])
  const [showPlanner, setShowPlanner] = useState(false)
  
  // Pianifica allenamento futuro
  const planWorkout = (workout: Omit<Workout, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    const plannedWorkout = {
      ...workout,
      status: 'PLANNED' as const,
      date: new Date(workout.date).toISOString()
    }
    
    setPlannedWorkouts(prev => [...prev, plannedWorkout])
    setShowPlanner(false)
  }
  ```

#### **8. Export e Condivisione**
- [ ] **Problema**: Nessuna possibilità di esportare o condividere allenamenti
- [ ] **Soluzione**: Export PDF/CSV e condivisione social
- [ ] **Implementazione**:
  ```typescript
  // Export allenamenti
  const exportWorkouts = async (format: 'pdf' | 'csv') => {
    try {
      const response = await fetch('/api/workouts/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ format, filters: advancedFilters })
      })
      
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `allenamenti-${new Date().toISOString().split('T')[0]}.${format}`
        a.click()
      }
    } catch (error) {
      console.error('Errore nell\'export:', error)
    }
  }
  ```

---

## 🚀 **ROADMAP FUTURA - FASI DI SVILUPPO**

### **📅 FASE 1: Ottimizzazioni Core (Settimane 1-2)**

#### **Obiettivi**
- Eliminare dati mock
- Implementare React Query
- Aggiungere statistiche base

#### **Deliverables**
- [ ] Dati reali dal database
- [ ] Hook personalizzati per allenamenti
- [ ] Statistiche base implementate
- [ ] Test unitari per logica

#### **File da Modificare**
- `app/workouts/page.tsx`
- `app/api/workouts/route.ts`
- `lib/hooks/useWorkouts.ts` (nuovo)
- `components/workouts/WorkoutStats.tsx` (nuovo)

### **📅 FASE 2: Analytics e Grafici (Settimane 3-4)**

#### **Obiettivi**
- Implementare grafici completi
- Aggiungere filtri avanzati
- Sistema tag e categorie

#### **Deliverables**
- [ ] Grafici interattivi completi
- [ ] Filtri avanzati funzionanti
- [ ] Sistema tag implementato
- [ ] UI/UX migliorata

#### **File da Modificare**
- `app/workouts/page.tsx`
- `components/workouts/WorkoutCharts.tsx` (nuovo)
- `components/workouts/AdvancedFilters.tsx` (nuovo)
- `components/workouts/TagSystem.tsx` (nuovo)

### **📅 FASE 3: Funzionalità Avanzate (Settimane 5-6)**

#### **Obiettivi**
- Pianificazione allenamenti
- Export e condivisione
- Integrazione con altri moduli

#### **Deliverables**
- [ ] Pianificatore allenamenti
- [ ] Sistema export completo
- [ ] Integrazione con dashboard
- [ ] API avanzate

#### **File da Modificare**
- `components/workouts/WorkoutPlanner.tsx` (nuovo)
- `components/workouts/ExportTools.tsx` (nuovo)
- `app/api/workouts/export/route.ts` (nuovo)
- `lib/utils/exportUtils.ts` (nuovo)

---

## 🛠️ **TECNOLOGIE E LIBRERIE DA IMPLEMENTARE**

### **Gestione Stato e Performance**
```bash
npm install @tanstack/react-query
npm install @tanstack/react-query-devtools
npm install react-window
```

### **Grafici e Visualizzazioni**
```bash
npm install recharts
npm install @types/recharts
npm install d3
```

### **Date e Filtri**
```bash
npm install date-fns
npm install react-datepicker
npm install @types/react-datepicker
```

### **Export e Utility**
```bash
npm install jspdf
npm install jspdf-autotable
npm install papaparse
```

---

## 📊 **METRICHE DI SUCCESSO**

### **Performance**
- [ ] Tempo caricamento allenamenti < 1 secondo
- [ ] Grafici renderizzati < 500ms
- [ ] Filtri applicati < 200ms

### **UX/UI**
- [ ] Interfaccia intuitiva e responsive
- [ ] Feedback visivo per tutte le azioni
- [ ] Loading states appropriati

### **Funzionalità**
- [ ] 0 dati mock nella pagina
- [ ] Statistiche complete e accurate
- [ ] Sistema tag funzionante

---

## 🔍 **CODICE DI RIFERIMENTO ATTUALI**

### **Dati Mock da Sostituire**
```typescript
// File: app/workouts/page.tsx (righe 40-80)
const mockWorkouts: Workout[] = [
  {
    id: '1',
    title: 'Corsa mattutina',
    description: 'Corsa leggera per riscaldamento',
    date: '2024-01-15T07:00:00Z',
    duration: 45,
    distance: 8.5,
    calories: 450,
    rpe: 7,
    type: 'RUNNING',
    notes: 'Giornata fresca, buona performance'
  },
  // ... altri dati fittizi
]
```

### **Gestione Stato Base**
```typescript
// File: app/workouts/page.tsx (righe 80-100)
const [workouts, setWorkouts] = useState<Workout[]>(mockWorkouts)
const [searchTerm, setSearchTerm] = useState('')
const [filterType, setFilterType] = useState('ALL')
```

### **API Endpoint Base**
```typescript
// File: app/api/workouts/route.ts (righe 30-60)
export async function GET(request: NextRequest) {
  const workouts = await prisma.workout.findMany({
    where: { userId: session.user.id },
    orderBy: { date: 'desc' },
    skip,
    take: limit,
  })
}
```

---

## 📝 **NOTE DI SVILUPPO**

### **Convenzioni di Codice**
- Utilizzare TypeScript strict mode
- Evitare il tipo `any` (preferire tipi specifici)
- Componenti funzionali con hooks
- Props interface per tutti i componenti
- Error boundaries per gestione errori

### **Struttura File Consigliata**
```
app/workouts/
├── page.tsx (componente principale)
├── components/
│   ├── WorkoutList.tsx
│   ├── WorkoutStats.tsx
│   ├── WorkoutCharts.tsx
│   ├── AdvancedFilters.tsx
│   └── TagSystem.tsx
├── hooks/
│   ├── useWorkouts.ts
│   └── useWorkoutActions.ts
└── utils/
    ├── workoutHelpers.ts
    ├── chartDataTransformers.ts
    └── exportUtils.ts
```

### **Testing Strategy**
- Test unitari per hooks e utility
- Test di integrazione per API
- Test E2E per flussi allenamenti
- Coverage target: >80%

---

## 🎯 **CONCLUSIONI**

La pagina Allenamenti di Performia ha una base solida ma richiede miglioramenti significativi per:

1. **Dati Reali**: Sostituire mock con dati dal database
2. **Performance**: Ottimizzare con React Query e caching
3. **Analytics**: Aggiungere statistiche e grafici completi
4. **Funzionalità**: Implementare tag, pianificazione e export

Questa roadmap fornisce un percorso chiaro per trasformare la pagina allenamenti in un sistema completo di tracking e analisi delle performance sportive.

---

*Ultimo aggiornamento: ${new Date().toLocaleDateString('it-IT')}*
*Versione documento: 1.0*
*Responsabile sviluppo: Team Performia*
