// custom module
const { connectMongodb } = require("./mongodb");
const redis = require("./redis");
const { mailgun } = require("./mailgun");
const { s3Client, Bucket } = require("./aws");

// combined export
module.exports = { connectMongodb, redis, mailgun, s3Client, Bucket };
