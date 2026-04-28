import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import authService from '@/services/authService'
import api from '@/services/api'

export interface SafeUser {
  id: number
  firstName: string
  lastName: string
  email: string
  bio?: string | null
  avatarUrl?: string | null
  role?: string
}

export const useAuthStore = defineStore('auth', () => {
  const currentUser = ref<SafeUser | null>(null)
  const isLoading = ref(false)

  const isAuthenticated = computed(() => currentUser.value !== null)
  const isAdmin = computed(() => currentUser.value?.role === 'admin')

  async function init() {
    const token = api.getToken()
    if (!token) return

    isLoading.value = true
    try {
      const res = await authService.me()
      if (res?.user) currentUser.value = res.user
    } catch (e) {
      api.setToken(null)
      currentUser.value = null
    } finally {
      isLoading.value = false
    }
  }

  async function login(email: string, password: string) {
    isLoading.value = true
    try {
      const res = await authService.login({ email, password })
      if (res?.token) {
        api.setToken(res.token)
        currentUser.value = res.user ?? null
        return { success: true }
      }

      return { success: false, message: res?.message }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err)
      return { success: false, message: message ?? 'Login failed' }
    } finally {
      isLoading.value = false
    }
  }

  async function register(payload: { firstName: string; lastName: string; email: string; password: string }) {
    isLoading.value = true
    try {
      const res = await authService.signup(payload)
      if (res?.token) {
        api.setToken(res.token)
        currentUser.value = res.user ?? null
        return { success: true }
      }

      return { success: false, message: res?.message }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err)
      return { success: false, message: message ?? 'Signup failed' }
    } finally {
      isLoading.value = false
    }
  }

  function logout() {
    api.setToken(null)
    currentUser.value = null
  }

  return {
    currentUser,
    isAuthenticated,
    isAdmin,
    isLoading,
    init,
    login,
    register,
    logout,
  }
})
