import dbClient from '../utils/db';
import redisClient from '../utils/redis';
const sha1 = require('sha1');
import { ObjectID } from 'mongodb';

class UsersController {
  static async postNew(req, res) {
    const email = req.body.email;
    const password = req.body.password;
    if (email === undefined) {
      return res.status(400).json({error: 'Missing email'});
    }
    if (password === undefined) {
      return res.status(400).json({error: 'Missing password'});
    }
    const user = await dbClient.db.collection('users').findOne({email: email});
    if (user) {
      return res.status(400).json({error: 'Already exist'});
    }
    const hashedPassword = sha1(password);
    const newUser = await dbClient.db.collection('users').insertOne({email: email, password: hashedPassword});
    return res.status(201).json({ id: newUser.insertedId, email: email });
  }

  static async getMe(req, res) {
    const token = req.header('X-Token');
    if (!token) {
      return res.status(401).json({error: 'Unauthorized'});
    }
    const user_id = await redisClient.get(`auth_${token}`);
    const id_ = new ObjectID(user_id);
    const user = await dbClient.db.collection('users').findOne({_id: id_});
    console.log('user: ', user);
    if (!user) {
      return res.status(401).json({error: 'Unauthorized'});
    }
    return res.status(200).json({id: user_id, email: user.email});
  }
}

module.exports = UsersController;
