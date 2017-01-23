const express = require('express');
const router = express.Router();
const logger = require('winston');
const config = require('config');
const GitHubApi = require('github');
const MongoClient = require('mongodb').MongoClient;
const throwjs = require('throw.js');
const Joi = require('joi');

const subscriptionSchema = Joi.object().keys({
  label: Joi.string().required(),
  repo: Joi.string().required(),
  email: Joi.string().email().required()
});

let database = null;

MongoClient.connect(config.get('mongo.uri'))
  .then((db) => {
    database = db;
  })
  .catch((err) => logger.error(err));

const github = new GitHubApi({
  debug: config.get('github.debug'),
  protocol: 'https'
});

github.authenticate({
  type: 'oauth',
  token: config.get('github.token')
});

router.get('/repo/:owner/:repo/labels', (req, res, next) => {
  logger.info(`Fetching labels for ${req.params.owner}/${req.params.repo}`);

  github.issues.getLabels({
    repo: req.params.repo,
    owner: req.params.owner
  })
  .then((response) => res.json(response))
  .catch((err) => next(err));
});

router.post('/subscriptions', (req, res, next) => {
  logger.info(`Creating subscription for ${req.body.email}`);

  const result = Joi.validate(req.body, subscriptionSchema);

  if (result.error) {
    next(new throwjs.BadRequest('Validation error'));
  } else {
    database
    .collection('subscriptions')
    .insert({
      email: result.value.email,
      repo: result.value.repo,
      since: new Date().toISOString(),
      etag: null,
      label: result.value.label
    })
    .then(() => res.json({ok: true}))
    .catch(() => next(new throwjs.BadRequest('Database error')));
  }
});

router.use((err, req, res, next) => {
  logger.error(err);

  if (req.app.get('env') !== 'development' && req.app.get('env') !== 'test') {
    delete err.stack;
  }

  res.status(err.statusCode || 500).json(err);
});

module.exports = router;
