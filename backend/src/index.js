const express        = require("express")
const cors           = require("cors")
const dotenv         = require("dotenv")
const db             = require("./database")
const authRoutes     = require("./routes/auth")
const userRoutes     = require("./routes/users")
const projectRoutes  = require("./routes/projects")
const taskRoutes     = require("./routes/tasks")
const commentRoutes  = require("./routes/comments")

dotenv.config()

const app = express()

app.use(cors())
app.use(express.json())

app.use("/auth", authRoutes)
app.use("/users", userRoutes)
app.use("/projects", projectRoutes)
app.use("/tasks", taskRoutes)
app.use("/comments", commentRoutes)

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`)
})