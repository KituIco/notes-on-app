var express = require('express');
var router = express.Router();
const jwt = require('jsonwebtoken');
const multer = require("multer");

const mysql = require('mysql');
const shortid = require('shortid');
const bcrypt = require('bcrypt');
const Redis = require('ioredis');

const redis = new Redis({port: 6379, host: 'redis'})
const authenticate = require('../middleware/auth')(jwt);
const storage = require('../middleware/storage')(multer);
const notesdb = require('../repositories/db.config.js')(mysql);

const userRepo = require('../repositories/user.repository.js')(notesdb);
const spaceRepo = require('../repositories/workspace.repository.js')(notesdb);
const pageRepo = require('../repositories/page.repository.js')(notesdb);
const blockRepo = require('../repositories/block.repository.js')(notesdb, redis);

const userService = require('../services/user.service.js')(userRepo, spaceRepo, bcrypt, jwt);
const workspaceService = require('../services/workspace.service.js')(userRepo, spaceRepo, pageRepo, blockRepo);
const controller = require('../controllers/workspace.controller')(userService, workspaceService, shortid);


/* Workspace Operations. */
router.patch('/:workspaceId', authenticate.auth, storage.imgStore, controller.patchWorkspace);
router.delete('/:workspaceId', authenticate.auth, controller.deleteWorkspace);
router.put('/:workspaceId', authenticate.auth, controller.patchWorkspace);
router.get('/:workspaceId', authenticate.auth, controller.getWorkspace);

router.post('/', authenticate.auth, controller.postWorkspace);
router.get('/', authenticate.auth, controller.getWorkspaces);



module.exports = router;
