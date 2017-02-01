/* global: Promise */

const config = require('config');
const logger = require('winston');

class Mailer {
  constructor(mailgun) {
    this.mailgun = mailgun;
  }

  sendVerificationEmail(subscription) {
    logger.info(`Send verification email for: ${subscription.email}`);

    const data = {
      'o:testmode': config.get('mailgun.testmode'),
      from: 'no-reply@gityeller.com',
      to: subscription.email,
      subject: 'Hey! It\s great having you!',
      html: `
Hello there!<br/><br/>
It looks like you want me to watch ${subscription.repo} repository for the "${subscription.label}" label. No problem!<br/><br/>

But first, please verify your email <a href="https://gityeller.com/api/verify/${subscription._id}">by clicking this link</a>.

Cheers!<br/><br/>

GitYeller
    `};

    return this.mailgun.messages().send(data);
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
Cheers!<br/><br/>

GitYeller

<hr>
<small>Unsubscribe from future emails like this, <a href="https://gityeller.com/api/unsubscribe/${subscription._id}">here</a>.</small>
    `};

    return this.mailgun.messages().send(data);
  }
}

module.exports = (mailgun) => new Mailer(mailgun);
