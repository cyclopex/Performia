'use client'

import { useDroppable } from '@dnd-kit/core'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Calendar, Target, Trophy } from 'lucide-react'
import { ScheduledActivity, Workout, RaceResult } from '@/types/activity'

interface DroppableDayProps {
  day: Date
  activities: (ScheduledActivity | Workout | RaceResult)[]
  onAddActivity: (activity: Omit<ScheduledActivity, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => void
  onEditActivity: (activity: ScheduledActivity) => void
  onDeleteActivity: (id: string) => void
  onOpenEditWorkoutModal: (workout: Workout) => void
  onOpenDeleteWorkoutModal: (workout: Workout) => void
  isToday: boolean
}

// Componente per le attività trascinabili
function DraggableActivityItem({ 
  activity, 
  onEdit, 
  onDelete, 
  onOpenEditWorkoutModal,
  onOpenDeleteWorkoutModal 
}: {
  activity: ScheduledActivity | Workout | RaceResult
  onEdit: (activity: ScheduledActivity) => void
  onDelete: (id: string) => void
  onOpenEditWorkoutModal: (workout: Workout) => void
  onOpenDeleteWorkoutModal: (workout: Workout) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: activity.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'WORKOUT':
      case 'RUNNING':
      case 'CYCLING':
      case 'SWIMMING':
      case 'STRENGTH':
      case 'CARDIO':
      case 'FLEXIBILITY':
      case 'SPORTS':
      case 'YOGA':
      case 'PILATES':
      case 'CROSSFIT':
      case 'MARTIAL_ARTS':
      case 'CLIMBING':
      case 'OTHER':
        return <Target className="w-4 h-4" />
      case 'THERAPY':
        return <Target className="w-4 h-4" />
      case 'NUTRITION':
        return <Calendar className="w-4 h-4" />
      case 'MENTAL':
        return <Target className="w-4 h-4" />
      case 'ASSESSMENT':
        return <Target className="w-4 h-4" />
      case 'RACE':
      case 'COMPETITION':
      case 'TIME_TRIAL':
      case 'FUN_RUN':
        return <Trophy className="w-4 h-4" />
      default:
        return <Calendar className="w-4 h-4" />
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'WORKOUT':
      case 'RUNNING':
      case 'CYCLING':
      case 'SWIMMING':
      case 'STRENGTH':
      case 'CARDIO':
      case 'FLEXIBILITY':
      case 'SPORTS':
      case 'YOGA':
      case 'PILATES':
      case 'CROSSFIT':
      case 'MARTIAL_ARTS':
      case 'CLIMBING':
      case 'OTHER':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'THERAPY':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'NUTRITION':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'MENTAL':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'ASSESSMENT':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'RACE':
      case 'COMPETITION':
      case 'TIME_TRIAL':
      case 'FUN_RUN':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getActivityType = (activity: ScheduledActivity | Workout | RaceResult): string => {
    if ('type' in activity && activity.type) {
      return activity.type
    } else if ('eventType' in activity && activity.eventType) {
      return activity.eventType
    }
    return 'OTHER'
  }

  const getActivityTitle = (activity: ScheduledActivity | Workout | RaceResult): string => {
    if ('title' in activity && activity.title) {
      return activity.title
    } else if ('eventName' in activity && activity.eventName) {
      return activity.eventName
    } else if ('description' in activity && (activity as ScheduledActivity | Workout).description) {
      return (activity as ScheduledActivity | Workout).description || 'Attività'
    }
    return 'Attività'
  }

  const formatTime = (time: string) => {
    if (!time) return ''
    
    if (/^\d{1,2}:\d{2}$/.test(time)) {
      return time
    }
    
    if (/^\d{1,2}:\d{2}:\d{2}$/.test(time)) {
      return time.substring(0, 5)
    }
    
    const minutes = parseInt(time)
    if (!isNaN(minutes)) {
      const hours = Math.floor(minutes / 60)
      const mins = minutes % 60
      return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
    }
    
    return time
  }

  const handleActivityClick = (activity: ScheduledActivity | Workout | RaceResult) => {
    if ('duration' in activity && 'type' in activity && 'status' in activity && !('time' in activity)) {
      // È un Workout
      onOpenEditWorkoutModal(activity as Workout)
    } else if ('title' in activity && 'type' in activity && 'status' in activity && 'time' in activity) {
      // È una ScheduledActivity
      onEdit(activity as ScheduledActivity)
    }
  }

  const handleActivityDelete = (activity: ScheduledActivity | Workout | RaceResult) => {
    if ('duration' in activity && 'type' in activity && 'status' in activity && !('time' in activity)) {
      // È un Workout
      onOpenDeleteWorkoutModal(activity as Workout)
    } else {
      // È una ScheduledActivity
      onDelete(activity.id)
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`p-2 rounded text-xs border ${getActivityColor(getActivityType(activity))} cursor-move hover:opacity-80 transition-opacity`}
      onClick={() => handleActivityClick(activity)}
    >
      <div className="flex items-center space-x-1">
        {getActivityIcon(getActivityType(activity))}
        <span className="font-medium truncate">
          {getActivityTitle(activity)}
        </span>
      </div>
      
      {('time' in activity && activity.time) && (
        <div className="text-xs opacity-75 mt-1">
          {formatTime(activity.time)}
        </div>
      )}
    </div>
  )
}

export default function DroppableDay({
  day,
  activities,
  onAddActivity,
  onEditActivity,
  onDeleteActivity,
  onOpenEditWorkoutModal,
  onOpenDeleteWorkoutModal,
  isToday
}: DroppableDayProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: day.toISOString(),
  })

  return (
    <div
      ref={setNodeRef}
      className={`min-h-32 p-3 rounded-lg border transition-colors ${
        isToday 
          ? 'border-blue-300 bg-blue-50' 
          : isOver 
            ? 'border-green-300 bg-green-50' 
            : 'border-gray-200'
      }`}
    >
      <div className={`text-center mb-2 ${
        isToday ? 'text-blue-600 font-semibold' : 'text-gray-600'
      }`}>
        <div className="text-sm font-medium">
          {day.toLocaleDateString('it-IT', { weekday: 'short' })}
        </div>
        <div className="text-lg font-bold">
          {day.getDate()}
        </div>
      </div>
      
      <div className="space-y-1">
        {activities && activities.length > 0 ? (
          activities.map((activity, activityIndex) => (
            <DraggableActivityItem
              key={activity.id || activityIndex}
              activity={activity}
              onEdit={onEditActivity}
              onDelete={onDeleteActivity}
              onOpenEditWorkoutModal={onOpenEditWorkoutModal}
              onOpenDeleteWorkoutModal={onOpenDeleteWorkoutModal}
            />
          ))
        ) : (
          <div className="text-xs text-gray-400 text-center py-2">
            {isOver ? 'Rilascia qui' : 'Nessuna attività'}
          </div>
        )}
      </div>
    </div>
  )
}
