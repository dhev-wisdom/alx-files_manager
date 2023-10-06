const redis = require('redis');

class RedisClient {
  constructor() {
    this.client = redis.createClient();

    this.client.on('error', (error) => {
      console.log("Error in connection: ", error);
    });
    this.client.on('connect', () => {
      console.log('Connected to redis server');
    });
  }

  isAlive() {
    return this.client.connected;
  }

  async get(key) {
    return new Promise((resolve, reject) => {
      this.client.get(key, (err, reply) => {
        if (err) {
          console.error(err);
          reject(err);
        } else {
          resolve(reply);
        }
      });
    });
  }

  async set(key, value, duration) {
    return new Promise((resolve, reject) => {
      this.client.set(key, value, 'EX', duration, (err, reply) => {
        if (err) {
          console.error(err);
          reject(err);
	      } else {
          resolve(reply);
	      }
      });
    });
  }

  async del(key) {
    return new Promise((resolve, reject) => {
      this.client.del(key, (err, reply) => {
        if (err) {
          console.error(err);
          reject(err);
	      } else {
          resolve(reply);
	      }
      });
    });
  }
  
}

const redisClient = new RedisClient();

module.exports = redisClient;
