import "dotenv/config"

export function requireEnv(name: string): string {
    const value = process.env[name]?.trim()
    if (!value) {
        throw new Error(`Missing required environment variable: ${name}`)
    }

    return value
}

export function hasOneOf(names: string[]): boolean {
    return names.some((n) => Boolean(process.env[n]?.trim()))
}

export function validateServerEnv(): void {
    // Required: JWT secret and SUPABASE_URL
    requireEnv("JWT_SECRET")
    requireEnv("SUPABASE_URL")

    // At least one Supabase key must be present
    if (!hasOneOf(["SUPABASE_SERVICE_ROLE_KEY", "SUPABASE_SECRET_KEY", "SUPABASE_ANON_KEY"])) {
        throw new Error(
            "Missing required Supabase key: one of SUPABASE_SERVICE_ROLE_KEY, SUPABASE_SECRET_KEY, or SUPABASE_ANON_KEY must be set",
        )
    }
}

export default {
    requireEnv,
    hasOneOf,
    validateServerEnv,
}
