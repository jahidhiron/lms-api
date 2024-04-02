// lib
const router = require("express").Router();

// custom
const { isAuthenticated, isInstructor } = require("../middlewares");
const { conversations } = require("./conversation/controller");

// routes
router.get("/conversations", isAuthenticated, isInstructor, conversations);

module.exports = router;
