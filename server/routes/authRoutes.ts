import { Router } from "express"

import { login, me, signup } from "../controllers/authController"
import { requireAuth } from "../middleware/authMiddleware"

const authRoutes = Router()

authRoutes.post("/signup", signup)
authRoutes.post("/login", login)
authRoutes.get("/me", requireAuth, me)

export default authRoutes
