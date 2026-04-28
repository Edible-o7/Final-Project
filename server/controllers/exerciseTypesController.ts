import type { RequestHandler } from "express"

import type { AuthenticatedRequest } from "../middleware/authMiddleware"
import { requireRole } from "../middleware/authorization"
import {
    createExerciseType,
    deleteExerciseType,
    getExerciseTypeById,
    getExerciseTypeUsage,
    listExerciseTypes,
    updateExerciseType,
} from "../models/exerciseTypesModel"

function parseId(value: string | string[] | undefined): number | null {
    const raw = Array.isArray(value) ? value[0] : value
    if (!raw) {
        return null
    }

    const parsed = Number(raw)
    return Number.isInteger(parsed) && parsed > 0 ? parsed : null
}

export const listAllExerciseTypes: RequestHandler = async (_req, res) => {
    try {
        const exerciseTypes = await listExerciseTypes()
        res.status(200).json({ exerciseTypes })
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unable to load exercise types"
        res.status(500).json({ message })
    }
}

export const getExerciseType: RequestHandler = async (req, res) => {
    try {
        const id = parseId(req.params.exerciseTypeId)
        if (!id) {
            res.status(400).json({ message: "Invalid exercise type id" })
            return
        }

        const exerciseType = await getExerciseTypeById(id)
        if (!exerciseType) {
            res.status(404).json({ message: "Exercise type not found" })
            return
        }

        const usageCount = await getExerciseTypeUsage(id)
        res.status(200).json({ exerciseType, usageCount })
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unable to load exercise type"
        res.status(500).json({ message })
    }
}

export const createExerciseTypeHandler: RequestHandler = async (req, res) => {
    try {
        const authedRequest = req as AuthenticatedRequest
        const userId = authedRequest.user?.userId
        if (!userId) {
            res.status(401).json({ message: "Unauthorized" })
            return
        }

        const name = typeof req.body.name === "string" ? req.body.name.trim() : ""
        const category = typeof req.body.category === "string" ? req.body.category.trim() : ""
        const description = typeof req.body.description === "string" ? req.body.description.trim() : null

        if (!name || !category) {
            res.status(400).json({ message: "name and category are required" })
            return
        }

        const exerciseType = await createExerciseType({
            name,
            category,
            description,
            createdBy: userId,
        })

        res.status(201).json({ exerciseType })
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unable to create exercise type"
        res.status(500).json({ message })
    }
}

export const updateExerciseTypeHandler: RequestHandler = async (req, res) => {
    try {
        const id = parseId(req.params.exerciseTypeId)
        if (!id) {
            res.status(400).json({ message: "Invalid exercise type id" })
            return
        }

        const exerciseType = await updateExerciseType(id, {
            name: typeof req.body.name === "string" ? req.body.name.trim() : undefined,
            category: typeof req.body.category === "string" ? req.body.category.trim() : undefined,
            description: Object.prototype.hasOwnProperty.call(req.body, "description")
                ? (req.body.description ?? null)
                : undefined,
        })

        if (!exerciseType) {
            res.status(404).json({ message: "Exercise type not found" })
            return
        }

        res.status(200).json({ exerciseType })
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unable to update exercise type"
        res.status(500).json({ message })
    }
}

export const removeExerciseType: RequestHandler = async (req, res) => {
    try {
        const id = parseId(req.params.exerciseTypeId)
        if (!id) {
            res.status(400).json({ message: "Invalid exercise type id" })
            return
        }

        await deleteExerciseType(id)
        res.status(204).send()
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unable to delete exercise type"
        res.status(500).json({ message })
    }
}
