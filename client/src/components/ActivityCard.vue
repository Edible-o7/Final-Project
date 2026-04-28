<script setup lang="ts">
import type { ActivityRecord } from '@/types/domain'

const props = defineProps<{ activity: ActivityRecord }>()
const emit = defineEmits<{
  (e: 'edit', activity: ActivityRecord): void
  (e: 'delete', activity: ActivityRecord): void
}>()

function onEdit() {
  emit('edit', props.activity)
}

function onDelete() {
  emit('delete', props.activity)
}
</script>

<template>
  <div class="box">
    <div class="level">
      <div class="level-left">
        <div>
          <p class="is-size-5 has-text-weight-semibold">{{ props.activity.title }}</p>
          <p class="is-size-7 has-text-grey">{{ props.activity.activityDate }}</p>
        </div>
      </div>

      <div class="level-right">
        <button class="button is-small is-warning" @click="onEdit">Edit</button>
        <button class="button is-small is-danger" @click="onDelete">Delete</button>
      </div>
    </div>

    <p class="mb-2">{{ props.activity.notes || 'No notes' }}</p>
    <div class="tags">
      <span class="tag is-info">Duration: {{ props.activity.durationMinutes }} min</span>
      <span class="tag is-info">Calories: {{ props.activity.caloriesBurned }}</span>
      <span class="tag" :class="props.activity.isPrivate ? 'is-warning' : 'is-success'">
        {{ props.activity.isPrivate ? 'Private' : 'Public' }}
      </span>
    </div>
  </div>
</template>
