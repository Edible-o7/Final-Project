import api from './api'

export async function getUser(userId: number) {
  return api.get(`/users/${userId}`)
}

export async function listUsers() {
  return api.get('/users')
}

export async function updateUser(userId: number, payload: any) {
  return api.put(`/users/${userId}`, payload)
}

export async function deleteUser(userId: number) {
  return api.del(`/users/${userId}`)
}

export async function mySummary() {
  return api.get('/users/me/summary')
}

export async function weeklySummary(userId: number, days?: number) {
  const q = days ? `?days=${days}` : ''
  return api.get(`/users/${userId}/weekly-summary${q}`)
}

export async function streak(userId: number) {
  return api.get(`/users/${userId}/streak`)
}

export default {
  getUser,
  listUsers,
  updateUser,
  deleteUser,
  mySummary,
  weeklySummary,
  streak,
}
