const db                    = require("../database")
const bcrypt                = require("bcrypt")
const jwt                   = require("jsonwebtoken")
const { v4: uuidv4 }        = require("uuid")
const { validationResult }  = require("express-validator")

const register = async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }

    const { username, password, roles } = req.body
    
    const exists = db.prepare("SELECT id FROM users WHERE username = ?").get(username)
    if (exists) {
        return res.status(400).json({ error: "Username exists" })
    }

    const hash        = await bcrypt.hash(password, 10)
    const id          = uuidv4()
    const created_at  = new Date().toISOString()
    const rolesArr    = Array.isArray(roles) && roles.length ? roles : ["developer"]

    db.prepare(
        "INSERT INTO users (id, username, password, roles, created_at) VALUES (?, ?, ?, ?, ?)"
    ).run(
        id,
        username,
        hash,
        JSON.stringify(rolesArr),
        created_at
    )

    const secret = process.env.JWT_SECRET

    if (!secret || secret === "secret") {
        console.error("SECURITY ERROR: JWT_SECRET not configured!")
        return res.status(500).json({ error: "Server configuration error" })
    }

    const token = jwt.sign(
        { id },
        secret,
        { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    )

    res.json({ token, user: { id, username, roles: rolesArr } })
}

const login = async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }

    const { username, password } = req.body
    
    const row = db.prepare(
        "SELECT id, username, password, roles FROM users WHERE username = ?"
    ).get(username)
    
    if (!row) {
        return res.status(400).json({ error: "Invalid credentials" })
    }

    const ok = await bcrypt.compare(password, row.password)
    if (!ok) {
        return res.status(400).json({ error: "Invalid credentials" })
    }

    const secret = process.env.JWT_SECRET
    
    if (!secret || secret === "secret") {
        console.error("SECURITY ERROR: JWT_SECRET not configured!")
        return res.status(500).json({ error: "Server configuration error" })
    }

    const token = jwt.sign(
        { id: row.id },
        secret,
        { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    )

    res.json({ 
        token, 
        user: { 
            id: row.id, 
            username: row.username, 
            roles: JSON.parse(row.roles) 
        } 
    })
}

module.exports = { register, login }