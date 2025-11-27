const jwt = require("jsonwebtoken")
const db  = require("../database")

const getUserById = (id) => {
    const row = db.prepare(
        "SELECT id, username, roles FROM users WHERE id = ?"
    ).get(id)

    if (!row) return null

    row.roles = JSON.parse(row.roles)
    return row
}

const authenticate = (req, res, next) => {
    const auth = req.headers.authorization
    if (!auth || !auth.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Unauthorized" })
    }

    const token = auth.split(" ")[1]

    try {
        const secret = process.env.JWT_SECRET
        
        // SÉCURITÉ : Refuser si pas de JWT_SECRET configuré
        if (!secret || secret === "secret") {
            console.error("SECURITY ERROR: JWT_SECRET not configured or using default value!")
            return res.status(500).json({ error: "Server configuration error" })
        }

        const payload = jwt.verify(token, secret)
        const user    = getUserById(payload.id)

        if (!user) return res.status(401).json({ error: "Unauthorized" })

        req.user = user
        next()
    } catch (e) {
        return res.status(401).json({ error: "Invalid token" })
    }
}

const requireRole = (role) => {
    return (req, res, next) => {
        if (!req.user) return res.status(401).json({ error: "Unauthorized" })
        if (!req.user.roles.includes(role)) {
            return res.status(403).json({ error: "Forbidden" })
        }
        next()
    }
}

const requireProjectManager = (projectIdParam) => {
    return (req, res, next) => {
        const projectId = req.params[projectIdParam || "id"]
        const row       = db.prepare(
            "SELECT 1 FROM project_managers WHERE project_id = ? AND user_id = ?"
        ).get(projectId, req.user.id)

        if (!row) {
            return res.status(403).json({ error: "Not manager of project" })
        }

        next()
    }
}

const requireTaskProjectManager = (req, res, next) => {
    const taskId = req.params.id

    const task = db.prepare(
        "SELECT project_id FROM tasks WHERE id = ?"
    ).get(taskId)
    
    if (!task) {
        return res.status(404).json({ error: "Task not found" })
    }

    const isManager = db.prepare(
        "SELECT 1 FROM project_managers WHERE project_id = ? AND user_id = ?"
    ).get(task.project_id, req.user.id)
    
    if (!isManager) {
        return res.status(403).json({ error: "Not manager of this project" })
    }
    
    next()
}

module.exports = { 
    authenticate, 
    requireRole, 
    requireProjectManager,
    requireTaskProjectManager 
}