// lib
const router = require("express").Router();

// custom
const { isAuthenticated, validate } = require("../middlewares");
const { addValidator, updateValidator, idValidator } = require("./validator");
const { add, update, remove, addToCards, addToCard } = require("./controller");

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

router.delete("/:id", isAuthenticated, idValidator, validate, remove);

router.get("/", isAuthenticated, addToCards);

router.get("/:id", idValidator, isAuthenticated, validate, addToCard);

module.exports = router;
