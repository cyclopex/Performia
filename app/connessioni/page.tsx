'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

interface ConnectionWithUser {
  id: string
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED'
  isInitiator: boolean
  otherUser: {
    id: string
    name: string
    email: string
    image: string | null
    role: string
    profile?: {
      bio: string | null
      location: string | null
      specializations: string | null
    }
  }
  createdAt: string
  updatedAt: string
}

interface UserWithConnection {
  id: string
  name: string
  email: string
  image: string | null
  role: string
  profile?: {
    bio: string | null
    location: string | null
    specializations: string | null
  }
  connectionStatus: 'PENDING' | 'ACCEPTED' | 'REJECTED' | null
  connectionId: string | null
  isInitiator: boolean | null
}

export default function ConnessioniPage() {
  const { data: session } = useSession()
  const [connections, setConnections] = useState<ConnectionWithUser[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<UserWithConnection[]>([])
  
  const [searchLoading, setSearchLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'connections' | 'search'>('connections')

  // Carica le connessioni
  const loadConnections = async () => {
    if (!session?.user?.id) return
    
    
    try {
      const response = await fetch('/api/connections')
      if (response.ok) {
        const data = await response.json()
        setConnections(data)
      }
    } catch (error) {
      console.error('Errore nel caricamento delle connessioni:', error)
    } finally {
      
    }
  }

  // Cerca utenti
  const searchUsers = async () => {
    if (!session?.user?.id) return
    
    setSearchLoading(true)
    try {
      const response = await fetch(`/api/users/search?q=${encodeURIComponent(searchQuery)}`)
      if (response.ok) {
        const data = await response.json()
        setSearchResults(data)
      }
    } catch (error) {
      console.error('Errore nella ricerca utenti:', error)
    } finally {
      setSearchLoading(false)
    }
  }

  // Invia richiesta di connessione
  const sendConnectionRequest = async (userId: string) => {
    try {
      const response = await fetch('/api/connections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ connectedUserId: userId })
      })

      if (response.ok) {
        // Ricarica le connessioni e aggiorna i risultati di ricerca
        await loadConnections()
        await searchUsers()
      } else {
        const error = await response.json()
        alert(error.error || 'Errore nell\'invio della richiesta')
      }
    } catch (error) {
      console.error('Errore nell\'invio della richiesta:', error)
      alert('Errore nell\'invio della richiesta')
    }
  }

  // Gestisci richiesta di connessione
  const handleConnectionAction = async (connectionId: string, action: 'accept' | 'reject') => {
    try {
      const response = await fetch(`/api/connections/${connectionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      })

      if (response.ok) {
        await loadConnections()
      } else {
        const error = await response.json()
        alert(error.error || 'Errore nella gestione della richiesta')
      }
    } catch (error) {
      console.error('Errore nella gestione della richiesta:', error)
      alert('Errore nella gestione della richiesta')
    }
  }

  // Rimuovi connessione
  const removeConnection = async (connectionId: string) => {
    if (!confirm('Sei sicuro di voler rimuovere questa connessione?')) return

    try {
      const response = await fetch(`/api/connections/${connectionId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await loadConnections()
      } else {
        const error = await response.json()
        alert(error.error || 'Errore nella rimozione della connessione')
      }
    } catch (error) {
      console.error('Errore nella rimozione della connessione:', error)
      alert('Errore nella rimozione della connessione')
    }
  }

  useEffect(() => {
    loadConnections()
    searchUsers() // Carica tutti gli utenti all'avvio
  }, [session])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchUsers()
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchQuery])

  const pendingConnections = connections.filter(c => c.status === 'PENDING' && !c.isInitiator)
  const acceptedConnections = connections.filter(c => c.status === 'ACCEPTED')
  const sentRequests = connections.filter(c => c.status === 'PENDING' && c.isInitiator)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">Connessioni</h1>
          <p className="text-gray-600 dark:text-gray-400">Gestisci le tue connessioni e trova nuovi contatti</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-white dark:bg-gray-700 rounded-lg p-1 mb-6 shadow-sm">
          <button
            onClick={() => setActiveTab('connections')}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
              activeTab === 'connections'
                ? 'bg-blue-500 text-white'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300'
            }`}
          >
            Le Mie Connessioni
          </button>
          <button
            onClick={() => setActiveTab('search')}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
              activeTab === 'search'
                ? 'bg-blue-500 text-white'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300'
            }`}
          >
            Cerca Utenti
          </button>
        </div>

        {activeTab === 'connections' && (
          <div className="space-y-6">
            {/* Richieste in sospeso */}
            {pendingConnections.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Richieste in sospeso ({pendingConnections.length})
                </h2>
                <div className="space-y-4">
                  {pendingConnections.map((connection) => (
                    <div key={connection.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          {connection.otherUser.image ? (
                            <img
                              src={connection.otherUser.image}
                              alt={connection.otherUser.name}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-blue-600 font-semibold text-lg">
                              {connection.otherUser.name?.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800">{connection.otherUser.name}</h3>
                          <p className="text-sm text-gray-600">{connection.otherUser.email}</p>
                          <p className="text-xs text-gray-500 capitalize">{connection.otherUser.role.toLowerCase()}</p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleConnectionAction(connection.id, 'accept')}
                          className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                        >
                          Accetta
                        </button>
                        <button
                          onClick={() => handleConnectionAction(connection.id, 'reject')}
                          className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                        >
                          Rifiuta
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Connessioni accettate */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Connessioni ({acceptedConnections.length})
              </h2>
              {acceptedConnections.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Non hai ancora connessioni accettate</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {acceptedConnections.map((connection) => (
                    <div key={connection.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          {connection.otherUser.image ? (
                            <img
                              src={connection.otherUser.image}
                              alt={connection.otherUser.name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-blue-600 font-semibold">
                              {connection.otherUser.name?.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-800">{connection.otherUser.name}</h3>
                          <p className="text-xs text-gray-500 capitalize">{connection.otherUser.role.toLowerCase()}</p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => window.location.href = `/chat?userId=${connection.otherUser.id}`}
                          className="flex-1 px-3 py-2 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600 transition-colors"
                        >
                          Messaggia
                        </button>
                        <button
                          onClick={() => removeConnection(connection.id)}
                          className="px-3 py-2 bg-gray-200 text-gray-700 text-sm rounded-md hover:bg-gray-300 transition-colors"
                        >
                          Rimuovi
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Richieste inviate */}
            {sentRequests.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Richieste inviate ({sentRequests.length})
                </h2>
                <div className="space-y-4">
                  {sentRequests.map((connection) => (
                    <div key={connection.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                          {connection.otherUser.image ? (
                            <img
                              src={connection.otherUser.image}
                              alt={connection.otherUser.name}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-gray-600 font-semibold text-lg">
                              {connection.otherUser.name?.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800">{connection.otherUser.name}</h3>
                          <p className="text-sm text-gray-600">{connection.otherUser.email}</p>
                          <p className="text-xs text-gray-500 capitalize">{connection.otherUser.role.toLowerCase()}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">In attesa di risposta</span>
                        <button
                          onClick={() => removeConnection(connection.id)}
                          className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded-md hover:bg-gray-300 transition-colors"
                        >
                          Annulla
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'search' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Cerca Utenti</h2>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Cerca per nome o email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {searchLoading && (
                  <div className="absolute right-3 top-3">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                  </div>
                )}
              </div>
            </div>

            {searchResults.length > 0 && (
              <div className="space-y-4">
                {searchResults.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        {user.image ? (
                          <img
                            src={user.image}
                            alt={user.name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-blue-600 font-semibold text-lg">
                            {user.name?.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">{user.name}</h3>
                        <p className="text-sm text-gray-600">{user.email}</p>
                        <p className="text-xs text-gray-500 capitalize">{user.role.toLowerCase()}</p>
                        {user.profile?.specializations && (
                          <p className="text-xs text-gray-400 mt-1">{user.profile.specializations}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {user.connectionStatus === null && (
                        <button
                          onClick={() => sendConnectionRequest(user.id)}
                          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                        >
                          Connetti
                        </button>
                      )}
                      {user.connectionStatus === 'PENDING' && (
                        <span className="text-sm text-gray-500">
                          {user.isInitiator ? 'Richiesta inviata' : 'Richiesta ricevuta'}
                        </span>
                      )}
                      {user.connectionStatus === 'ACCEPTED' && (
                        <button
                          onClick={() => window.location.href = `/chat?userId=${user.id}`}
                          className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                        >
                          Messaggia
                        </button>
                      )}
                      {user.connectionStatus === 'REJECTED' && (
                        <span className="text-sm text-red-500">Rifiutata</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {searchQuery && !searchLoading && searchResults.length === 0 && (
              <p className="text-gray-500 text-center py-8">Nessun utente trovato</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
