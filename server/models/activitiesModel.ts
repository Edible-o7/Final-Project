import { getSupabaseClient } from "../db/client"

export interface ActivityRow {
    id: number
    user_id: number
    exercise_type_id: number
    title: string
    duration_minutes: number
    calories_burned: number
    activity_date: string
    notes: string | null
    is_private: boolean
    created_at: string
    updated_at: string
}

export interface Activity {
    id: number
    userId: number
    exerciseTypeId: number
    title: string
    durationMinutes: number
    caloriesBurned: number
    activityDate: string
    notes: string | null
    isPrivate: boolean
    createdAt: string
    updatedAt: string
}

export interface CreateActivityInput {
    userId: number
    exerciseTypeId: number
    title: string
    durationMinutes: number
    caloriesBurned?: number
    activityDate?: string
    notes?: string | null
    isPrivate?: boolean
}

export interface UpdateActivityInput {
    exerciseTypeId?: number
    title?: string
    durationMinutes?: number
    caloriesBurned?: number
    activityDate?: string
    notes?: string | null
    isPrivate?: boolean
}

function mapActivity(row: ActivityRow): Activity {
    return {
        id: row.id,
        userId: row.user_id,
        exerciseTypeId: row.exercise_type_id,
        title: row.title,
        durationMinutes: row.duration_minutes,
        caloriesBurned: row.calories_burned,
        activityDate: row.activity_date,
        notes: row.notes,
        isPrivate: row.is_private,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    }
}

export async function listActivitiesByUser(userId: number): Promise<Activity[]> {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase
        .from("activities")
        .select("*")
        .eq("user_id", userId)
        .order("activity_date", { ascending: false })

    if (error) {
        throw new Error(error.message)
    }

    return ((data ?? []) as ActivityRow[]).map(mapActivity)
}

export async function listPublicFriendActivities(userIds: number[]): Promise<Activity[]> {
    if (userIds.length === 0) {
        return []
    }

    const supabase = getSupabaseClient()
    const { data, error } = await supabase
        .from("activities")
        .select("*")
        .in("user_id", userIds)
        .eq("is_private", false)
        .order("activity_date", { ascending: false })

    if (error) {
        throw new Error(error.message)
    }

    return ((data ?? []) as ActivityRow[]).map(mapActivity)
}

export async function getActivityById(activityId: number): Promise<Activity | null> {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase
        .from("activities")
        .select("*")
        .eq("id", activityId)
        .maybeSingle()

    if (error) {
        throw new Error(error.message)
    }

    return data ? mapActivity(data as ActivityRow) : null
}

export async function createActivity(
    input: CreateActivityInput,
): Promise<Activity> {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase
        .from("activities")
        .insert({
            user_id: input.userId,
            exercise_type_id: input.exerciseTypeId,
            title: input.title,
            duration_minutes: input.durationMinutes,
            calories_burned: input.caloriesBurned ?? 0,
            activity_date: input.activityDate ?? new Date().toISOString().slice(0, 10),
            notes: input.notes ?? null,
            is_private: input.isPrivate ?? false,
        })
        .select("*")
        .single()

    if (error || !data) {
        throw new Error(error?.message || "Unable to create activity")
    }

    return mapActivity(data as ActivityRow)
}

export async function updateActivity(
    activityId: number,
    input: UpdateActivityInput,
): Promise<Activity | null> {
    const supabase = getSupabaseClient()
    const updates: Record<string, unknown> = {}

    if (typeof input.exerciseTypeId === "number") updates.exercise_type_id = input.exerciseTypeId
    if (typeof input.title === "string") updates.title = input.title
    if (typeof input.durationMinutes === "number") updates.duration_minutes = input.durationMinutes
    if (typeof input.caloriesBurned === "number") updates.calories_burned = input.caloriesBurned
    if (typeof input.activityDate === "string") updates.activity_date = input.activityDate
    if (Object.prototype.hasOwnProperty.call(input, "notes")) updates.notes = input.notes ?? null
    if (typeof input.isPrivate === "boolean") updates.is_private = input.isPrivate

    const { data, error } = await supabase
        .from("activities")
        .update(updates)
        .eq("id", activityId)
        .select("*")
        .maybeSingle()

    if (error) {
        throw new Error(error.message)
    }

    return data ? mapActivity(data as ActivityRow) : null
}

export async function deleteActivity(activityId: number): Promise<boolean> {
    const supabase = getSupabaseClient()
    const { error } = await supabase.from("activities").delete().eq("id", activityId)

    if (error) {
        throw new Error(error.message)
    }

    return true
}

