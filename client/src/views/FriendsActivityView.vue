<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useAuthStore } from '../stores/auth'
import { friendFeed } from '@/services/activityService'
import type { ActivityRecord } from '@/types/domain'

const auth = useAuthStore()
const activities = ref<ActivityRecord[]>([])
const error = ref('')
const loading = ref(false)

async function loadFeed() {
  if (!auth.isAuthenticated) return

  loading.value = true
  error.value = ''
  try {
    const res = await friendFeed()
    activities.value = (res?.activities ?? []) as ActivityRecord[]
  } catch (err: unknown) {
    error.value = err instanceof Error ? err.message : 'Unable to load friend activity'
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await loadFeed()
})
</script>

<template>
  <section class="section">
    <div class="container">
      <h1 class="title">Friends Activity</h1>
      <p class="subtitle" v-if="!auth.isAuthenticated">
        Please log in to see friends' activities.
      </p>

      <div v-if="auth.isAuthenticated">
        <button class="button is-link mb-4" @click="loadFeed" :disabled="loading">Refresh Feed</button>

        <div class="notification is-info" v-if="loading">Loading friend activity...</div>
        <div class="notification is-danger" v-else-if="error">{{ error }}</div>

        <div v-if="!loading && activities.length === 0" class="notification is-light">
          No friend activity yet.
        </div>

        <div v-for="activity in activities" :key="activity.id" class="box">
          <div class="level">
            <div class="level-left">
              <div>
                <p class="is-size-5 has-text-weight-semibold">{{ activity.title }}</p>
                <p class="is-size-7 has-text-grey">
                  {{ activity.activityDate }} &middot; User #{{ activity.userId }}
                </p>
              </div>
            </div>
          </div>

          <p class="mb-2">{{ activity.notes || 'No notes' }}</p>
          <div class="tags">
            <span class="tag is-info">Duration: {{ activity.durationMinutes }} min</span>
            <span class="tag is-info">Calories: {{ activity.caloriesBurned }}</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
