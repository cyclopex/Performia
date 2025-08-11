'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import { useSession } from 'next-auth/react'

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

interface MessageListProps {
  messages: Message[]
  loading: boolean
}

export default function MessageList({ messages, loading }: MessageListProps) {
  const { data: session } = useSession()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) {
        return 'Ora sconosciuta'
      }
      
      const now = new Date()
      const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
      
      if (diffInHours < 24) {
        return date.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })
      } else if (diffInHours < 48) {
        return 'Ieri'
      } else {
        return date.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' })
      }
    } catch (error) {
      console.error('Errore nella formattazione della data:', error)
      return 'Ora sconosciuta'
    }
  }

  const renderMessage = (message: Message) => {
    // Validazione messaggio
    if (!message || !message.sender || !session?.user?.id) {
      return null
    }

    const isOwnMessage = message.sender.id === session.user.id

    return (
      <div
        key={message.id}
        className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4`}
      >
        <div
          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
            isOwnMessage
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-800'
          }`}
        >
          {!isOwnMessage && (
            <p className="text-xs opacity-75 mb-1">
              {message.sender.name || 'Utente sconosciuto'}
            </p>
          )}
          
          {message.type === 'text' && (
            <p className="text-sm whitespace-pre-wrap">
              {message.content || 'Messaggio vuoto'}
            </p>
          )}
          
          {message.type === 'image' && message.fileUrl && (
            <div>
              <Image
                src={message.fileUrl}
                alt="Immagine"
                className="max-w-full rounded-lg" width={400} height={300}
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                  e.currentTarget.nextElementSibling?.classList.remove('hidden')
                }}
              />
              <p className="text-sm text-gray-500 hidden">Immagine non disponibile</p>
              {message.content && (
                <p className="text-sm mt-2 whitespace-pre-wrap">{message.content}</p>
              )}
            </div>
          )}
          
          {message.type === 'file' && message.fileUrl && (
            <div>
              <a
                href={message.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 p-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors"
              >
                <div className="w-8 h-8 bg-white bg-opacity-20 rounded flex items-center justify-center">
                  <span className="text-xs">📎</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {message.fileName || 'File senza nome'}
                  </p>
                  {message.fileSize && (
                    <p className="text-xs opacity-75">
                      {(message.fileSize / 1024 / 1024).toFixed(1)} MB
                    </p>
                  )}
                </div>
              </a>
              {message.content && (
                <p className="text-sm mt-2 whitespace-pre-wrap">{message.content}</p>
              )}
            </div>
          )}
          
          <div className="flex items-center justify-between mt-1">
            <p className="text-xs opacity-75">
              {formatTime(message.createdAt)}
            </p>
            {isOwnMessage && (
              <div className="flex items-center space-x-1">
                {message.status === 'SENT' && (
                  <span className="text-xs">✓</span>
                )}
                {message.status === 'DELIVERED' && (
                  <span className="text-xs">✓✓</span>
                )}
                {message.status === 'READ' && (
                  <span className="text-xs text-blue-300">✓✓</span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex-1 overflow-y-auto p-4">
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </div>
    )
  }

  if (!messages || messages.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto p-4">
        <div className="text-center text-gray-500 py-8">
          <p>Nessun messaggio ancora</p>
          <p className="text-sm">Inizia la conversazione!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto p-4">
      <div className="space-y-4">
        {messages.map(renderMessage).filter(Boolean)}
      </div>
      <div ref={messagesEndRef} />
    </div>
  )
}
