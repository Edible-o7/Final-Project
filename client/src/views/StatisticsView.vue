<script setup lang="ts">
import StatTrack from '../components/StatTrack.vue'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
</script>

<template>
  <section class="section">
    <div class="container">
      <h1 class="title">Statistics</h1>
      <p class="subtitle" v-if="!auth.isAuthenticated">
        Please log in to view your statistics.
      </p>

      <StatTrack v-if="auth.isAuthenticated" />
    </div>
  </section>
</template>
