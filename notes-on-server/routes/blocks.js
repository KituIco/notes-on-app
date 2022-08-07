var express = require('express');
var router = express.Router();
const jwt = require('jsonwebtoken');
const multer = require("multer");

const shortid = require('shortid');
const mysql = require('mysql');
const Redis = require('ioredis');

const redis = new Redis({port: 6379, host: 'redis'})
const authenticate = require('../middleware/auth')(jwt);
const storage = require('../middleware/storage')(multer);
const notesdb = require('../repositories/db.config.js')(mysql);

const spaceRepo = require('../repositories/workspace.repository.js')(notesdb);
const pageRepo = require('../repositories/page.repository.js')(notesdb);
const blockRepo = require('../repositories/block.repository.js')(notesdb, redis);

const blockService = require('../services/block.service.js')(pageRepo, blockRepo);
const pageService = require('../services/page.service.js')(spaceRepo, pageRepo, blockRepo, redis);
const controller = require('../controllers/block.controller')(pageService, blockService, shortid);


/* Block Operations. */
router.patch('/:blockId', authenticate.auth, storage.imgStore, controller.patchBlock.bind(controller, router));
router.delete('/:blockId', authenticate.auth, controller.deleteBlock.bind(controller, router));
router.get('/:blockId', authenticate.auth, controller.getBlock.bind(controller, router));

router.patch('/', authenticate.auth, controller.patchBlockOrder.bind(controller, router));
router.post('/', authenticate.auth, controller.postBlock.bind(controller, router));
router.get('/', authenticate.auth, controller.getBlocks.bind(controller, router));

module.exports = router;