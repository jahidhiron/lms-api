// set prefix before a number
module.exports = (i) =>
  `${
    i + 1 === 1
      ? "1st"
      : i + 1 === 2
      ? "2nd"
      : i + 1 === 3
      ? "3rd"
      : i + 1 + "th"
  }`;
