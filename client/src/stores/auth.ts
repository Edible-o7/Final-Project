import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

export type Role = 'user' | 'admin'

export interface User {
  id: string
  name: string
  username: string
  password: string
  role: Role
}

export interface Activity {
  id: string
  userId: string
  title: string
  description: string
  distance: string
  duration: string
  date: string
}

export const useAuthStore = defineStore('auth', () => {
  // In-memory data. Refreshing the browser will reset everything.
  const users = ref<User[]>([
    {
      id: '1',
      name: 'John Smith',
      username: 'john',
      password: 'password',
      role: 'user',
    },
    {
      id: '2',
      name: 'Admin User',
      username: 'admin',
      password: 'admin',
      role: 'admin',
    },
  ])

  const currentUserId = ref<string | null>(null)

  const activities = ref<Activity[]>([
    {
      id: 'a1',
      userId: '1',
      title: 'Walked through campus',
      description: "A quick walk from dorms to the library.",
      distance: '1.2 mi',
      duration: '0:45',
      date: '2026-02-24',
    },
    {
      id: 'a2',
      userId: '2',
      title: 'Admin morning run',
      description: 'A quick run around the park for admin energy.',
      distance: '2.0 mi',
      duration: '0:30',
      date: '2026-03-16',
    },
  ])

  const currentUser = computed(() => {
    if (!currentUserId.value) return null
    return users.value.find((u) => u.id === currentUserId.value) ?? null
  })

  const isAuthenticated = computed(() => currentUser.value !== null)
  const isAdmin = computed(() => currentUser.value?.role === 'admin')

  const currentUserActivities = computed(() => {
    if (!currentUserId.value) return []
    return activities.value.filter((activity) => activity.userId === currentUserId.value)
  })

  const friendsActivities = computed(() => {
    if (!currentUserId.value) return []
    return activities.value.filter((activity) => activity.userId !== currentUserId.value)
  })

  function login(username: string, password: string) {
    const user = users.value.find((u) => u.username === username && u.password === password)
    if (!user) {
      return false
    }

    currentUserId.value = user.id
    return true
  }

  function logout() {
    currentUserId.value = null
  }

  function register(name: string, username: string, password: string) {
    const result = addUser({ name, username, password, role: 'user' })
    if (!result.success || !result.user) return result

    currentUserId.value = result.user.id
    return result
  }

  function addActivity(payload: Omit<Activity, 'id' | 'userId'>) {
    if (!currentUserId.value) return
    const id = Date.now().toString()
    activities.value.unshift({ id, userId: currentUserId.value, ...payload })
  }

  function deleteActivity(id: string) {
    activities.value = activities.value.filter((activity) => activity.id !== id)
  }

  function updateActivity(id: string, payload: Partial<Omit<Activity, 'id' | 'userId'>>) {
    const index = activities.value.findIndex((activity) => activity.id === id)
    if (index === -1) return

    const existing = activities.value[index]
    activities.value[index] = { ...(existing as Activity), ...(payload as Partial<Activity>) } as Activity
  }

  function isUsernameTaken(username: string, excludeId?: string) {
    return users.value.some((u) => u.username === username && u.id !== excludeId)
  }

  function addUser(payload: Omit<User, 'id'>) {
    if (isUsernameTaken(payload.username)) {
      return { success: false, message: 'Username already exists' }
    }

    const id = Date.now().toString()
    const newUser: User = { id, ...payload }
    users.value.push(newUser)

    return { success: true, user: newUser }
  }

  function updateUser(id: string, payload: Partial<Omit<User, 'id'>>) {
    const index = users.value.findIndex((u) => u.id === id)
    if (index === -1) {
      return { success: false, message: 'User not found' }
    }

    if (payload.username && isUsernameTaken(payload.username, id)) {
      return { success: false, message: 'Username already exists' }
    }

    users.value[index] = { ...(users.value[index] as User), ...(payload as Partial<User>) } as User
    return { success: true, user: users.value[index] }
  }

  function deleteUser(id: string) {
    users.value = users.value.filter((u) => u.id !== id)
    if (currentUserId.value === id) {
      currentUserId.value = null
    }
  }

  function getUserById(id: string) {
    return users.value.find((u) => u.id === id) ?? null
  }

  return {
    users,
    currentUser,
    activities,
    currentUserActivities,
    friendsActivities,
    isAuthenticated,
    isAdmin,
    login,
    logout,
    register,
    addUser,
    updateUser,
    deleteUser,
    addActivity,
    updateActivity,
    deleteActivity,
    getUserById,
  }
})
