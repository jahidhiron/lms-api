// lib
const router = require("express").Router();

// custom
const { isAuthenticated, validate, isInstructor } = require("../middlewares");
const { addValidator, idValidator } = require("./validator");
const {
  add,
  update,
  remove,
  assignments,
  assignment,
} = require("./controller");

// routes
router.post("/", isAuthenticated, isInstructor, addValidator, validate, add);

router.put(
  "/:id",
  isAuthenticated,
  isInstructor,
  idValidator,
  validate,
  update
);

router.delete(
  "/:id",
  isAuthenticated,
  isInstructor,
  idValidator,
  validate,
  remove
);

router.get("/", isAuthenticated, assignments);

router.get("/:id", isAuthenticated, idValidator, validate, assignment);

module.exports = router;
