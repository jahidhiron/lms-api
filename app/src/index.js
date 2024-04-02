// core module
const http = require("http");

// custom module
const app = require("./app");
const { host, port, apiLocalOrigin } = require("./config");

// create server
const server = http.createServer(app);

// start server
server.listen(port, () => {
  console.log(`Server started on ${host}:${port}, url ${apiLocalOrigin}`);
});
