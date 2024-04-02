// custom module
const { mailgun } = require("../init");
const { InternalServerError } = require("./errors");

exports.sendEmail = (body, errorMsg) => {
  return new Promise((resolve, reject) => {
    mailgun()
      .messages()
      .send(body, (error, _) => {
        if (error) {
          return reject(new InternalServerError(errorMsg));
        }
        resolve(true);
      });
  });
};
