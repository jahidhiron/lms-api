// pre-defined module
const mg = require("mailgun-js");

// custom module
const {
  mailgunApiKey: apiKey,
  mailgunDomain: domain,
} = require("../../../config");

exports.mailgun = () =>
  mg({
    apiKey,
    domain,
  });
