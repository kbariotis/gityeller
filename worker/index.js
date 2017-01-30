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

const githubIssuesApi = github.issues;
/**
 * Main run function that handles the infinite
 * loop over the database
 */
const run = db => {
  const collection = db.collection('subscriptions');
  const cursor = collection.find({});

  function processItem(subscription) {

    if (subscription === null) {
      logger.info('End of cursor');
      return run(db);
    } else {
      logger.info(`Checking ${subscription.email} - ${subscription.repo} - ${subscription.label}`);
    }

    return editItem(subscription)
      .then(() => cursor.nextObject())
      .then(i => processItem(i));
  }

  return cursor
    .nextObject()
    .then(subscription => processItem(subscription))
    .catch(() => run(db));
};

/**
 * Every subscription in the database goes through
 * this function. Checks against GH for new
 * issues
 */
const editItem = subscription => {
  const [owner, repo] = subscription.repo.split('/');

  const headers = {};
  if (subscription.etag) {
    headers['If-None-Match'] = subscription.etag;
  }

  const options = {
    headers: headers,
    owner: owner,
    repo: repo,
    labels: subscription.label,
    direction: 'desc'
  };

  if (subscription.since) {
    options.since = subscription.since;
  }
  return githubIssuesApi.getForRepo(options)
    .then((response) => processGithubResponse(subscription, response))
    .catch((err) => logger.error(err))
}

/**
 * Process GH response. Update DB
 * accordingly and send new mails
 */
const processGithubResponse = (subscription, response) => {
  return new Promise((resolve, reject) => {
    logger.debug(response);

    const subscriptionsCollection = database.collection('subscriptions');
    const deliveriesCollection = database.collection('subscriptions');
    const subscriptionId = new MongoDB.ObjectID(subscription._id);

    if (response.meta.status !== '304 Not Modified') {
      if (response.length) {
        let issues = respose;
        const d = new Date(issues.created_at); // most recent item first
        d.setSeconds(d.getSeconds() + 1);

        subscriptionsCollection.update({
          _id: subscriptionId
        }, {
          $set: {
            'since': d.toISOString()
          }
        });

        deliveriesCollection.find({
          subscription_id: subscriptionId,
          issue_number: {
            $in: issues.map(issue => issue.number)
          }
        })
          .then(results => {

            if (results.length) {
              issues = issues.filter(issue => results.map(item => item.issue_number).indexOf(issue.number) > -1);
            }

            return sendEmail(subscription, issues)
          })
          .then(() => issues.forEach(issue => logger.info(`Send email for issue: ${issue.number} - Success!`)))
          .then(body => issues.forEach(issue => deliveriesCollection.insert({
            subscription_id: subscriptionId,
            issue_number:  issue.number,
            message_id: body.id
          }))
          .catch(error => logger.error(error))
          .catch(() => issues.forEach(issue => logger.info(`Send email for issue: ${issue.number} - Error!`)));
      }
    }

    subscriptionsCollection.update({
      _id: subscriptionId
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
