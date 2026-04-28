import { Router } from "express"

import {
    createActivityHandler,
    friendFeed,
    getActivity,
    listMyActivities,
    removeActivity,
    updateActivityHandler,
    leaderboard,
} from "../controllers/activitiesController"
import { requireAuth } from "../middleware/authMiddleware"

const activitiesRoutes = Router()

activitiesRoutes.get("/mine", requireAuth, listMyActivities)
activitiesRoutes.get("/friends", requireAuth, friendFeed)
activitiesRoutes.get("/leaderboard", leaderboard)
activitiesRoutes.get("/:activityId", requireAuth, getActivity)
activitiesRoutes.post("/", requireAuth, createActivityHandler)
activitiesRoutes.put("/:activityId", requireAuth, updateActivityHandler)
activitiesRoutes.delete("/:activityId", requireAuth, removeActivity)

export default activitiesRoutes
