/* global: Promise */

const config = require('config');
const logger = require('winston');
const MongoDB = require('mongodb');

class Worker {
  constructor(github, database, mailer) {

    this.githubIssuesApi = github.issues;
    this.subscriptionsCollection = database.collection('subscriptions');
    this.deliveriesCollection = database.collection('deliveries');
    this.mailer = mailer;
  }

  run(subscription) {
    return this.editItem(subscription)
      .then((response) => this.processGithubResponse(subscription, response))
      .catch((err) => logger.error(err))
  }

  /**
  * Every subscription in the database goes through
  * this function. Checks against GH for new
  * issues
  */
  editItem(subscription) {
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

    return this.githubIssuesApi.getForRepo(options);
  }

  /**
   * Remove those from issues that exists in sent
   */
  filterIssues(issues, sent) {
    return issues.filter(issue => sent.map(item => item.issue_number).indexOf(issue.number) === -1);
  }

  /**
   * Process GH response. Update DB
   * accordingly and send new mails
   */
  processGithubResponse(subscription, response) {
    return new Promise((resolve, reject) => {
      logger.debug(response);

      const subscriptionId = new MongoDB.ObjectID(subscription._id);
      const responseStatus = response.meta.status;
      const responseLength = response.length;
      const responseETag = response.meta.etag;
      const issues = response;
      const updateSubscriptionPayload = {
        'etag': responseETag
      };

      if (responseLength) {
        const d = new Date(issues[0].created_at); // most recent item first
        d.setSeconds(d.getSeconds() + 1);
        updateSubscriptionPayload.since = d.toISOString();
      } else {
        return setTimeout(resolve, 3000);
      }

      return this.subscriptionsCollection.update({
        _id: subscriptionId
      }, {
        $set: updateSubscriptionPayload
      })
      .then(() => this.deliveriesCollection.find({
        subscription_id: subscriptionId,
        issue_number: {
          $in: issues.map(issue => issue.number)
        }
      }).toArray())
      .then(results => this.filterIssues(issues, results))
      .then(filteredIssues => this.mailer.sendEmail(subscription, filteredIssues))
      .then(body => issues.forEach(issue => this.deliveriesCollection.insert({
        subscription_id: subscriptionId,
        issue_number:  issue.number,
        message_id: body.id
      })))
      .catch(error => logger.error(error))
      .then(() => setTimeout(resolve, 3000));
    });
  }
}

module.exports = (github, database, mailer) => new Worker(github, database, mailer);