<script setup lang="ts">
import { computed, ref } from 'vue'
import { useAuthStore } from '../stores/auth'
import UserForm from '../components/UserForm.vue'
import UserTable from '../components/UserTable.vue'
import type { Role, User } from '../stores/auth'

const auth = useAuthStore()
const users = computed(() => auth.users)
const isAdmin = computed(() => auth.isAdmin)

const mode = ref<'add' | 'edit'>('add')
const selectedUser = ref<User | null>(null)
const error = ref('')

function startEdit(user: User) {
  mode.value = 'edit'
  selectedUser.value = user
  error.value = ''
}

function resetForm() {
  mode.value = 'add'
  selectedUser.value = null
  error.value = ''
}

function save(payload: { name: string; username: string; password: string; role: Role }) {
  error.value = ''

  if (mode.value === 'add') {
    const result = auth.addUser(payload)
    if (!result.success) {
      error.value = result.message ?? 'Unable to create user.'
      return
    }

    resetForm()
    return
  }

  if (!selectedUser.value) return

  const result = auth.updateUser(selectedUser.value.id, payload)
  if (!result.success) {
    error.value = result.message ?? 'Unable to update user.'
    return
  }

  resetForm()
}

function remove(user: User) {
  if (!confirm(`Delete user "${user.username}"? This cannot be undone.`)) return

  auth.deleteUser(user.id)
  if (selectedUser.value?.id === user.id) resetForm()
}
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
        <UserForm
          :mode="mode"
          :user="selectedUser"
          :disabled="false"
          @save="save"
          @cancel="resetForm"
        />

        <p class="help is-danger" v-if="error">{{ error }}</p>

        <h2 class="subtitle">Registered users</h2>
        <UserTable :users="users" @edit="startEdit" @delete="remove" />
      </div>
    </div>
  </section>
</template>
