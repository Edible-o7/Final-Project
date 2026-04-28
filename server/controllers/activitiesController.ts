import type { RequestHandler } from "express"

import type { AuthenticatedRequest } from "../middleware/authMiddleware"
import { requireOwnershipOrRole } from "../middleware/authorization"
import {
    createActivity,
    deleteActivity,
    getActivityById,
    getFriendFeedSummary,
    listActivitiesByUser,
    listPublicFriendActivities,
    updateActivity,
} from "../models/activitiesModel"

function parseId(value: string | string[] | undefined): number | null {
    const raw = Array.isArray(value) ? value[0] : value
    if (!raw) {
        return null
    }

    const parsed = Number(raw)
    return Number.isInteger(parsed) && parsed > 0 ? parsed : null
}

function canAccessActivity(userId: number, role: string | undefined, activityOwnerId: number): boolean {
    return userId === activityOwnerId || role === "admin"
}

export const listMyActivities: RequestHandler = async (req, res) => {
    try {
        const authedRequest = req as AuthenticatedRequest
        const userId = authedRequest.user?.userId
        if (!userId) {
            res.status(401).json({ message: "Unauthorized" })
            return
        }

        const activities = await listActivitiesByUser(userId)
        res.status(200).json({ activities })
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unable to load activities"
        res.status(500).json({ message })
    }
}

export const getActivity: RequestHandler = async (req, res) => {
    try {
        const activityId = parseId(req.params.activityId)
        if (!activityId) {
            res.status(400).json({ message: "Invalid activity id" })
            return
        }

        const activity = await getActivityById(activityId)
        if (!activity) {
            res.status(404).json({ message: "Activity not found" })
            return
        }

        const authedRequest = req as AuthenticatedRequest
        const userId = authedRequest.user?.userId
        const role = authedRequest.user?.role

        if (!userId || !canAccessActivity(userId, role, activity.userId)) {
            res.status(403).json({ message: "Forbidden" })
            return
        }

        res.status(200).json({ activity })
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unable to load activity"
        res.status(500).json({ message })
    }
}

export const createActivityHandler: RequestHandler = async (req, res) => {
    try {
        const authedRequest = req as AuthenticatedRequest
        const userId = authedRequest.user?.userId
        if (!userId) {
            res.status(401).json({ message: "Unauthorized" })
            return
        }

        const exerciseTypeId = Number(req.body.exerciseTypeId)
        const title = typeof req.body.title === "string" ? req.body.title.trim() : ""
        const durationMinutes = Number(req.body.durationMinutes)
        const caloriesBurned = req.body.caloriesBurned !== undefined ? Number(req.body.caloriesBurned) : undefined
        const activityDate = typeof req.body.activityDate === "string" ? req.body.activityDate.trim() : undefined
        const notes = typeof req.body.notes === "string" ? req.body.notes.trim() : null
        const isPrivate = typeof req.body.isPrivate === "boolean" ? req.body.isPrivate : undefined

        if (!Number.isInteger(exerciseTypeId) || exerciseTypeId <= 0 || !title || !Number.isFinite(durationMinutes) || durationMinutes <= 0) {
            res.status(400).json({ message: "exerciseTypeId, title, and durationMinutes are required" })
            return
        }

        const activity = await createActivity({
            userId,
            exerciseTypeId,
            title,
            durationMinutes,
            caloriesBurned: Number.isFinite(caloriesBurned) ? caloriesBurned : 0,
            activityDate,
            notes,
            isPrivate,
        })

        res.status(201).json({ activity })
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unable to create activity"
        res.status(500).json({ message })
    }
}

export const updateActivityHandler: RequestHandler = async (req, res) => {
    try {
        const activityId = parseId(req.params.activityId)
        if (!activityId) {
            res.status(400).json({ message: "Invalid activity id" })
            return
        }

        const authedRequest = req as AuthenticatedRequest
        const userId = authedRequest.user?.userId
        const role = authedRequest.user?.role

        const existingActivity = await getActivityById(activityId)
        if (!existingActivity) {
            res.status(404).json({ message: "Activity not found" })
            return
        }

        if (!userId || !canAccessActivity(userId, role, existingActivity.userId)) {
            res.status(403).json({ message: "Forbidden" })
            return
        }

        const activity = await updateActivity(activityId, {
            exerciseTypeId: typeof req.body.exerciseTypeId === "number" ? req.body.exerciseTypeId : undefined,
            title: typeof req.body.title === "string" ? req.body.title.trim() : undefined,
            durationMinutes: typeof req.body.durationMinutes === "number" ? req.body.durationMinutes : undefined,
            caloriesBurned: typeof req.body.caloriesBurned === "number" ? req.body.caloriesBurned : undefined,
            activityDate: typeof req.body.activityDate === "string" ? req.body.activityDate.trim() : undefined,
            notes: Object.prototype.hasOwnProperty.call(req.body, "notes") ? (req.body.notes ?? null) : undefined,
            isPrivate: typeof req.body.isPrivate === "boolean" ? req.body.isPrivate : undefined,
        })

        if (!activity) {
            res.status(404).json({ message: "Activity not found" })
            return
        }

        res.status(200).json({ activity })
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unable to update activity"
        res.status(500).json({ message })
    }
}

export const removeActivity: RequestHandler = async (req, res) => {
    try {
        const activityId = parseId(req.params.activityId)
        if (!activityId) {
            res.status(400).json({ message: "Invalid activity id" })
            return
        }

        const authedRequest = req as AuthenticatedRequest
        const userId = authedRequest.user?.userId
        const role = authedRequest.user?.role

        const existingActivity = await getActivityById(activityId)
        if (!existingActivity) {
            res.status(404).json({ message: "Activity not found" })
            return
        }

        if (!userId || !canAccessActivity(userId, role, existingActivity.userId)) {
            res.status(403).json({ message: "Forbidden" })
            return
        }

        await deleteActivity(activityId)
        res.status(204).send()
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unable to delete activity"
        res.status(500).json({ message })
    }
}

export const friendFeed: RequestHandler = async (req, res) => {
    try {
        const authedRequest = req as AuthenticatedRequest
        const userId = authedRequest.user?.userId
        if (!userId) {
            res.status(401).json({ message: "Unauthorized" })
            return
        }

        const friendIds = Array.isArray(req.query.friendIds)
            ? req.query.friendIds.map((value) => Number(value)).filter((value) => Number.isInteger(value) && value > 0)
            : []

        const activities = await listPublicFriendActivities(friendIds)
        const summary = await getFriendFeedSummary(friendIds)

        res.status(200).json({ activities, summary })
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unable to load friend feed"
        res.status(500).json({ message })
    }
}

export const leaderboard: RequestHandler = async (req, res) => {
    try {
        const days = req.query.days ? Number(req.query.days) : 30
        const limit = req.query.limit ? Number(req.query.limit) : 10
        const { getLeaderboard } = await import("../models/activitiesModel")
        const board = await getLeaderboard(days, limit)
        res.status(200).json({ board })
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unable to load leaderboard"
        res.status(500).json({ message })
    }
}
