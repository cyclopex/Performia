import { Activity, Clock, MapPin, Target } from 'lucide-react'

interface WorkoutStatsProps {
  total: number
  totalDuration: number
  totalDistance: number
  avgRPE: number
}

const StatCard = ({ title, value, icon, subtitle }: { 
  title: string
  value: string | number
  icon: React.ReactNode
  subtitle?: string
}) => (
  <div className="card-hover">
    <div className="flex items-center">
      <div className="w-12 h-12 bg-gradient-sport rounded-xl flex items-center justify-center mr-4">
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-600 dark:text-gray-400">{title}</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
        {subtitle && (
          <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
        )}
      </div>
    </div>
  </div>
)

export default function WorkoutStats({ total, totalDuration, totalDistance, avgRPE }: WorkoutStatsProps) {
  const totalHours = Math.round(totalDuration / 60)
  const avgDuration = total > 0 ? Math.round(totalDuration / total) : 0
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <StatCard 
        title="Allenamenti Totali" 
        value={total} 
        icon={<Activity className="w-6 h-6 text-white" />}
        subtitle={`${total > 0 ? 'attività registrate' : 'nessuna attività'}`}
      />
      
      <StatCard 
        title="Ore Totali" 
        value={totalHours} 
        icon={<Clock className="w-6 h-6 text-white" />}
        subtitle={`${totalDuration} minuti totali`}
      />
      
      <StatCard 
        title="Distanza Totale" 
        value={`${totalDistance.toFixed(1)} km`} 
        icon={<MapPin className="w-6 h-6 text-white" />}
        subtitle={`media ${total > 0 ? (totalDistance / total).toFixed(1) : 0} km/allenamento`}
      />
      
      <StatCard 
        title="RPE Medio" 
        value={avgRPE.toFixed(1)} 
        icon={<Target className="w-6 h-6 text-white" />}
        subtitle={`intensità ${avgRPE >= 8 ? 'alta' : avgRPE >= 6 ? 'media' : 'bassa'}`}
      />
    </div>
  )
}
