<script setup lang="ts">
import { nextTick, onMounted, ref, watch } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useInfiniteActivityScroll } from '@/composables/useInfiniteActivityScroll'
import ActivityCardView from '@/components/ActivityCardView.vue'
import ActivityCardSkeleton from '@/components/ActivityCardSkeleton.vue'

const auth = useAuthStore()
const scrollContainer = ref<HTMLElement | null>(null)

// Initialize infinite scroll composable
const {
  items,
  isLoading,
  isLoadingMore,
  error,
  hasInitialized,
  hasMore,
  displayText,
  setupInfiniteScroll,
  reset,
  refresh,
} = useInfiniteActivityScroll(20)

const hasSetupInfiniteScroll = ref(false)

async function initializeFeedForAuthenticatedUser() {
  await refresh()

  if (!hasSetupInfiniteScroll.value) {
    await nextTick()
    setupInfiniteScroll(scrollContainer.value)
    hasSetupInfiniteScroll.value = true
  }
}

onMounted(async () => {
  if (!auth.isAuthenticated) return
  await initializeFeedForAuthenticatedUser()
})

watch(
  () => auth.isAuthenticated,
  async (isAuthenticated) => {
    if (isAuthenticated) {
      await initializeFeedForAuthenticatedUser()
      return
    }

    reset()
  },
)

async function handleRefresh() {
  await refresh()
}
</script>

<template>
  <section class="section">
    <div class="container">
      <h1 class="title">Friends Activity</h1>
      <p class="subtitle" v-if="!auth.isAuthenticated">
        Please log in to see friends' activities.
      </p>

      <div v-if="auth.isAuthenticated">
        <div class="mb-4">
          <button class="button is-link" :disabled="isLoading || isLoadingMore" @click="handleRefresh">
            Refresh Feed
          </button>
        </div>

        <!-- Activity counter and status -->
        <div class="level mb-4">
          <div class="level-left">
            <div class="level-item">
              <p class="subtitle">
                <span v-if="displayText" class="has-text-info">{{ displayText }}</span>
              </p>
            </div>
          </div>
        </div>

        <!-- Error notification -->
        <div v-if="error" class="notification is-danger mb-4">
          <button class="delete" @click="handleRefresh"></button>
          {{ error }}
          <div class="mt-2">
            <button class="button is-small is-danger is-light" @click="handleRefresh">Retry</button>
          </div>
        </div>

        <!-- Empty state -->
        <div v-if="hasInitialized && !isLoading && items.length === 0 && !error" class="notification is-light">
          <p>No friend activity yet. Make sure you have accepted friend requests!</p>
        </div>

        <!-- Infinite scroll container -->
        <div
          v-if="items.length > 0 || isLoading"
          ref="scrollContainer"
          class="activities-container"
          style="max-height: 800px; overflow-y: auto; border: 1px solid #dbdbdb; border-radius: 4px; padding: 1rem"
        >
          <!-- Activity cards -->
          <div v-for="activity in items" :key="activity.id" class="mb-4">
            <ActivityCardView :activity="activity" />
          </div>

          <!-- Loading skeletons -->
          <div v-if="isLoadingMore">
            <ActivityCardSkeleton v-for="n in 3" :key="`loading-${n}`" class="mb-4" />
          </div>
        </div>

        <!-- Initial loading state -->
        <div v-if="isLoading && items.length === 0" class="activities-container">
          <ActivityCardSkeleton v-for="n in 5" :key="`initial-${n}`" class="mb-4" />
        </div>

        <!-- End of list message -->
        <div v-if="items.length > 0 && !isLoadingMore && !hasMore" class="notification is-success mt-4">
          <p class="has-text-centered">You've reached the end of the feed! 🎉</p>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.activities-container {
  /* Scrollable container styling */
}
</style>
