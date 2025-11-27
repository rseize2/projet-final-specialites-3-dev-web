const express        = require("express")
const router         = express.Router()
const { authenticate } = require("../middleware/auth")
const controller     = require("../controllers/userController")

router.get("/", authenticate, controller.listUsers)

router.get("/me", authenticate, controller.me)

router.get("/:id", authenticate, controller.getUser)

module.exports = router