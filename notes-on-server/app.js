const express = require('express');
const app = express();
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');

const socket = require("socket.io");
const server = require("http").createServer(app);
const io = socket(server, {
  cors: {
    origin: 'http://localhost:4200',
  }
});
const onConnection = require('./socket');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const workspacesRouter = require('./routes/workspaces');
const pagesRouter = require('./routes/pages');
const blocksRouter = require('./routes/blocks');

// view engine setup
app.use(cors());
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.set('socketio', io);
io.on("connection", onConnection)

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use('/static',express.static(path.join(__dirname, 'public')));


app.use('/workspaces/:workspaceId/pages/:pageId/blocks', function (req, res, next) {
  blocksRouter.params = { workspaceId: req.params.workspaceId, pageId: req.params.pageId };
  blocksRouter(req, res, next);
});

app.use('/workspaces/:workspaceId/pages', function (req, res, next) {
  pagesRouter.params = { workspaceId: req.params.workspaceId };
  pagesRouter(req, res, next);
});

app.use('/workspaces', workspacesRouter);
app.use('/users', usersRouter);
app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  res.status(404).json({
    message: `Error 404: Page Not Found.`
  });
});

module.exports = {app: app, server:server};
