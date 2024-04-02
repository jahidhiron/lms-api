// lib
const router = require("express").Router();

// custom
const {
  isAuthenticated,
  isAdmin,
  validate,
  isInstructor,
} = require("../middlewares");
const { uploadFileValidator, idValidator } = require("./validator");
const { add, remove, files, file } = require("./controller");
const { upload } = require("../middlewares");

// routes
router.post(
  "/",
  isAuthenticated,
  upload.single("file"),
  uploadFileValidator,
  validate,
  add
);

router.delete("/:id", isAuthenticated, isAdmin, idValidator, validate, remove);

router.get("/", isAuthenticated, isInstructor, files);

router.get("/:id", isAuthenticated, isInstructor, idValidator, validate, file);

module.exports = router;
