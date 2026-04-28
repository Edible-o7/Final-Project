import jwt, { type SignOptions } from "jsonwebtoken"

export type UserRole = "admin" | "moderator" | "user"

export interface AuthTokenPayload {
    userId: number
    email: string
    role: UserRole
}

function getJwtSecret(): string {
    const secret = process.env.JWT_SECRET?.trim()
    if (!secret) {
        throw new Error("Missing required environment variable: JWT_SECRET")
    }

    return secret
}

export function signAuthToken(payload: AuthTokenPayload): string {
    const envExpiry = process.env.JWT_EXPIRES_IN?.trim()
    const expiresIn: SignOptions["expiresIn"] = envExpiry
        ? (envExpiry as SignOptions["expiresIn"])
        : "7d"

    return jwt.sign(payload, getJwtSecret(), { expiresIn })
}

export function verifyAuthToken(token: string): AuthTokenPayload {
    return jwt.verify(token, getJwtSecret()) as AuthTokenPayload
}
