// lib
const router = require("express").Router();

// custom
const { isAuthenticated, isAdmin, validate } = require("../middlewares");
const { addValidator, updateValidator, idValidator } = require("./validator");
const {
  add,
  update,
  remove,
  subCategories,
  subCategory,
} = require("./controller");

// routes
router.post("/", isAuthenticated, isAdmin, addValidator, validate, add);

router.put(
  "/:id",
  isAuthenticated,
  isAdmin,
  updateValidator,
  idValidator,
  validate,
  update
);

router.delete("/:id", isAuthenticated, isAdmin, idValidator, validate, remove);

router.get("/", subCategories);

router.get("/:id", idValidator, validate, subCategory);

module.exports = router;
