<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import type { ActivityFormPayload, ActivityRecord } from '@/types/domain'

const props = defineProps<{
  mode: 'add' | 'edit'
  activity?: ActivityRecord | null
  disabled?: boolean
}>()

const emit = defineEmits<{
  (e: 'save', payload: ActivityFormPayload): void
  (e: 'cancel'): void
}>()

const form = reactive({
  exerciseTypeId: 1,
  title: '',
  notes: '',
  durationMinutes: 30,
  caloriesBurned: 0,
  activityDate: new Date().toISOString().slice(0, 10),
  isPrivate: false,
})

const buttonLabel = computed(() => (props.mode === 'edit' ? 'Save changes' : 'Add activity'))

watch(
  () => props.activity,
  (activity) => {
    if (!activity) {
      form.exerciseTypeId = 1
      form.title = ''
      form.notes = ''
      form.durationMinutes = 30
      form.caloriesBurned = 0
      form.activityDate = new Date().toISOString().slice(0, 10)
      form.isPrivate = false
      return
    }

    form.exerciseTypeId = activity.exerciseTypeId
    form.title = activity.title
    form.notes = activity.notes ?? ''
    form.durationMinutes = activity.durationMinutes
    form.caloriesBurned = activity.caloriesBurned
    form.activityDate = activity.activityDate
    form.isPrivate = activity.isPrivate
  },
  { immediate: true }
)

function onSubmit() {
  if (!form.title.trim() || !Number.isFinite(form.durationMinutes) || form.durationMinutes <= 0) {
    return
  }

  emit('save', {
    exerciseTypeId: form.exerciseTypeId,
    title: form.title.trim(),
    notes: form.notes.trim() || null,
    durationMinutes: Number(form.durationMinutes),
    caloriesBurned: Number(form.caloriesBurned) || 0,
    activityDate: form.activityDate,
    isPrivate: form.isPrivate,
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
          <label class="label">Exercise Type ID</label>
          <div class="control">
            <input class="input" v-model.number="form.exerciseTypeId" type="number" min="1" />
          </div>
        </div>

        <div class="field">
          <label class="label">Title</label>
          <div class="control">
            <input class="input" v-model="form.title" placeholder="Walk around campus" />
          </div>
        </div>

        <div class="field">
          <label class="label">Notes</label>
          <div class="control">
            <input class="input" v-model="form.notes" placeholder="How did it go?" />
          </div>
        </div>

        <div class="field">
          <label class="label">Duration (minutes)</label>
          <div class="control">
            <input class="input" v-model.number="form.durationMinutes" type="number" min="1" />
          </div>
        </div>

        <div class="field">
          <label class="label">Calories</label>
          <div class="control">
            <input class="input" v-model.number="form.caloriesBurned" type="number" min="0" />
          </div>
        </div>

        <div class="field">
          <label class="label">Date</label>
          <div class="control">
            <input class="input" v-model="form.activityDate" type="date" />
          </div>
        </div>

        <div class="field">
          <label class="checkbox">
            <input type="checkbox" v-model="form.isPrivate" />
            Private activity
          </label>
        </div>

        <div class="field">
          <p class="help is-info">Use a valid Exercise Type ID from your database.</p>
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