export async function getFriendFeedSummary(userIds: number[]): Promise<{
    totalActivities: number
    totalMinutes: number
}> {
    const activities = await listPublicFriendActivities(userIds)

    return activities.reduce(
        (summary, activity) => ({
            totalActivities: summary.totalActivities + 1,
            totalMinutes: summary.totalMinutes + activity.durationMinutes,
        }),
        { totalActivities: 0, totalMinutes: 0 },
    )
}

export async function getWeeklyActivitySummary(userId: number, days = 7) {
    const supabase = getSupabaseClient()
    const today = new Date()
    const from = new Date(today)
    from.setDate(today.getDate() - (days - 1))

    const fromIso = from.toISOString().slice(0, 10)
    const toIso = today.toISOString().slice(0, 10)

    const { data, error } = await supabase
        .from("activities")
        .select("duration_minutes, calories_burned, activity_date")
        .eq("user_id", userId)
        .gte("activity_date", fromIso)
        .lte("activity_date", toIso)

    if (error) {
        throw new Error(error.message)
    }

    const rows = (data ?? []) as Array<{ duration_minutes: number; calories_burned: number; activity_date: string }>

    const byDate = new Map<string, { minutes: number; calories: number; count: number }>()
    for (const r of rows) {
        const d = r.activity_date
        const entry = byDate.get(d) ?? { minutes: 0, calories: 0, count: 0 }
        entry.minutes += Number(r.duration_minutes || 0)
        entry.calories += Number(r.calories_burned || 0)
        entry.count += 1
        byDate.set(d, entry)
    }

    const daily = Array.from(byDate.entries()).map(([date, v]) => ({ date, ...v }))

    const totalMinutes = daily.reduce((s, d) => s + d.minutes, 0)
    const totalCalories = daily.reduce((s, d) => s + d.calories, 0)

    return { days, totalMinutes, totalCalories, daily }
}

export async function getCurrentStreak(userId: number, lookbackDays = 365) {
    const supabase = getSupabaseClient()
    const today = new Date()
    const from = new Date(today)
    from.setDate(today.getDate() - lookbackDays)

    const fromIso = from.toISOString().slice(0, 10)
    const toIso = today.toISOString().slice(0, 10)

    const { data, error } = await supabase
        .from("activities")
        .select("activity_date")
        .eq("user_id", userId)
        .gte("activity_date", fromIso)
        .lte("activity_date", toIso)
        .order("activity_date", { ascending: false })

    if (error) {
        throw new Error(error.message)
    }

    const dates = Array.from(new Set(((data ?? []) as Array<{ activity_date: string }>).map((r) => r.activity_date)))
    // dates are ordered desc; compute consecutive streak ending today
    let streak = 0
    let cursor = new Date()
    for (const d of dates) {
        const dDate = new Date(d)
        // normalize to yyyy-mm-dd compare
        const cursorIso = cursor.toISOString().slice(0, 10)
        if (d === cursorIso) {
            streak += 1
            cursor.setDate(cursor.getDate() - 1)
            continue
        }

        // if the date is before cursor, but not equal, break streak
        const dTime = new Date(d).setHours(0, 0, 0, 0)
        const cursorTime = cursor.setHours(0, 0, 0, 0)
        if (dTime === cursorTime) {
            streak += 1
            cursor.setDate(cursor.getDate() - 1)
            continue
        }

        break
    }

    return { streak }
}

export async function getLeaderboard(days = 30, limit = 10) {
    const supabase = getSupabaseClient()
    const today = new Date()
    const from = new Date(today)
    from.setDate(today.getDate() - (days - 1))

    const fromIso = from.toISOString().slice(0, 10)
    const toIso = today.toISOString().slice(0, 10)

    const { data, error } = await supabase
        .from("activities")
        .select("user_id, duration_minutes, calories_burned")
        .gte("activity_date", fromIso)
        .lte("activity_date", toIso)

    if (error) {
        throw new Error(error.message)
    }

    const rows = (data ?? []) as Array<{ user_id: number; duration_minutes: number; calories_burned: number }>
    const map = new Map<number, { totalMinutes: number; totalCalories: number; activities: number }>()

    for (const r of rows) {
        const m = map.get(r.user_id) ?? { totalMinutes: 0, totalCalories: 0, activities: 0 }
        m.totalMinutes += Number(r.duration_minutes || 0)
        m.totalCalories += Number(r.calories_burned || 0)
        m.activities += 1
        map.set(r.user_id, m)
    }

    const arr = Array.from(map.entries()).map(([userId, v]) => ({ userId, ...v }))
    arr.sort((a, b) => b.totalMinutes - a.totalMinutes)

    return arr.slice(0, limit)
}
