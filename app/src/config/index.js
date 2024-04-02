// custom module
const {
  NODE_ENV,
  HOST,
  PORT,
  MONGODB_CONNECTION_URL,
  BD_NAME,
  REDIS_PORT,
  REDIS_HOST,
  REDIS_URL,
  REDIS_BACKLIST_EXPIRED_IN,
  CACHING_TIME,
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_KEY,
  AWS_REGION,
  AWS_API_VERSION,
  AWS_S3_BUCKET_NAME,
  AWS_S3_BASE_URL,
  MAILGUN_DOMAIN,
  MAILGUN_API_KEY,
  MAIL_FROM,
  MINUTES_TO_EXPIRE,
  APP_NAME,
  APP_ADDRESS,
  PASSWORD_SALT,
  JWT_ACCESS_TOKEN_SECRET,
  JWT_REFRESH_TOKEN_SECRET,
  JWT_ACCESS_TOKEN_EXPIRED_IN,
  JWT_REFRESH_TOKEN_EXPIRED_IN,
  CLIENT_LOCAL_ORIGIN,
  CLIENT_CLOUD_ORIGIN,
  PAYPAL_CLIENT_ID,
  PAYPAL_APP_SECRET,
  PAYPAL_BASE_URL,
  API_LOCAL_ORIGIN,
  API_CLOUD_ORIGIN,
} = process.env;

// export environments
module.exports = {
  // general
  env: NODE_ENV,
  host: HOST,
  port: PORT,
  // db
  mongodbConnectionUrl: MONGODB_CONNECTION_URL,
  dbName: BD_NAME,
  // redis
  redisPort: REDIS_PORT,
  redisHost: REDIS_HOST,
  redisUrl: REDIS_URL,
  redisBacklistExpiredIn: REDIS_BACKLIST_EXPIRED_IN,
  cachingTime: CACHING_TIME,
  // aws
  awsAccessKeyId: AWS_ACCESS_KEY_ID,
  awsSecretKey: AWS_SECRET_KEY,
  awsRegion: AWS_REGION,
  awsApiVersion: AWS_API_VERSION,
  awsS3BucketName: AWS_S3_BUCKET_NAME,
  awsS3BaseUrl: AWS_S3_BASE_URL,
  // mailgun
  mailgunDomain: MAILGUN_DOMAIN,
  mailgunApiKey: MAILGUN_API_KEY,
  mailFrom: MAIL_FROM,

  // paypal
  paypalClientId: PAYPAL_CLIENT_ID,
  paypalAppSecret: PAYPAL_APP_SECRET,
  paypalBaseUrl: PAYPAL_BASE_URL,

  // app
  minutesToExpire: MINUTES_TO_EXPIRE,
  appName: APP_NAME,
  appAddress: APP_ADDRESS,
  passwordSalt: PASSWORD_SALT,
  jwtAccessTokenSecret: JWT_ACCESS_TOKEN_SECRET,
  jwtRefreshTokenSecret: JWT_REFRESH_TOKEN_SECRET,
  jwtAccessTokenExpiredIn: JWT_ACCESS_TOKEN_EXPIRED_IN,
  jwtRefreshTokenExpiredIn: JWT_REFRESH_TOKEN_EXPIRED_IN,
  clientLocalOrigin: CLIENT_LOCAL_ORIGIN,
  clientCloudOrigin: CLIENT_CLOUD_ORIGIN,
  apiLocalOrigin: API_LOCAL_ORIGIN,
  apiCloudOrigin: API_CLOUD_ORIGIN,
};
