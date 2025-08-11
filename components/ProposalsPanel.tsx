'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Clock, CheckCircle, XCircle, Eye, Calendar, Dumbbell } from 'lucide-react'
import toast from 'react-hot-toast'

interface Proposal {
  id: string
  type?: string
  action: string
  status: string
  title: string
  description?: string
  activityType?: string
  workoutType?: string
  startTime?: string
  endTime?: string
  duration?: number
  location?: string
  notes?: string
  createdAt: string
  proposalType?: 'activity' | 'workout'
  proposedBy: {
    id: string
    name: string
    email: string
    role: string
    profile?: {
      specializations?: string
      experience?: string
      certifications?: string
    }
  }
}

interface ApiProposal {
  id: string
  type?: string
  action: string
  status: string
  title: string
  description?: string
  activityType?: string
  workoutType?: string
  startTime?: string
  endTime?: string
  duration?: number
  location?: string
  notes?: string
  createdAt: string
  proposedBy: {
    id: string
    name: string
    email: string
    role: string
    profile?: {
      specializations?: string
      experience?: string
      certifications?: string
    }
  }
}

interface ProposalsPanelProps {
  isOpen: boolean
  onClose: () => void
}

export default function ProposalsPanel({ isOpen, onClose }: ProposalsPanelProps) {
  const { data: session } = useSession()
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    if (isOpen && session?.user?.id) {
      loadProposals()
    }
  }, [isOpen, session?.user?.id])

  const loadProposals = async () => {
    try {
      setLoading(true)
      
      // Carica proposte di attività
      const activitiesResponse = await fetch('/api/proposals/activities?type=received&status=PENDING_APPROVAL')
      const activitiesData = await activitiesResponse.json()
      
      // Carica proposte di allenamenti
      const workoutsResponse = await fetch('/api/proposals/workouts?type=received&status=PENDING_APPROVAL')
      const workoutsData = await workoutsResponse.json()
      
      // Combina e formatta le proposte
      const formattedProposals = [
        ...activitiesData.map((p: ApiProposal) => ({ ...p, proposalType: 'activity' })),
        ...workoutsData.map((p: ApiProposal) => ({ ...p, proposalType: 'workout' }))
      ]
      
      setProposals(formattedProposals)
    } catch (error) {
      console.error('Errore nel caricamento delle proposte:', error)
      toast.error('Errore nel caricamento delle proposte')
    } finally {
      setLoading(false)
    }
  }

  const handleProposalResponse = async (proposalId: string, proposalType: string, response: 'approve' | 'reject') => {
    try {
      const responseData = await fetch('/api/proposals/respond', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          proposalId,
          proposalType,
          response,
          notes: ''
        })
      })

      if (responseData.ok) {
        toast.success(`Proposta ${response === 'approve' ? 'approvata' : 'rifiutata'} con successo`)
        loadProposals() // Ricarica le proposte
        setShowDetails(false)
        setSelectedProposal(null)
      } else {
        const errorData = await responseData.json()
        toast.error(errorData.error || 'Errore nella risposta alla proposta')
      }
    } catch (error) {
      console.error('Errore nella risposta alla proposta:', error)
      toast.error('Errore nella risposta alla proposta')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'CREATE':
        return <Calendar className="w-4 h-4 text-green-600" />
      case 'UPDATE':
        return <Eye className="w-4 h-4 text-blue-600" />
      case 'DELETE':
        return <XCircle className="w-4 h-4 text-red-600" />
      default:
        return <Clock className="w-4 h-4 text-gray-600" />
    }
  }

  const getActionText = (action: string) => {
    switch (action) {
      case 'CREATE':
        return 'Creazione'
      case 'UPDATE':
        return 'Modifica'
      case 'DELETE':
        return 'Eliminazione'
      default:
        return 'Azione'
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock className="w-6 h-6" />
              <h2 className="text-2xl font-bold">Proposte in Attesa</h2>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <XCircle className="w-6 h-6" />
            </button>
          </div>
          <p className="text-primary-100 mt-2">
            {proposals.length} proposta{proposals.length !== 1 ? 'e' : ''} in attesa di approvazione
          </p>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : proposals.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">Nessuna proposta in attesa</h3>
              <p className="text-gray-500">Non ci sono proposte che richiedono la tua approvazione</p>
            </div>
          ) : (
            <div className="space-y-4">
              {proposals.map((proposal) => (
                <div
                  key={proposal.id}
                  className="bg-gray-50 rounded-xl p-4 border-l-4 border-yellow-400 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => {
                    setSelectedProposal(proposal)
                    setShowDetails(true)
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {getActionIcon(proposal.action)}
                        <span className="text-sm font-medium text-gray-600 bg-yellow-100 px-2 py-1 rounded-full">
                          {getActionText(proposal.action)}
                        </span>
                        {proposal.proposalType === 'activity' ? (
                          <Calendar className="w-4 h-4 text-blue-600" />
                        ) : (
                          <Dumbbell className="w-4 h-4 text-green-600" />
                        )}
                        <span className="text-sm text-gray-500">
                          {proposal.proposalType === 'activity' ? 'Attività' : 'Allenamento'}
                        </span>
                      </div>
                      
                      <h3 className="font-semibold text-gray-900 mb-1">{proposal.title}</h3>
                      
                      {proposal.description && (
                        <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                          {proposal.description}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>Proposta da: <strong>{proposal.proposedBy.name}</strong></span>
                        <span>•</span>
                        <span>{formatDate(proposal.createdAt)}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleProposalResponse(proposal.id, proposal.proposalType || 'activity', 'approve')
                        }}
                        className="p-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition-colors"
                        title="Approva"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleProposalResponse(proposal.id, proposal.proposalType || 'activity', 'reject')
                        }}
                        className="p-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors"
                        title="Rifiuta"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Dettagli */}
        {showDetails && selectedProposal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
              <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white p-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold">Dettagli Proposta</h3>
                  <button
                    onClick={() => setShowDetails(false)}
                    className="text-white hover:text-gray-200 transition-colors"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>
              </div>
              
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Informazioni Proposta</h4>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tipo:</span>
                        <span className="font-medium">{selectedProposal.proposalType === 'activity' ? 'Attività' : 'Allenamento'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Azione:</span>
                        <span className="font-medium">{getActionText(selectedProposal.action)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Titolo:</span>
                        <span className="font-medium">{selectedProposal.title}</span>
                      </div>
                      {selectedProposal.description && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Descrizione:</span>
                          <span className="font-medium">{selectedProposal.description}</span>
                        </div>
                      )}
                      {selectedProposal.duration && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Durata:</span>
                          <span className="font-medium">{selectedProposal.duration} min</span>
                        </div>
                      )}
                      {selectedProposal.location && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Luogo:</span>
                          <span className="font-medium">{selectedProposal.location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Proposta da</h4>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Nome:</span>
                        <span className="font-medium">{selectedProposal.proposedBy.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Ruolo:</span>
                        <span className="font-medium">{selectedProposal.proposedBy.role}</span>
                      </div>
                      {selectedProposal.proposedBy.profile?.specializations && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Specializzazioni:</span>
                          <span className="font-medium">{selectedProposal.proposedBy.profile.specializations}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => handleProposalResponse(selectedProposal.id, selectedProposal.proposalType || 'activity', 'approve')}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-5 h-5" />
                      Approva
                    </button>
                    <button
                      onClick={() => handleProposalResponse(selectedProposal.id, selectedProposal.proposalType || 'activity', 'reject')}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <XCircle className="w-5 h-5" />
                      Rifiuta
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
