import type { RequestHandler } from "express"
import bcrypt from "bcryptjs"

import {
    createUser,
    findUserByEmail,
    findUserById,
    toSafeUser,
} from "../models/authModel"
import { signAuthToken } from "../utils/jwt"
import type { AuthenticatedRequest } from "../middleware/authMiddleware"

function normalizeEmail(email: unknown): string {
    return typeof email === "string" ? email.trim().toLowerCase() : ""
}

function isNonEmptyString(value: unknown): value is string {
    return typeof value === "string" && value.trim().length > 0
}

export const signup: RequestHandler = async (req, res) => {
    try {
        const firstName = isNonEmptyString(req.body.firstName)
            ? req.body.firstName.trim()
            : ""
        const lastName = isNonEmptyString(req.body.lastName)
            ? req.body.lastName.trim()
            : ""
        const email = normalizeEmail(req.body.email)
        const password = isNonEmptyString(req.body.password)
            ? req.body.password
            : ""
        const bio = typeof req.body.bio === "string" ? req.body.bio.trim() : null
        const avatarUrl =
            typeof req.body.avatarUrl === "string"
                ? req.body.avatarUrl.trim()
                : null

        if (!firstName || !lastName || !email || !password) {
            res.status(400).json({
                message:
                    "firstName, lastName, email, and password are required",
            })
            return
        }

        if (password.length < 8) {
            res.status(400).json({
                message: "Password must be at least 8 characters long",
            })
            return
        }

        const existingUser = await findUserByEmail(email)
        if (existingUser) {
            res.status(409).json({ message: "A user with that email already exists" })
            return
        }

        const passwordHash = await bcrypt.hash(password, 12)
        const user = await createUser({
            firstName,
            lastName,
            email,
            passwordHash,
            bio,
            avatarUrl,
            role: "user",
        })

        const token = signAuthToken({
            userId: user.id,
            email: user.email,
            role: user.role,
        })

        res.status(201).json({ user, token })
    } catch (error) {
        const message = error instanceof Error ? error.message : "Signup failed"
        res.status(500).json({ message })
    }
}

export const login: RequestHandler = async (req, res) => {
    try {
        const email = normalizeEmail(req.body.email)
        const password = isNonEmptyString(req.body.password)
            ? req.body.password
            : ""

        if (!email || !password) {
            res.status(400).json({ message: "email and password are required" })
            return
        }

        const user = await findUserByEmail(email)
        if (!user) {
            res.status(401).json({ message: "Invalid email or password" })
            return
        }

        const passwordMatches = await bcrypt.compare(password, user.password_hash)
        if (!passwordMatches) {
            res.status(401).json({ message: "Invalid email or password" })
            return
        }

        const safeUser = toSafeUser(user)
        const token = signAuthToken({
            userId: safeUser.id,
            email: safeUser.email,
            role: safeUser.role,
        })

        res.status(200).json({ user: safeUser, token })
    } catch (error) {
        const message = error instanceof Error ? error.message : "Login failed"
        res.status(500).json({ message })
    }
}

export const me: RequestHandler = async (req, res) => {
    try {
        const authedRequest = req as AuthenticatedRequest
        const payload = authedRequest.user

        if (!payload) {
            res.status(401).json({ message: "Unauthorized" })
            return
        }

        const user = await findUserById(payload.userId)
        if (!user) {
            res.status(404).json({ message: "User not found" })
            return
        }

        res.status(200).json({ user: toSafeUser(user) })
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unable to load user"
        res.status(500).json({ message })
    }
}
