import Link from 'next/link'
import { Trophy, Users, TrendingUp, Shield } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-sport opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
              <span className="gradient-text block">Performia</span>
              <span className="text-gray-900 block">La piattaforma per sportivi e professionisti</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Connetti con coach, fisioterapisti, nutrizionisti e altri atleti. 
              Traccia i tuoi allenamenti, monitora i progressi e raggiungi i tuoi obiettivi.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/register" className="btn-primary text-lg px-8 py-4">
                Inizia Gratis
              </Link>
              <Link href="/auth/login" className="btn-secondary text-lg px-8 py-4">
                Accedi
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Tutto quello che ti serve per eccellere
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Una piattaforma completa che combina networking professionale e tracking sportivo
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="card-hover text-center">
              <div className="w-16 h-16 bg-gradient-sport rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Networking</h3>
              <p className="text-gray-600">
                Connetti con coach, professionisti e altri atleti nella tua area
              </p>
            </div>

            <div className="card-hover text-center">
              <div className="w-16 h-16 bg-gradient-sport rounded-2xl flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Tracking</h3>
              <p className="text-gray-600">
                Monitora allenamenti, risultati e progressi con grafici dettagliati
              </p>
            </div>

            <div className="card-hover text-center">
              <div className="w-16 h-16 bg-gradient-sport rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Performance</h3>
              <p className="text-gray-600">
                Analizza i tuoi dati e ottimizza le tue prestazioni
              </p>
            </div>

            <div className="card-hover text-center">
              <div className="w-16 h-16 bg-gradient-sport rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Sicurezza</h3>
              <p className="text-gray-600">
                I tuoi dati sono protetti e la privacy è garantita
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-sport">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-4">
            Pronto a trasformare la tua carriera sportiva?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Unisciti a migliaia di atleti e professionisti che stanno già utilizzando Performia
          </p>
          <Link href="/auth/register" className="bg-white text-primary-600 font-semibold py-4 px-8 rounded-xl hover:bg-gray-50 transition-colors duration-300">
            Registrati Ora
          </Link>
        </div>
      </section>
    </div>
  )
}
