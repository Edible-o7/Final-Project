<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { mySummary } from '@/services/userService'

const summary = ref({
  activityCount: 0,
  totalMinutes: 0,
  totalCalories: 0,
})

const loading = ref(false)
const error = ref('')

onMounted(async () => {
  loading.value = true
  error.value = ''
  try {
    const res = await mySummary()
    if (res?.summary) {
      summary.value = {
        activityCount: Number(res.summary.activityCount || 0),
        totalMinutes: Number(res.summary.totalMinutes || 0),
        totalCalories: Number(res.summary.totalCalories || 0),
      }
    }
  } catch (err: unknown) {
    error.value = err instanceof Error ? err.message : 'Unable to load statistics'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <section class="stats">
    <div class="section-heading">
      <h2>Statistics</h2>
    </div>

    <div class="notification is-info" v-if="loading">Loading statistics...</div>
    <div class="notification is-danger" v-else-if="error">{{ error }}</div>

    <div class="stat-cards" v-else>
      <article class="card stat-card">
        <header class="card-header">
          <p class="card-header-title">Your totals</p>
        </header>
        <div class="card-content">
          <div class="columns is-multiline is-mobile">
            <div class="column is-half">
              <p class="stat-value has-text-success">{{ summary.activityCount }}</p>
              <p class="stat-label">Activities</p>
            </div>
            <div class="column is-half">
              <p class="stat-value has-text-success">{{ summary.totalMinutes }}</p>
              <p class="stat-label">Minutes</p>
            </div>
            <div class="column is-half">
              <p class="stat-value has-text-success">{{ summary.totalCalories }}</p>
              <p class="stat-label">Calories</p>
            </div>
          </div>
        </div>
      </article>
    </div>
  </section>
</template>

<style scoped>
.stats {
  max-width: 860px;
  margin: 0 auto;
  padding: 1rem 0;
}

.section-heading {
  text-align: center;
  margin-bottom: 1.5rem;
}

.section-heading h2 {
  font-size: 1.75rem;
  font-weight: 700;
  letter-spacing: 0.02em;
}

.stat-cards {
  display: grid;
  gap: 1rem;
}

@media (min-width: 768px) {
  .stat-cards {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

.stat-card {
  border-radius: 0.75rem;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(16, 185, 129, 0.15);
}

.card-header {
  background: rgba(16, 185, 129, 0.12);
  border-bottom: 1px solid rgba(16, 185, 129, 0.2);
}

.card-header-title {
  font-weight: 700;
  color: #0b6f4b;
}

.stat-value {
  font-size: 2.2rem;
  font-weight: 700;
  margin-bottom: 0.15rem;
}

.stat-label {
  font-size: 0.9rem;
  color: rgba(0, 0, 0, 0.6);
  letter-spacing: 0.02em;
}
</style>
