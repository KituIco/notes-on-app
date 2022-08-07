var express = require('express');
var router = express.Router();
const multer = require("multer");

const mysql = require('mysql');
const shortid = require('shortid');
const Redis = require('ioredis');

const redis = new Redis({port: 6379, host: 'redis'})
const notesdb = require('../repositories/db.config.js')(mysql);

const userRepo = require('../repositories/user.repository.js')(notesdb);
const spaceRepo = require('../repositories/workspace.repository.js')(notesdb);
const pageRepo = require('../repositories/page.repository.js')(notesdb);
const blockRepo = require('../repositories/block.repository.js')(notesdb, redis);

const pageService = require('../services/page.service.js')(spaceRepo, pageRepo, blockRepo, redis);
const workspaceService = require('../services/workspace.service.js')(userRepo, spaceRepo, pageRepo, blockRepo);
const controller = require('../controllers/page.controller')(pageService, workspaceService, shortid);

/* GET home page. */
router.get('/pages/:pageId', controller.getPublicPage.bind(controller, router));

router.get('/', function (req, res) {
    res.status(200).json({
        message: `Welcome to NotesOn WebApp`
    });
});

module.exports = router;
