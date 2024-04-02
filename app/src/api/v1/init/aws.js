// third-party module
const { S3Client } = require("@aws-sdk/client-s3");

// custom module
const {
  awsRegion,
  awsAccessKeyId,
  awsSecretKey,
  awsS3BucketName,
} = require("../../../config");

const s3Client = new S3Client({
  region: awsRegion,
  credentials: {
    accessKeyId: awsAccessKeyId,
    secretAccessKey: awsSecretKey,
  },
});

module.exports = { s3Client, Bucket: awsS3BucketName };
