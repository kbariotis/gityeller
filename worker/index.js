/* global: Promise */
const MongoDB = require('mongodb');
const MongoClient = MongoDB.MongoClient;
const GitHubApi = require('github');
const config = require('config');
const logger = require('winston');
let database = null;

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
const run = db => {
  const collection = db.collection('subscriptions');
  const cursor = collection.find({});

  function processItem(item) {

    if (item === null) {
      logger.info('End of cursor');
      return run(db);
    } else {
      logger.info(`Checking ${item.email} - ${item.repo} - ${item.label}`);
    }

    return editItem(item)
      .then(() => cursor.nextObject())
      .then(i => processItem(i));
  }

  return cursor
    .nextObject()
    .then(item => processItem(item))
    .catch(() => run(db));
};

/**
 * Every item in the database goes through
 * this function. Checks against GH for new
 * issues
 */
const editItem = item => {
  const [owner, repo] = item.repo.split('/');

  const headers = {};
  if (item.etag) {
    headers['If-None-Match'] = item.etag;
  }

  const options = {
    headers: headers,
    owner: owner,
    repo: repo,
    labels: item.label,
    direction: 'desc'
  };

  if (item.since) {
    options.since = item.since;
  }
  return github.issues.getForRepo(options)
    .then((response) => processGithubResponse(item, response))
    .catch((err) => logger.error(err))
}

/**
 * Process GH response. Update DB
 * accordingly and send new mails
 */
const processGithubResponse = (item, response) => {
  return new Promise((resolve, reject) => {
    logger.debug(response);

    const collection = database.collection('subscriptions');

    if (response.meta.status !== '304 Not Modified') {
      if (response.length) {
        const d = new Date(response[0].created_at);
        d.setSeconds(d.getSeconds() + 1);

        collection.update({
          _id: new MongoDB.ObjectID(item._id)
        }, {
          $set: {
            'since': d.toISOString()
          }
        });

        const issues = response.filter((item) => new Date(item.created_at) < d);

        sendEmail(item, issues)
          .then((error) => issues.forEach((issue) => logger.info(`Send email for issue: ${issue.number} - Success!`)))
          .catch(() => issues.forEach((issue) => logger.info(`Send email for issue: ${issue.number} - Error!`)))
          .catch((error) => logger.error(error));
      }
    }

    collection.update({
      _id: new MongoDB.ObjectID(item._id)
    }, {
      $set: {
        'etag': response.meta.etag
      }
    });

    setTimeout(resolve, 3000);
  });
}

/**
 * Send email
 */
const sendEmail = (subscription, issues) => {
  issues.forEach((issue) => logger.info(`Send email for issue: ${issue.number}`));

  const data = {
    'o:testmode': config.get('mailgun.testmode'),
    from: 'no-reply@gityeller.com',
    to: subscription.email,
    subject: 'Hey! I\'ve found a new issue',
    html: `
Hello there!<br/><br/>
I've found a new issue with label "${subscription.label}" from
the ${subscription.repo} repository.<br/><br/>

${issues.map(issue => `<a href="${issue.html_url}">${issue.title}</a><br/>`)}
<br/>
Cheers!<br/>

GitYeller

<hr>
<small>Unsubscribe from future emails like this, <a href="https://gityeller.com/api/unsubscribe/${subscription._id}">here</a>.</small>
    `
  };

  return mailgun.messages().send(data);
};

/**
 * Wait for the DB connection and run the iteration
 */
MongoClient.connect(config.get('mongo.uri'))
  .then(db => {
    database = db;

    return run(db);
  })
  .catch(err => logger.error('error', err));
