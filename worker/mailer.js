/* global: Promise */

const config = require('config');
const logger = require('winston');

class Mailer {
  constructor(mailgun) {
    this.mailgun = mailgun;
  }

  sendEmail(subscription, issues) {
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
    `};

    return this.mailgun.messages().send(data);
  }
}

module.exports = (mailgun) => new Mailer(mailgun);
