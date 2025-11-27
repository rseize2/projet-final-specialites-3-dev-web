const express                   = require("express")
const router                    = express.Router()
const { body }                  = require("express-validator")
const { authenticate, requireProjectManager, requireTaskProjectManager } = require("../middleware/auth")
const controller                = require("../controllers/taskController")

router.get("/:id", authenticate, controller.getTask)

router.post("/project/:id", authenticate, requireProjectManager("id"), body("title").isString().notEmpty(), controller.createTask)

router.put("/:id", authenticate, controller.updateTask)

router.delete("/:id", authenticate, requireTaskProjectManager, controller.deleteTask)

router.post("/:id/assign", authenticate, requireTaskProjectManager, body("userId").optional().isString(), controller.assignTask)

router.post("/:id/unassign", authenticate, requireTaskProjectManager, controller.unassignTask)

router.post("/:id/complete", authenticate, controller.completeTask)

router.post("/:id/validate", authenticate, requireTaskProjectManager, controller.validateTask)

module.exports = router