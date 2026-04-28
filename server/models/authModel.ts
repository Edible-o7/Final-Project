import { getSupabaseClient } from "../db/client"
import type { UserRole } from "../utils/jwt"

export interface UserRow {
    id: number
    first_name: string
    last_name: string
    email: string
    password_hash: string
    bio: string | null
    avatar_url: string | null
    role: UserRole
    created_at: string
    updated_at: string
}

export interface SafeUser {
    id: number
    firstName: string
    lastName: string
    email: string
    bio: string | null
    avatarUrl: string | null
    role: UserRole
    createdAt: string
    updatedAt: string
}

export interface CreateUserInput {
    firstName: string
    lastName: string
    email: string
    passwordHash: string
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

export async function findUserByEmail(
    email: string,
): Promise<UserRow | null> {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("email", email)
        .maybeSingle()

    if (error) {
        throw new Error(error.message)
    }

    return (data as UserRow | null) ?? null
}

export async function findUserById(userId: number): Promise<UserRow | null> {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .maybeSingle()

    if (error) {
        throw new Error(error.message)
    }

    return (data as UserRow | null) ?? null
}

export async function createUser(
    input: CreateUserInput,
): Promise<SafeUser> {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase
        .from("users")
        .insert({
            first_name: input.firstName,
            last_name: input.lastName,
            email: input.email,
            password_hash: input.passwordHash,
            bio: input.bio ?? null,
            avatar_url: input.avatarUrl ?? null,
            role: input.role ?? "user",
        })
        .select("*")
        .single()

    if (error || !data) {
        throw new Error(error?.message || "Unable to create user")
    }

    return mapUserRow(data as UserRow)
}

export function toSafeUser(row: UserRow): SafeUser {
    return mapUserRow(row)
}
