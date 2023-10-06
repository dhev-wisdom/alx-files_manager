import dbClient from '../utils/db';
import redisClient from '../utils/redis';
import { ObjectID } from 'mongodb';
const { v4: uuidv4 } = require('uuid');
import { promises as fs } from 'fs';
import Queue from 'bull/lib/queue';

const queue = new Queue('fileQueue', 'redis://127.0.0.1:6379');

class FilesController {
  static async postUpload(req, res) {
    const token = req.header('X-Token');
    if (!token) return res.status(401).json({error: 'Unauthorized'});
    const user_id = await redisClient.get(`auth_${token}`);
    const user_id_ = new ObjectID(user_id);
    const user = await dbClient.db.collection('users').findOne({_id: user_id_});
    if (!user) return res.status(400).json({error: 'Unauthorized'});
    const { name, type, data, parentId, isPublic } = req.body;

    if (!name) return res.status(400).json({error: 'Mising name'});
    if (!type) return res.status(400).json({error: 'Missing type'});
    if (type !== 'folder' && type !== 'file' && type !== 'image') {
      return res.status(400).json({error: 'Missing type'});
    }
    if (type !== 'folder' && !data) {
      return res.status(400).json({error: 'Missing data'});
    }
    const files = await dbClient.db.collection('files');
    if (parentId) {
      const parentId_ = new ObjectID(parentId);
      const file = await files.findOne({id_: parentId_});
      if (!file) return res.status(400).json({error: 'Parent not found'});
      if (file.type !== 'folder') {
        return res.status(400).json(({error: 'Parent is not a folder'}));
      }
    }
    if (type === 'folder') {
    files.insertOne({
        userId: user._id,
        name: name,
        type: type,
        isPublic: isPublic || false,
        parentId: parentId || 0,
    })
        .then((result) => {
        return res.status(201).json({
            id: result.insertedId,
            userId: user._id,
            name,
            type,
            isPublic: isPublic || false,
            parentId: parentId || 0,
        })
        })
        .catch((err) => {
        console.log('Unexpected error occured: ', err);
        });
    } else {
        const filePath = process.env.FOLDER_PATH || '/tmp/files_manager';
        const folderPath = `${filePath}/${uuidv4()}`;
        const file = Buffer.from(data, 'base64');

        try {
        try {
            await fs.mkdir(folderPath);
        } catch(err) {
            console.log('Error encountered while creating file path in disk: ', err);
        }
        await fs.writeFile(folderPath, file, 'utf-8');
        } catch(err) {
        console.log('Error encountered while writing file to file path: ', err);
        }

        files.insertOne({
        userId: user._id,
        name,
        type,
        isPublic: isPublic || false,
        parentId : parentId || 0,
        localPath: folderPath,
        })
        .then((result) => {
            res.status(201).json({
            id: result.insertedId,
            userId: user._id,
            name,
            type,
            isPublic: isPublic || false,
            parentId: parentId || 0,
            });
            if (type === 'image') {
              queue.add({
                userId: user._id,
                fileId: result.insertedId,
              });
            }
        })
        .catch((err) => {
            console.log(err);
        });
    }
  }
}

module.exports = FilesController;