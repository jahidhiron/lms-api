// lib
const router = require("express").Router();

// custom
const {
  isAuthenticated,
  validate,
  isInstructor,
  isStudent,
} = require("../middlewares");
const { addValidator, updateValidator, idValidator } = require("./validator");
const {
  add,
  update,
  addComment,
  updateComment,
  deleteComment,
  remove,
  announcements,
  announcement,
} = require("./controller");

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

router.post(
  "/add-comment/:id",
  isAuthenticated,
  updateValidator,
  idValidator,
  validate,
  addComment
);

router.put(
  "/update-comment/:id",
  isAuthenticated,
  updateValidator,
  idValidator,
  validate,
  updateComment
);

router.delete(
  "/delete-comment/:id",
  isAuthenticated,
  updateValidator,
  idValidator,
  validate,
  deleteComment
);

router.delete(
  "/:id",
  isAuthenticated,
  isInstructor,
  idValidator,
  validate,
  remove
);

router.get("/", isAuthenticated, announcements);

router.get("/:id", isAuthenticated, idValidator, validate, announcement);

module.exports = router;
