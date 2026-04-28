import api from './api'
import type { ActivityFormPayload } from '@/types/domain'

export async function getMyActivities() {
  return api.get('/activities/mine')
}

export async function createActivity(payload: ActivityFormPayload) {
  return api.post('/activities', payload)
}

export async function updateActivity(activityId: number, payload: Partial<ActivityFormPayload>) {
  return api.put(`/activities/${activityId}`, payload)
}

export async function deleteActivity(activityId: number) {
  return api.del(`/activities/${activityId}`)
}

export async function friendFeed() {
  return api.get('/activities/friends')
}

export async function leaderboard(days?: number, limit?: number) {
  const q = [] as string[]
  if (days) q.push(`days=${days}`)
  if (limit) q.push(`limit=${limit}`)
  const qs = q.length ? `?${q.join('&')}` : ''
  return api.get(`/activities/leaderboard${qs}`)
}

export default {
  getMyActivities,
  createActivity,
  updateActivity,
  deleteActivity,
  friendFeed,
  leaderboard,
}
