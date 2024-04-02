// generate random number
exports.generateCode = (length) => {
  const _ = String(Math.random()).split(".")[1].split("");
  const l = _.length;

  let code = "";
  for (let i = 0; i < length; i++) {
    code += _[l - (i + 1)];
  }

  return code;
};
