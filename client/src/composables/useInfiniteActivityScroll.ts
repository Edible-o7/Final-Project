import { ref, computed } from 'vue'
import { useInfiniteScroll } from '@vueuse/core'
import { friendFeed } from '@/services/activityService'
import type { ActivityRecord } from '@/types/domain'

export interface InfiniteScrollState {
  items: ActivityRecord[]
  isLoading: boolean
  isLoadingMore: boolean
  error: string
  total: number
  currentOffset: number
  pageSize: number
}

export function useInfiniteActivityScroll(pageSize = 20) {
  // State
  const items = ref<ActivityRecord[]>([])
  const isLoading = ref(false)
  const isLoadingMore = ref(false)
  const error = ref('')
  const hasInitialized = ref(false)
  const total = ref(0)
  const currentOffset = ref(0)
  const hasMore = ref(true)
  const isFetching = ref(false)
  const latestRequestId = ref(0)

  // Computed
  const itemsLoaded = computed(() => items.value.length)
  const displayText = computed(() => {
    if (itemsLoaded.value === 0 && total.value === 0) return ''
    return `Showing ${itemsLoaded.value} of ${total.value} activities`
  })

  // Load initial/current batch
  async function loadBatch(offset: number = 0, isInitial = false) {
    if (isFetching.value) {
      return
    }

    const requestId = ++latestRequestId.value
    isFetching.value = true
    const loadingFlag = isInitial ? isLoading : isLoadingMore
    loadingFlag.value = true
    error.value = ''

    try {
      const response = await friendFeed(offset, pageSize)
      const { activities = [], total: totalCount = 0 } = response

      if (requestId !== latestRequestId.value) {
        return
      }

      const dedupedIncoming = activities.filter(
        (activity, index, source) => source.findIndex((candidate) => candidate.id === activity.id) === index,
      )

      if (isInitial) {
        items.value = dedupedIncoming
      } else {
        const existingIds = new Set(items.value.map((activity) => activity.id))
        const uniqueNewItems = dedupedIncoming.filter((activity) => !existingIds.has(activity.id))
        items.value.push(...uniqueNewItems)
      }

      total.value = totalCount
      currentOffset.value = offset + dedupedIncoming.length

      // Check if there are more items to load
      hasMore.value = dedupedIncoming.length > 0 && itemsLoaded.value < totalCount
      hasInitialized.value = true
    } catch (err: unknown) {
      error.value =
        typeof err === 'object' && err !== null && 'message' in err
          ? String((err as { message?: unknown }).message ?? 'Failed to load activities')
          : err instanceof Error
            ? err.message
            : 'Failed to load activities'
      hasInitialized.value = true
    } finally {
      loadingFlag.value = false
      isFetching.value = false
    }
  }

  // Load next batch
  async function loadMore() {
    if (isLoading.value || isLoadingMore.value || isFetching.value || !hasMore.value) return
    await loadBatch(currentOffset.value, false)
  }

  // Reset everything
  function reset() {
    items.value = []
    error.value = ''
    hasInitialized.value = false
    total.value = 0
    currentOffset.value = 0
    hasMore.value = true
  }

  async function refresh() {
    reset()
    await loadBatch(0, true)
  }

  // Setup infinite scroll with VueUse
  function setupInfiniteScroll(element: HTMLElement | null) {
    if (!element) return

    useInfiniteScroll(
      element,
      () => loadMore(),
      {
        distance: 100, // Trigger when 100px from bottom
        canLoadMore: () => !isLoading.value && !isLoadingMore.value && !isFetching.value && hasMore.value,
      }
    )
  }

  return {
    // State
    items,
    isLoading,
    isLoadingMore,
    error,
    hasInitialized,
    total,
    currentOffset,
    hasMore,
    isFetching,
    pageSize,

    // Computed
    itemsLoaded,
    displayText,

    // Methods
    loadBatch,
    loadMore,
    reset,
    refresh,
    setupInfiniteScroll,
  }
}
