// lib
const router = require("express").Router();

// custom
const { isAuthenticated, validate, isAdmin } = require("../middlewares");
const { addValidator, listValidator, idValidator } = require("./validator");
const { add, remove, ratings, rating } = require("./controller");

// routes
router.post("/", isAuthenticated, addValidator, validate, add);

router.delete("/:id", isAuthenticated, isAdmin, idValidator, validate, remove);

router.get("/", listValidator, validate, ratings);

router.get("/:id", idValidator, validate, rating);

module.exports = router;
