import api from "./api"
import type { ActivityRecord, ActivityFormPayload } from "@/types/domain"

// ============================================================================
// TYPES
// ============================================================================

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  offset: number
  limit: number
}

export interface FriendFeedResponse {
  activities: ActivityRecord[]
  total: number
  offset: number
  limit: number
}

export interface ApiError {
  message: string
  code?: string
  status?: number
}

// ============================================================================
// CONSTANTS
// ============================================================================

const PAGINATION_DEFAULTS = {
  limit: 20,
  maxLimit: 100,
  minLimit: 1,
  minOffset: 0,
}

// ============================================================================
// VALIDATION & ERROR HANDLING
// ============================================================================

function validatePaginationParams(offset: number, limit: number): void {
  if (!Number.isInteger(offset) || offset < PAGINATION_DEFAULTS.minOffset) {
    throw new Error(`Invalid offset: must be >= 0, got ${offset}`)
  }

  if (!Number.isInteger(limit) || limit < PAGINATION_DEFAULTS.minLimit || limit > PAGINATION_DEFAULTS.maxLimit) {
    throw new Error(`Invalid limit: must be 1-100, got ${limit}`)
  }
}

function handleApiError(error: unknown): ApiError {
  if (error instanceof Error) {
    return { message: error.message, code: "UNKNOWN_ERROR" }
  }

  if (typeof error === "object" && error !== null && "message" in error) {
    return { message: (error as Record<string, unknown>).message as string, code: "API_ERROR" }
  }

  return { message: "An unexpected error occurred", code: "UNKNOWN_ERROR" }
}

// ============================================================================
// SERVICE FUNCTIONS
// ============================================================================

export async function getMyActivities() {
  try {
    return await api.get("/activities/mine")
  } catch (error) {
    throw handleApiError(error)
  }
}

export async function createActivity(payload: ActivityFormPayload) {
  try {
    if (!payload || typeof payload !== "object") {
      throw new Error("Invalid activity payload")
    }
    return await api.post("/activities", payload)
  } catch (error) {
    throw handleApiError(error)
  }
}

export async function updateActivity(activityId: number, payload: Partial<ActivityFormPayload>) {
  try {
    if (!Number.isInteger(activityId) || activityId <= 0) {
      throw new Error(`Invalid activity ID: ${activityId}`)
    }
    return await api.put(`/activities/${activityId}`, payload)
  } catch (error) {
    throw handleApiError(error)
  }
}

export async function deleteActivity(activityId: number) {
  try {
    if (!Number.isInteger(activityId) || activityId <= 0) {
      throw new Error(`Invalid activity ID: ${activityId}`)
    }
    return await api.del(`/activities/${activityId}`)
  } catch (error) {
    throw handleApiError(error)
  }
}

export async function friendFeed(
  offset: number = PAGINATION_DEFAULTS.minOffset,
  limit: number = PAGINATION_DEFAULTS.limit
): Promise<FriendFeedResponse> {
  try {
    validatePaginationParams(offset, limit)

    const response = await api.get(`/activities/friends?offset=${offset}&limit=${limit}`)

    if (!response || typeof response !== "object") {
      throw new Error("Invalid API response: expected object")
    }

    const { activities = [], total = 0 } = response as Record<string, unknown>

    if (!Array.isArray(activities)) {
      throw new Error("Invalid API response: activities must be an array")
    }

    if (typeof total !== "number" || total < 0) {
      throw new Error("Invalid API response: total must be non-negative")
    }

    return { activities: activities as ActivityRecord[], total, offset, limit }
  } catch (error) {
    throw handleApiError(error)
  }
}

export async function leaderboard(days?: number, limit?: number) {
  try {
    const q = [] as string[]
    if (days !== undefined) {
      if (!Number.isInteger(days) || days < 1) {
        throw new Error("Days must be a positive integer")
      }
      q.push(`days=${days}`)
    }
    if (limit !== undefined) {
      if (!Number.isInteger(limit) || limit < 1) {
        throw new Error("Limit must be a positive integer")
      }
      q.push(`limit=${limit}`)
    }
    const qs = q.length ? `?${q.join("&")}` : ""
    return await api.get(`/activities/leaderboard${qs}`)
  } catch (error) {
    throw handleApiError(error)
  }
}

export default {
  getMyActivities,
  createActivity,
  updateActivity,
  deleteActivity,
  friendFeed,
  leaderboard,
}
