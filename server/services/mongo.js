const config = require('config');
const GitHubApi = require('github');
const MongoDB = require('mongodb');
const MongoClient = require('mongodb').MongoClient;

const mongo = {
    ObjectID: MongoDB.ObjectID
};

let database = null;

MongoClient.connect(config.get('mongo.uri'))
  .then((db) => {
    mongo.database = db;
  })
  .catch((err) => logger.error(err));

module.exports = mongo;
