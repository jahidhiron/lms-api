// lib
const router = require("express").Router();

// custom
const { isAuthenticated, isAdmin, validate } = require("../middlewares");
const { addValidator, idValidator } = require("./validator");
const { add, update, remove, categories, category } = require("./controller");

// routes
router.post("/", isAuthenticated, isAdmin, addValidator, validate, add);

router.put("/:id", isAuthenticated, isAdmin, idValidator, validate, update);

router.delete("/:id", isAuthenticated, isAdmin, idValidator, validate, remove);

router.get("/", categories);

router.get("/:id", idValidator, validate, category);

module.exports = router;
