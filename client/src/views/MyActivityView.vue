<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useAuthStore } from '../stores/auth'
import StatTrack from '../components/StatTrack.vue'
import ActivityForm from '../components/ActivityForm.vue'
import ActivityList from '../components/ActivityList.vue'
import type { ActivityFormPayload, ActivityRecord } from '@/types/domain'
import { createActivity, deleteActivity, getMyActivities, updateActivity } from '@/services/activityService'

const auth = useAuthStore()
const activities = ref<ActivityRecord[]>([])
const isLoading = ref(false)
const error = ref('')

const editing = ref<ActivityRecord | null>(null)

async function loadActivities() {
  if (!auth.isAuthenticated) return

  isLoading.value = true
  error.value = ''
  try {
    const res = await getMyActivities()
    activities.value = (res?.activities ?? []) as ActivityRecord[]
  } catch (err: unknown) {
    error.value = err instanceof Error ? err.message : 'Unable to load activities'
  } finally {
    isLoading.value = false
  }
}

async function onSave(payload: ActivityFormPayload) {
  if (!auth.isAuthenticated) return

  if (editing.value) {
    await updateActivity(editing.value.id, payload)
    editing.value = null
    await loadActivities()
    return
  }

  await createActivity(payload)
  await loadActivities()
}

function onEdit(activity: ActivityRecord) {
  editing.value = activity
}

function onCancel() {
  editing.value = null
}

async function onDelete(activity: ActivityRecord) {
  await deleteActivity(activity.id)
  await loadActivities()
  if (editing.value?.id === activity.id) {
    editing.value = null
  }
}

onMounted(async () => {
  await loadActivities()
})
</script>

<template>
  <section class="section">
    <div class="container">
      <div class="content">
        <h1 class="title">My Activity</h1>
        <p class="subtitle" v-if="auth.currentUser">
          Welcome back, <strong>{{ auth.currentUser.firstName }}</strong>.
        </p>
        <p class="subtitle" v-else>
          Please log in to see your activity history.
        </p>
      </div>

      <div class="notification is-info" v-if="isLoading">Loading activities...</div>
      <div class="notification is-danger" v-else-if="error">{{ error }}</div>

      <StatTrack />

      <ActivityForm
        :mode="editing ? 'edit' : 'add'"
        :activity="editing"
        :disabled="!auth.isAuthenticated"
        @save="onSave"
        @cancel="onCancel"
      >
        <template #default>
          <h2 class="subtitle">Your activities</h2>
          <ActivityList
            :activities="activities"
            @edit="onEdit"
            @delete="onDelete"
          />
        </template>
      </ActivityForm>
    </div>
  </section>
</template>
