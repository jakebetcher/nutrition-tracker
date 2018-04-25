'use strict';

require('dotenv').config();

const chai = require('chai');
const chaiHttp = require('chai-http');
const jwt = require('jsonwebtoken');
const faker = require('faker');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const expect = chai.expect;



const { Goal } = require('../goals');
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
let explicitUserId;

describe('goals API resource', function() {
   
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
        .get('/goals')
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
        .get('/goals')
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

    it('Should send protected data', function() {
      let resGoals;
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
            amount: faker.random.number(3000),
            range: faker.random.number(400)
          },
          fat: {
            amount: faker.random.number(200),
            range: faker.random.number(30)
          },
          protein: {
            amount: faker.random.number(200),
            range: faker.random.number(40)
          },
          carbs: {
            amount: faker.random.number(200),
            range: faker.random.number(40)
          }
        });
      })
      .then(goal => {
        const token = jwt.sign(
          {
            user: { 
              _id: goal.user,
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
          .get('/goals')
          .set('authorization', `Bearer ${token}`)
      })
      .then(res => {
        expect(res).to.have.status(200);
        expect(res.body).to.be.an('array');

        res.body.forEach(function(goal) {
          expect(goal).to.be.a('object');
          expect(goal).to.include.keys('_id', 'user', 'calories', 'fat', 'protein', 'carbs', 'date');
        });

        resGoals = res.body[0];
        return Goal.findById(resGoals._id);
      })
      .then(function(goal) {
        expect(resGoals.user).to.equal(`${goal.user}`);
        expect(resGoals._id).to.equal(`${goal._id}`);
        expect(resGoals.calories.amount).to.equal(goal.calories.amount);
        expect(resGoals.calories.range).to.equal(goal.calories.range);
        expect(resGoals.fat.amount).to.equal(goal.fat.amount);
        expect(resGoals.fat.range).to.equal(goal.fat.range);
        expect(resGoals.protein.amount).to.equal(goal.protein.amount);
        expect(resGoals.protein.range).to.equal(goal.protein.range);
        expect(resGoals.carbs.amount).to.equal(goal.carbs.amount);
        expect(resGoals.carbs.range).to.equal(goal.carbs.range);
      }); 
    });  
  });

  describe('protected POST Endpoint', function() {
    it('should reject requests with no credentials', function() {
      const newGoal = {
        calories: {
          amount: faker.random.number(3000),
          range: faker.random.number(400)
        },
        fat: {
          amount: faker.random.number(200),
          range: faker.random.number(30)
        },
        protein: {
          amount: faker.random.number(200),
          range: faker.random.number(40)
        },
        carbs: {
          amount: faker.random.number(200),
          range: faker.random.number(40)
        }
      };

      return chai.request(app)
        .post('/goals')
        .send(newGoal)
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

    it('should reject requests with an expired token', function() {
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

      const anotherNewGoal = {
          calories: {
            amount: faker.random.number(3000),
            range: faker.random.number(400)
          },
          fat: {
            amount: faker.random.number(200),
            range: faker.random.number(30)
          },
          protein: {
             amount: faker.random.number(200),
             range: faker.random.number(40)
          },
          carbs: {
            amount: faker.random.number(200),
            range: faker.random.number(40)
          }
      };

      return chai
        .request(app)
        .post('/goals')
        .send(anotherNewGoal)
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

    it('should create a new goal', function() {
      let thirdNewGoal;
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
        thirdNewGoal = {
          user: user._id,
          calories: {
            amount: faker.random.number(3000),
            range: faker.random.number(400)
          },
          fat: {
            amount: faker.random.number(200),
            range: faker.random.number(30)
          },
          protein: {
            amount: faker.random.number(200),
            range: faker.random.number(40)
          },
          carbs: {
            amount: faker.random.number(200),
            range: faker.random.number(40)
          }
        };

        const token = jwt.sign(
          {
            user: {
              _id: user._id,
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
          .post('/goals')
          .send(thirdNewGoal)
          .set('authorization', `Bearer ${token}`)
      })
      .then(function(res) {
        expect(res).to.have.status(201);
        expect(res).to.be.json;
        expect(res.body).to.be.a('object');
        expect(res.body).to.include.keys('_id', 'user', 'calories', 'fat', 'protein', 'carbs', 'date');
        return Goal.findById(res.body._id);
      })
      .then(function(goal) {
        expect(`${goal.user}`).to.equal(`${thirdNewGoal.user}`);
        expect(goal.calories.amount).to.equal(thirdNewGoal.calories.amount);
        expect(goal.calories.range).to.equal(thirdNewGoal.calories.range);
        expect(goal.fat.range).to.equal(thirdNewGoal.fat.range);
        expect(goal.protein.range).to.equal(thirdNewGoal.protein.range);
        expect(goal.carbs.amount).to.equal(thirdNewGoal.carbs.amount);
      })
    });
  });
});
 


