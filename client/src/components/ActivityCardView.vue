<script setup lang="ts">
import type { ActivityRecord } from '@/types/domain'

defineProps<{ activity: ActivityRecord }>()
</script>

<template>
  <div class="box">
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
      <span class="tag" :class="activity.isPrivate ? 'is-warning' : 'is-success'">
        {{ activity.isPrivate ? 'Private' : 'Public' }}
      </span>
    </div>
  </div>
</template>
