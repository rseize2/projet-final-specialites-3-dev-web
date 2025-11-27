const express                   = require("express")
const router                    = express.Router()
const { body }                  = require("express-validator")
const { authenticate, requireProjectManager } = require("../middleware/auth")
const controller                = require("../controllers/projectController")

router.get( "/", authenticate, controller.listProjects)

router.post("/", authenticate, body("title").isString().notEmpty(), controller.createProject)

router.put("/:id", authenticate, requireProjectManager("id"), body("title").optional().isString(), controller.updateProject)

router.delete("/:id", authenticate, requireProjectManager("id"), controller.deleteProject)

router.post("/:id/manage", authenticate, controller.assignManager)

router.get("/:id/tasks", authenticate, controller.getProjectTasks)

module.exports = router