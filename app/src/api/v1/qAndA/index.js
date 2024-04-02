// lib
const router = require("express").Router();

// custom
const { isAuthenticated, validate } = require("../middlewares");
const {
  addValidator,
  updateValidator,
  idValidator,
  qAReplyValidator,
  replyVoteValidator,
  qAUpdateReplyValidator,
} = require("./validator");
const {
  add,
  update,
  vote,
  remove,
  qas,
  qa,
  addReply,
  updateReply,
  deleteReply,
  replyVote,
} = require("./controller");

// routes
router.post("/", isAuthenticated, addValidator, validate, add);

router.put(
  "/:id",
  isAuthenticated,
  idValidator,
  updateValidator,
  validate,
  update
);

router.put("/vote/:id", isAuthenticated, idValidator, validate, vote);

router.put(
  "/reply-vote/:id",
  isAuthenticated,
  idValidator,
  replyVoteValidator,
  validate,
  replyVote
);

router.post(
  "/reply/:id",
  isAuthenticated,
  idValidator,
  qAReplyValidator,
  validate,
  addReply
);

router.put(
  "/reply/:id",
  isAuthenticated,
  idValidator,
  qAUpdateReplyValidator,
  validate,
  updateReply
);

router.delete(
  "/reply/:id",
  isAuthenticated,
  idValidator,
  validate,
  deleteReply
);

router.delete("/:id", isAuthenticated, idValidator, validate, remove);

router.get("/", isAuthenticated, qas);

router.get("/:id", isAuthenticated, idValidator, validate, qa);

module.exports = router;
