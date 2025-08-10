'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'
import { Search, MoreVertical, Phone, Video, Plus } from 'lucide-react'
import UserSearchModal from '@/components/chat/UserSearchModal'
import MessageList from '@/components/chat/MessageList'
import MessageInput from '@/components/chat/MessageInput'

interface Chat {
  id: string
  type: 'DIRECT' | 'GROUP'
  name: string
  lastMessage?: {
    id: string
    content: string
    type: string
    createdAt: string
    sender: {
      id: string
      name: string
      email: string
    }
  }
  participants: {
    id: string
    name: string
    email: string
    image: string | null
    role: string
  }[]
  unreadCount: number
  updatedAt: string
}

interface Message {
  id: string
  content: string
  type: string
  fileUrl?: string
  fileName?: string
  fileSize?: number
  status: 'SENT' | 'DELIVERED' | 'READ'
  createdAt: string
  sender: {
    id: string
    name: string
    email: string
    image: string | null
  }
}

// Funzione per formattare il tempo
const formatTime = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
  
  if (diffInHours < 24) {
    return date.toLocaleTimeString('it-IT', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  } else if (diffInHours < 48) {
    return 'Ieri'
  } else {
    return date.toLocaleDateString('it-IT', { 
      day: '2-digit', 
      month: '2-digit' 
    })
  }
}

export default function ChatPage() {
  const { data: session } = useSession()
  const searchParams = useSearchParams()
  const [chats, setChats] = useState<Chat[]>([])
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [messagesLoading, setMessagesLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showUserSearch, setShowUserSearch] = useState(false)

  // Controlla se c'è un userId nei parametri per aprire una chat diretta
  const targetUserId = searchParams.get('userId')

  // Carica le chat dell'utente
  const loadChats = async () => {
    if (!session?.user?.id) return
    
    setLoading(true)
    try {
      const response = await fetch('/api/chats')
      if (response.ok) {
        const data = await response.json()
        setChats(data)
        
        // Se c'è un targetUserId, cerca o crea la chat
        if (targetUserId && !selectedChat) {
          const existingChat = data.find((chat: Chat) => 
            chat.type === 'DIRECT' && 
            chat.participants.some(p => p.id === targetUserId)
          )
          
          if (existingChat) {
            setSelectedChat(existingChat)
            loadMessages(existingChat.id)
          } else {
            // Crea nuova chat
            createDirectChat(targetUserId)
          }
        }
      }
    } catch (error) {
      console.error('Errore nel caricamento delle chat:', error)
    } finally {
      setLoading(false)
    }
  }

  // Carica i messaggi di una chat
  const loadMessages = async (chatId: string) => {
    if (!session?.user?.id) return
    
    setMessagesLoading(true)
    try {
      const response = await fetch(`/api/chats/${chatId}/messages`)
      if (response.ok) {
        const data = await response.json()
        setMessages(data.messages)
      }
    } catch (error) {
      console.error('Errore nel caricamento dei messaggi:', error)
    } finally {
      setMessagesLoading(false)
    }
  }

  // Crea una nuova chat diretta
  const createDirectChat = async (userId: string) => {
    try {
      const response = await fetch('/api/chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'DIRECT',
          participantIds: [userId]
        })
      })

      if (response.ok) {
        const newChat = await response.json()
        setChats(prev => [newChat, ...prev])
        setSelectedChat(newChat)
        loadMessages(newChat.id)
      } else {
        const error = await response.json()
        alert(error.error || 'Errore nella creazione della chat')
      }
    } catch (error) {
      console.error('Errore nella creazione della chat:', error)
      alert('Errore nella creazione della chat')
    }
  }

  // Gestisce la selezione di un utente dal modal
  const handleUserSelect = (userId: string) => {
    createDirectChat(userId)
  }

  // Invia un messaggio
  const sendMessage = async (content: string, type: string, file?: File) => {
    if (!selectedChat || !session?.user?.id) return

    // TODO: Implementare upload file
    const messageData = {
      content: content,
      type: type
    }

    try {
      const response = await fetch(`/api/chats/${selectedChat.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(messageData)
      })

      if (response.ok) {
        const sentMessage = await response.json()
        setMessages(prev => [...prev, sentMessage])
        
        // Aggiorna l'ultimo messaggio nella lista chat
        setChats(prev => prev.map(chat => 
          chat.id === selectedChat.id 
            ? { ...chat, lastMessage: sentMessage, updatedAt: sentMessage.createdAt }
            : chat
        ))
      }
    } catch (error) {
      console.error('Errore nell\'invio del messaggio:', error)
      alert('Errore nell\'invio del messaggio')
    }
  }

  // Filtra le chat in base alla ricerca
  const filteredChats = chats.filter(chat =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.lastMessage?.content.toLowerCase().includes(searchQuery.toLowerCase())
  )

  useEffect(() => {
    loadChats()
  }, [session])

  useEffect(() => {
    if (selectedChat) {
      loadMessages(selectedChat.id)
    }
  }, [selectedChat])



  return (
    <div className="h-screen bg-gray-50 flex">
      {/* Sidebar - Lista Chat */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-semibold text-gray-800">Chat</h1>
            <button
              onClick={() => setShowUserSearch(true)}
              className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Cerca chat..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : filteredChats.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              {searchQuery ? 'Nessuna chat trovata' : 'Nessuna chat disponibile'}
            </div>
          ) : (
            filteredChats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => setSelectedChat(chat)}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedChat?.id === chat.id ? 'bg-blue-50 border-blue-200' : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    {chat.participants[0]?.image ? (
                      <img
                        src={chat.participants[0].image}
                        alt={chat.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-blue-600 font-semibold text-lg">
                        {chat.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-800 truncate">{chat.name}</h3>
                      {chat.lastMessage && (
                        <span className="text-xs text-gray-500">
                          {formatTime(chat.lastMessage.createdAt)}
                        </span>
                      )}
                    </div>
                    {chat.lastMessage ? (
                      <p className="text-sm text-gray-600 truncate">
                        {chat.lastMessage.sender.id === session?.user?.id ? 'Tu: ' : ''}
                        {chat.lastMessage.content}
                      </p>
                    ) : (
                      <p className="text-sm text-gray-500">Nessun messaggio</p>
                    )}
                  </div>
                  {chat.unreadCount > 0 && (
                    <div className="w-5 h-5 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center">
                      {chat.unreadCount}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    {selectedChat.participants[0]?.image ? (
                      <img
                        src={selectedChat.participants[0].image}
                        alt={selectedChat.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-blue-600 font-semibold">
                        {selectedChat.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    <h2 className="font-semibold text-gray-800">{selectedChat.name}</h2>
                    <p className="text-sm text-gray-500">
                      {selectedChat.participants.length} partecipante{selectedChat.participants.length !== 1 ? 'i' : ''}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
                    <Phone className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
                    <Video className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <MessageList messages={messages} loading={messagesLoading} />

            {/* Message Input */}
            <MessageInput
              onSendMessage={sendMessage}
              disabled={!selectedChat}
            />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <h3 className="text-xl font-semibold mb-2">Seleziona una chat</h3>
              <p>Inizia una conversazione con i tuoi contatti</p>
            </div>
          </div>
        )}
      </div>

      {/* User Search Modal */}
      <UserSearchModal
        isOpen={showUserSearch}
        onClose={() => setShowUserSearch(false)}
        onUserSelect={handleUserSelect}
      />
    </div>
  )
}
