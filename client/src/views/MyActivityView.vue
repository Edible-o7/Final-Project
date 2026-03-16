<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'
import StatTrack from '../components/StatTrack.vue'
import ActivityForm from '../components/ActivityForm.vue'
import ActivityList from '../components/ActivityList.vue'
import type { Activity } from '../stores/auth'

const auth = useAuthStore()

const editing = ref<Activity | null>(null)

function onSave(payload: Omit<Activity, 'id' | 'userId'>) {
  if (!auth.isAuthenticated) return

  if (editing.value) {
    auth.updateActivity(editing.value.id, payload)
    editing.value = null
    return
  }

  auth.addActivity(payload)
}

function onEdit(activity: Activity) {
  editing.value = activity
}

function onCancel() {
  editing.value = null
}

function onDelete(activity: Activity) {
  auth.deleteActivity(activity.id)
  if (editing.value?.id === activity.id) {
    editing.value = null
  }
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
            :activities="auth.currentUserActivities"
            @edit="onEdit"
            @delete="onDelete"
          />
        </template>
      </ActivityForm>
    </div>
  </section>
</template>
