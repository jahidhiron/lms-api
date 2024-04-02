// lib
const router = require("express").Router();

// custom
const { isAuthenticated, validate } = require("../middlewares");
const { updateValidator } = require("./validator");
const { update, profile } = require("./controller");

// routes
router.put("/", isAuthenticated, updateValidator, validate, update);

router.get("/", isAuthenticated, validate, profile);

module.exports = router;
