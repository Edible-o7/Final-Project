<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
const users = computed(() => auth.users)
</script>

<template>
  <section class="section">
    <div class="container">
      <h1 class="title">Admin Dashboard</h1>
      <p class="subtitle">Only users with the <strong>admin</strong> role can access this page.</p>

      <div v-if="!auth.isAdmin" class="notification is-warning">
        You do not have permission to view this page.
      </div>

      <div v-else>
        <h2 class="subtitle">Registered users</h2>
        <table class="table is-fullwidth">
          <thead>
            <tr>
              <th>Name</th>
              <th>Username</th>
              <th>Role</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in users" :key="user.id">
              <td>{{ user.name }}</td>
              <td>{{ user.username }}</td>
              <td>{{ user.role }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
</template>
