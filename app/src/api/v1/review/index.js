// lib
const router = require("express").Router();

// custom
const { isAuthenticated, validate } = require("../middlewares");
const { addValidator, addReplyValidator, idValidator } = require("./validator");
const {
  add,
  addReply,
  update,
  updateReply,
  remove,
  removeReply,
  reviews,
  review,
} = require("./controller");

// routes
router.post("/", isAuthenticated, addValidator, validate, add);

router.post(
  "/reply/:id",
  isAuthenticated,
  addReplyValidator,
  validate,
  addReply
);

router.put("/:id", isAuthenticated, idValidator, validate, update);

router.put("/reply/:id", isAuthenticated, idValidator, validate, updateReply);

router.delete("/:id", isAuthenticated, idValidator, validate, remove);

router.delete(
  "/reply/:id",
  isAuthenticated,
  idValidator,
  validate,
  removeReply
);

router.get("/", reviews);

router.get("/:id", idValidator, validate, review);

module.exports = router;
