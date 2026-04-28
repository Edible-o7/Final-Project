import express from "express"

import { validateServerEnv } from "./utils/env"

import authRoutes from "./routes/authRoutes"
import usersRoutes from "./routes/usersRoutes"
import exerciseTypesRoutes from "./routes/exerciseTypesRoutes"
import activitiesRoutes from "./routes/activitiesRoutes"

// Validate required environment right away so missing secrets fail fast.
validateServerEnv()

const PORT = Number(process.env.PORT) || 3000

const app = express()

app.use(express.json())

app.get("/", (_req, res) => {
    res.json({ message: "Exercise app API is running" })
})

app.get("/fitness", (_req, res) => {
    res.send("Fitness is important!")
})

app.use("/auth", authRoutes)
app.use("/users", usersRoutes)
app.use("/exercise-types", exerciseTypesRoutes)
app.use("/activities", activitiesRoutes)

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})