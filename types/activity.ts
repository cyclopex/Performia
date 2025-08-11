// Interfacce semplificate e standardizzate per le attività
export interface ScheduledActivity {
  id: string
  title: string
  description?: string
  date: string // Solo string per compatibilità HTML
  time: string
  duration: number
  type: 'WORKOUT' | 'THERAPY' | 'NUTRITION' | 'MENTAL' | 'ASSESSMENT' | 'CUSTOM'
  assignedBy?: string
  assignedTo?: string
  tags?: string[] // Opzionale per compatibilità
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED'
  userId: string
  createdAt: string
  updatedAt: string
}

export interface Workout {
  id: string
  title: string
  description?: string
  date: string
  duration: number
  distance?: number
  calories?: number
  rpe?: number
  notes?: string
  type: 'RUNNING' | 'CYCLING' | 'SWIMMING' | 'STRENGTH' | 'CARDIO' | 'FLEXIBILITY' | 'SPORTS' | 'OTHER'
  status: 'PLANNED' | 'COMPLETED' | 'CANCELLED'
  userId: string
  createdAt: string
  updatedAt: string
}

export interface RaceResult {
  id: string
  eventName: string
  eventType: 'RACE' | 'COMPETITION' | 'TIME_TRIAL' | 'FUN_RUN'
  date: string
  distance?: number
  time?: string
  position?: number
  totalParticipants?: number
  notes?: string
  userId: string
  createdAt: string
  updatedAt: string
}

export interface AnthropometricData {
  id: string
  date: string
  weight?: number
  bodyFat?: number
  muscleMass?: number
  bmi?: number
  chest?: number
  waist?: number
  hips?: number
  biceps?: number
  thighs?: number
  notes?: string
  userId: string
  createdAt: string
  updatedAt: string
}
