// custom
const { createActivityLog } = require("../utils/createActivityLog");
const { NotFound } = require("../utils/errors");
const {
  createOrderService,
  capturePaymentService,
  newPaymentService,
  findOnePaymentService,
  deletePaymentService,
  findPaymentsService,
  findPaymentService,
} = require("./service");
const { findOneCourseService } = require("../course/service");
const { findOneUserService } = require("../auth/service");

const { newEnrollmentService } = require("../enrollment/service");

// add payment order
exports.add = async (req, res, next) => {
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || null;
  const { amount, currency } = req.body;
  const { _id } = req.user;

  try {
    // create order
    const order = await createOrderService({
      currency_code: currency,
      value: amount,
    });

    // save activity log
    await createActivityLog({
      title: `Add new payment order`,
      desc: `Add new payment order of ${amount}${currency} and tranxId: ${order.id}`,
      ip,
      user: _id,
    });

    // response
    res.status(201).json({
      code: 201,
      status: "success",
      message: req.__("addNewPaymentOrderSucc"),
      data: {
        order: { id: order.id, status: order.status, link: order.links[1] },
      },
    });
  } catch (error) {
    next(error, req, res);
  }
};

// confirm order
exports.confirmOrder = async (req, res, next) => {
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || null;
  const { courseId } = req.body;
  const { orderID } = req.params;
  const { _id } = req.user;

  try {
    // course checker
    const course = await findOneCourseService({
      _id: courseId,
      isDelete: false,
    });
    if (!course) {
      throw new NotFound(req.__("courseNotFoundErr"));
    }

    // buyer checker
    const isBuyerUserExist = await findOneUserService({
      _id,
      isDelete: false,
    });
    if (!isBuyerUserExist) {
      throw new NotFound(req.__("userNotFoundErr"));
    }

    // capture order
    const captureData = await capturePaymentService(orderID);

    // create new payment
    const payment = await newPaymentService({
      captureData,
      ip,
      _id,
      body: { ...req.body },
    });

    // create new enrollment
    await newEnrollmentService({
      body: { courseId, paymentId: payment._id },
      _id,
    });

    // new conversation
    // await newConversationService({});

    // save activity log
    await createActivityLog({
      title: `Order payment`,
      desc: `Order payment confirmed for "${courseId}" course id`,
      ip,
      user: _id,
    });

    // response
    res.status(201).json({
      code: 201,
      status: "success",
      message: req.__("orderPaymentConfirmSucc"),
      data: { payment },
    });
  } catch (error) {
    next(error, req, res);
  }
};

// remove payment
exports.remove = async (req, res, next) => {
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || null;
  const { id } = req.params;
  const { _id } = req.user;

  try {
    // find payment
    const payment = await findOnePaymentService({
      _id: id,
      isDelete: false,
    });
    if (!payment) {
      throw new NotFound(req.__("paymentNotFoundErr"));
    }

    // soft delete payment
    await deletePaymentService({ payment, _id });

    // save activity log
    await createActivityLog({
      title: `Delete payment`,
      desc: `${payment._id} payment id is deleted`,
      ip,
      user: _id,
    });

    // response
    res.status(200).json({
      code: 200,
      status: "success",
      message: req.__("paymentDeleteSucc"),
    });
  } catch (error) {
    next(error, req, res);
  }
};

// list payment
exports.payments = async (req, res, next) => {
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || null;
  const { _id } = req.user;
  const { q, page, size } = req.query;
  const query = {};
  let options = {
    q: q !== "undefined" && q !== undefined ? q : "",
    page: parseInt(page) || 1,
    size: parseInt(size) || 10,
  };

  try {
    // list
    const payments = await findPaymentsService(query, options);

    // save activity log
    await createActivityLog({
      title: `List payment`,
      ip,
      user: _id,
    });

    // response
    res.status(200).json({
      code: 200,
      status: "success",
      message: res.__("paymentListSucc"),
      data: { ...payments },
    });
  } catch (error) {
    next(error, req, res);
  }
};

// payment detail
exports.payment = async (req, res, next) => {
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || null;
  const { _id } = req.user;
  const { id } = req.params;
  const keyValues = { isDelete: false, _id: id };

  try {
    // list
    const payment = await findPaymentService(keyValues);
    if (!payment) {
      throw new NotFound(req.__("paymentNotFoundErr"));
    }

    // save activity log
    await createActivityLog({
      title: `Detail payment`,
      desc: `Get detail payment by "${payment._id}" id `,
      ip,
      user: _id,
    });

    // response
    res.status(200).json({
      code: 200,
      status: "success",
      message: res.__("paymentDetailSucc"),
      data: { payment },
    });
  } catch (error) {
    next(error, req, res);
  }
};
