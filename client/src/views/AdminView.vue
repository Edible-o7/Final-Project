<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useAuthStore } from '../stores/auth'
import UserForm from '../components/UserForm.vue'
import UserTable from '../components/UserTable.vue'
import { listUsers, updateUser, deleteUser } from '@/services/userService'

interface AdminUser {
  id: number | string
  firstName?: string
  lastName?: string
  email?: string
  role?: string
}

const auth = useAuthStore()
const users = ref<AdminUser[]>([])
const isAdmin = computed(() => auth.isAdmin)

const mode = ref<'add' | 'edit'>('edit')
const selectedUser = ref<AdminUser | null>(null)
const error = ref('')
const loading = ref(false)

async function loadUsers() {
  if (!isAdmin.value) return
  loading.value = true
  error.value = ''
  try {
    const res = await listUsers()
    users.value = (res?.users ?? []) as AdminUser[]
  } catch (err: unknown) {
    error.value = err instanceof Error ? err.message : 'Unable to load users.'
  } finally {
    loading.value = false
  }
}

function startEdit(user: AdminUser) {
  mode.value = 'edit'
  selectedUser.value = user
  error.value = ''
}

function resetForm() {
  mode.value = 'edit'
  selectedUser.value = null
  error.value = ''
}

async function save(payload: {
  firstName?: string
  lastName?: string
  email?: string
  password?: string
  role?: string
}) {
  error.value = ''

  if (!selectedUser.value) {
    error.value = 'Select a user to edit from the table.'
    return
  }

  try {
    await updateUser(Number(selectedUser.value.id), payload)
    await loadUsers()
    resetForm()
  } catch (err: unknown) {
    error.value = err instanceof Error ? err.message : 'Unable to update user.'
    return
  }
}

async function remove(user: AdminUser) {
  const label = `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || user.email
  if (!confirm(`Delete user "${label}"? This cannot be undone.`)) return

  await deleteUser(Number(user.id))
  await loadUsers()
  if (selectedUser.value?.id === user.id) resetForm()
}

onMounted(async () => {
  await loadUsers()
})
</script>

<template>
  <section class="section">
    <div class="container">
      <h1 class="title">Admin Dashboard</h1>
      <p class="subtitle">Only users with the <strong>admin</strong> role can access this page.</p>

      <div v-if="!isAdmin" class="notification is-warning">
        You do not have permission to view this page.
      </div>

      <div v-else>
        <div class="notification is-info" v-if="loading">Loading users...</div>

        <UserForm
          :mode="mode"
          :user="selectedUser"
          :disabled="false"
          @save="save"
          @cancel="resetForm"
        />

        <p class="help is-danger" v-if="error">{{ error }}</p>

        <h2 class="subtitle">Registered users (select one to edit)</h2>
        <UserTable :users="users" @edit="startEdit" @delete="remove" />
      </div>
    </div>
  </section>
</template>
