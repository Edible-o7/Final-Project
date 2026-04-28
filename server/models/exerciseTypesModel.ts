import { getSupabaseClient } from "../db/client"

export interface ExerciseTypeRow {
    id: number
    name: string
    category: string
    description: string | null
    created_by: number | null
    created_at: string
    updated_at: string
}

export interface ExerciseType {
    id: number
    name: string
    category: string
    description: string | null
    createdBy: number | null
    createdAt: string
    updatedAt: string
}

export interface CreateExerciseTypeInput {
    name: string
    category: string
    description?: string | null
    createdBy: number
}

export interface UpdateExerciseTypeInput {
    name?: string
    category?: string
    description?: string | null
}

function mapExerciseType(row: ExerciseTypeRow): ExerciseType {
    return {
        id: row.id,
        name: row.name,
        category: row.category,
        description: row.description,
        createdBy: row.created_by,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    }
}

export async function listExerciseTypes(): Promise<ExerciseType[]> {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase.from("exercise_types").select("*").order("name", { ascending: true })

    if (error) {
        throw new Error(error.message)
    }

    return ((data ?? []) as ExerciseTypeRow[]).map(mapExerciseType)
}

export async function getExerciseTypeById(
    id: number,
): Promise<ExerciseType | null> {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase
        .from("exercise_types")
        .select("*")
        .eq("id", id)
        .maybeSingle()

    if (error) {
        throw new Error(error.message)
    }

    return data ? mapExerciseType(data as ExerciseTypeRow) : null
}

export async function createExerciseType(
    input: CreateExerciseTypeInput,
): Promise<ExerciseType> {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase
        .from("exercise_types")
        .insert({
            name: input.name,
            category: input.category,
            description: input.description ?? null,
            created_by: input.createdBy,
        })
        .select("*")
        .single()

    if (error || !data) {
        throw new Error(error?.message || "Unable to create exercise type")
    }

    return mapExerciseType(data as ExerciseTypeRow)
}

export async function updateExerciseType(
    id: number,
    input: UpdateExerciseTypeInput,
): Promise<ExerciseType | null> {
    const supabase = getSupabaseClient()
    const updates: Record<string, unknown> = {}

    if (typeof input.name === "string") updates.name = input.name
    if (typeof input.category === "string") updates.category = input.category
    if (Object.prototype.hasOwnProperty.call(input, "description")) updates.description = input.description ?? null

    const { data, error } = await supabase
        .from("exercise_types")
        .update(updates)
        .eq("id", id)
        .select("*")
        .maybeSingle()

    if (error) {
        throw new Error(error.message)
    }

    return data ? mapExerciseType(data as ExerciseTypeRow) : null
}

export async function deleteExerciseType(id: number): Promise<boolean> {
    const supabase = getSupabaseClient()
    const { error } = await supabase.from("exercise_types").delete().eq("id", id)

    if (error) {
        throw new Error(error.message)
    }

    return true
}

export async function getExerciseTypeUsage(id: number): Promise<number> {
    const supabase = getSupabaseClient()
    const { count, error } = await supabase
        .from("activities")
        .select("id", { count: "exact", head: true })
        .eq("exercise_type_id", id)

    if (error) {
        throw new Error(error.message)
    }

    return count ?? 0
}
