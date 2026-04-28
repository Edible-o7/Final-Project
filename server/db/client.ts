import { createClient, type SupabaseClient } from "@supabase/supabase-js"
import { requireEnv } from "../utils/env"

let supabaseClient: SupabaseClient | null = null

export function getSupabaseClient(): SupabaseClient {
    if (!supabaseClient) {
        const supabaseUrl = requireEnv("SUPABASE_URL")
        const supabaseKey =
            process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
            process.env.SUPABASE_SECRET_KEY?.trim() ||
            process.env.SUPABASE_ANON_KEY?.trim()

        if (!supabaseKey) {
            throw new Error(
                "Missing required environment variable: SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_SECRET_KEY / SUPABASE_ANON_KEY)",
            )
        }

        supabaseClient = createClient(supabaseUrl, supabaseKey)
    }

    return supabaseClient
}
