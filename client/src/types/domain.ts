export interface SafeUser {
  id: number
  firstName: string
  lastName: string
  email: string
  bio?: string | null
  avatarUrl?: string | null
  role?: string
}

export interface ActivityRecord {
  id: number
  userId: number
  exerciseTypeId: number
  title: string
  durationMinutes: number
  caloriesBurned: number
  activityDate: string
  notes: string | null
  isPrivate: boolean
}

export interface ActivityFormPayload {
  exerciseTypeId: number
  title: string
  durationMinutes: number
  caloriesBurned: number
  activityDate: string
  notes?: string | null
  isPrivate?: boolean
}
