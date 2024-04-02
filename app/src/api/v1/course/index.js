// lib
const router = require("express").Router();

// custom
const { isAuthenticated, validate, isInstructor } = require("../middlewares");
const {
  addValidator,
  publicCourseValidator,
  idValidator,
  updateValidator,
} = require("./validator");
const {
  add,
  update,
  remove,
  courses,
  publicCourses,
  course,
  publicCourse,
} = require("./controller");

// routes
router.post("/", isAuthenticated, isInstructor, addValidator, validate, add);

router.put(
  "/:id",
  isAuthenticated,
  isInstructor,
  idValidator,
  updateValidator,
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

router.get("/", isAuthenticated, isInstructor, courses);

router.get("/public", publicCourseValidator, validate, publicCourses);

router.get("/:key", isAuthenticated, isInstructor, course);

router.get("/public/:key", publicCourse);

module.exports = router;
