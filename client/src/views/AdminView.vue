<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useAuthStore } from '../stores/auth'
import type { Role, User } from '../stores/auth'

const auth = useAuthStore()
const users = computed(() => auth.users)
const isAdmin = computed(() => auth.isAdmin)

const formMode = ref<'add' | 'edit'>('add')
const selectedUserId = ref<string | null>(null)
const error = ref('')

const form = reactive({
  name: '',
  username: '',
  password: '',
  role: 'user' as Role,
})

function resetForm() {
  form.name = ''
  form.username = ''
  form.password = ''
  form.role = 'user'
  selectedUserId.value = null
  formMode.value = 'add'
  error.value = ''
}

function startEdit(user: User) {
  formMode.value = 'edit'
  selectedUserId.value = user.id
  form.name = user.name
  form.username = user.username
  form.password = user.password
  form.role = user.role
  error.value = ''
}

function submit() {
  error.value = ''

  if (!form.name.trim() || !form.username.trim() || !form.password.trim()) {
    error.value = 'Name, username, and password are required.'
    return
  }

  if (formMode.value === 'add') {
    const result = auth.addUser({
      name: form.name.trim(),
      username: form.username.trim(),
      password: form.password,
      role: form.role,
    })
    if (!result.success) {
      error.value = result.message ?? 'Unable to create user.'
      return
    }

    resetForm()
    return
  }

  if (!selectedUserId.value) return

  const result = auth.updateUser(selectedUserId.value, {
    name: form.name.trim(),
    username: form.username.trim(),
    password: form.password,
    role: form.role,
  })

  if (!result.success) {
    error.value = result.message ?? 'Unable to update user.'
    return
  }

  resetForm()
}

function remove(user: User) {
  if (!confirm(`Delete user "${user.username}"? This cannot be undone.`)) return

  auth.deleteUser(user.id)
  if (selectedUserId.value === user.id) resetForm()
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
        <div class="box" style="max-width: 600px;">
          <h2 class="subtitle">{{ formMode === 'add' ? 'Add user' : 'Edit user' }}</h2>

          <div class="field">
            <label class="label">Name</label>
            <div class="control">
              <input class="input" v-model="form.name" type="text" placeholder="Name" />
            </div>
          </div>

          <div class="field">
            <label class="label">Username</label>
            <div class="control">
              <input class="input" v-model="form.username" type="text" placeholder="Username" />
            </div>
          </div>

          <div class="field">
            <label class="label">Password</label>
            <div class="control">
              <input class="input" v-model="form.password" type="password" placeholder="Password" />
            </div>
          </div>

          <div class="field">
            <label class="label">Role</label>
            <div class="control">
              <div class="select">
                <select v-model="form.role">
                  <option value="user">user</option>
                  <option value="admin">admin</option>
                </select>
              </div>
            </div>
          </div>

          <p class="help is-danger" v-if="error">{{ error }}</p>

          <div class="field is-grouped">
            <div class="control">
              <button class="button is-primary" @click="submit">
                {{ formMode === 'add' ? 'Create user' : 'Save changes' }}
              </button>
            </div>
            <div class="control" v-if="formMode === 'edit'">
              <button class="button is-light" @click="resetForm">Cancel</button>
            </div>
          </div>
        </div>

        <h2 class="subtitle">Registered users</h2>
        <table class="table is-fullwidth is-striped is-hoverable">
          <thead>
            <tr>
              <th>Name</th>
              <th>Username</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in users" :key="user.id">
              <td>{{ user.name }}</td>
              <td>{{ user.username }}</td>
              <td>{{ user.role }}</td>
              <td>
                <button class="button is-small is-info" @click="startEdit(user)">Edit</button>
                <button class="button is-small is-danger" @click="remove(user)">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
</template>
