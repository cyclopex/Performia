'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { 
  User, 
  Calendar, 
  MapPin, 
  Trophy, 
  Target, 
  Activity, 
  Edit,
  Settings,
  TrendingUp,
  Clock,
  Zap,
  BarChart3
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts'
import Navbar from '@/components/layout/Navbar'
import Button from '@/components/ui/Button'

interface ProfileData {
  id: string
  userId: string
  bio?: string
  location?: string
  birthDate?: string
  specializations?: string
  experience?: string
  certifications?: string
  achievements?: string
  avatar?: string
  coverImage?: string
  height?: string
  weight?: string
  gender?: string
  dominantHand?: string
  sports?: string[] | string
  sportLevel?: string
  yearsExperience?: string
  sportGoals?: string
  trainingAvailability?: string[] | string
  trainingFrequency?: string
}

interface UserData {
  id: string
  name: string
  email: string
  role: string
  isApproved: boolean
  createdAt: string
  profile: ProfileData
}

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const [userData, setUserData] = useState<UserData | null>(null)
  
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session) {
      redirect('/auth/login')
    }

    fetchUserProfile()
  }, [session, status])

  const fetchUserProfile = async () => {
    try {
      const response = await fetch('/api/users/profile')
      if (response.ok) {
        const data = await response.json()
        setUserData(data)
      }
    } catch (error) {
      console.error('Errore nel caricamento del profilo:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
        </div>
      </div>
    )
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Profilo non trovato</h2>
            <p className="text-gray-600">Impossibile caricare i dati del profilo</p>
          </div>
        </div>
      </div>
    )
  }

  // Dati mock per i grafici
  const performanceData = [
    { month: 'Gen', performance: 85 },
    { month: 'Feb', performance: 88 },
    { month: 'Mar', performance: 92 },
    { month: 'Apr', performance: 89 },
    { month: 'Mag', performance: 95 },
    { month: 'Giu', performance: 91 }
  ]

  const sportDistribution = [
    { name: 'Atletica', value: 40, color: '#3B82F6' },
    { name: 'Nuoto', value: 25, color: '#10B981' },
    { name: 'Ciclismo', value: 20, color: '#F59E0B' },
    { name: 'Altri', value: 15, color: '#8B5CF6' }
  ]

  const weeklyProgress = [
    { day: 'Lun', km: 12, tempo: 45 },
    { day: 'Mar', km: 8, tempo: 32 },
    { day: 'Mer', km: 15, tempo: 58 },
    { day: 'Gio', km: 10, tempo: 38 },
    { day: 'Ven', km: 18, tempo: 72 },
    { day: 'Sab', km: 20, tempo: 78 },
    { day: 'Dom', km: 0, tempo: 0 }
  ]

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Non specificata'
    return new Date(dateString).toLocaleDateString('it-IT', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const calculateAge = (birthDate: string) => {
    if (!birthDate) return 'Non specificata'
    const today = new Date()
    const birth = new Date(birthDate)
    const age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      return age - 1
    }
    return age
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header del profilo */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-8">
          {/* Cover image */}
          <div className="h-48 bg-gradient-to-r from-primary-600 to-primary-800 relative">
            {userData.profile.coverImage && (
              <Image 
                src={userData.profile.coverImage} 
                alt="Cover" 
                className="w-full h-full object-cover" width={400} height={300}
              />
            )}
            <div className="absolute inset-0 bg-black bg-opacity-30"></div>
          </div>
          
          {/* Profile info */}
          <div className="relative px-8 pb-8">
            <div className="flex flex-col md:flex-row items-start md:items-end gap-6">
              {/* Avatar */}
              <div className="relative -mt-20">
                <div className="w-40 h-40 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center text-white text-6xl font-bold shadow-xl border-4 border-white">
                  {userData.profile.avatar ? (
                    <Image 
                      src={userData.profile.avatar} 
                      alt="Avatar" 
                      className="w-full h-full rounded-full object-cover" width={160} height={160}
                    />
                  ) : (
                    userData.name.charAt(0).toUpperCase()
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute bottom-2 right-2 bg-white shadow-lg"
                  onClick={() => {}}
                >
                  <Edit className="w-4 h-4" />
                </Button>
              </div>
              
              {/* Info principali */}
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-4xl font-bold text-gray-900 mb-2">{userData.name}</h1>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-gray-600">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-primary-600" />
                    <span className="capitalize">{userData.role.toLowerCase()}</span>
                  </div>
                  {userData.profile.birthDate && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-primary-600" />
                      <span>{calculateAge(userData.profile.birthDate)} anni</span>
                    </div>
                  )}
                  {userData.profile.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-primary-600" />
                      <span>{userData.profile.location}</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Azioni */}
              <div className="flex gap-3">
                <Button variant="outline">
                  <Settings className="w-4 h-4 mr-2" />
                  Impostazioni
                </Button>
                <Button>
                  <Edit className="w-4 h-4 mr-2" />
                  Modifica Profilo
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Colonna sinistra - Dati personali */}
          <div className="lg:col-span-1 space-y-6">
            {/* Informazioni personali */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-primary-600" />
                Informazioni Personali
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Nome</span>
                  <span className="font-medium">{userData.name}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Ruolo</span>
                  <span className="font-medium capitalize">{userData.role.toLowerCase()}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Data di nascita</span>
                  <span className="font-medium">{formatDate(userData.profile.birthDate || '')}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Età</span>
                  <span className="font-medium">{calculateAge(userData.profile.birthDate || '')} anni</span>
                </div>
                {userData.profile.location && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Località</span>
                    <span className="font-medium">{userData.profile.location}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Dati fisici */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary-600" />
                Dati Fisici
              </h3>
              <div className="space-y-4">
                {userData.profile.height && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Altezza</span>
                    <span className="font-medium">{userData.profile.height} cm</span>
                  </div>
                )}
                {userData.profile.weight && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Peso</span>
                    <span className="font-medium">{userData.profile.weight} kg</span>
                  </div>
                )}
                {userData.profile.gender && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Sesso</span>
                    <span className="font-medium capitalize">{userData.profile.gender.toLowerCase()}</span>
                  </div>
                )}
                {userData.profile.dominantHand && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Mano dominante</span>
                    <span className="font-medium capitalize">{userData.profile.dominantHand.toLowerCase()}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Sport praticati */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-primary-600" />
                Sport Praticati
              </h3>
              <div className="space-y-4">
                {/* Gestisce il campo sports che potrebbe essere stringa o array */}
                {(() => {
                  const sportsData = userData.profile.sports
                  if (!sportsData) {
                    return <p className="text-gray-500 text-center py-4">Nessuno sport specificato</p>
                  }
                  
                  // Se è un array, lo usa direttamente
                  if (Array.isArray(sportsData)) {
                    if (sportsData.length === 0) {
                      return <p className="text-gray-500 text-center py-4">Nessuno sport specificato</p>
                    }
                    return (
                      <div className="space-y-3">
                        {sportsData.map((sport, index) => (
                          <div key={index} className="flex items-center gap-3 p-3 bg-primary-50 rounded-lg">
                            <div className="w-3 h-3 bg-primary-600 rounded-full"></div>
                            <span className="font-medium">{sport}</span>
                          </div>
                        ))}
                      </div>
                    )
                  }
                  
                  // Se è una stringa, la converte in array
                  if (typeof sportsData === 'string' && sportsData.trim() !== '') {
                    return (
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 p-3 bg-primary-50 rounded-lg">
                          <div className="w-3 h-3 bg-primary-600 rounded-full"></div>
                          <span className="font-medium">{sportsData}</span>
                        </div>
                      </div>
                    )
                  }
                  
                  return <p className="text-gray-500 text-center py-4">Nessuno sport specificato</p>
                })()}
                {userData.profile.sportLevel && (
                  <div className="mt-4 p-3 bg-gradient-to-r from-primary-50 to-blue-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="w-4 h-4 text-primary-600" />
                      <span className="font-medium">Livello</span>
                    </div>
                    <span className="text-primary-700 capitalize">{userData.profile.sportLevel.toLowerCase()}</span>
                  </div>
                )}
                {userData.profile.yearsExperience && (
                  <div className="mt-4 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4 text-green-600" />
                      <span className="font-medium">Esperienza</span>
                    </div>
                    <span className="text-green-700">{userData.profile.yearsExperience} anni</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Colonna destra - Grafici e statistiche */}
          <div className="lg:col-span-2 space-y-6">
            {/* Performance Overview */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary-600" />
                Andamento Performance
              </h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="performance" 
                      stroke="#3b82f6" 
                      strokeWidth={3}
                      dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                      name="Performance %"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Grafici multipli */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Distribuzione sport */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-primary-600" />
                  Distribuzione Sport
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={sportDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {sportDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap gap-2 mt-4">
                  {sportDistribution.map((sport, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: sport.color }}
                      ></div>
                      <span className="text-sm text-gray-600">{sport.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Progresso settimanale */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-primary-600" />
                  Progresso Settimanale
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklyProgress}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="day" stroke="#6b7280" />
                      <YAxis stroke="#6b7280" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px'
                        }}
                      />
                      <Bar dataKey="km" fill="#10b981" name="Km" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="tempo" fill="#f59e0b" name="Minuti" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Obiettivi e preferenze */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-primary-600" />
                Obiettivi e Preferenze
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Obiettivi Sportivi</h4>
                  {userData.profile.sportGoals ? (
                    <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">{userData.profile.sportGoals}</p>
                  ) : (
                    <p className="text-gray-500 italic">Nessun obiettivo specificato</p>
                  )}
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Disponibilità Allenamento</h4>
                  {(() => {
                    const availabilityData = userData.profile.trainingAvailability
                    if (!availabilityData) {
                      return <p className="text-gray-500 italic">Non specificata</p>
                    }
                    
                    // Se è un array, lo usa direttamente
                    if (Array.isArray(availabilityData)) {
                      if (availabilityData.length === 0) {
                        return <p className="text-gray-500 italic">Non specificata</p>
                      }
                      return (
                        <div className="space-y-2">
                          {availabilityData.map((time, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                              <span className="text-gray-600">{time}</span>
                            </div>
                          ))}
                        </div>
                      )
                    }
                    
                    // Se è una stringa, la converte in array
                    if (typeof availabilityData === 'string' && availabilityData.trim() !== '') {
                      return (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                            <span className="text-gray-600">{availabilityData}</span>
                          </div>
                        </div>
                      )
                    }
                    
                    return <p className="text-gray-500 italic">Non specificata</p>
                  })()}
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Frequenza Allenamento</h4>
                  {userData.profile.trainingFrequency ? (
                    <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">{userData.profile.trainingFrequency}</p>
                  ) : (
                    <p className="text-gray-500 italic">Non specificata</p>
                  )}
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Certificazioni</h4>
                  {userData.profile.certifications ? (
                    <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">{userData.profile.certifications}</p>
                  ) : (
                    <p className="text-gray-500 italic">Nessuna certificazione</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
