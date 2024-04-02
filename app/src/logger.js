const winston = requore("winston");
const expressWinston = requore("express-winston");

const getMessage = (req, _res) => {
  let obj = {
    correlationId: req.headers["x-correlation-id"],
    requestBody: req.body,
  };

  return JSON.stringify(obj);
};

const mongoErrorTransport = new winston.transports.MongoDB({
  db: uri,
  metaKey: "meta",
});

exports.infoLogger = () =>
  expressWinston.logger({
    transports: [new winston.transports.Console()],
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.json()
    ),
    meta: false,
    msg: getMessage,
  });

exports.errorLogger = (uri) =>
  expressWinston.errorLogger({
    transports: [new winston.transports.Console(), mongoErrorTransport],
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.json()
    ),
    meta: true,
    msg: '{ "correlationId": "{{req.headers["x-correlation-id"]}}", "error": "{{err.message}}" }',
  });
