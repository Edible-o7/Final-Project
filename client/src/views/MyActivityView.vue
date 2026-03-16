<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'
import StatTrack from '../components/StatTrack.vue'

const auth = useAuthStore()

const title = ref('')
const description = ref('')
const distance = ref('')
const duration = ref('')
const date = ref(new Date().toISOString().slice(0, 10))

function addActivity() {
  if (!title.value.trim() || !distance.value.trim() || !duration.value.trim()) {
    return
  }

  auth.addActivity({
    title: title.value.trim(),
    description: description.value.trim(),
    distance: distance.value.trim(),
    duration: duration.value.trim(),
    date: date.value,
  })

  title.value = ''
  description.value = ''
  distance.value = ''
  duration.value = ''
  date.value = new Date().toISOString().slice(0, 10)
}
</script>

<template>
  <section class="section">
    <div class="container">
      <div class="content">
        <h1 class="title">My Activity</h1>
        <p class="subtitle" v-if="auth.currentUser">
          Welcome back, <strong>{{ auth.currentUser.name }}</strong>.
        </p>
        <p class="subtitle" v-else>
          Please log in to see your activity history.
        </p>
      </div>

      <StatTrack />

      <div class="box" style="max-width: 760px; margin-top: 2rem;">
        <h2 class="subtitle">Add a new activity</h2>

        <div class="columns is-multiline">
          <div class="column is-half">
            <div class="field">
              <label class="label">Title</label>
              <div class="control">
                <input class="input" v-model="title" placeholder="Walk around campus" />
              </div>
            </div>

            <div class="field">
              <label class="label">Description</label>
              <div class="control">
                <input class="input" v-model="description" placeholder="How did it go?" />
              </div>
            </div>

            <div class="field">
              <label class="label">Distance</label>
              <div class="control">
                <input class="input" v-model="distance" placeholder="1.2 mi" />
              </div>
            </div>

            <div class="field">
              <label class="label">Duration</label>
              <div class="control">
                <input class="input" v-model="duration" placeholder="0:45" />
              </div>
            </div>

            <div class="field">
              <label class="label">Date</label>
              <div class="control">
                <input class="input" v-model="date" type="date" />
              </div>
            </div>

            <div class="field">
              <div class="control">
                <button class="button is-primary" @click="addActivity" :disabled="!auth.isAuthenticated">
                  Add activity
                </button>
              </div>
            </div>
          </div>

          <div class="column is-half">
            <h2 class="subtitle">Your activities</h2>
            <div v-if="auth.currentUserActivities.length === 0" class="notification is-light">
              No activities yet. Add one to see it here.
            </div>

            <div v-for="activity in auth.currentUserActivities" :key="activity.id" class="box">
              <div class="level">
                <div class="level-left">
                  <div>
                    <p class="is-size-5 has-text-weight-semibold">{{ activity.title }}</p>
                    <p class="is-size-7 has-text-grey">{{ activity.date }}</p>
                  </div>
                </div>

                <div class="level-right">
                  <button class="button is-small is-danger" @click="auth.deleteActivity(activity.id)">
                    Delete
                  </button>
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
      </div>
    </div>
  </section>
</template>
