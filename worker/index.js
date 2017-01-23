/* global: Promise */
const MongoClient = require('mongodb').MongoClient;
const GitHubApi = require('github');
const config = require('config');
const logger = require('winston');

const mailgun = require('mailgun-js')({
  apiKey: config.get('mailgun.token'),
  domain: config.get('mailgun.domain')
});

let database = null;

const github = new GitHubApi({
  debug: config.get('github.debug'),
  protocol: 'https'
});

github.authenticate({
  type: 'oauth',
  token: config.get('github.token')
});

const sendEmail = (subscription, issue) => {
  logger.info('Send email for issue:', issue.number);

  const data = {
    from: 'no-reply@gityeller.com',
    to: subscription.email,
    subject: 'Hey! I\'ve found a new issue',
    html: `
Hello there!<br/><br/>
I've found a new issue with label "${subscription.label}" from
the ${subscription.repo} repository.<br/><br/>

<a href="${issue.html_url}">${issue.title}</a><br/><br/>

Cheers!<br/>

GitYeller

<hr>
<small>Unsubscribe from future emails like this, <a href="https://gityeller.com/unsubscribe/${subscription._id}">here</a>.</small>
    `
  };

  mailgun.messages().send(data, (error) => {
    if (error) {
      logger.error(`Send email for issue: ${issue.number} - Error!`);
      logger.error(error);
    } else {
      logger.info(`Send email for issue: ${issue.number} - Success!`);
    }
  });
};

const editItem = item => {
  return new Promise((resolve, reject) => {
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
    github.issues.getForRepo(options, (err, res) => {
      if (err) {
        logger.error(err);
        reject(err);
      }

      logger.debug(res);

      if (res.meta.status !== '304 Not Modified') {
        if (res.length) {
          const d = new Date(res[0].created_at);
          d.setSeconds(d.getSeconds() + 1);

          database.collection('subscriptions').update({
            email: item.email,
            repo: item.repo
          }, {
            $set: {
              'since': d.toISOString()
            }
          });

          res.forEach(issue => sendEmail(item, issue));
        }

        database.collection('subscriptions').update({
          email: item.email,
          repo: item.repo
        }, {
          $set: {
            'etag': res.meta.etag
          }
        });
      }

      setTimeout(resolve, 5000);
    });
  });
};

const run = db => {
  const collection = db.collection('subscriptions');
  const cursor = collection.find({});

  function processItem(item) {
    if (item === null) {
      logger.info('End of cursor');
      return run(db);
    }

    return editItem(item)
      .then(() => cursor.nextObject())
      .then(i => processItem(i));
  }

  return cursor
    .nextObject()
    .then(item => processItem(item));
};

MongoClient.connect(config.get('mongo.uri'))
  .then(db => {
    database = db;

    return run(db);
  })
  .catch(err => logger.error('error', err));
