// lib
const router = require("express").Router();

// custom
const { isAuthenticated, validate, isStudent } = require("../middlewares");
const { addValidator, updateValidator, idValidator } = require("./validator");
const { add, update, remove, notes, note } = require("./controller");

// routes
router.post("/", isAuthenticated, isStudent, addValidator, validate, add);

router.put(
  "/:id",
  isAuthenticated,
  isStudent,
  updateValidator,
  idValidator,
  validate,
  update
);

router.delete(
  "/:id",
  isAuthenticated,
  isStudent,
  idValidator,
  validate,
  remove
);

router.get("/", isAuthenticated, notes);

router.get("/:id", isAuthenticated, idValidator, validate, note);

module.exports = router;
