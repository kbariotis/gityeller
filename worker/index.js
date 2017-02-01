/* global: Promise */
const MongoDB = require('mongodb');
const MongoClient = MongoDB.MongoClient;
const GitHubApi = require('github');
const config = require('config');
const logger = require('winston');
const createMailer = require('../shared/mailer');
const createWorker = require('./worker');

/**
 * Mailgun initialization
 */
const mailgun = require('mailgun-js')({
  apiKey: config.get('mailgun.token'),
  domain: config.get('mailgun.domain')
});

/**
 * Github initialization
 */
const github = new GitHubApi({
  debug: config.get('github.debug'),
  protocol: 'https'
});

github.authenticate({
  type: 'oauth',
  token: config.get('github.token')
});

/**
 * Main run function that handles the infinite
 * loop over the database
 */
const run = (db, worker) => {
  const collection = db.collection('subscriptions');
  const cursor = collection.find({});

  function processItem(subscription) {
    if (subscription === null) {
      logger.info('End of cursor');
      return run(db, worker);
    }

    logger.info(`Checking ${subscription.email} - ${subscription.repo} - ${subscription.label}`);

    return worker.run(subscription)
      .then(() => cursor.nextObject())
      .then(i => processItem(i));
  }

  return cursor
    .nextObject()
    .then(subscription => processItem(subscription))
    .catch((error) => logger.error(error))
    .catch(() => run(db, worker));
};

/**
 * Wait for the DB connection and run the iteration
 */
MongoClient.connect(config.get('mongo.uri'))
  .then(db => {
    const mailer = createMailer(mailgun);
    const worker = createWorker(github, db, mailer);

    return run(db, worker);
  })
  .catch(err => logger.error('error', err));
