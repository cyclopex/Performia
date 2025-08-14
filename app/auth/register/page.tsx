'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Mail, Lock, User, Trophy, Users, Briefcase, Calendar, Phone, MapPin } from 'lucide-react'
import Button from '@/components/ui/Button'
import toast from 'react-hot-toast'

type UserRole = 'ATHLETE' | 'COACH' | 'PROFESSIONAL'

// Nuovi tipi per i dati sportivi

type FormData = {
  // Dati base
  name: string
  email: string
  password: string
  confirmPassword: string
  role: UserRole
  
  // Dati personali
  birthDate: string
  phone: string
  city: string
  
  // Dati fisici
  height: string
  weight: string
  gender: string
  dominantHand: string
  
  // Dati sportivi
  sports: string[]
  sportLevel: string
  yearsExperience: string
  
  // Preferenze
  sportGoals: string
  trainingAvailability: string[]
  trainingFrequency: string
}

export default function RegisterPage() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'ATHLETE',
    birthDate: '',
    phone: '',
    city: '',
    height: '',
    weight: '',
    gender: '',
    dominantHand: '',
    sports: [],
    sportLevel: '',
    yearsExperience: '',
    sportGoals: '',
    trainingAvailability: [],
    trainingFrequency: ''
  })

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [passwordMatch, setPasswordMatch] = useState<boolean | null>(null)
  const router = useRouter()

  // Lista degli sport disponibili
  const availableSports = [
    'Atletica leggera', 'Calcio', 'Basket', 'Tennis', 'Nuoto', 'Ciclismo',
    'Pallavolo', 'Rugby', 'Atletica pesante', 'Ginnastica', 'Boxe', 'Judo',
    'Karate', 'Taekwondo', 'Arrampicata', 'Sci', 'Snowboard', 'Surf',
    'Pallanuoto', 'Hockey', 'Baseball', 'Softball', 'Golf', 'Tennis tavolo',
    'Badminton', 'Squash', 'Paddle', 'Pallamano', 'Pallacanestro', 'Altro'
  ]

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    // Controllo in tempo reale per le password
    if (name === 'password' || name === 'confirmPassword') {
      const currentPassword = name === 'password' ? value : formData.password
      const currentConfirmPassword = name === 'confirmPassword' ? value : formData.confirmPassword
      
      if (currentPassword && currentConfirmPassword) {
        setPasswordMatch(currentPassword === currentConfirmPassword)
      } else {
        setPasswordMatch(null)
      }
    }
  }

  const handleSportChange = (sport: string) => {
    setFormData(prev => ({
      ...prev,
      sports: prev.sports.includes(sport)
        ? prev.sports.filter(s => s !== sport)
        : [...prev.sports, sport]
    }))
  }

  const handleAvailabilityChange = (time: string) => {
    setFormData(prev => ({
      ...prev,
      trainingAvailability: prev.trainingAvailability.includes(time)
        ? prev.trainingAvailability.filter(t => t !== time)
        : [...prev.trainingAvailability, time]
    }))
  }

  const nextStep = () => {
    if (currentStep === 1 && (!formData.name || !formData.email || !formData.password || !formData.confirmPassword)) {
      toast.error('Compila tutti i campi obbligatori')
      return
    }
    if (currentStep === 2 && (!formData.birthDate || !formData.sports.length)) {
      toast.error('Compila i dati personali e seleziona almeno uno sport')
      return
    }
    setCurrentStep(prev => Math.min(prev + 1, 3))
  }

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const handleSubmit = async () => {
    if (formData.password !== formData.confirmPassword) {
      toast.error('Le password non coincidono')
      return
    }

    if (formData.password.length < 6) {
      toast.error('La password deve essere di almeno 6 caratteri')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Registrazione completata! Ora puoi accedere.')
        router.push('/auth/login')
      } else {
        toast.error(data.error || 'Errore durante la registrazione')
      }
    } catch {
      toast.error('Errore durante la registrazione')
    } finally {
      setIsLoading(false)
    }
  }

  const roleOptions = [
    {
      value: 'ATHLETE',
      label: 'Atleta',
      description: 'Traccia allenamenti e connetti con coach',
      icon: Trophy,
    },
    {
      value: 'COACH',
      label: 'Coach',
      description: 'Gestisci atleti e programmi di allenamento',
      icon: Users,
    },
    {
      value: 'PROFESSIONAL',
      label: 'Professionista',
      description: 'Offri servizi specializzati (fisioterapia, nutrizione, etc.)',
      icon: Briefcase,
    },
  ]

  const renderStep1 = () => (
    <>
      {/* Role Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-4">
          Seleziona il tuo ruolo
        </label>
        <div className="grid md:grid-cols-3 gap-4">
          {roleOptions.map((role) => {
            const Icon = role.icon
            return (
              <label
                key={role.value}
                className={`relative cursor-pointer ${
                  formData.role === role.value
                    ? 'ring-2 ring-primary-500 bg-primary-50'
                    : 'bg-gray-50 hover:bg-gray-100'
                } rounded-xl p-4 transition-all duration-200`}
              >
                <input
                  type="radio"
                  name="role"
                  value={role.value}
                  checked={formData.role === role.value}
                  onChange={handleInputChange}
                  className="sr-only"
                />
                <div className="flex flex-col items-center text-center">
                  <Icon className="w-8 h-8 text-primary-600 mb-2" />
                  <span className="font-semibold text-gray-900">{role.label}</span>
                  <span className="text-sm text-gray-600 mt-1">{role.description}</span>
                </div>
              </label>
            )
          })}
        </div>
      </div>

      {/* Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
          Nome completo *
        </label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            required
            value={formData.name}
            onChange={handleInputChange}
            className="input-field pl-10"
            placeholder="Il tuo nome completo"
          />
        </div>
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
          Email *
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={formData.email}
            onChange={handleInputChange}
            className="input-field pl-10"
            placeholder="la-tua-email@esempio.com"
          />
        </div>
      </div>

      {/* Password */}
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
          Password *
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            required
            value={formData.password}
            onChange={handleInputChange}
            className="input-field pl-10 pr-10"
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Confirm Password */}
      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
          Conferma password *
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            id="confirmPassword"
            name="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            autoComplete="new-password"
            required
            value={formData.confirmPassword}
            onChange={handleInputChange}
            className={`input-field pl-10 pr-10 ${
              passwordMatch === true ? 'border-green-500' : 
              passwordMatch === false ? 'border-red-500' : ''
            }`}
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
        {passwordMatch !== null && (
          <div className={`mt-1 text-sm ${
            passwordMatch ? 'text-green-600' : 'text-red-600'
          }`}>
            {passwordMatch ? '✓ Le password coincidono' : '✗ Le password non coincidono'}
          </div>
        )}
      </div>
    </>
  )

  const renderStep2 = () => (
    <>
      {/* Data di nascita */}
      <div>
        <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700 mb-2">
          Data di nascita *
        </label>
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            id="birthDate"
            name="birthDate"
            type="date"
            required
            value={formData.birthDate}
            onChange={handleInputChange}
            className="input-field pl-10"
          />
        </div>
      </div>

      {/* Telefono */}
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
          Numero di telefono
        </label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            id="phone"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleInputChange}
            className="input-field pl-10"
            placeholder="+39 123 456 7890"
          />
        </div>
      </div>

      {/* Città */}
      <div>
        <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
          Città/Regione
        </label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            id="city"
            name="city"
            type="text"
            value={formData.city}
            onChange={handleInputChange}
            className="input-field pl-10"
            placeholder="La tua città"
          />
        </div>
      </div>

      {/* Sport praticati */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Sport praticati *
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-48 overflow-y-auto">
          {availableSports.map((sport) => (
            <label key={sport} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.sports.includes(sport)}
                onChange={() => handleSportChange(sport)}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700">{sport}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Livello sportivo */}
      <div>
        <label htmlFor="sportLevel" className="block text-sm font-medium text-gray-700 mb-2">
          Livello sportivo attuale
        </label>
        <select
          id="sportLevel"
          name="sportLevel"
          value={formData.sportLevel}
          onChange={handleInputChange}
          className="input-field"
        >
          <option value="">Seleziona livello</option>
          <option value="BEGINNER">Principiante</option>
          <option value="INTERMEDIATE">Intermedio</option>
          <option value="ADVANCED">Avanzato</option>
          <option value="EXPERT">Esperto</option>
        </select>
      </div>

      {/* Anni di esperienza */}
      <div>
        <label htmlFor="yearsExperience" className="block text-sm font-medium text-gray-700 mb-2">
          Anni di esperienza nello sport principale
        </label>
        <input
          id="yearsExperience"
          name="yearsExperience"
          type="number"
          min="0"
          max="50"
          value={formData.yearsExperience}
          onChange={handleInputChange}
          className="input-field"
          placeholder="0"
        />
      </div>
    </>
  )

  const renderStep3 = () => (
    <>
      {/* Dati fisici */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="height" className="block text-sm font-medium text-gray-700 mb-2">
            Altezza (cm)
          </label>
          <input
            id="height"
            name="height"
            type="number"
            min="100"
            max="250"
            value={formData.height}
            onChange={handleInputChange}
            className="input-field"
            placeholder="175"
          />
        </div>
        <div>
          <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-2">
            Peso (kg)
          </label>
          <input
            id="weight"
            name="weight"
            type="number"
            min="30"
            max="200"
            step="0.1"
            value={formData.weight}
            onChange={handleInputChange}
            className="input-field"
            placeholder="70.5"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-2">
            Sesso biologico
          </label>
          <select
            id="gender"
            name="gender"
            value={formData.gender}
            onChange={handleInputChange}
            className="input-field"
          >
            <option value="">Seleziona</option>
            <option value="MALE">Maschio</option>
            <option value="FEMALE">Femmina</option>
            <option value="OTHER">Altro</option>
            <option value="PREFER_NOT_TO_SAY">Preferisco non dire</option>
          </select>
        </div>
        <div>
          <label htmlFor="dominantHand" className="block text-sm font-medium text-gray-700 mb-2">
            Mano dominante
          </label>
          <select
            id="dominantHand"
            name="dominantHand"
            value={formData.dominantHand}
            onChange={handleInputChange}
            className="input-field"
          >
            <option value="">Seleziona</option>
            <option value="RIGHT">Destra</option>
            <option value="LEFT">Sinistra</option>
            <option value="AMBIDEXTROUS">Ambidestro</option>
          </select>
        </div>
      </div>

      {/* Obiettivi sportivi */}
      <div>
        <label htmlFor="sportGoals" className="block text-sm font-medium text-gray-700 mb-2">
          Obiettivi sportivi
        </label>
        <select
          id="sportGoals"
          name="sportGoals"
          value={formData.sportGoals}
          onChange={handleInputChange}
          className="input-field"
        >
          <option value="">Seleziona obiettivo</option>
          <option value="RECREATIONAL">Ricreativo</option>
          <option value="COMPETITIVE">Competitivo</option>
          <option value="PROFESSIONAL">Professionale</option>
        </select>
      </div>

      {/* Disponibilità allenamenti */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Disponibilità per allenamenti
        </label>
        <div className="grid grid-cols-3 gap-3">
          {['Mattina', 'Pomeriggio', 'Sera'].map((time) => (
            <label key={time} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.trainingAvailability.includes(time)}
                onChange={() => handleAvailabilityChange(time)}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700">{time}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Frequenza allenamento */}
      <div>
        <label htmlFor="trainingFrequency" className="block text-sm font-medium text-gray-700 mb-2">
          Frequenza di allenamento desiderata
        </label>
        <select
          id="trainingFrequency"
          name="trainingFrequency"
          value={formData.trainingFrequency}
          onChange={handleInputChange}
          className="input-field"
        >
          <option value="">Seleziona frequenza</option>
          <option value="1-2">1-2 volte a settimana</option>
          <option value="3-4">3-4 volte a settimana</option>
          <option value="5-6">5-6 volte a settimana</option>
          <option value="daily">Ogni giorno</option>
        </select>
      </div>
    </>
  )

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-sport rounded-2xl flex items-center justify-center mb-4">
            <span className="text-white font-bold text-2xl">S</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Crea il tuo account</h2>
          <p className="mt-2 text-gray-600">
            Hai già un account?{' '}
            <Link href="/auth/login" className="text-primary-600 hover:text-primary-500 font-semibold">
              Accedi
            </Link>
          </p>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-primary-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / 3) * 100}%` }}
          ></div>
        </div>

        {/* Step indicator */}
        <div className="flex justify-center space-x-4">
          {[1, 2, 3].map((step) => (
            <div
              key={step}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step <= currentStep
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              {step}
            </div>
          ))}
        </div>

        <div className="card">
          <div className="space-y-6">
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}

            {/* Navigation buttons */}
            <div className="flex justify-between pt-4">
              {currentStep > 1 && (
                <Button
                  type="button"
                  onClick={prevStep}
                  variant="outline"
                >
                  Indietro
                </Button>
              )}
              
              {currentStep < 3 ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  className="ml-auto"
                >
                  Avanti
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="ml-auto"
                >
                  {isLoading ? 'Registrazione in corso...' : 'Completa registrazione'}
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Registrandoti, accetti i nostri{' '}
            <Link href="/terms" className="text-primary-600 hover:text-primary-500">
              Termini di Servizio
            </Link>{' '}
            e la{' '}
            <Link href="/privacy" className="text-primary-600 hover:text-primary-500">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
