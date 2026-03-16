<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const auth = useAuthStore()

const name = ref('')
const username = ref('')
const password = ref('')
const error = ref('')

function submit() {
  error.value = ''

  if (!name.value.trim() || !username.value.trim() || !password.value) {
    error.value = 'All fields are required.'
    return
  }

  const result = auth.register(name.value.trim(), username.value.trim(), password.value)
  if (!result.success) {
    error.value = result.message ?? 'Unable to create account.'
    return
  }

  router.push({ name: 'my-activity' })
}
</script>

<template>
  <section class="section">
    <div class="container">
      <h1 class="title">Create an account</h1>

      <div class="box" style="max-width: 440px;">
        <div class="field">
          <label class="label">Name</label>
          <div class="control">
            <input class="input" v-model="name" type="text" placeholder="Your name" />
          </div>
        </div>

        <div class="field">
          <label class="label">Username</label>
          <div class="control">
            <input class="input" v-model="username" type="text" placeholder="Choose a username" />
          </div>
        </div>

        <div class="field">
          <label class="label">Password</label>
          <div class="control">
            <input class="input" v-model="password" type="password" placeholder="Choose a password" />
          </div>
        </div>

        <div class="field">
          <p class="help is-danger" v-if="error">{{ error }}</p>
        </div>

        <div class="field is-grouped">
          <div class="control">
            <button class="button is-primary" @click="submit">Create account</button>
          </div>
          <div class="control">
            <router-link class="button is-text" to="/log-in">Back to login</router-link>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
