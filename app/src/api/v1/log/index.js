// lib
const router = require("express").Router();

// custom
const { isAuthenticated } = require("../middleware");
const { idValidator } = require("./validator");
const { list, detail } = require("./controller");
const validate = require("../validator");

// routes
router.get("/", isAuthenticated, list);

router.get("/:id", isAuthenticated, idValidator, validate, detail);

module.exports = router;
