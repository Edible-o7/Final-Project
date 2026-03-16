<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import type { Role, User } from '../stores/auth'

const props = defineProps<{
  mode: 'add' | 'edit'
  user?: User | null
  disabled?: boolean
}>()

const emit = defineEmits<{
  (e: 'save', payload: { name: string; username: string; password: string; role: Role }): void
  (e: 'cancel'): void
}>()

const form = reactive({
  name: '',
  username: '',
  password: '',
  role: 'user' as Role,
})

const buttonLabel = computed(() => (props.mode === 'edit' ? 'Save changes' : 'Create user'))

watch(
  () => props.user,
  (user) => {
    if (!user) {
      form.name = ''
      form.username = ''
      form.password = ''
      form.role = 'user'
      return
    }

    form.name = user.name
    form.username = user.username
    form.password = user.password
    form.role = user.role
  },
  { immediate: true }
)

function onSubmit() {
  if (!form.name.trim() || !form.username.trim() || !form.password.trim()) {
    return
  }

  emit('save', {
    name: form.name.trim(),
    username: form.username.trim(),
    password: form.password,
    role: form.role,
  })
}

function onCancel() {
  emit('cancel')
}
</script>

<template>
  <div class="box" style="max-width: 600px;">
    <h2 class="subtitle">{{ props.mode === 'add' ? 'Add user' : 'Edit user' }}</h2>

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

    <div class="field is-grouped">
      <div class="control">
        <button class="button is-primary" @click="onSubmit" :disabled="props.disabled">
          {{ buttonLabel }}
        </button>
      </div>
      <div class="control" v-if="props.mode === 'edit'">
        <button class="button is-light" @click="onCancel" type="button">
          Cancel
        </button>
      </div>
    </div>
  </div>
</template>
