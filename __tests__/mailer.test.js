const createMailer = require('../shared/mailer');
const githubFixture = require('../fixtures/github.response');

let response = {};

beforeEach(() => {
  const sendFn = jest.fn();
  const mailgunMock = {messages: jest.fn(() => ({send: sendFn}))};
  const mailer = createMailer(mailgunMock);

  mailer.sendEmail({
    email: 'konmpar@gmail.com',
    repo: 'throw.js',
    owner: 'kbariotis',
    label: 'Need help',
    _id: 'SOME+ID'
  }, githubFixture);

  response = sendFn.mock.calls[0][0];
});

test('SendEmail', () => expect(response).toMatchSnapshot());
