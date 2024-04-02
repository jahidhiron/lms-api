// lib
const router = require("express").Router();

// custom
const { isAuthenticated, validate, isInstructor } = require("../middlewares");
const { addValidator, idValidator, updateValidator } = require("./validator");
const { add, update, remove, quizs, quiz } = require("./controller");

// routes
router.post("/", isAuthenticated, isInstructor, addValidator, validate, add);

router.put(
  "/:id",
  isAuthenticated,
  isInstructor,
  updateValidator,
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

router.get("/", isAuthenticated, isInstructor, quizs);

router.get("/:id", isAuthenticated, idValidator, validate, quiz);

module.exports = router;
