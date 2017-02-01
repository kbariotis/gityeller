const express = require('express');
const router = express.Router();
const logger = require('winston');
const config = require('config');
const GitHubApi = require('github');
const throwjs = require('throw.js');
const Joi = require('joi');
const mongo = require('../services/mongo');

const subscriptionSchema = Joi.object().keys({
  label: Joi.string().required(),
  repo: Joi.string().required(),
  email: Joi.string().email().required()
});

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
    owner: req.params.owner,
    per_page: 100
  })
  .then((response) => res.json(response))
  .catch((err) => next(err));
});

router.post('/subscriptions', (req, res, next) => {
  logger.info(`Creating subscription for ${req.body.email}`);

  const result = Joi.validate(req.body, subscriptionSchema);
  const collection = mongo.database.collection('subscriptions');

  if (result.error) {
    next(new throwjs.BadRequest('Validation error'));
  } else {
    collection.findOne({
      email: result.value.email,
      repo: result.value.repo,
      label: result.value.label
    })
    .then((model) => {
      if (model) {
        return true;
      }

      return collection.insert({
        email: result.value.email,
        repo: result.value.repo,
        since: new Date().toISOString(),
        etag: null,
        label: result.value.label,
        is_enabled: false
      });
    })
    .then(() => res.json({ok: true}))
    .catch(() => next(new throwjs.BadRequest('Database error')));
  }
});

router.get('/unsubscribe/:id', (req, res, next) => {
  logger.info(`Canceling subscription for ${req.params.id}`);

  mongo.database
  .collection('subscriptions')
  .findOneAndDelete({
    _id: new mongo.ObjectID(req.params.id)
  })
  .then(() => res.json({ok: true, message: 'You have been unsubscribed.'}))
  .catch(() => next(new throwjs.BadRequest('Database error')));
});

router.get('/verify/:id', (req, res, next) => {
  logger.info(`Verifying subscription for ${req.params.id}`);

  mongo.database
  .collection('subscriptions')
  .findOneAndUpdate({
    _id: new mongo.ObjectID(req.params.id)
  }, {
    $set: {
      is_enabled: true
    }
  })
  .then(() => res.json({ok: true, message: 'You are now verified.'}))
  .catch(() => next(new throwjs.BadRequest('Database error')));
});

router.use((err, req, res, next) => {
  logger.error(err);

  if (req.app.get('env') !== 'development' && req.app.get('env') !== 'test') {
    delete err.stack;
  }

  res.status(err.statusCode || 500).json(err);
});

module.exports = router;
