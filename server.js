'use strict';
require('dotenv').config();

const bodyParser = require('body-parser');
const express = require('express');
const morgan = require('morgan');
const passport = require('passport');

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const { DATABASE_URL, PORT } = require('./config');
const { Goal, Entry, Stat } = require('./models');
const { User } = require('./users')

const app = express();

const { router: goalsRouter } = require('./goals-router');
const { router: entriesRouter } = require('./entries-router');
const { router: statsRouter } = require('./stats-router');
const { router: usersRouter } = require('./users');
const { router: authRouter, localStrategy, jwtStrategy } = require('./auth');

app.use(morgan('common'));
app.use(bodyParser.json());


passport.use(localStrategy);
passport.use(jwtStrategy);

app.use('/goals', goalsRouter);
app.use('/entries/', entriesRouter);
app.use('/stats', statsRouter);
app.use('/api/users/', usersRouter);
app.use('/api/auth/', authRouter);

app.use(express.static("public"));

const jwtAuth = passport.authenticate('jwt', { session: false });


app.use('*', (req, res) => {
  return res.status(404).json({ message: 'Not Found' });
});

let server;

const config = require('./config');
console.log(config.JWT_EXPIRY);


function runServer(databaseUrl = DATABASE_URL, port = PORT) {
  return new Promise((resolve, reject) => {
    mongoose.connect(databaseUrl, err => {
      if (err) {
        return reject(err);
      }
      server = app.listen(port, () => {
        console.log(`Your app is listening on port ${port}`);
        resolve();
      })
        .on('error', err => {
          mongoose.disconnect();
          reject(err);
        });
    });
  });
}


function closeServer() {
  return mongoose.disconnect().then(() => {
    return new Promise((resolve, reject) => {
      console.log('Closing server');
      server.close(err => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  });
}


if (require.main === module) {
  runServer().catch(err => console.error(err));
};

module.exports = {app, runServer, closeServer};
