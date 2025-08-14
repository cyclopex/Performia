'use client'

import { useState, useEffect } from 'react'
import { X, Download, Activity, MapPin, Clock, Target, CheckCircle } from 'lucide-react'
import Button from '@/components/ui/Button'

interface StravaImportModalProps {
  isOpen: boolean
  onClose: () => void
  onImport: (activities: any[]) => void
}

export default function StravaImportModal({ isOpen, onClose, onImport }: StravaImportModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [importedCount, setImportedCount] = useState(0)
  const [activities, setActivities] = useState<any[]>([])
  const [stravaToken, setStravaToken] = useState<string | null>(null)

  // Controlla se ci sono token Strava nell'URL
  useEffect(() => {
    if (isOpen) {
      const urlParams = new URLSearchParams(window.location.search)
      const token = urlParams.get('strava_token')
      if (token) {
        setStravaToken(token)
        // Rimuovi i parametri dall'URL
        window.history.replaceState({}, document.title, window.location.pathname)
        // Carica automaticamente le attività
        loadStravaActivities(token)
      }
    }
  }, [isOpen])

  const handleStravaAuth = async () => {
    setIsLoading(true)
    
    try {
      const clientId = '172690' // Il tuo client ID
      const redirectUri = `${window.location.origin}/api/strava/callback`
      const scope = 'read,activity:read_all'
      
      const authUrl = `https://www.strava.com/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}`
      
      window.location.href = authUrl
    } catch (error) {
      console.error('Errore nell\'autenticazione Strava:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadStravaActivities = async (token: string) => {
    setIsLoading(true)
    
    try {
      const response = await fetch(`/api/strava/activities?access_token=${token}`)
      
      if (response.ok) {
        const data = await response.json()
        setActivities(data.activities)
      } else {
        throw new Error('Errore nel caricamento delle attività')
      }
    } catch (error) {
      console.error('Errore nel caricamento delle attività Strava:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleImportActivities = async () => {
    if (activities.length === 0 || !stravaToken) return
    
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/strava/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          accessToken: stravaToken,
          activities 
        })
      })

      if (response.ok) {
        const result = await response.json()
        setImportedCount(result.imported)
        onImport(result.activities)
        
        // Chiudi il modal dopo 3 secondi
        setTimeout(() => {
          onClose()
          setImportedCount(0)
          setActivities([])
          setStravaToken(null)
        }, 3000)
      }
    } catch (error) {
      console.error('Errore nell\'importazione:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Importa da Strava</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {importedCount > 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Importazione completata!
              </h3>
              <p className="text-gray-700">
                {importedCount} allenamenti importati con successo da Strava
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Il modal si chiuderà automaticamente...
              </p>
            </div>
          ) : (
            <>
              <div className="text-center mb-6">
                <Activity className="w-16 h-16 text-orange-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Importa i tuoi allenamenti da Strava
                </h3>
                <p className="text-gray-600">
                  Connetti il tuo account Strava per importare automaticamente tutti i tuoi allenamenti
                </p>
              </div>

              {activities.length > 0 ? (
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-3">
                    Attività trovate ({activities.length})
                  </h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {activities.slice(0, 5).map((activity, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <Activity className="w-4 h-4 text-orange-500" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{activity.name}</p>
                          <div className="flex items-center space-x-4 text-xs text-gray-600">
                            <span className="flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              {Math.round(activity.moving_time / 60)} min
                            </span>
                            {activity.distance && (
                              <span className="flex items-center">
                                <MapPin className="w-3 h-3 mr-1" />
                                {(activity.distance / 1000).toFixed(1)} km
                              </span>
                            )}
                            <span className="flex items-center">
                              <Target className="w-3 h-3 mr-1" />
                              {activity.type}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                    {activities.length > 5 && (
                      <p className="text-sm text-gray-500 text-center">
                        ... e altre {activities.length - 5} attività
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Button
                    onClick={handleStravaAuth}
                    disabled={isLoading}
                    className="w-full"
                  >
                    {isLoading ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mx-auto"></div>
                    ) : (
                      <>
                        <Download className="w-4 h-4 mr-2" />
                        Connetti con Strava
                      </>
                    )}
                  </Button>
                  <p className="text-xs text-gray-500 mt-2">
                    Verrai reindirizzato a Strava per autorizzare l'accesso
                  </p>
                </div>
              )}

              {activities.length > 0 && (
                <div className="flex space-x-3">
                  <Button
                    onClick={handleImportActivities}
                    disabled={isLoading}
                    className="flex-1"
                  >
                    {isLoading ? 'Importazione...' : `Importa ${activities.length} attività`}
                  </Button>
                  <Button
                    onClick={onClose}
                    variant="outline"
                    className="flex-1"
                  >
                    Annulla
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

