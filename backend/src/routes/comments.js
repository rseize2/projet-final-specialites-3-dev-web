const express           = require("express")
const router            = express.Router()
const { body }          = require("express-validator")
const { authenticate }  = require("../middleware/auth")
const controller        = require("../controllers/commentController")

router.get("/task/:id", authenticate, controller.listComments)
router.post("/task/:id", authenticate, body("content").isString().notEmpty(), controller.createComment)

module.exports = router
