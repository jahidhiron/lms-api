// lib
const router = require("express").Router();

// custom
const {
  isAuthenticated,
  isAdmin,
  validate,
  isStudent,
  isInstructor,
} = require("../middlewares");
const {
  addValidator,
  assignmentIdValidator,
  assignmentAnswerIdValidator,
} = require("./validator");
const {
  add,
  update,
  submit,
  remove,
  assignmentAnswers,
  assignmentAnswer,
} = require("./controller");

// routes
router.post("/", isAuthenticated, isStudent, addValidator, validate, add);

router.put(
  "/:id",
  isAuthenticated,
  isStudent,
  assignmentAnswerIdValidator,
  validate,
  update
);

router.put(
  "/submit/:id",
  isAuthenticated,
  isStudent,
  assignmentAnswerIdValidator,
  validate,
  submit
);

router.delete(
  "/:id",
  isAuthenticated,
  isInstructor,
  assignmentAnswerIdValidator,
  validate,
  remove
);

router.get("/", isAuthenticated, assignmentAnswers);

router.get(
  "/:id",
  isAuthenticated,
  assignmentIdValidator,
  validate,
  assignmentAnswer
);

module.exports = router;
