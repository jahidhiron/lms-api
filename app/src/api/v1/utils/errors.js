class GeneralError extends Error {
  constructor(message) {
    super();
    this.message = message;
    this.status = "failed";
  }

  getCode() {
    return 400;
  }
}

class BadRequest extends GeneralError {
  constructor(message = "Bad request") {
    super(message);
    this.name = "BadRequest";
  }
  getCode() {
    return 400;
  }
}

class Unauthorized extends GeneralError {
  constructor(message = "Unauthorized") {
    super(message);
    this.name = "Unauthorized";
  }
  getCode() {
    return 401;
  }
}

class Forbidden extends GeneralError {
  constructor(message = "Forbidden") {
    super(message);
    this.name = "Forbidden";
  }
  getCode() {
    return 403;
  }
}

class NotFound extends GeneralError {
  constructor(message = "Not found") {
    super(message);
    this.name = "NotFound";
  }

  getCode() {
    return 404;
  }
}

class InternalServerError extends GeneralError {
  constructor(message = "Internal server error") {
    super(message);
    this.name = "InternalServerError";
  }

  getCode() {
    return 500;
  }
}

module.exports = {
  GeneralError,
  BadRequest,
  Unauthorized,
  Forbidden,
  NotFound,
  InternalServerError,
};
