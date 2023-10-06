const express = require('express');

const router = express.Router();

const AppController = require('../controllers/AppController');

const AuthController = require('../controllers/AuthController');

const UsersController = require('../controllers/UsersController');

const FilesController = require('../controllers/FilesController');

router.get('/status', AppController.getStatus);

router.get('/stats', AppController.getStats);

router.post('/users', UsersController.postNew);

router.get('/connect', AuthController.getConnect);

router.get('/disconnect', AuthController.getDisconnect);

router.get('/users/me', UsersController.getMe);

router.post('/files', FilesController.postUpload);

router.get('/files', FilesController.getIndex);

router.get('/files/:id', FilesController.getShow);

module.exports = router;
