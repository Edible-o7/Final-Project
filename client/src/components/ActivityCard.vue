<script setup lang="ts">
import type { Activity } from '../stores/auth'

const props = defineProps<{ activity: Activity }>()
const emit = defineEmits<{
  (e: 'edit', activity: Activity): void
  (e: 'delete', activity: Activity): void
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
          <p class="is-size-7 has-text-grey">{{ props.activity.date }}</p>
        </div>
      </div>

      <div class="level-right">
        <button class="button is-small is-warning" @click="onEdit">Edit</button>
        <button class="button is-small is-danger" @click="onDelete">Delete</button>
      </div>
    </div>

    <p class="mb-2">{{ props.activity.description }}</p>
    <div class="tags">
      <span class="tag is-info">Distance: {{ props.activity.distance }}</span>
      <span class="tag is-info">Duration: {{ props.activity.duration }}</span>
    </div>
  </div>
</template>
