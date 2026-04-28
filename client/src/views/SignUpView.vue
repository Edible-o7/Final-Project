<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const auth = useAuthStore()

const firstName = ref('')
const lastName = ref('')
const email = ref('')
const password = ref('')
const error = ref('')

async function submit() {
  error.value = ''

  if (!firstName.value.trim() || !lastName.value.trim() || !email.value.trim() || !password.value) {
    error.value = 'All fields are required.'
    return
  }

  const res = await auth.register({ firstName: firstName.value.trim(), lastName: lastName.value.trim(), email: email.value.trim(), password: password.value })
  if (!res.success) {
    error.value = res.message ?? 'Unable to create account.'
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
          <label class="label">First name</label>
          <div class="control">
            <input class="input" v-model="firstName" type="text" placeholder="First name" />
          </div>
        </div>

        <div class="field">
          <label class="label">Last name</label>
          <div class="control">
            <input class="input" v-model="lastName" type="text" placeholder="Last name" />
          </div>
        </div>

        <div class="field">
          <label class="label">Email</label>
          <div class="control">
            <input class="input" v-model="email" type="email" placeholder="you@example.com" />
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
