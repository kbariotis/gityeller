const config = require('config');
const MongoDB = require('mongodb');
const MongoClient = require('mongodb').MongoClient;
const logger = require('winston');

const mongo = {
  ObjectID: MongoDB.ObjectID
};

MongoClient.connect(config.get('mongo.uri'))
  .then((db) => {
    mongo.database = db;
  })
  .catch((err) => logger.error(err));

module.exports = mongo;
