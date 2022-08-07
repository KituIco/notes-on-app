var express = require('express');
var router = express.Router();
const jwt = require('jsonwebtoken');
const multer = require("multer");

const mysql = require('mysql');
const shortid = require('shortid');
const Redis = require('ioredis');

const redis = new Redis({port: 6379, host: 'redis'})
const authenticate = require('../middleware/auth')(jwt);
const storage = require('../middleware/storage')(multer);
const notesdb = require('../repositories/db.config.js')(mysql);

const userRepo = require('../repositories/user.repository.js')(notesdb);
const spaceRepo = require('../repositories/workspace.repository.js')(notesdb);
const pageRepo = require('../repositories/page.repository.js')(notesdb);
const blockRepo = require('../repositories/block.repository.js')(notesdb, redis);

const pageService = require('../services/page.service.js')(spaceRepo, pageRepo, blockRepo, redis);
const workspaceService = require('../services/workspace.service.js')(userRepo, spaceRepo, pageRepo, blockRepo);
const controller = require('../controllers/page.controller')(pageService, workspaceService, shortid);


/* Page Operations. */
router.patch('/:pageId', authenticate.auth, storage.imgStore, controller.patchPage.bind(controller, router));
router.delete('/:pageId', authenticate.auth, controller.deletePage.bind(controller, router));
router.get('/:pageId', authenticate.auth, controller.getPage.bind(controller, router));

router.patch('/', authenticate.auth, controller.patchPageOrder.bind(controller, router));
router.post('/', authenticate.auth, controller.postPage.bind(controller, router));
router.get('/', authenticate.auth, controller.getPages.bind(controller, router));


module.exports = router;
