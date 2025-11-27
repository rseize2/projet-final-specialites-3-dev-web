const db = require("../database")

const listUsers = (req, res) => {
    const rows  = db.prepare("SELECT id, username, roles, created_at FROM users").all()
    const users = rows.map(r => ({
        id : r.id,
        username : r.username,
        roles  : JSON.parse(r.roles),
        created_at: r.created_at
    }))
    res.json(users)
}

const me = (req, res) => {
    res.json(req.user)
}

const getUser = (req, res) => {
    const row = db.prepare(
        "SELECT id, username, roles, created_at FROM users WHERE id = ?"
    ).get(req.params.id)

    if (!row) return res.status(404).json({ error: "Not found" })

    row.roles = JSON.parse(row.roles)
    res.json(row)
}

module.exports = { listUsers, me, getUser }