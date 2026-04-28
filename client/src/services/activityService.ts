import api from './api'

export async function getMyActivities() {
  return api.get('/activities/mine')
}

export async function createActivity(payload: any) {
  // normalize client payload into server shape
  const durationParts = String(payload.duration || '').split(':').map((s: string) => Number(s))
  let durationMinutes = 0
  if (durationParts.length === 2) {
    durationMinutes = durationParts[0] * 60 + durationParts[1]
  } else if (durationParts.length === 1) {
    durationMinutes = durationParts[0]
  }

  const body = {
    exerciseTypeId: payload.exerciseTypeId ?? 1,
    title: payload.title,
    durationMinutes,
    caloriesBurned: payload.caloriesBurned ?? 0,
    activityDate: payload.date,
    notes: payload.description ?? null,
    isPrivate: payload.isPrivate ?? false,
  }

  return api.post('/activities', body)
}

export async function updateActivity(activityId: number, payload: any) {
  const durationParts = String(payload.duration || '').split(':').map((s: string) => Number(s))
  let durationMinutes: number | undefined = undefined
  if (payload.duration !== undefined) {
    if (durationParts.length === 2) durationMinutes = durationParts[0] * 60 + durationParts[1]
    else if (durationParts.length === 1) durationMinutes = durationParts[0]
  }

  const body: any = {}
  if (payload.title !== undefined) body.title = payload.title
  if (durationMinutes !== undefined) body.durationMinutes = durationMinutes
  if (payload.caloriesBurned !== undefined) body.caloriesBurned = payload.caloriesBurned
  if (payload.date !== undefined) body.activityDate = payload.date
  if (payload.description !== undefined) body.notes = payload.description
  if (payload.isPrivate !== undefined) body.isPrivate = payload.isPrivate

  return api.put(`/activities/${activityId}`, body)
}

export async function deleteActivity(activityId: number) {
  return api.del(`/activities/${activityId}`)
}

export async function friendFeed(friendIds: number[]) {
  const qs = friendIds.length ? `?friendIds=${friendIds.join(',')}` : ''
  return api.get(`/activities/friends${qs}`)
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
