// pre-defined module
const bcrypt = require("bcryptjs");

// custom module
const { passwordSalt } = require("../../../config");

// hashed password
exports.hashPassword = (password) => {
  return new Promise((resolve, reject) => {
    bcrypt.genSalt(parseInt(passwordSalt), (error, salt) => {
      if (error) {
        return reject(error);
      }

      bcrypt.hash(password, salt, (error, hashed) => {
        if (error) {
          return reject(error);
        }
        resolve(hashed);
      });
    });
  });
};

// compare password
exports.comparePassword = async (password, hashedPassword) => {
  return new Promise((resolve, reject) => {
    bcrypt.compare(password, hashedPassword, (error, result) => {
      if (error) {
        return reject(error);
      }
      resolve(result);
    });
  });
};
