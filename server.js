const path = require('path');
const express = require('express');
const webpack = require('webpack');
const webpackMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');
const config = require('./webpack.config.js');
const MongoClient = require('mongodb').MongoClient;
const logger = require('winston');
const jsconfig = require('config');
const GitHubApi = require('github');
const bodyParser = require('body-parser')

let database = null;

MongoClient.connect(jsconfig.get('mongo.uri'))
  .then((db) => database = db)
  .catch((err) => logger.error(err))

const github = new GitHubApi({
  debug: jsconfig.get('github.debug'),
  protocol: 'https'
});

github.authenticate({
  type: 'oauth',
  token: jsconfig.get('github.token')
});

const isDeveloping = process.env.NODE_ENV !== 'production';
const port = isDeveloping ? 3000 : process.env.PORT;
const app = express();

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.get('/repo/:owner/:repo/labels', function (req, res, next) {

  github.issues.getLabels({
    repo: req.params.repo,
    owner: req.params.owner
  })
  .then((response) => res.json(response))
  .catch((err) => next(err));
});

app.post('/subscriptions', function (req, res, next) {

  database
    .collection('subscriptions')
    .insert({
      email: req.body.email,
      repo: req.body.repo,
      since: new Date().toISOString(),
      etag: null,
      label: req.body.label
    })
    .then(() => res.json({ok: true}))
    .catch((err) => next(err));
});

if (isDeveloping) {
  const compiler = webpack(config);
  const middleware = webpackMiddleware(compiler, {
    publicPath: config.output.publicPath,
    contentBase: 'src',
    stats: {
      colors: true,
      hash: false,
      timings: true,
      chunks: false,
      chunkModules: false,
      modules: false
    }
  });

  app.use(middleware);
  app.use(webpackHotMiddleware(compiler));
  app.get('*', function response(req, res) {
    res.write(middleware.fileSystem.readFileSync(path.join(__dirname, 'dist/index.html')));
    res.end();
  });
} else {
  app.use(express.static(__dirname + '/dist'));
  app.get('*', function response(req, res) {
    res.sendFile(path.join(__dirname, 'dist/index.html'));
  });
}

app.listen(port, '0.0.0.0', function onStart(err) {
  if (err) {
    logger.error(err);
  }
  logger.info('==> 🌎 Listening on port %s. Open up http://0.0.0.0:%s/ in your browser.', port, port);
});
