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
const run = (cursor, worker) => {
  if (cursor.isClosed()) {
    cursor.rewind();
  }

  return cursor
    .next()
    .then(subscription => {
      if (!subscription) {
        throw new Error('Cursor got to the end');
      } else {
        return subscription;
      }
    })
    .then(subscription => worker.run(subscription))
    .catch((error) => logger.error(error))
    .then(() => setTimeout(() => run(cursor, worker), 0));
};

/**
 * Wait for the DB connection and run the iteration
 */
MongoClient.connect(config.get('mongo.uri'))
  .then(db => {
    const mailer = createMailer(mailgun);
    const worker = createWorker(github, db, mailer);

    const collection = db.collection('subscriptions');
    const cursor = collection.find({}).batchSize(1);

    return run(cursor, worker);
  })
  .catch(err => logger.error('error', err));
