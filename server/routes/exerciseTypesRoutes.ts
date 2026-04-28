import { Router } from "express"

import {
    createExerciseTypeHandler,
    getExerciseType,
    listAllExerciseTypes,
    removeExerciseType,
    updateExerciseTypeHandler,
} from "../controllers/exerciseTypesController"
import { requireAuth } from "../middleware/authMiddleware"
import { requireRole } from "../middleware/authorization"

const exerciseTypesRoutes = Router()

exerciseTypesRoutes.get("/", listAllExerciseTypes)
exerciseTypesRoutes.get("/:exerciseTypeId", getExerciseType)
exerciseTypesRoutes.post("/", requireAuth, createExerciseTypeHandler)
exerciseTypesRoutes.put("/:exerciseTypeId", requireAuth, requireRole("admin", "moderator"), updateExerciseTypeHandler)
exerciseTypesRoutes.delete("/:exerciseTypeId", requireAuth, requireRole("admin"), removeExerciseType)

export default exerciseTypesRoutes
