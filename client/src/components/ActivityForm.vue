<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import type { Activity } from '../stores/auth'

const props = defineProps<{
  mode: 'add' | 'edit'
  activity?: Activity | null
  disabled?: boolean
}>()

const emit = defineEmits<{
  (e: 'save', payload: Omit<Activity, 'id' | 'userId'>): void
  (e: 'cancel'): void
}>()

const form = reactive({
  title: '',
  description: '',
  distance: '',
  duration: '',
  date: new Date().toISOString().slice(0, 10),
})

const buttonLabel = computed(() => (props.mode === 'edit' ? 'Save changes' : 'Add activity'))

watch(
  () => props.activity,
  (activity) => {
    if (!activity) {
      form.title = ''
      form.description = ''
      form.distance = ''
      form.duration = ''
      form.date = new Date().toISOString().slice(0, 10)
      return
    }

    form.title = activity.title
    form.description = activity.description
    form.distance = activity.distance
    form.duration = activity.duration
    form.date = activity.date
  },
  { immediate: true }
)

function onSubmit() {
  if (!form.title.trim() || !form.distance.trim() || !form.duration.trim()) {
    return
  }

  emit('save', {
    title: form.title.trim(),
    description: form.description.trim(),
    distance: form.distance.trim(),
    duration: form.duration.trim(),
    date: form.date,
  })
}

function onCancel() {
  emit('cancel')
}
</script>

<template>
  <div class="box" style="max-width: 760px; margin-top: 2rem;">
    <h2 class="subtitle">{{ props.mode === 'add' ? 'Add a new activity' : 'Edit activity' }}</h2>

    <div class="columns is-multiline">
      <div class="column is-half">
        <div class="field">
          <label class="label">Title</label>
          <div class="control">
            <input class="input" v-model="form.title" placeholder="Walk around campus" />
          </div>
        </div>

        <div class="field">
          <label class="label">Description</label>
          <div class="control">
            <input class="input" v-model="form.description" placeholder="How did it go?" />
          </div>
        </div>

        <div class="field">
          <label class="label">Distance</label>
          <div class="control">
            <input class="input" v-model="form.distance" placeholder="1.2 mi" />
          </div>
        </div>

        <div class="field">
          <label class="label">Duration</label>
          <div class="control">
            <input class="input" v-model="form.duration" placeholder="0:45" />
          </div>
        </div>

        <div class="field">
          <label class="label">Date</label>
          <div class="control">
            <input class="input" v-model="form.date" type="date" />
          </div>
        </div>

        <div class="field">
          <div class="control">
            <button class="button is-primary" @click="onSubmit" :disabled="props.disabled">
              {{ buttonLabel }}
            </button>
            <button
              v-if="props.mode === 'edit'"
              class="button is-light"
              @click="onCancel"
              type="button"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>

      <div class="column is-half">
        <slot />
      </div>
    </div>
  </div>
</template>
