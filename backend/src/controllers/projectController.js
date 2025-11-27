const db                   = require("../database")
const { v4: uuidv4 }       = require("uuid")
const { validationResult } = require("express-validator")

const listProjects = (req, res) => {
    const rows = db.prepare(
        "SELECT p.id, p.title, p.description, p.deadline, p.created_at, " +
        "GROUP_CONCAT(pm.user_id) as managers " +
        "FROM projects p " +
        "LEFT JOIN project_managers pm ON p.id = pm.project_id " +
        "GROUP BY p.id"
    ).all()

    const projects = rows.map(r => ({
        id : r.id,
        title : r.title,
        description : r.description,
        deadline : r.deadline,
        created_at : r.created_at,
        managers : r.managers ? r.managers.split(",") : []
    }))

    res.json(projects)
}

const createProject = (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })

    const { title, description, deadline } = req.body
    const id          = uuidv4()
    const created_at  = new Date().toISOString()

    db.prepare(
        "INSERT INTO projects (id, title, description, deadline, created_at) VALUES (?, ?, ?, ?, ?)"
    ).run(
        id,
        title,
        description || "",
        deadline || null,
        created_at
    )

    res.json({ id, title, description, deadline, created_at })
}

const updateProject = (req, res) => {
    const { id } = req.params
    const p      = db.prepare("SELECT id FROM projects WHERE id = ?").get(id)
    if (!p) return res.status(404).json({ error: "Not found" })

    const { title, description, deadline } = req.body

    db.prepare(
        "UPDATE projects SET title = COALESCE(?, title), description = COALESCE(?, description), deadline = COALESCE(?, deadline) WHERE id = ?"
    ).run(title, description, deadline, id)

    const row = db.prepare(
        "SELECT id, title, description, deadline, created_at FROM projects WHERE id = ?"
    ).get(id)

    res.json(row)
}

const deleteProject = (req, res) => {
    const { id } = req.params
    db.prepare("DELETE FROM projects WHERE id = ?").run(id)
    res.json({ success: true })
}

const assignManager = (req, res) => {
    const projectId = req.params.id
    const userId    = req.user.id
    const p         = db.prepare("SELECT id FROM projects WHERE id = ?").get(projectId)
    if (!p) return res.status(404).json({ error: "Project not found" })

    db.prepare(
        "INSERT OR IGNORE INTO project_managers (project_id, user_id) VALUES (?, ?)"
    ).run(projectId, userId)

    res.json({ success: true })
}

const getProjectTasks = (req, res) => {
    const projectId = req.params.id
    const p         = db.prepare("SELECT id FROM projects WHERE id = ?").get(projectId)
    if (!p) return res.status(404).json({ error: "Project not found" })

    const tasks = db.prepare(
        "SELECT id, title, description, status, assigned_to, deadline, created_at FROM tasks WHERE project_id = ?"
    ).all(projectId)

    res.json(tasks)
}

module.exports = { listProjects, createProject, updateProject, deleteProject, assignManager, getProjectTasks }