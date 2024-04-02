// custom module
const { emailTemplate } = require("./utils/baseEmailTemplate");
const { sendEmail } = require("./utils/sendEmail");
const { mailFrom, appName } = require("../../config");

// send email
exports.sendEmailService = async ({ body, email, subject, errorMsg }) => {
  const html = emailTemplate(body);

  await sendEmail(
    {
      from: mailFrom,
      to: email,
      subject: `${appName} ${subject}`,
      html,
    },
    errorMsg
  );
};
