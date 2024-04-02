// custom module
const {
  headingColor,
  subHeadingColor,
  textColor,
  mainContentColor,
} = require('./emailTemplateStyle');

exports.emailTemplate = ({
  heading,
  subHeading = null,
  description = null,
  mainContent = null,
}) => {
  return `
          <h1 style="color: ${headingColor};">${heading}</h1>
          <hr />
          ${
            subHeading
              ? `
                    <h3 style="color: ${subHeadingColor};">${subHeading}</h3>
                    <br />
                `
              : ''
          }
          ${
            description
              ? `<p style="color: ${textColor};">${description}</p>`
              : ''
          }
          ${
            mainContent
              ? `<h3 style="color: ${mainContentColor};">${mainContent}</h3>`
              : ''
          }
        `;
};
