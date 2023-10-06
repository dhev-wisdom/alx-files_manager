import dbClient from '../utils/db';
import redisClient from '../utils/redis';
const sha1 = require('sha1');
const { v4: uuidv4 } = require('uuid');

class AuthController {
  static async getConnect(req, res) {
    const authHeader = req.headers.authorization;

    if (authHeader === null) {
      return res.status(401).json({error: 'Unauthorized'});
    }

    const b64code = authHeader.split(' ')[1];
    console.log('b64code: ', b64code);
    const credentials = Buffer.from(b64code, 'base64').toString('utf-8');
    const email = credentials.split(':')[0];
    const password = credentials.split(':')[1];
    console.log('email and password: ', email, password);
    const hashedPassword = sha1(password);
    console.log('hashPassword: ', hashedPassword);

    const user = await dbClient.db.collection('users').findOne({email:email});
    if (!user || user.password !== hashedPassword) {
        return res.status(401).json({error: 'Unauthorized'});
    }
    const token = uuidv4();
    const key = `auth_${token}`;
    const duration = 60 * 60 * 24;
    await redisClient.set(key, user._id, duration);
    return res.status(200).json({token: token});
  }

  static async getDisconnect(req, res) {
    const token = req.header('X-Token');
    if (!token) {
      return res.status(401).json({error: 'Unauthorized'});
    }
    const id_ = await redisClient.get(`auth_${token}`);
    if (id_) {
      await redisClient.del(`auth_${token}`);
      return res.status(204).json({});
    } else {
      return res.status(401).json({error: 'User is not connected'});
    }
  }
}

module.exports = AuthController;
