import { getSupabaseClient } from "../db/client"
import type { UserRole } from "../utils/jwt"
import type { UserRow, SafeUser } from "./authModel"

export interface UpdateUserInput {
    firstName?: string
    lastName?: string
    bio?: string | null
    avatarUrl?: string | null
    role?: UserRole
}

function mapUserRow(row: UserRow): SafeUser {
    return {
        id: row.id,
        firstName: row.first_name,
        lastName: row.last_name,
        email: row.email,
        bio: row.bio,
        avatarUrl: row.avatar_url,
        role: row.role,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    }
}

export async function listUsers(): Promise<SafeUser[]> {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase.from("users").select("*").order("id", { ascending: true })

    if (error) {
        throw new Error(error.message)
    }

    return ((data ?? []) as UserRow[]).map(mapUserRow)
}

export async function getUserById(userId: number): Promise<SafeUser | null> {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .maybeSingle()

    if (error) {
        throw new Error(error.message)
    }

    return data ? mapUserRow(data as UserRow) : null
}

export async function updateUser(
    userId: number,
    input: UpdateUserInput,
): Promise<SafeUser | null> {
    const supabase = getSupabaseClient()
    const updates: Record<string, unknown> = {}

    if (typeof input.firstName === "string") updates.first_name = input.firstName
    if (typeof input.lastName === "string") updates.last_name = input.lastName
    if (Object.prototype.hasOwnProperty.call(input, "bio")) updates.bio = input.bio ?? null
    if (Object.prototype.hasOwnProperty.call(input, "avatarUrl")) updates.avatar_url = input.avatarUrl ?? null
    if (typeof input.role === "string") updates.role = input.role

    const { data, error } = await supabase
        .from("users")
        .update(updates)
        .eq("id", userId)
        .select("*")
        .maybeSingle()

    if (error) {
        throw new Error(error.message)
    }

    return data ? mapUserRow(data as UserRow) : null
}

export async function deleteUser(userId: number): Promise<boolean> {
    const supabase = getSupabaseClient()
    const { error } = await supabase.from("users").delete().eq("id", userId)

    if (error) {
        throw new Error(error.message)
    }

    return true
}

export async function getUserActivitySummary(userId: number): Promise<{
    activityCount: number
    totalCalories: number
    totalMinutes: number
}> {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase
        .from("activities")
        .select("duration_minutes, calories_burned")
        .eq("user_id", userId)

    if (error) {
        throw new Error(error.message)
    }

    const rows = (data ?? []) as Array<{ duration_minutes: number; calories_burned: number }>

    return rows.reduce(
        (summary, row) => ({
            activityCount: summary.activityCount + 1,
            totalCalories: summary.totalCalories + Number(row.calories_burned || 0),
            totalMinutes: summary.totalMinutes + Number(row.duration_minutes || 0),
        }),
        { activityCount: 0, totalCalories: 0, totalMinutes: 0 },
    )
}
