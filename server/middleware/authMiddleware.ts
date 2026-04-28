import type { NextFunction, Request, Response } from "express"

import { verifyAuthToken, type AuthTokenPayload } from "../utils/jwt"

export interface AuthenticatedRequest extends Request {
    user?: AuthTokenPayload
}

export function requireAuth(
    req: Request,
    res: Response,
    next: NextFunction,
): void {
    const authHeader = req.headers.authorization

    if (!authHeader?.startsWith("Bearer ")) {
        res.status(401).json({ message: "Missing bearer token" })
        return
    }

    const token = authHeader.slice("Bearer ".length).trim()

    try {
        const payload = verifyAuthToken(token)
        ;(req as AuthenticatedRequest).user = payload
        next()
    } catch {
        res.status(401).json({ message: "Invalid or expired token" })
    }
}
