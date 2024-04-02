// core module
const express = require("express");
const path = require("path");

// third-party module
const cors = require("cors");
const csrf = require("csurf");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const { I18n } = require("i18n");
require("dotenv").config();

// custom module
const { clientLocalOrigin, clientCloudOrigin } = require("./config");
const {
  processRequest,
  handleError,
  notFound,
} = require("./api/v1/middlewares");
const { connectMongodb } = require("./api/v1/init");
const routes = require("./api/v1/routes");

// object scaffolding
const app = express();

// csrf
const csrfProtection = csrf({ cookie: true });

// connect database
connectMongodb();

// language
const i18n = new I18n({
  locales: ["en", "jp"],
  directory: path.join(__dirname, "./api/v1/translate"),
  defaultLocale: "en",
});

// third party middleware
app.use(
  cors({
    credentials: true,
    origin: [clientLocalOrigin, clientCloudOrigin],
  })
);
app.use(express.json({ limit: "500mb" }));
app.use(bodyParser.json({ limit: "500mb" }));
app.use(bodyParser.urlencoded({ limit: "500mb", extended: true }));
app.use(processRequest);
app.use(cookieParser());
app.use(i18n.init);
app.use(morgan("dev"));

// routing
routes.map(
  (route) =>
    routes &&
    routes.length > 0 &&
    app.use(`/api/v1/${route.path}`, route.module)
);

// handle error
app.use(handleError);

// not found error
app.use(notFound);

app.use(csrfProtection);

// csrf protection
app.get("/api/csrf-token", (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

module.exports = app;
