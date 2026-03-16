<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const auth = useAuthStore()

const username = ref('')
const password = ref('')
const error = ref('')

function submit() {
  error.value = ''
  const ok = auth.login(username.value.trim(), password.value)
  if (!ok) {
    error.value = 'Invalid username or password.'
    return
  }

  router.push({ name: 'my-activity' })
}
</script>

<template>
  <section class="section">
    <div class="container">
      <h1 class="title">Log in</h1>

      <div class="box" style="max-width: 420px;">
        <div class="field">
          <label class="label">Username</label>
          <div class="control">
            <input
              class="input"
              v-model="username"
              type="text"
              autocomplete="username"
              placeholder="Enter username"
            />
          </div>
        </div>

        <div class="field">
          <label class="label">Password</label>
          <div class="control">
            <input
              class="input"
              v-model="password"
              type="password"
              autocomplete="current-password"
              placeholder="Enter password"
            />
          </div>
        </div>

        <div class="field">
          <p class="help is-danger" v-if="error">{{ error }}</p>
        </div>

        <div class="field is-grouped">
          <div class="control">
            <button class="button is-primary" @click="submit">Sign in</button>
          </div>
          <div class="control">
            <router-link class="button is-text" to="/sign-up">Create account</router-link>
          </div>
        </div>

        <p class="is-size-7 has-text-grey">
          Tip: Use <strong>john</strong>/<strong>password</strong> or <strong>admin</strong>/<strong>admin</strong>
        </p>
      </div>
    </div>
  </section>
</template>
