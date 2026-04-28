import type { RequestHandler } from "express"

import { requireSelfOrRole, requireRole } from "../middleware/authorization"
import type { AuthenticatedRequest } from "../middleware/authMiddleware"
import {
    deleteUser,
    getUserActivitySummary,
    getUserById,
    listUsers,
    updateUser,
} from "../models/usersModel"

function parseId(value: string | string[] | undefined): number | null {
    const raw = Array.isArray(value) ? value[0] : value
    if (!raw) {
        return null
    }

    const parsed = Number(raw)
    return Number.isInteger(parsed) && parsed > 0 ? parsed : null
}

export const listAllUsers: RequestHandler = async (_req, res) => {
    try {
        const users = await listUsers()
        res.status(200).json({ users })
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unable to load users"
        res.status(500).json({ message })
    }
}

export const getUser: RequestHandler = async (req, res) => {
    try {
        const userId = parseId(req.params.userId)
        if (!userId) {
            res.status(400).json({ message: "Invalid user id" })
            return
        }

        const user = await getUserById(userId)
        if (!user) {
            res.status(404).json({ message: "User not found" })
            return
        }

        res.status(200).json({ user })
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unable to load user"
        res.status(500).json({ message })
    }
}

export const updateUserProfile: RequestHandler = async (req, res) => {
    try {
        const userId = parseId(req.params.userId)
        if (!userId) {
            res.status(400).json({ message: "Invalid user id" })
            return
        }

        const authedRequest = req as AuthenticatedRequest
        const isAdmin = authedRequest.user?.role === "admin"
        const canEditRole = isAdmin && typeof req.body.role === "string"

        const updatedUser = await updateUser(userId, {
            firstName: typeof req.body.firstName === "string" ? req.body.firstName.trim() : undefined,
            lastName: typeof req.body.lastName === "string" ? req.body.lastName.trim() : undefined,
            bio: Object.prototype.hasOwnProperty.call(req.body, "bio") ? (req.body.bio ?? null) : undefined,
            avatarUrl: Object.prototype.hasOwnProperty.call(req.body, "avatarUrl") ? (req.body.avatarUrl ?? null) : undefined,
            role: canEditRole ? req.body.role : undefined,
        })

        if (!updatedUser) {
            res.status(404).json({ message: "User not found" })
            return
        }

        res.status(200).json({ user: updatedUser })
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unable to update user"
        res.status(500).json({ message })
    }
}

export const removeUser: RequestHandler = async (req, res) => {
    try {
        const userId = parseId(req.params.userId)
        if (!userId) {
            res.status(400).json({ message: "Invalid user id" })
            return
        }

        await deleteUser(userId)
        res.status(204).send()
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unable to delete user"
        res.status(500).json({ message })
    }
}

export const mySummary: RequestHandler = async (req, res) => {
    try {
        const authedRequest = req as AuthenticatedRequest
        const userId = authedRequest.user?.userId
        if (!userId) {
            res.status(401).json({ message: "Unauthorized" })
            return
        }

        const summary = await getUserActivitySummary(userId)
        res.status(200).json({ summary })
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unable to load summary"
        res.status(500).json({ message })
    }
}

export const weeklySummary: RequestHandler = async (req, res) => {
    try {
        const userId = parseId(req.params.userId)
        if (!userId) {
            res.status(400).json({ message: "Invalid user id" })
            return
        }

        const { getWeeklyActivitySummary } = await import("../models/activitiesModel")
        const days = req.query.days ? Number(req.query.days) : 7
        const summary = await getWeeklyActivitySummary(userId, days)
        res.status(200).json({ summary })
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unable to load weekly summary"
        res.status(500).json({ message })
    }
}

export const streak: RequestHandler = async (req, res) => {
    try {
        const userId = parseId(req.params.userId)
        if (!userId) {
            res.status(400).json({ message: "Invalid user id" })
            return
        }

        const { getCurrentStreak } = await import("../models/activitiesModel")
        const result = await getCurrentStreak(userId)
        res.status(200).json(result)
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unable to load streak"
        res.status(500).json({ message })
    }
}
