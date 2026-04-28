<script setup lang="ts">
import type { ActivityRecord } from '@/types/domain'
import ActivityCard from './ActivityCard.vue'

const props = defineProps<{ activities: ActivityRecord[] }>()
defineEmits<{
  (e: 'edit', activity: ActivityRecord): void
  (e: 'delete', activity: ActivityRecord): void
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
