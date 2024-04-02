// lib
const router = require("express").Router();

// custom
const { isAuthenticated, validate, isInstructor } = require("../middlewares");
const { addValidator, idValidator } = require("./validator");
const { add, update, remove, lectures, lecure } = require("./controller");

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

router.get("/", isAuthenticated, isInstructor, lectures);

router.get("/:id", isAuthenticated, isInstructor, lecure);

module.exports = router;
