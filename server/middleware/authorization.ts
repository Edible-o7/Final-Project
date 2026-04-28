import type { NextFunction, Request, Response } from "express"

import type { AuthenticatedRequest } from "./authMiddleware"
import type { UserRole } from "../utils/jwt"

function getAuthedUser(req: Request): NonNullable<AuthenticatedRequest["user"]> | null {
    const authedRequest = req as AuthenticatedRequest
    return authedRequest.user ?? null
}

function parsePositiveId(value: string | undefined): number | null {
    if (!value) {
        return null
    }

    const parsed = Number(value)
    if (!Number.isInteger(parsed) || parsed <= 0) {
        return null
    }

    return parsed
}

export function requireRole(...allowedRoles: UserRole[]) {
    return (req: Request, res: Response, next: NextFunction): void => {
        const user = getAuthedUser(req)

        if (!user) {
            res.status(401).json({ message: "Unauthorized" })
            return
        }

        if (!allowedRoles.includes(user.role)) {
            res.status(403).json({ message: "Forbidden" })
            return
        }

        next()
    }
}

export function requireSelfOrRole(
    userIdParamName: string,
    allowedRoles: UserRole[] = ["admin"],
) {
    return (req: Request, res: Response, next: NextFunction): void => {
        const user = getAuthedUser(req)

        if (!user) {
            res.status(401).json({ message: "Unauthorized" })
            return
        }

        const targetUserId = parsePositiveId(req.params[userIdParamName])
        if (!targetUserId) {
            res.status(400).json({ message: "Invalid user id" })
            return
        }

        const isSameUser = user.userId === targetUserId
        const hasElevatedRole = allowedRoles.includes(user.role)

        if (!isSameUser && !hasElevatedRole) {
            res.status(403).json({ message: "Forbidden" })
            return
        }

        next()
    }
}

export function requireOwnershipOrRole(
    ownerIdSource: (req: Request) => number | undefined,
    allowedRoles: UserRole[] = ["admin"],
) {
    return (req: Request, res: Response, next: NextFunction): void => {
        const user = getAuthedUser(req)

        if (!user) {
            res.status(401).json({ message: "Unauthorized" })
            return
        }

        const ownerId = ownerIdSource(req)
        if (!Number.isInteger(ownerId) || !ownerId || ownerId <= 0) {
            res.status(400).json({ message: "Invalid ownership reference" })
            return
        }

        if (user.userId !== ownerId && !allowedRoles.includes(user.role)) {
            res.status(403).json({ message: "Forbidden" })
            return
        }

        next()
    }
}
