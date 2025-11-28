const db                   = require("../database")
const { v4: uuidv4 }       = require("uuid")
const { validationResult } = require("express-validator")

const createTask = (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }

    const projectId = req.params.id
    const project   = db.prepare("SELECT id FROM projects WHERE id = ?").get(projectId)
    
    if (!project) {
        return res.status(404).json({ error: "Project not found" })
    }

    const { title, description, deadline, assigned_to } = req.body
    const id         = uuidv4()
    const created_at = new Date().toISOString()
    const status     = "non_validé"

    db.prepare(
        "INSERT INTO tasks (id, project_id, title, description, status, assigned_to, deadline, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
    ).run(
        id,
        projectId,
        title,
        description || "",
        status,
        assigned_to || null,
        deadline || null,
        created_at
    )

    const row = db.prepare(
        "SELECT id, project_id, title, description, status, assigned_to, deadline, created_at FROM tasks WHERE id = ?"
    ).get(id)

    res.json(row)
}

const getTask = (req, res) => {
    const id  = req.params.id
    const row = db.prepare(
        "SELECT id, project_id, title, description, status, assigned_to, deadline, created_at FROM tasks WHERE id = ?"
    ).get(id)

    if (!row) {
        return res.status(404).json({ error: "Not found" })
    }

    res.json(row)
}

const updateTask = (req, res) => {
    const id  = req.params.id
    const row = db.prepare(
        "SELECT id, project_id, status, assigned_to FROM tasks WHERE id = ?"
    ).get(id)
    
    if (!row) {
        return res.status(404).json({ error: "Not found" })
    }

    const user = req.user
    const body = req.body

    const isManager = db.prepare(
        "SELECT 1 FROM project_managers WHERE project_id = ? AND user_id = ?"
    ).get(row.project_id, user.id)

    const isAssigned = row.assigned_to === user.id

    if (!isManager && !isAssigned) {
        return res.status(403).json({ error: "Forbidden" })
    }

    const allowedStatus = ["non_validé", "en_cours", "complétée", "validée"]
    if (body.status && !allowedStatus.includes(body.status)) {
        return res.status(400).json({ error: "Invalid status" })
    }

    if (body.status === "validée" && !isManager) {
        return res.status(403).json({ error: "Only managers can validate tasks" })
    }

    if (body.assigned_to !== undefined && !isManager) {
        return res.status(403).json({ error: "Only managers can assign tasks" })
    }

    db.prepare(
        "UPDATE tasks SET title = COALESCE(?, title), description = COALESCE(?, description), " +
        "status = COALESCE(?, status), assigned_to = CASE WHEN ? IS NULL THEN assigned_to ELSE ? END, " +
        "deadline = COALESCE(?, deadline) WHERE id = ?"
    ).run(
        body.title, 
        body.description, 
        body.status, 
        body.assigned_to, 
        body.assigned_to, 
        body.deadline, 
        id
    )

    const updated = db.prepare(
        "SELECT id, project_id, title, description, status, assigned_to, deadline, created_at FROM tasks WHERE id = ?"
    ).get(id)

    res.json(updated)
}

const deleteTask = (req, res) => {
    const id = req.params.id
    db.prepare("DELETE FROM tasks WHERE id = ?").run(id)
    res.json({ success: true })
}

const assignTask = (req, res) => {
    const id     = req.params.id
    const { userId } = req.body
    
    const task = db.prepare("SELECT project_id FROM tasks WHERE id = ?").get(id)
    if (!task) {
        return res.status(404).json({ error: "Task not found" })
    }

    if (userId) {
        const user = db.prepare("SELECT id FROM users WHERE id = ?").get(userId)
        if (!user) {
            return res.status(404).json({ error: "User not found" })
        }
    }

    db.prepare("UPDATE tasks SET assigned_to = ? WHERE id = ?").run(userId || null, id)
    res.json({ success: true })
}

const unassignTask = (req, res) => {
    const id   = req.params.id
    const task = db.prepare("SELECT id FROM tasks WHERE id = ?").get(id)
    
    if (!task) {
        return res.status(404).json({ error: "Task not found" })
    }

    db.prepare("UPDATE tasks SET assigned_to = NULL WHERE id = ?").run(id)
    res.json({ success: true })
}

const completeTask = (req, res) => {
    const id   = req.params.id
    const task = db.prepare(
        "SELECT id, assigned_to, status FROM tasks WHERE id = ?"
    ).get(id)
    
    if (!task) {
        return res.status(404).json({ error: "Task not found" })
    }
    
    if (task.assigned_to !== req.user.id) {
        return res.status(403).json({ error: "Not assigned to you" })
    }

    db.prepare("UPDATE tasks SET status = ? WHERE id = ?").run("complétée", id)
    res.json({ success: true })
}

const validateTask = (req, res) => {
    const id   = req.params.id
    const task = db.prepare("SELECT id, status FROM tasks WHERE id = ?").get(id)
    
    if (!task) {
        return res.status(404).json({ error: "Task not found" })
    }

    db.prepare("UPDATE tasks SET status = ? WHERE id = ?").run("validée", id)
    res.json({ success: true })
}

module.exports = { 
    createTask, 
    getTask, 
    updateTask, 
    deleteTask, 
    assignTask, 
    unassignTask, 
    completeTask, 
    validateTask 
}