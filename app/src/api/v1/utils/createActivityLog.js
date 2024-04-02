// custom module
const { Log } = require("../models");
const { InternalServerError } = require("./errors");

// create log document
exports.createActivityLog = (document) => {
  return new Promise(async (resolve, reject) => {
    try {
      const newLog = new Log(document);
      await newLog.save();
      resolve(true);
    } catch (error) {
      return reject(new InternalServerError("Error to save activity log"));
    }
  });
};
