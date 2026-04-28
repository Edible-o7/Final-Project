import api from "./api"

export interface SignupPayload {
  firstName: string
  lastName: string
  email: string
  password: string
}

export interface LoginPayload {
  email: string
  password: string
}

export async function signup(payload: SignupPayload) {
  return api.post("/auth/signup", payload)
}

export async function login(payload: LoginPayload) {
  const res = await api.post("/auth/login", payload)
  if (res?.token) api.setToken(res.token)
  return res
}

export async function me() {
  return api.get("/auth/me")
}

export function logout() {
  api.setToken(null)
}

export default { signup, login, me, logout }
