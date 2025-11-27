const db                  = require("../database")
const { v4: uuidv4 }      = require("uuid")
const { validationResult }= require("express-validator")

const listComments = (req, res) => {
    const taskId = req.params.id
    const rows   = db.prepare(
        "SELECT c.id, c.task_id, c.user_id, c.content, c.created_at, u.username " +
        "FROM comments c " +
        "JOIN users u ON u.id = c.user_id " +
        "WHERE c.task_id = ? " +
        "ORDER BY c.created_at ASC"
    ).all(taskId)
    res.json(rows)
}

const createComment = (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }

    const taskId      = req.params.id
    const task        = db.prepare("SELECT id FROM tasks WHERE id = ?").get(taskId)
    if (!task) {
        return res.status(404).json({ error: "Task not found" })
    }

    const { content } = req.body
    const id          = uuidv4()
    const created_at  = new Date().toISOString()

    db.prepare(
        "INSERT INTO comments (id, task_id, user_id, content, created_at) VALUES (?, ?, ?, ?, ?)"
    ).run(
        id,
        taskId,
        req.user.id,
        content,
        created_at
    )

    const row = db.prepare(
        "SELECT c.id, c.task_id, c.user_id, c.content, c.created_at, u.username " +
        "FROM comments c " +
        "JOIN users u ON u.id = c.user_id " +
        "WHERE c.id = ?"
    ).get(id)

    res.json(row)
}

module.exports = { listComments, createComment }