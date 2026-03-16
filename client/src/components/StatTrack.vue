
<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '../stores/auth'
import type { Activity } from '../stores/auth'

interface StatCard {
  title: string
  stats: Array<{ label: string; value: string }>
}

const auth = useAuthStore()

function parseDistanceMiles(value: string) {
  const match = value.match(/([\d.]+)\s*(mi|ft|km)?/i)
  if (!match) return 0

  const amount = Number(match[1])
  const unit = match[2]?.toLowerCase() || 'mi'

  if (unit === 'ft') return amount / 5280
  if (unit === 'km') return amount * 0.621371
  return amount
}

function parseDurationMinutes(value: string) {
  const parts = value.split(':').map((p) => Number(p))
  if (parts.length === 2) {
    // mm:ss or hh:mm
    const [a = 0, b = 0] = parts
    return a * 60 + b
  }
  if (parts.length === 3) {
    const [h = 0, m = 0, s = 0] = parts
    return h * 3600 + m * 60 + s
  }
  return Number(value) || 0
}

function formatDuration(minutesOrSeconds: number) {
  const totalSeconds = Math.round(minutesOrSeconds)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

function formatPace(distanceMiles: number, durationMinutes: number) {
  if (distanceMiles <= 0) return '—'
  const pace = durationMinutes / distanceMiles
  const minutes = Math.floor(pace)
  const seconds = Math.round((pace - minutes) * 60)
  return `${minutes}:${seconds.toString().padStart(2, '0')} min/mi`
}

function getStats(activities: Activity[]) {
  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const aWeekAgo = new Date(now)
  aWeekAgo.setDate(now.getDate() - 7)

  const all = activities
  const today = all.filter((act) => new Date(act.date) >= startOfToday)
  const week = all.filter((act) => new Date(act.date) >= aWeekAgo)

  const compute = (list: Activity[]) => {
    const dist = list.reduce((sum, act) => sum + parseDistanceMiles(act.distance), 0)
    const durMin = list.reduce((sum, act) => sum + parseDurationMinutes(act.duration), 0) / 60

    return {
      distance: `${dist.toFixed(1)} mi`,
      duration: formatDuration(durMin * 60),
      avgPace: formatPace(dist, durMin),
      calories: `${(dist * 100).toFixed(0)}`,
    }
  }

  return {
    today: compute(today),
    week: compute(week),
    allTime: compute(all),
  }
}

const stats = computed(() => {
  const baseStats = getStats(auth.currentUserActivities)

  return [
    {
      title: 'Today',
      stats: [
        { label: 'Distance', value: baseStats.today.distance },
        { label: 'Duration', value: baseStats.today.duration },
        { label: 'Avg Pace', value: baseStats.today.avgPace },
        { label: 'Calories', value: baseStats.today.calories },
      ],
    },
    {
      title: 'This week',
      stats: [
        { label: 'Distance', value: baseStats.week.distance },
        { label: 'Duration', value: baseStats.week.duration },
        { label: 'Avg Pace', value: baseStats.week.avgPace },
        { label: 'Calories', value: baseStats.week.calories },
      ],
    },
    {
      title: 'All time',
      stats: [
        { label: 'Distance', value: baseStats.allTime.distance },
        { label: 'Duration', value: baseStats.allTime.duration },
        { label: 'Avg Pace', value: baseStats.allTime.avgPace },
        { label: 'Calories', value: baseStats.allTime.calories },
      ],
    },
  ] as StatCard[]
})
</script>

<template>
  <section class="stats">
    <div class="section-heading">
      <h2>Statistics</h2>
    </div>

    <div class="stat-cards">
      <article v-for="card in stats" :key="card.title" class="card stat-card">
        <header class="card-header">
          <p class="card-header-title">{{ card.title }}</p>
        </header>

        <div class="card-content">
          <div class="columns is-multiline is-mobile">
            <div class="column is-half" v-for="stat in card.stats" :key="stat.label">
              <p class="stat-value has-text-success">{{ stat.value }}</p>
              <p class="stat-label">{{ stat.label }}</p>
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
