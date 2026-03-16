<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()

const friendsActivities = computed(() => auth.friendsActivities)
</script>

<template>
  <section class="section">
    <div class="container">
      <h1 class="title">Friends Activity</h1>
      <p class="subtitle" v-if="!auth.isAuthenticated">
        Please log in to see friends' activities.
      </p>

      <div v-if="auth.isAuthenticated">
        <div v-if="friendsActivities.length === 0" class="notification is-light">
          No friend activity yet.
        </div>

        <div v-for="activity in friendsActivities" :key="activity.id" class="box">
          <div class="level">
            <div class="level-left">
              <div>
                <p class="is-size-5 has-text-weight-semibold">{{ activity.title }}</p>
                <p class="is-size-7 has-text-grey">
                  {{ activity.date }} &middot; {{ auth.getUserById(activity.userId)?.name || 'Unknown' }}
                </p>
              </div>
            </div>
          </div>

          <p class="mb-2">{{ activity.description }}</p>
          <div class="tags">
            <span class="tag is-info">Distance: {{ activity.distance }}</span>
            <span class="tag is-info">Duration: {{ activity.duration }}</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
