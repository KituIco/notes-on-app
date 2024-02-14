var express = require('express');
var router = express.Router();
const jwt = require('jsonwebtoken');
const multer = require("multer");

const mysql = require('mysql');
const shortid = require('shortid');
const bcrypt = require('bcryptjs');
const Redis = require('ioredis');


const redis = new Redis({port: 6379, host: 'redis'})
const authenticate = require('../middleware/auth')(jwt);
const storage = require('../middleware/storage')(multer);
const notesdb = require('../repositories/db.config.js')(mysql);

const spaceRepo = require('../repositories/workspace.repository.js')(notesdb);
const userRepo = require('../repositories/user.repository.js')(notesdb);
const pageRepo = require('../repositories/page.repository.js')(notesdb);
const blockRepo = require('../repositories/block.repository.js')(notesdb, redis);

const userService = require('../services/user.service.js')(userRepo, spaceRepo, bcrypt, jwt);
const workspaceService = require('../services/workspace.service.js')(userRepo, spaceRepo, pageRepo, blockRepo);
const controller = require('../controllers/user.controller')(userService, shortid);
const workspaceController = require('../controllers/workspace.controller')(userService, workspaceService, shortid);

/* User Operations on Workspace */
router.patch('/:userId/workspaces', authenticate.auth, workspaceController.patchSpaceOrder);
router.post('/:userId/workspaces', authenticate.auth, workspaceController.postWorkspace);
router.get('/:userId/workspaces', authenticate.auth, controller.getUserSpaces);
router.post('/login', controller.getUserLogin);

/* User Operations */
router.patch('/:userId', authenticate.auth, storage.imgStore, controller.patchUser);
router.get('/:userId', authenticate.auth, controller.getUser);
router.get('/', authenticate.auth, controller.getUsers);
router.post('/', controller.postUser);

//router.delete('/:userId', controller.deleteUser);

module.exports = router;
