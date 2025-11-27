const Database = require("better-sqlite3")
const path     = require("path")
const fs       = require("fs")

const dbFile   = process.env.DATABASE_FILE || path.join(__dirname, "database.db")
const exists   = fs.existsSync(dbFile)
const db       = new Database(dbFile)

if (!exists) {
    db.exec(`
        PRAGMA foreign_keys = ON;
        CREATE TABLE users (
            id         TEXT PRIMARY KEY,
            username   TEXT UNIQUE NOT NULL,
            password   TEXT NOT NULL,
            roles      TEXT NOT NULL,
            created_at TEXT NOT NULL
        );
        CREATE TABLE projects (
            id          TEXT PRIMARY KEY,
            title       TEXT NOT NULL,
            description TEXT,
            deadline    TEXT,
            created_at  TEXT NOT NULL
        );
        CREATE TABLE project_managers (
            project_id TEXT NOT NULL,
            user_id    TEXT NOT NULL,
            PRIMARY KEY(project_id, user_id),
            FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE CASCADE,
            FOREIGN KEY(user_id)    REFERENCES users(id)    ON DELETE CASCADE
        );
        CREATE TABLE tasks (
            id          TEXT PRIMARY KEY,
            project_id  TEXT NOT NULL,
            title       TEXT NOT NULL,
            description TEXT,
            status      TEXT NOT NULL,
            assigned_to TEXT,
            deadline    TEXT,
            created_at  TEXT NOT NULL,
            FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE CASCADE,
            FOREIGN KEY(assigned_to) REFERENCES users(id)   ON DELETE SET NULL
        );
        CREATE TABLE comments (
            id         TEXT PRIMARY KEY,
            task_id    TEXT NOT NULL,
            user_id    TEXT NOT NULL,
            content    TEXT NOT NULL,
            created_at TEXT NOT NULL,
            FOREIGN KEY(task_id) REFERENCES tasks(id) ON DELETE CASCADE,
            FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
        );
    `)
}

module.exports = db