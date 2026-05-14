import { config } from "dotenv"
import { getSupabaseClient } from "../db/client"

config({ path: "server/.env" })

type IdRow = { id: number }

type FriendshipRow = {
  requester_id: number
  addressee_id: number
}

const SEED_PREFIX = "[INF-SEED]"
const TOTAL_ACTIVITIES = 67

function toIsoDate(daysAgo: number): string {
  const date = new Date()
  date.setDate(date.getDate() - daysAgo)
  return date.toISOString().slice(0, 10)
}

async function ensureUsers(minimum = 3): Promise<number[]> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from("users")
    .select("id")
    .order("id", { ascending: true })

  if (error) throw new Error(`Unable to load users: ${error.message}`)

  const userIds = ((data ?? []) as IdRow[]).map((u) => u.id)
  if (userIds.length >= minimum) {
    return userIds
  }

  const missing = minimum - userIds.length
  const stamp = Date.now()

  const newUsers = Array.from({ length: missing }).map((_, index) => ({
    first_name: `Seed${index + 1}`,
    last_name: "User",
    email: `inf-seed-${stamp}-${index + 1}@example.com`,
    password_hash: "$2b$10$0A8vKATB8M0M8OlQYcYFruybOtbmZX8j3fULMVD4L5R9f9Rj8ZzQK",
    role: "user",
  }))

  const { data: inserted, error: insertError } = await supabase
    .from("users")
    .insert(newUsers)
    .select("id")

  if (insertError) throw new Error(`Unable to create seed users: ${insertError.message}`)

  const insertedIds = ((inserted ?? []) as IdRow[]).map((u) => u.id)
  return [...userIds, ...insertedIds]
}

async function ensureExerciseTypes(createdBy: number, minimum = 3): Promise<number[]> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from("exercise_types")
    .select("id")
    .order("id", { ascending: true })

  if (error) throw new Error(`Unable to load exercise types: ${error.message}`)

  const typeIds = ((data ?? []) as IdRow[]).map((t) => t.id)
  if (typeIds.length >= minimum) {
    return typeIds
  }

  const missing = minimum - typeIds.length
  const stamp = Date.now()

  const newTypes = Array.from({ length: missing }).map((_, index) => ({
    name: `${SEED_PREFIX} Type ${stamp}-${index + 1}`,
    category: "Cardio",
    description: "Seeded exercise type for infinite scrolling test",
    created_by: createdBy,
  }))

  const { data: inserted, error: insertError } = await supabase
    .from("exercise_types")
    .insert(newTypes)
    .select("id")

  if (insertError) throw new Error(`Unable to create exercise types: ${insertError.message}`)

  const insertedIds = ((inserted ?? []) as IdRow[]).map((t) => t.id)
  return [...typeIds, ...insertedIds]
}

async function ensureFriendships(viewerId: number, friendIds: number[]): Promise<void> {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase
    .from("friendships")
    .select("requester_id, addressee_id")
    .eq("status", "accepted")
    .or(`requester_id.eq.${viewerId},addressee_id.eq.${viewerId}`)

  if (error) throw new Error(`Unable to load friendships: ${error.message}`)

  const existingPairs = new Set(
    ((data ?? []) as FriendshipRow[]).map((row) => {
      const low = Math.min(row.requester_id, row.addressee_id)
      const high = Math.max(row.requester_id, row.addressee_id)
      return `${low}:${high}`
    }),
  )

  const rowsToCreate = friendIds
    .filter((friendId) => {
      const low = Math.min(viewerId, friendId)
      const high = Math.max(viewerId, friendId)
      return !existingPairs.has(`${low}:${high}`)
    })
    .map((friendId) => ({
      requester_id: viewerId,
      addressee_id: friendId,
      status: "accepted",
    }))

  if (rowsToCreate.length === 0) return

  const { error: createError } = await supabase.from("friendships").insert(rowsToCreate)
  if (createError) throw new Error(`Unable to create friendships: ${createError.message}`)
}

async function removePreviousSeededActivities(): Promise<void> {
  const supabase = getSupabaseClient()
  const { error } = await supabase
    .from("activities")
    .delete()
    .ilike("title", `${SEED_PREFIX}%`)

  if (error) throw new Error(`Unable to clear old seeded activities: ${error.message}`)
}

async function insertSeedActivities(friendIds: number[], exerciseTypeIds: number[]): Promise<number> {
  const supabase = getSupabaseClient()

  const rows = Array.from({ length: TOTAL_ACTIVITIES }).map((_, index) => {
    const friendId = friendIds[index % friendIds.length]
    const exerciseTypeId = exerciseTypeIds[index % exerciseTypeIds.length]
    const duration = 20 + (index % 6) * 5
    const calories = 180 + (index % 8) * 25

    return {
      user_id: friendId,
      exercise_type_id: exerciseTypeId,
      title: `${SEED_PREFIX} Workout #${index + 1}`,
      duration_minutes: duration,
      calories_burned: calories,
      activity_date: toIsoDate(Math.floor(index / 3)),
      notes: `Seeded activity ${index + 1} for infinite scrolling`,
      is_private: false,
    }
  })

  const { data, error } = await supabase
    .from("activities")
    .insert(rows)
    .select("id")

  if (error) throw new Error(`Unable to insert seeded activities: ${error.message}`)

  return ((data ?? []) as IdRow[]).length
}

async function verifyCount(): Promise<number> {
  const supabase = getSupabaseClient()
  const { count, error } = await supabase
    .from("activities")
    .select("id", { count: "exact", head: true })
    .ilike("title", `${SEED_PREFIX}%`)

  if (error) throw new Error(`Unable to verify seeded count: ${error.message}`)
  return count ?? 0
}

async function main() {
  const allUsers = await ensureUsers(3)
  const viewerId = allUsers[0]
  const friendIds = allUsers.slice(1, 4)

  if (friendIds.length === 0) {
    throw new Error("Unable to prepare friend users for feed seeding")
  }

  const exerciseTypeIds = await ensureExerciseTypes(viewerId, 3)
  await ensureFriendships(viewerId, friendIds)
  await removePreviousSeededActivities()

  const inserted = await insertSeedActivities(friendIds, exerciseTypeIds)
  const verifiedCount = await verifyCount()

  console.log("✅ Infinite-scroll seed complete")
  console.log(`Viewer user id: ${viewerId}`)
  console.log(`Friend user ids: ${friendIds.join(", ")}`)
  console.log(`Inserted rows: ${inserted}`)
  console.log(`Verified seeded rows in DB: ${verifiedCount}`)
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error)
  console.error(`❌ Seed failed: ${message}`)
  process.exit(1)
})
