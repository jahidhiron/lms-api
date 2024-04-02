// lib
const router = require("express").Router();

// custom
const { isAuthenticated, isAdmin, validate } = require("../middlewares");
const { addValidator, captureValidator, idValidator } = require("./validator");
const {
  add,
  confirmOrder,
  remove,
  payments,
  payment,
} = require("./controller");

// routes
router.post("/pay", isAuthenticated, addValidator, validate, add);

router.post(
  "/pay/:orderID/capture",
  isAuthenticated,
  captureValidator,
  validate,
  confirmOrder
);

router.delete("/:id", isAuthenticated, isAdmin, idValidator, validate, remove);

router.get("/", isAuthenticated, isAdmin, payments);

router.get("/:id", isAuthenticated, isAdmin, idValidator, validate, payment);

module.exports = router;
