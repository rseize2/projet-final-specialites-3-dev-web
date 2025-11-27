const express    = require("express")
const router     = express.Router()
const { body }   = require("express-validator")
const controller = require("../controllers/authController")

router.post("/register", body("username").isString().notEmpty(), body("password").isString().isLength({ min: 6 }), controller.register)

router.post("/login", body("username").isString().notEmpty(), body("password").isString().notEmpty(), controller.login)

module.exports = router