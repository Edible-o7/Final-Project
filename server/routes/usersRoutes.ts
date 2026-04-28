import { Router } from "express"

import {
    getUser,
    listAllUsers,
    mySummary,
    removeUser,
    updateUserProfile,
    weeklySummary,
    streak,
} from "../controllers/usersController"
import { requireAuth } from "../middleware/authMiddleware"
import { requireRole, requireSelfOrRole } from "../middleware/authorization"

const usersRoutes = Router()

usersRoutes.get("/", requireAuth, requireRole("admin"), listAllUsers)
usersRoutes.get("/me/summary", requireAuth, mySummary)
usersRoutes.get("/:userId", requireAuth, requireSelfOrRole("userId"), getUser)
usersRoutes.put("/:userId", requireAuth, requireSelfOrRole("userId"), updateUserProfile)
usersRoutes.delete("/:userId", requireAuth, requireSelfOrRole("userId"), removeUser)
usersRoutes.get("/:userId/weekly-summary", requireAuth, requireSelfOrRole("userId"), weeklySummary)
usersRoutes.get("/:userId/streak", requireAuth, requireSelfOrRole("userId"), streak)

export default usersRoutes
