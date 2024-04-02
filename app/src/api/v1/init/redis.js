// pre-defined module
const { promisify } = require("util");
const redis = require("redis");
const { env } = require("../../../config");

// custom module
const {
  redisPort: port,
  redisHost: host,
  redisUrl,
} = require("../../../config");

const config = { legacyMode: true };

if (env === "local") {
  config.port = port;
  config.host = host;
} else {
  config.url = redisUrl;
}

const client = redis.createClient(config);

(async () => {
  await client.connect();
})();

client.on("connect", () => {
  console.log("Client connected to redis");
});

client.on("ready", () => {
  console.log("Redis client ready to use");
});

client.on("error", (err) => {
  console.log(err.message);
});

client.on("end", () => {
  console.log("Client disconnected from redis");
});

process.on("SIGINT", async () => {
  await client.disconnect();
});

const getRedis = promisify(client.get).bind(client);
const setRedis = promisify(client.set).bind(client);
const deleteRedis = promisify(client.del).bind(client);

module.exports = { client, getRedis, setRedis, deleteRedis };
