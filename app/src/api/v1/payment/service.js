// lib
const {
  Types: { ObjectId },
} = require("mongoose");
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));
const {
  paypalClientId,
  paypalAppSecret,
  paypalBaseUrl,
} = require("../../../config");

// start services utilities
// ------------------------------------

const generateAccessToken = async () => {
  const auth = Buffer.from(paypalClientId + ":" + paypalAppSecret).toString(
    "base64"
  );
  const response = await fetch(`${paypalBaseUrl}/v1/oauth2/token`, {
    method: "post",
    body: "grant_type=client_credentials",
    headers: {
      Authorization: `Basic ${auth}`,
    },
  });

  const jsonData = await handleResponse(response);
  return jsonData.access_token;
};

const handleResponse = async (response) => {
  if (response.status === 200 || response.status === 201) {
    return response.json();
  }

  const errorMessage = await response.text();
  throw new InternalServerError(errorMessage);
};

// ------------------------------------
// end services utilities

// custom module
const { Enrollment, Payment } = require("../models");
const { InternalServerError } = require("../utils/errors");

// find single document
exports.findOnePaymentService = async (keyValues, options = {}) => {
  const payment = await Payment.findOne(keyValues, options);
  return payment;
};

// create a new order
exports.createOrderService = async ({ currency_code, value }) => {
  const accessToken = await generateAccessToken();
  const url = `${paypalBaseUrl}/v2/checkout/orders`;
  const response = await fetch(url, {
    method: "post",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code,
            value,
          },
        },
      ],
    }),
  });

  return handleResponse(response);
};

// capture order
exports.capturePaymentService = async (orderId) => {
  const accessToken = await generateAccessToken();
  const url = `${paypalBaseUrl}/v2/checkout/orders/${orderId}/capture`;
  const response = await fetch(url, {
    method: "post",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return handleResponse(response);
};

// new payment
exports.newPaymentService = async ({ captureData, ip, _id, body }) => {
  const amount =
    captureData.purchase_units[0].payments.captures[0].amount.value;
  const currency =
    captureData.purchase_units[0].payments.captures[0].amount.currency_code;
  const tranxId = captureData.id;
  const paymentId = captureData.purchase_units[0].payments.captures[0].id;
  const buyerName = captureData.purchase_units[0].shipping.name.full_name;
  const buyerEmail = captureData.payment_source.paypal.email_address;
  const buyerAccount = captureData.payment_source.paypal.account_id;
  const buyerAddress = captureData.purchase_units[0].shipping.address;

  const payment = new Payment({
    ...body,
    ip,
    amount,
    currency,
    tranxId,
    paymentId,
    buyerName,
    buyerEmail,
    buyerAccount,
    buyerAddress,
    updatedBy: _id,
  });
  await payment.save();

  return payment;
};

// create new enrollment
exports.newEnrollmentService = async ({ body, _id }) => {
  const newEnrollment = new Enrollment({ ...body, updatedBy: _id });
  await newEnrollment.save();

  newEnrollment.isDelete = undefined;
  newEnrollment.__v = undefined;

  return newEnrollment;
};

// soft delete payment
exports.deletePaymentService = async ({ payment, _id }) => {
  payment.isDelete = true;
  payment.deletedAt = new Date().getTime();
  payment.deletedBy = _id;

  // save payment
  await payment.save();
};

// payment list
exports.findPaymentsService = async (keyValues = {}, { q, page, size }) => {
  let regex = new RegExp(q, "i");
  const skip = (page - 1) * size;

  let query = {
    ...keyValues,
    $or: [{ "course.title": regex }],
  };

  let project = {
    amount: 1,
    currency: 1,
    ip: 1,
    tranxId: 1,
    paymentId: 1,
    buyerName: 1,
    buyerEmail: 1,
    buyerAccount: 1,
    buyerAddress: 1,
    course: {
      _id: "$course._id",
      title: "$course.title",
      slug: "$course.slug",
    },
    updatedBy: {
      _id: "$user._id",
      name: "$user.name",
      email: "$user.email",
    },
    updatedByAdmin: {
      _id: "$admin._id",
      name: "$admin.name",
      email: "$admin.email",
    },
  };

  const result = await Payment.aggregate([
    {
      $match: { isDelete: false },
    },
    {
      $lookup: {
        from: "courses",
        localField: "courseId",
        foreignField: "_id",
        as: "course",
      },
    },
    {
      $unwind: { path: "$course", preserveNullAndEmptyArrays: true },
    },
    {
      $lookup: {
        from: "users",
        localField: "updatedBy",
        foreignField: "_id",
        as: "user",
      },
    },
    {
      $unwind: { path: "$user", preserveNullAndEmptyArrays: true },
    },
    {
      $lookup: {
        from: "users",
        localField: "updatedByAdmin",
        foreignField: "_id",
        as: "admin",
      },
    },
    {
      $unwind: { path: "$admin", preserveNullAndEmptyArrays: true },
    },
    { $project: project },
    { $match: query },
    { $sort: { _id: -1 } },
    {
      $facet: {
        metadata: [{ $count: "totalItem" }, { $addFields: { page } }],
        data: [{ $skip: skip }, { $limit: size }],
      },
    },
  ]);

  const { metadata, data: payments } = result[0];
  if (payments.length === 0) {
    return {
      payments: [],
      totalItem: 0,
      totalPage: 0,
    };
  }
  const { totalItem } = metadata[0];
  return {
    payments,
    totalItem,
    totalPage: Math.ceil(totalItem / size),
  };
};

// detail payment
exports.findPaymentService = async (keyValues = {}) => {
  let query = {
    ...keyValues,
    _id: new ObjectId(keyValues["_id"]),
  };

  let project = {
    amount: 1,
    currency: 1,
    ip: 1,
    tranxId: 1,
    paymentId: 1,
    buyerName: 1,
    buyerEmail: 1,
    buyerAccount: 1,
    buyerAddress: 1,
    courseId: "$course._id",
    course: {
      title: "$course.title",
      slug: "$course.slug",
    },
    updatedBy: {
      _id: "$user._id",
      name: "$user.name",
      email: "$user.email",
    },
    updatedByAdmin: {
      _id: "$admin._id",
      name: "$admin.name",
      email: "$admin.email",
    },
  };

  const result = await Payment.aggregate([
    {
      $match: query,
    },
    {
      $lookup: {
        from: "courses",
        localField: "courseId",
        foreignField: "_id",
        as: "course",
      },
    },
    {
      $unwind: { path: "$course", preserveNullAndEmptyArrays: true },
    },
    {
      $lookup: {
        from: "users",
        localField: "updatedBy",
        foreignField: "_id",
        as: "user",
      },
    },
    {
      $unwind: { path: "$user", preserveNullAndEmptyArrays: true },
    },
    {
      $lookup: {
        from: "users",
        localField: "updatedByAdmin",
        foreignField: "_id",
        as: "admin",
      },
    },
    {
      $unwind: { path: "$admin", preserveNullAndEmptyArrays: true },
    },
    { $project: project },
  ]);

  const payment = result.length > 0 ? result[0] : null;
  return payment;
};
