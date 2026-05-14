import bcrypt from "bcryptjs"
import { config } from "dotenv"
import { getSupabaseClient } from "../db/client"

config({ path: "server/.env" })

const VIEWER_EMAIL = "infinite.test@example.com"
const VIEWER_PASSWORD = "Password123!"
const VIEWER_FIRST_NAME = "Infinite"
const VIEWER_LAST_NAME = "Tester"
const FRIEND_COUNT = 25
const ACTIVITIES_PER_FRIEND = 30
const FRIENDSHIP_STATUS = "accepted"
const ACTIVITY_PREFIX = "[INF-FEED]"
const EXERCISE_TYPE_PREFIX = "[INF-FEED] Type"

type IdRow = { id: number }

type UserRow = {
  id: number
  email: string
}

type ExerciseTypeRow = {
  id: number
}

function toIsoDate(daysAgo: number): string {
  const date = new Date()
  date.setDate(date.getDate() - daysAgo)
  return date.toISOString().slice(0, 10)
}

async function upsertViewer(): Promise<number> {
  const supabase = getSupabaseClient()
  const passwordHash = await bcrypt.hash(VIEWER_PASSWORD, 12)

  const { data, error } = await supabase
    .from("users")
    .upsert(
      {
        first_name: VIEWER_FIRST_NAME,
        last_name: VIEWER_LAST_NAME,
        email: VIEWER_EMAIL,
        password_hash: passwordHash,
        role: "user",
      },
      { onConflict: "email" },
    )
    .select("id")
    .single()

  if (error || !data) {
    throw new Error(`Unable to create viewer user: ${error?.message || "unknown error"}`)
  }

  return (data as IdRow).id
}

async function ensureExerciseTypes(createdBy: number, minimum: number): Promise<number[]> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from("exercise_types")
    .select("id")
    .order("id", { ascending: true })

  if (error) throw new Error(`Unable to load exercise types: ${error.message}`)

  const existingIds = ((data ?? []) as ExerciseTypeRow[]).map((row) => row.id)
  if (existingIds.length >= minimum) {
    return existingIds
  }

  const missing = minimum - existingIds.length
  const stamp = Date.now()

  const newTypes = Array.from({ length: missing }).map((_, index) => ({
    name: `${EXERCISE_TYPE_PREFIX} ${stamp}-${index + 1}`,
    category: "Cardio",
    description: "Seeded exercise type for friend feed testing",
    created_by: createdBy,
  }))

  const { data: inserted, error: insertError } = await supabase
    .from("exercise_types")
    .insert(newTypes)
    .select("id")

  if (insertError) {
    throw new Error(`Unable to create exercise types: ${insertError.message}`)
  }

  const insertedIds = ((inserted ?? []) as ExerciseTypeRow[]).map((row) => row.id)
  return [...existingIds, ...insertedIds]
}

async function ensureFriends(viewerId: number, count: number): Promise<number[]> {
  const supabase = getSupabaseClient()
  const stamp = Date.now()
  const passwordHash = await bcrypt.hash(VIEWER_PASSWORD, 12)

  const friendUsers = Array.from({ length: count }).map((_, index) => ({
    first_name: `Friend${index + 1}`,
    last_name: "Tester",
    email: `infinite.friend.${stamp}.${index + 1}@example.com`,
    password_hash: passwordHash,
    role: "user",
  }))

  const { data: insertedUsers, error: insertError } = await supabase
    .from("users")
    .insert(friendUsers)
    .select("id")

  if (insertError) {
    throw new Error(`Unable to create friend users: ${insertError.message}`)
  }

  const friendIds = ((insertedUsers ?? []) as IdRow[]).map((row) => row.id)
  if (friendIds.length === 0) {
    throw new Error("No friend users were created")
  }

  const friendshipRows = friendIds.map((friendId) => ({
    requester_id: viewerId,
    addressee_id: friendId,
    status: FRIENDSHIP_STATUS,
  }))

  const { error: friendshipError } = await supabase
    .from("friendships")
    .upsert(friendshipRows, { onConflict: "requester_id,addressee_id" })

  if (friendshipError) {
    throw new Error(`Unable to create friendships: ${friendshipError.message}`)
  }

  return friendIds
}

async function cleanupOldSeedData(viewerId: number): Promise<void> {
  const supabase = getSupabaseClient()

  const { data: friendRows, error: friendLoadError } = await supabase
    .from("users")
    .select("id, email")
    .like("email", "infinite.friend.%")

  if (friendLoadError) {
    throw new Error(`Unable to load previous friend users: ${friendLoadError.message}`)
  }

  const friendIds = ((friendRows ?? []) as UserRow[]).map((row) => row.id)

  if (friendIds.length > 0) {
    const { error: deleteActivitiesError } = await supabase
      .from("activities")
      .delete()
      .like("title", `${ACTIVITY_PREFIX}%`)

    if (deleteActivitiesError) {
      throw new Error(`Unable to clear old friend activities: ${deleteActivitiesError.message}`)
    }

    const { error: friendshipDeleteError } = await supabase
      .from("friendships")
      .delete()
      .eq("requester_id", viewerId)
      .in("addressee_id", friendIds)

    if (friendshipDeleteError) {
      throw new Error(`Unable to clear old friendships: ${friendshipDeleteError.message}`)
    }

    const { error: friendDeleteError } = await supabase
      .from("users")
      .delete()
      .like("email", "infinite.friend.%")

    if (friendDeleteError) {
      throw new Error(`Unable to clear old friend users: ${friendDeleteError.message}`)
    }
  }
}

async function insertActivities(friendIds: number[], exerciseTypeIds: number[]): Promise<number> {
  const supabase = getSupabaseClient()
  const rows = Array.from({ length: friendIds.length * ACTIVITIES_PER_FRIEND }).map((_, index) => {
    const friendId = friendIds[index % friendIds.length]
    const exerciseTypeId = exerciseTypeIds[index % exerciseTypeIds.length]
    const dayBucket = Math.floor(index / friendIds.length)

    return {
      user_id: friendId,
      exercise_type_id: exerciseTypeId,
      title: `${ACTIVITY_PREFIX} Activity #${index + 1}`,
      duration_minutes: 20 + (index % 7) * 5,
      calories_burned: 150 + (index % 11) * 20,
      activity_date: toIsoDate(dayBucket),
      notes: `Seeded activity ${index + 1} for infinite scroll testing`,
      is_private: false,
    }
  })

  const { data, error } = await supabase
    .from("activities")
    .insert(rows)
    .select("id")

  if (error) {
    throw new Error(`Unable to insert activities: ${error.message}`)
  }

  return ((data ?? []) as IdRow[]).length
}

async function main() {
  const viewerId = await upsertViewer()
  await cleanupOldSeedData(viewerId)

  const exerciseTypeIds = await ensureExerciseTypes(viewerId, 3)
  const friendIds = await ensureFriends(viewerId, FRIEND_COUNT)
  const inserted = await insertActivities(friendIds, exerciseTypeIds)

  console.log("✅ Friend-feed seed complete")
  console.log(`Viewer account: ${VIEWER_EMAIL}`)
  console.log(`Password: ${VIEWER_PASSWORD}`)
  console.log(`Viewer user id: ${viewerId}`)
  console.log(`Friend count: ${friendIds.length}`)
  console.log(`Activities inserted: ${inserted}`)
  console.log(`Expected friend-feed pages at 20/page: ${Math.ceil(inserted / 20)}`)
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error)
  console.error(`❌ Seed failed: ${message}`)
  process.exit(1)
})
