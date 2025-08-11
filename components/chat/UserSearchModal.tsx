'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { useSession } from 'next-auth/react'
import { X, Search, User } from 'lucide-react'

interface User {
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

interface UserSearchModalProps {
  isOpen: boolean
  onClose: () => void
  onUserSelect: (userId: string) => void
}

export default function UserSearchModal({ isOpen, onClose, onUserSelect }: UserSearchModalProps) {
  const { data: session } = useSession()
  const [searchQuery, setSearchQuery] = useState('')
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const searchUsers = useCallback(async () => {
    if (!searchQuery.trim() || !session?.user?.id) return
    
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/users/search?q=${encodeURIComponent(searchQuery)}`)
      if (response.ok) {
        const data = await response.json()
        setUsers(Array.isArray(data) ? data : [])
      } else {
        const errorData = await response.json().catch(() => ({}))
        setError(errorData.error || 'Errore nella ricerca')
        setUsers([])
      }
    } catch (error) {
      console.error('Errore nella ricerca utenti:', error)
      setError('Errore di connessione')
      setUsers([])
    } finally {
      setLoading(false)
    }
  }, [searchQuery, session?.user?.id])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        searchUsers()
      } else {
        setUsers([])
        setError(null)
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchQuery])

  const handleUserSelect = (user: User) => {
    if (!user || !user.id) return
    
    if (user.connectionStatus === 'ACCEPTED') {
      onUserSelect(user.id)
      onClose()
    } else if (user.connectionStatus === null) {
      // Invia richiesta di connessione
      sendConnectionRequest(user.id)
    }
  }

  const sendConnectionRequest = async (userId: string) => {
    if (!userId) return
    
    try {
      const response = await fetch('/api/connections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ connectedUserId: userId })
      })

      if (response.ok) {
        // Ricarica i risultati
        await searchUsers()
        alert('Richiesta di connessione inviata!')
      } else {
        const errorData = await response.json().catch(() => ({}))
        alert(errorData.error || 'Errore nell\'invio della richiesta')
      }
    } catch (error) {
      console.error('Errore nell\'invio della richiesta:', error)
      alert('Errore nell\'invio della richiesta')
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Nuova Chat</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Cerca utenti per nome o email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="px-4 py-2 bg-red-50 border-l-4 border-red-400">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Results */}
        <div className="max-h-96 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : users.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              {searchQuery ? 'Nessun utente trovato' : 'Inizia a cercare utenti...'}
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => handleUserSelect(user)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      {user.image ? (
                        <Image
                          src={user.image}
                          alt={user.name || 'Utente'}
                          className="w-10 h-10 rounded-full object-cover" width={40} height={40}
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                            e.currentTarget.nextElementSibling?.classList.remove('hidden')
                          }}
                        />
                      ) : (
                        <span className="text-blue-600 font-semibold">
                          {(user.name || 'U').charAt(0).toUpperCase()}
                        </span>
                      )}
                      <span className="text-blue-600 font-semibold hidden">
                        {(user.name || 'U').charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-800">
                        {user.name || 'Utente sconosciuto'}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {user.email || 'Email non disponibile'}
                      </p>
                      <p className="text-xs text-gray-500 capitalize">
                        {(user.role || 'user').toLowerCase()}
                      </p>
                      {user.profile?.specializations && (
                        <p className="text-xs text-gray-400 mt-1">
                          {user.profile.specializations}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      {user.connectionStatus === null && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            sendConnectionRequest(user.id)
                          }}
                          className="px-3 py-1 bg-blue-500 text-white text-xs rounded-md hover:bg-blue-600 transition-colors"
                        >
                          Connetti
                        </button>
                      )}
                      {user.connectionStatus === 'PENDING' && (
                        <span className="text-xs text-gray-500">
                          {user.isInitiator ? 'Richiesta inviata' : 'Richiesta ricevuta'}
                        </span>
                      )}
                      {user.connectionStatus === 'ACCEPTED' && (
                        <span className="text-xs text-green-600 font-medium">Connesso</span>
                      )}
                      {user.connectionStatus === 'REJECTED' && (
                        <span className="text-xs text-red-500">Rifiutata</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            Puoi chattare solo con utenti con cui sei connesso
          </p>
        </div>
      </div>
    </div>
  )
}
