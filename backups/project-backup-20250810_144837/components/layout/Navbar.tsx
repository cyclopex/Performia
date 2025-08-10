'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { Menu, X, User, LogOut, Settings, BarChart3 } from 'lucide-react'
import Button from '@/components/ui/Button'

export default function Navbar() {
  const { data: session } = useSession()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' })
  }

  // Chiudi dropdown quando si clicca fuori
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Chiudi menu mobile quando si cambia route
  useEffect(() => {
    setIsMenuOpen(false)
    setIsDropdownOpen(false)
  }, [])

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen)
  }

  return (
    <nav className="bg-white shadow-sport border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-sport rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <span className="text-xl font-bold gradient-text">Performia</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {session ? (
              <>
                <Link href="/dashboard" className="text-gray-700 hover:text-primary-600 transition-colors">
                  Dashboard
                </Link>
                <Link href="/connessioni" className="text-gray-700 hover:text-primary-600 transition-colors">
                  Connessioni
                </Link>
                <Link href="/workouts" className="text-gray-700 hover:text-primary-600 transition-colors">
                  Allenamenti
                </Link>
                <Link href="/chat" className="text-gray-700 hover:text-primary-600 transition-colors">
                  Chat
                </Link>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="text-gray-700 hover:text-primary-600 transition-colors">
                  Accedi
                </Link>
                <Link href="/auth/register">
                  <Button>Registrati</Button>
                </Link>
              </>
            )}
          </div>

          {/* User Menu */}
          {session && (
            <div className="hidden md:flex items-center space-x-4">
              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={toggleDropdown}
                  className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 transition-colors"
                  aria-expanded={isDropdownOpen}
                  aria-haspopup="true"
                >
                  <div className="w-8 h-8 bg-gradient-sport rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-semibold">
                      {session.user?.name?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <span>{session.user?.name || 'Utente'}</span>
                </button>
                
                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-sport-lg border border-gray-100 z-50">
                    <div className="py-2">
                      <Link href="/profile" className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50">
                        <User className="w-4 h-4 mr-3" />
                        Profilo
                      </Link>
                      <Link href="/dashboard" className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50">
                        <BarChart3 className="w-4 h-4 mr-3" />
                        Dashboard
                      </Link>
                      <Link href="/settings" className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50">
                        <Settings className="w-4 h-4 mr-3" />
                        Impostazioni
                      </Link>
                      <hr className="my-2" />
                      <button
                        onClick={handleSignOut}
                        className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-gray-50"
                      >
                        <LogOut className="w-4 h-4 mr-3" />
                        Esci
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-primary-600 transition-colors"
              aria-label={isMenuOpen ? 'Chiudi menu' : 'Apri menu'}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100">
            {session ? (
              <div className="space-y-4">
                <Link href="/dashboard" className="block text-gray-700 hover:text-primary-600 transition-colors">
                  Dashboard
                </Link>
                <Link href="/connessioni" className="block text-gray-700 hover:text-primary-600 transition-colors">
                  Connessioni
                </Link>
                <Link href="/workouts" className="block text-gray-700 hover:text-primary-600 transition-colors">
                  Allenamenti
                </Link>
                <Link href="/chat" className="block text-gray-700 hover:text-primary-600 transition-colors">
                  Chat
                </Link>
                <Link href="/profile" className="block text-gray-700 hover:text-primary-600 transition-colors">
                  Profilo
                </Link>
                <button
                  onClick={handleSignOut}
                  className="block w-full text-left text-gray-700 hover:text-primary-600 transition-colors"
                >
                  Esci
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <Link href="/auth/login" className="block text-gray-700 hover:text-primary-600 transition-colors">
                  Accedi
                </Link>
                <Link href="/auth/register">
                  <Button className="w-full">Registrati</Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
