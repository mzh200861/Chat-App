const redis = require('redis');
//const redisClient = redis.createClient();
let redisClient;
(async () => {
  redisClient = redis.createClient();

  redisClient.on('error', (err) => console.log('Redis Client Error', err));

  await redisClient.connect();
})();
module.exports = redisClient;