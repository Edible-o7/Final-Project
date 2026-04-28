<script setup lang="ts">
import { computed, reactive, watch } from 'vue'

interface UserPayload {
  id?: number | string
  firstName?: string
  lastName?: string
  email?: string
  password?: string
  role?: string
}

const props = defineProps<{
  mode: 'add' | 'edit'
  user?: UserPayload | null
  disabled?: boolean
}>()

const emit = defineEmits<{
  (e: 'save', payload: UserPayload): void
  (e: 'cancel'): void
}>()

const form = reactive<UserPayload>({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  role: 'user',
})

const buttonLabel = computed(() => (props.mode === 'edit' ? 'Save changes' : 'Create user'))

watch(
  () => props.user,
  (user) => {
      if (!user) {
        form.firstName = ''
        form.lastName = ''
        form.email = ''
        form.password = ''
        form.role = 'user'
        return
      }

      form.firstName = user.firstName ?? ''
      form.lastName = user.lastName ?? ''
      form.email = user.email ?? ''
      form.password = ''
      form.role = user.role ?? 'user'
  },
  { immediate: true }
)

function onSubmit() {
  if (!form.firstName?.trim() || !form.lastName?.trim() || !form.email?.trim()) {
    return
  }

  const payload: UserPayload = {
    firstName: form.firstName?.trim(),
    lastName: form.lastName?.trim(),
    email: form.email?.trim(),
    role: form.role,
  }

  if (form.password) {
    payload.password = form.password
  }

  emit('save', payload)
}

function onCancel() {
  emit('cancel')
}
</script>

<template>
  <div class="box" style="max-width: 600px;">
    <h2 class="subtitle">{{ props.mode === 'add' ? 'Add user' : 'Edit user' }}</h2>

    <div class="field">
      <label class="label">First name</label>
      <div class="control">
        <input class="input" v-model="form.firstName" type="text" placeholder="First name" />
      </div>
    </div>

    <div class="field">
      <label class="label">Last name</label>
      <div class="control">
        <input class="input" v-model="form.lastName" type="text" placeholder="Last name" />
      </div>
    </div>

    <div class="field">
      <label class="label">Email</label>
      <div class="control">
        <input class="input" v-model="form.email" type="email" placeholder="Email" />
      </div>
    </div>

    <div class="field">
      <label class="label">Password</label>
      <div class="control">
        <input
          class="input"
          v-model="form.password"
          type="password"
          :placeholder="props.mode === 'edit' ? 'Leave blank to keep current password' : 'Password'"
        />
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
