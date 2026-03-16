<script setup lang="ts">
import type { Activity } from '../stores/auth'

const props = defineProps<{ activities: Activity[] }>()
defineEmits<{
  (e: 'edit', activity: Activity): void
  (e: 'delete', activity: Activity): void
}>()
</script>

<template>
  <div>
    <div v-if="props.activities.length === 0" class="notification is-light">
      No activities yet. Add one to see it here.
    </div>

    <ActivityCard
      v-for="activity in props.activities"
      :key="activity.id"
      :activity="activity"
      @edit="$emit('edit', $event)"
      @delete="$emit('delete', $event)"
    />
  </div>
</template>

<script setup lang="ts">
import ActivityCard from './ActivityCard.vue'
</script>
