// lib
const router = require("express").Router();

// custom
const {
  isAuthenticated,
  validate,
  isAdmin,
  isStudent,
} = require("../middlewares");
const { addValidator, listValidator, idValidator } = require("./validator");
const { add, remove, quizAnswers, quizAnswer } = require("./controller");

// routes
router.post("/", isAuthenticated, isStudent, addValidator, validate, add);

router.delete("/:id", isAuthenticated, isAdmin, idValidator, validate, remove);

router.get("/", isAuthenticated, listValidator, validate, quizAnswers);

router.get("/:id", isAuthenticated, idValidator, validate, quizAnswer);

module.exports = router;
