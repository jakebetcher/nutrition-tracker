'use strict';

require('dotenv').config();

const chai = require('chai');
const chaiHttp = require('chai-http');
const jwt = require('jsonwebtoken');
const faker = require('faker');
const mongoose = require('mongoose');

const expect = chai.expect;

const { Goal } = require('../goals');
const { Entry } = require('../entries');
const { statObject } = require('../stats');
const { User } = require('../users');
const { closeServer, runServer, app } = require('../server');
const { JWT_SECRET, TEST_DATABASE_URL } = require('../config');

chai.use(chaiHttp);

function tearDownDb() {
  return new Promise((resolve, reject) => {
    console.warn('Deleting database');
    mongoose.connection.dropDatabase()
      .then(result => resolve(result))
      .catch(err => reject(err));
  });
}

const explicitUsername = 'exampleUsername1234';
const explicitPassword = 'examplePass';
const explicitFirstName = 'Example';
const explicitLastName = 'User';

describe('stats API Resource', function() {

  before(function () {
    return runServer(TEST_DATABASE_URL);
  });

  afterEach(function () {
    return tearDownDb();
  });

  after(function () {
    return closeServer();
  });

  describe('protected GET Endpoint', function() {
    it('Should reject requests with no credentials', function () {
      return chai
        .request(app)
        .get('/stats')
        .then(() =>
          expect.fail(null, null, 'Request should not succeed')
        )
        .catch(err => {
          if (err instanceof chai.AssertionError) {
            throw err;
          }
          const res = err.response;
          expect(res).to.have.status(401);
        });
    });

    it('Should reject requests with an expired token', function () {
      const token = jwt.sign(
        {
          user: {
            username: explicitUsername,
            firstName: explicitFirstName,
            lastName: explicitLastName
          },
          exp: Math.floor(Date.now() / 1000) - 10 // Expired ten seconds ago
        },
        JWT_SECRET,
        {
          algorithm: 'HS256',
          subject: explicitUsername
        }
      );

      return chai
        .request(app)
        .get('/stats')
        .set('authorization', `Bearer ${token}`)
        .then(() =>
          expect.fail(null, null, 'Request should not succeed')
        )
        .catch(err => {
          if (err instanceof chai.AssertionError) {
            throw err;
          }

          const res = err.response;
          expect(res).to.have.status(401);
        });
    });

    it('should send protected data', function() {
      let stats = {
          timesMetCaloriesGoals: 0,
          timesMetFatGoals: 1,
          timesMetProteinGoals: 0,
          timesMetCarbsGoals: 1,
          timesMetAllGoals: 0,
          timesMetAtLeastOneGoal: 1,
          daysGoalsHaveBeenTracked: 1
        };

      return User.hashPassword(explicitPassword)  
      .then(password => {
        return User.create({
          username: explicitUsername,
          password: password,
          firstName: explicitFirstName,
          lastName: explicitLastName
        });
      })
      .then(user => {
        return Goal.create({
          user: user._id,
          calories: {
            amount: 1000,
            range: 100
          },
          fat: {
            amount: 30,
            range: 10
          },
          protein: {
            amount: 30,
            range: 10
          },
          carbs: {
            amount: 30,
            range: 10
          }
        });  
      })
      .then(goal => {
        let theDate = new Date();
        let theDay = theDate.toDateString();
        return Entry.create({
          user: goal.user,
          goal: goal._id,
          foodName: 'example food',
          date: theDate,
          day: theDay,
          consumedCalories: 600,
          consumedFat: 25,
          consumedProtein: 15,
          consumedCarbs: 25
        });
      })
      .then(entry => {
        const token = jwt.sign(
          {
            user: { 
              _id: entry.user,
              username: explicitUsername,
              firstName: explicitFirstName,
              lastName: explicitLastName
            }
          },
          JWT_SECRET,
          {
            algorithm: 'HS256',
            subject: explicitUsername,
            expiresIn: '7d'
          }
        );

        return chai
          .request(app)
          .get('/stats')
          .set('authorization', `Bearer ${token}`)
      })
      .then(res => {
        expect(res).to.have.status(200);
        expect(res.body).to.be.an('object');
        expect(res.body).to.include.keys('timesMetCaloriesGoals', 'timesMetFatGoals', 'timesMetProteinGoals', 'timesMetCarbsGoals', 'timesMetAllGoals', 'timesMetAtLeastOneGoal', 'daysGoalsHaveBeenTracked');

        expect(res.body.timesMetCaloriesGoals).to.equal(stats.timesMetCaloriesGoals);
        expect(res.body.timesMetFatGoals).to.equal(stats.timesMetFatGoals);
        expect(res.body.timesMetProteinGoals).to.equal(stats.timesMetProteinGoals);
        expect(res.body.timesMetCarbsGoals).to.equal(stats.timesMetCarbsGoals);
        expect(res.body.timesMetAllGoals).to.equal(stats.timesMetAllGoals);
        expect(res.body.timesMetAtLeastOneGoal).to.equal(stats.timesMetAtLeastOneGoal);
        expect(res.body.daysGoalsHaveBeenTracked).to.equal(stats.daysGoalsHaveBeenTracked);
      });
    });
  });
});