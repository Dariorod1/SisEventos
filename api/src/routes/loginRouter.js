const express = require("express");
const router = express.Router();

// Controllers
const loginControllers = require("../controllers/loginControllers");



// Dos rutas: login y registro
// /api/singin & /api/singup
router.post("/api/signin", loginControllers.signIn);
router.post("/api/signup", loginControllers.signUp);



module.exports = router;